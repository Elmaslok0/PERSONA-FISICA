import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { buroAPIClient } from '../buro-service';
import { generateBuroPDF } from '../pdf-service';
import {
  createBuroConsultation,
  updateBuroConsultation,
  getBuroConsultation,
  getUserBuroConsultations,
} from '../db';
import { PersonaBCAutenticador, Direccion } from '../../shared/buro-api';
import { TRPCError } from '@trpc/server';

/**
 * Esquemas de validación para Zod
 */
const DireccionSchema = z.object({
  calle: z.string().min(1, 'Calle requerida'),
  numero: z.string().min(1, 'Número requerido'),
  ciudad: z.string().min(1, 'Ciudad requerida'),
  estado: z.string().min(1, 'Estado requerido'),
  codigoPostal: z.string().regex(/^\d{5}$/, 'Código postal debe tener 5 dígitos'),
  pais: z.string().default('México'),
});

const PersonaSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  apellidoPaterno: z.string().min(1, 'Apellido paterno requerido'),
  apellidoMaterno: z.string().min(1, 'Apellido materno requerido'),
  rfc: z.string().regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, 'RFC inválido'),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD'),
  direccion: DireccionSchema,
  cuentas: z.array(z.object({
    claveOtorgante: z.string(),
    nombreOtorgante: z.string(),
    numeroCuenta: z.string(),
  })).optional().default([]),
});

const ConsultaPersonalDataSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  apellidoPaterno: z.string().min(1, 'Apellido paterno requerido'),
  apellidoMaterno: z.string().min(1, 'Apellido materno requerido'),
  rfc: z.string().regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, 'RFC inválido'),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD'),
  calle: z.string().min(1, 'Calle requerida'),
  numero: z.string().min(1, 'Número requerido'),
  ciudad: z.string().min(1, 'Ciudad requerida'),
  estado: z.string().min(1, 'Estado requerido'),
  codigoPostal: z.string().regex(/^\d{5}$/, 'Código postal debe tener 5 dígitos'),
});

/**
 * Router de Buró de Crédito
 */
