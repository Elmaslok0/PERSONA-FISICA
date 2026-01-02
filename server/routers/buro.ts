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

const DireccionSchema = z.object({
  calle: z.string().min(1, 'Calle requerida'),
  numExt: z.string().min(1, 'Número exterior requerido'),
  numInt: z.string().optional(),
  colonia: z.string().min(1, 'Colonia requerida'),
  delegacionMunicipio: z.string().min(1, 'Delegación o Municipio requerido'),
  ciudad: z.string().min(1, 'Ciudad requerida'),
  estado: z.string().min(1, 'Estado requerido'),
  codPostal: z.string().regex(/^\d{5}$/, 'Código postal debe tener 5 dígitos'),
  codPais: z.string().default('MX'),
});

const PersonaSchema = z.object({
  nombres: z.string().min(1, 'Nombre requerido'),
  apellidoPaterno: z.string().min(1, 'Apellido paterno requerido'),
  apellidoMaterno: z.string().min(1, 'Apellido materno requerido'),
  rfc: z.string().regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, 'RFC inválido'),
  fechaNacimiento: z.string().min(1, 'Fecha requerida'),
  direccion: DireccionSchema,
  cuentas: z.array(z.object({
    claveOtorgante: z.string().optional(),
    nombreOtorgante: z.string().optional(),
    numeroCuenta: z.string(),
  })).optional().default([]),
});

const ConsultaPersonalDataSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  apellidoPaterno: z.string().min(1, 'Apellido paterno requerido'),
  apellidoMaterno: z.string().min(1, 'Apellido materno requerido'),
  rfc: z.string().regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, 'RFC inválido'),
  fechaNacimiento: z.string().min(1, 'Fecha requerida'),
  calle: z.string().min(1, 'Calle requerida'),
  numExt: z.string().min(1, 'Número exterior requerido'),
  numInt: z.string().optional(),
  colonia: z.string().min(1, 'Colonia requerida'),
  delegacionMunicipio: z.string().min(1, 'Delegación o Municipio requerido'),
  ciudad: z.string().min(1, 'Ciudad requerida'),
  estado: z.string().min(1, 'Estado requerido'),
  codigoPostal: z.string().regex(/^\d{5}$/, 'Código postal debe tener 5 dígitos'),
});

export const buroRouter = router({
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
          address: `${input.calle} ${input.numExt}${input.numInt ? ' Int ' + input.numInt : ''}, ${input.colonia}`,
          city: input.ciudad,
          state: input.estado,
          postalCode: input.codigoPostal,
          status: 'pending',
        });

        // Mapear a formato Buró
        const personaBuro: PersonaBCAutenticador = {
          nombres: input.nombre,
          apellidoPaterno: input.apellidoPaterno,
          apellidoMaterno: input.apellidoMaterno,
          rfc: input.rfc,
          fechaNacimiento: input.fechaNacimiento.replace(/-/g, ''),
          direccion: {
            calle: input.calle,
            numExt: input.numExt,
            numInt: input.numInt,
            colonia: input.colonia,
            delegacionMunicipio: input.delegacionMunicipio,
            ciudad: input.ciudad,
            estado: input.estado,
            codPais: 'MX',
            codPostal: input.codigoPostal,
          }
        };

        const authResponse = await buroAPIClient.autenticar(personaBuro);

        if (authResponse.respuesta?.errores?.sujetoNoAutenticado) {
          await updateBuroConsultation(consultation.id, {
            status: 'pending',
            authenticationData: JSON.stringify(authResponse),
          });
          return {
            consultationId: consultation.id,
            status: 'pending',
            requiresAuth: true,
            authData: authResponse,
          };
        }

        await updateBuroConsultation(consultation.id, {
          status: 'authenticated',
          authenticationData: JSON.stringify(authResponse),
        });

        return {
          consultationId: consultation.id,
          status: 'authenticated',
          requiresAuth: false,
        };
      } catch (error) {
        console.error('[Buro] Error iniciando consulta:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error al iniciar consulta',
        });
      }
    }),

  autenticar: protectedProcedure
    .input(z.object({
      consultationId: z.number(),
      persona: PersonaSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const consultation = await getBuroConsultation(input.consultationId);
        if (!consultation || consultation.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'No tienes acceso' });
        }

        const authResponse = await buroAPIClient.autenticar(input.persona);

        await updateBuroConsultation(input.consultationId, {
          authenticationData: JSON.stringify(authResponse),
          status: 'authenticated',
        });

        return {
          success: true,
          consultationId: input.consultationId,
          authResponse,
        };
      } catch (error) {
        console.error('[Buro] Error autenticando:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error en autenticación',
        });
      }
    }),

  obtenerInforme: protectedProcedure
    .input(z.object({
      consultationId: z.number(),
      persona: PersonaSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const consultation = await getBuroConsultation(input.consultationId);
        if (!consultation || consultation.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'No tienes acceso' });
        }

        const [prospectorData, estimadorData, informeBuroData] = await Promise.all([
          buroAPIClient.consultarProspector(input.persona),
          buroAPIClient.estimarIngresos(input.persona),
          buroAPIClient.obtenerInformeBuro(input.persona),
        ]);

        await updateBuroConsultation(input.consultationId, {
          prospectorData: JSON.stringify(prospectorData),
          incomeEstimate: JSON.stringify(estimadorData),
          reportData: JSON.stringify(informeBuroData),
          status: 'completed',
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
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error al obtener informe',
        });
      }
    }),

  obtenerHistorial: protectedProcedure.query(async ({ ctx }) => {
    const consultations = await getUserBuroConsultations(ctx.user.id);
    return consultations.map(c => ({
      id: c.id,
      rfc: c.rfc,
      firstName: c.firstName,
      lastName: c.lastName,
      status: c.status,
      createdAt: c.createdAt,
    }));
  }),
});
