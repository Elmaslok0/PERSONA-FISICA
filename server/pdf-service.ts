import { PDFDocument, PDFPage, rgb, degrees } from 'pdf-lib';
import { InformeBuroResponse, CuentasRespBC, ConsultaEfectuadaRespBC } from '../shared/buro-api';

/**
 * Genera un documento PDF con el informe de Buró
 */
export async function generateBuroPDF(
  consultation: {
    firstName: string;
    lastName: string;
    rfc: string;
    birthDate: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  },
  prospectorData: any,
  incomeData: any,
  reportData: any
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([612, 792]); // Letter size
  const { height } = page.getSize();

  let yPosition = height - 40;
  const lineHeight = 14;
  const margin = 40;
  const maxWidth = 612 - 2 * margin;

  // Función auxiliar para escribir texto
  const drawText = (text: string, size: number = 11, bold: boolean = false, color = rgb(0, 0, 0)) => {
    if (yPosition < 40) {
      page = pdfDoc.addPage([612, 792]);
      yPosition = height - 40;
    }
    page.drawText(text, {
      x: margin,
      y: yPosition,
      size,
      color,
      font: bold ? undefined : undefined,
    });
    yPosition -= lineHeight;
  };

  const drawSection = (title: string) => {
    yPosition -= 10;
    drawText(title, 14, true, rgb(30, 58, 138));
    page.drawLine({
      start: { x: margin, y: yPosition + 4 },
      end: { x: 612 - margin, y: yPosition + 4 },
      thickness: 1,
      color: rgb(229, 231, 235),
    });
    yPosition -= 10;
  };

  // Header
  drawText('INFORME DE BURÓ DE CRÉDITO', 20, true, rgb(30, 58, 138));
  drawText('Reporte Confidencial', 12, false, rgb(107, 114, 128));
  drawText(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 10, false, rgb(107, 114, 128));
  yPosition -= 10;

  // Datos Personales
  drawSection('DATOS PERSONALES');
  drawText(`Nombre: ${consultation.firstName} ${consultation.lastName}`, 11);
  drawText(`RFC: ${consultation.rfc}`, 11);
  drawText(`Fecha de Nacimiento: ${consultation.birthDate}`, 11);
  drawText(
    `Domicilio: ${consultation.address}, ${consultation.city}, ${consultation.state} ${consultation.postalCode}`,
    11
  );

  // Puntuación de Crédito
  const puntuacionCredito = reportData?.respuesta?.puntuacionCredito;
  if (puntuacionCredito) {
    drawSection('PUNTUACIÓN DE CRÉDITO');
    drawText(`Score: ${puntuacionCredito.score}`, 11);
    drawText(`Categoría: ${puntuacionCredito.categoria}`, 11);
    drawText(`Fecha: ${puntuacionCredito.fecha}`, 11);
  }

  // Estimación de Ingresos
  const estimacionIngresos = incomeData?.respuesta?.estimacionIngresos;
  if (estimacionIngresos) {
    drawSection('ESTIMACIÓN DE INGRESOS');
    drawText(`Ingreso Estimado: $${estimacionIngresos.ingresoEstimado}`, 11);
    drawText(`Periodicidad: ${estimacionIngresos.periodicidad}`, 11);
    drawText(`Confiabilidad: ${estimacionIngresos.confiabilidad}`, 11);
  }

  // Cuentas de Crédito
  const cuentas = prospectorData?.respuesta?.cuentas || [];
  if (cuentas.length > 0) {
    drawSection('CUENTAS DE CRÉDITO');
    cuentas.forEach((cuenta: CuentasRespBC, idx: number) => {
      drawText(`${idx + 1}. ${cuenta.nombreOtorgante}`, 11, true);
      drawText(`   Tipo: ${cuenta.tipoCuenta}`, 10);
      drawText(`   Saldo Actual: $${cuenta.saldoActual}`, 10);
      drawText(`   Saldo Vencido: $${cuenta.saldoVencido}`, 10);
      drawText(`   Límite de Crédito: $${cuenta.limiteCredito}`, 10);
      drawText(`   Pagos Vencidos: ${cuenta.numeroPagosVencidos}`, 10);
      yPosition -= 5;
    });
  }

  // Consultas Efectuadas
  const consultas = prospectorData?.respuesta?.consultasEfectuadas || [];
  if (consultas.length > 0) {
    drawSection('CONSULTAS EFECTUADAS');
    consultas.forEach((consulta: ConsultaEfectuadaRespBC, idx: number) => {
      drawText(`${idx + 1}. ${consulta.nombreOtorgante}`, 11, true);
      drawText(`   Fecha: ${consulta.fechaConsulta}`, 10);
      drawText(`   Tipo de Contrato: ${consulta.tipoContrato}`, 10);
      drawText(`   Importe: $${consulta.importeContrato}`, 10);
      yPosition -= 5;
    });
  }

  // Footer
  yPosition = 30;
  page.drawText('Este documento contiene información confidencial. Protégelo adecuadamente.', {
    x: margin,
    y: yPosition,
    size: 8,
    color: rgb(156, 163, 175),
  });

  // Convertir a buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