export const buroRouter = router({
  /**
   * Inicia una consulta de Buró guardando los datos personales
   */
  iniciarConsulta: protectedProcedure
    .input(ConsultaPersonalDataSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const consultation = await createBuroConsultation({
          userId: ctx.user.id,
          firstName: input.nombre,
          lastName: `${input.apellidoPaterno} ${input.apellidoMaterno}`,
          rfc: input.rfc,
          birthDate: input.fechaNacimiento,
          address: `${input.calle} ${input.numero}`,
          city: input.ciudad,
          state: input.estado,
          postalCode: input.codigoPostal,
          status: 'pending',
        });

        return {
          consultationId: consultation.id,
          status: consultation.status,
        };
      } catch (error) {
        console.error('[Buro] Error iniciando consulta:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al iniciar consulta',
        });
      }
    }),

  /**
   * Autentica al usuario con el API de Autenticador
   */
  autenticar: protectedProcedure
    .input(z.object({
      consultationId: z.number(),
      persona: PersonaSchema,
      respuestasAutenticacion: z.record(z.string(), z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Validar que la consulta pertenece al usuario
        const consultation = await getBuroConsultation(input.consultationId);
        if (!consultation || consultation.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'No tienes acceso a esta consulta',
          });
        }

        // Llamar al API de Autenticador
        const authResponse = await buroAPIClient.autenticar(input.persona);

        // Guardar datos de autenticación
        await updateBuroConsultation(input.consultationId, {
          authenticationData: JSON.stringify(authResponse),
          status: 'authenticated' as const,
        });

        return {
          success: true,
          consultationId: input.consultationId,
          respuestaAutenticador: authResponse.respuestaAutenticador,
        };
      } catch (error) {
        console.error('[Buro] Error autenticando:', error);
        
        // Actualizar estado como fallido
        await updateBuroConsultation(input.consultationId, {
          status: 'failed' as const,
          errorMessage: error instanceof Error ? error.message : 'Error desconocido',
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error en autenticación',
        });
      }
    }),

  /**
   * Obtiene el informe completo del Buró
   */
  obtenerInforme: protectedProcedure
    .input(z.object({
      consultationId: z.number(),
      persona: PersonaSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Validar que la consulta pertenece al usuario
        const consultation = await getBuroConsultation(input.consultationId);
        if (!consultation || consultation.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'No tienes acceso a esta consulta',
          });
        }

        // Ejecutar todas las consultas en paralelo
        const [prospectorData, estimadorData, informeBuroData] = await Promise.all([
          buroAPIClient.consultarProspector(input.persona),
          buroAPIClient.estimarIngresos(input.persona),
          buroAPIClient.obtenerInformeBuro(input.persona),
        ]);

        // Guardar todos los datos
        await updateBuroConsultation(input.consultationId, {
          prospectorData: JSON.stringify(prospectorData),
          incomeEstimate: JSON.stringify(estimadorData),
          reportData: JSON.stringify(informeBuroData),
          status: 'completed' as const,
        });

        return {
          success: true,
          consultationId: input.consultationId,
          prospector: prospectorData,
          estimador: estimadorData,
          informe: informeBuroData,
        };
      } catch (error) {
        console.error('[Buro] Error obteniendo informe:', error);

        // Actualizar estado como fallido
        await updateBuroConsultation(input.consultationId, {
          status: 'failed' as const,
          errorMessage: error instanceof Error ? error.message : 'Error desconocido',
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error al obtener informe',
        });
      }
    }),

  /**
   * Obtiene una consulta guardada
   */
  obtenerConsulta: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        const consultation = await getBuroConsultation(input);
        
        if (!consultation || consultation.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Consulta no encontrada',
          });
        }

        return {
          ...consultation,
          authenticationData: consultation.authenticationData ? JSON.parse(consultation.authenticationData) : null,
          reportData: consultation.reportData ? JSON.parse(consultation.reportData) : null,
          incomeEstimate: consultation.incomeEstimate ? JSON.parse(consultation.incomeEstimate) : null,
          prospectorData: consultation.prospectorData ? JSON.parse(consultation.prospectorData) : null,
        };
      } catch (error) {
        console.error('[Buro] Error obteniendo consulta:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener consulta',
        });
      }
    }),

  /**
   * Obtiene el historial de consultas del usuario
   */
  obtenerHistorial: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const consultations = await getUserBuroConsultations(ctx.user.id);
        
        return consultations.map(c => ({
          id: c.id,
          rfc: c.rfc,
          firstName: c.firstName,
          lastName: c.lastName,
          status: c.status,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }));
      } catch (error) {
        console.error('[Buro] Error obteniendo historial:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener historial',
        });
      }
    }),

  descargarPDF: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        const consultation = await getBuroConsultation(input);
        
        if (!consultation || consultation.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'No tienes acceso a esta consulta',
          });
        }

        if (consultation.status !== 'completed') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'La consulta no esta completa',
          });
        }

        const prospectorData = consultation.prospectorData ? JSON.parse(consultation.prospectorData) : null;
        const incomeData = consultation.incomeEstimate ? JSON.parse(consultation.incomeEstimate) : null;
        const reportData = consultation.reportData ? JSON.parse(consultation.reportData) : null;

        const pdfBuffer = await generateBuroPDF(
          {
            firstName: consultation.firstName,
            lastName: consultation.lastName,
            rfc: consultation.rfc,
            birthDate: consultation.birthDate,
            address: consultation.address,
            city: consultation.city,
            state: consultation.state,
            postalCode: consultation.postalCode,
          },
          prospectorData,
          incomeData,
          reportData
        );

        return {
          success: true,
          fileName: `buro-${consultation.rfc}-${new Date().getTime()}.pdf`,
          buffer: pdfBuffer.toString('base64'),
        };
      } catch (error) {
        console.error('[Buro] Error descargando PDF:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error al generar PDF',
        });
      }
    }),
});
