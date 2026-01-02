/**
 * Constantes y tipos para la integración con las APIs de Buró de Crédito
 */

export const BURO_API_ENDPOINTS = {
  AUTENTICADOR: process.env.BURO_API_AUTENTICADOR_URL || '',
  PROSPECTOR: process.env.BURO_API_PROSPECTOR_URL || '',
  ESTIMADOR_INGRESOS: process.env.BURO_API_ESTIMADOR_INGRESOS_URL || '',
  INFORME_BURO: process.env.BURO_API_INFORME_BURO_URL || '',
  // Dos APIs adicionales a integrar
  API_QUINTA: process.env.BURO_API_QUINTA_URL || '',
  API_SEXTA: process.env.BURO_API_SEXTA_URL || '',
};

export const BURO_API_CREDENTIALS = {
  API_KEY: process.env.BURO_API_KEY || '',
  API_SECRET: process.env.BURO_API_SECRET || '',
};

// Tipos para Autenticador
export interface PersonaBCAutenticador {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rfc: string;
  fechaNacimiento: string; // YYYY-MM-DD
  direccion: Direccion;
  cuentas: CuentaClienteBC[];
}

export interface Direccion {
  calle: string;
  numero: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  pais: string;
}

export interface CuentaClienteBC {
  claveOtorgante: string;
  nombreOtorgante: string;
  numeroCuenta: string;
}

export interface AutenticacionBCRequest {
  consulta: {
    persona: PersonaBCAutenticador;
  };
}

export interface AutenticacionBCResponse {
  respuesta: {
    autenticacion: {
      ejercidoCreditoAutomotriz: string;
      ejercidoCreditoHipotecario: string;
      tarjetaCredito: string;
      tipoReporte: string;
      tipoSalidaAU: string;
      ultimosCuatroDigitos: string;
      referenciaOperador: string;
    };
    errores?: {
      claveOPasswordErroneo?: string;
      errorReporteBloqueado?: string;
      errorSistemaBC?: string;
      sujetoNoAutenticado?: string;
    };
  };
  respuestaAutenticador: string;
}

// Tipos para Prospector
export interface ProspectorRequest {
  consulta: {
    persona: PersonaBCAutenticador;
  };
}

export interface CuentasRespBC {
  claveOtorgante: string;
  nombreOtorgante: string;
  numeroCuentaActual: string;
  tipoCuenta: string;
  tipoContrato: string;
  saldoActual: string;
  saldoVencido: string;
  creditoMaximo: string;
  limiteCredito: string;
  fechaAperturaCuenta: string;
  fechaCierreCuenta: string;
  fechaUltimoPago: string;
  montoPagar: string;
  numeroPagosVencidos: string;
  historicoPagos: string;
  formaPagoActual: string;
  frecuenciaPagos: string;
  claveObservacion: string;
  fechaActualizacion: string;
}

export interface ProspectorResponse {
  respuesta: {
    cuentas: CuentasRespBC[];
    consultasEfectuadas: ConsultaEfectuadaRespBC[];
    declaraciones: DeclaracionesClienteRespBC[];
    errores?: Record<string, string>;
  };
  respuestaAutenticador: string;
}

export interface ConsultaEfectuadaRespBC {
  fechaConsulta: string;
  nombreOtorgante: string;
  tipoContrato: string;
  importeContrato: string;
  resultadoFinal: string;
}

export interface DeclaracionesClienteRespBC {
  declaracionConsumidor: string;
}

// Tipos para Estimador de Ingresos
export interface EstimadorIngresosRequest {
  consulta: {
    persona: PersonaBCAutenticador;
  };
}

export interface EstimadorIngresosResponse {
  respuesta: {
    estimacionIngresos: {
      ingresoEstimado: string;
      periodicidad: string;
      confiabilidad: string;
      fuentes: string[];
    };
    errores?: Record<string, string>;
  };
  respuestaAutenticador: string;
}

// Tipos para Informe de Buró
export interface InformeBuroRequest {
  consulta: {
    persona: PersonaBCAutenticador;
  };
}

export interface InformeBuroResponse {
  respuesta: {
    datosPersonales: {
      nombre: string;
      rfc: string;
      fechaNacimiento: string;
      direccion: Direccion;
    };
    cuentas: CuentasRespBC[];
    consultasEfectuadas: ConsultaEfectuadaRespBC[];
    puntuacionCredito: {
      score: number;
      categoria: string;
      fecha: string;
    };
    declaraciones: DeclaracionesClienteRespBC[];
    errores?: Record<string, string>;
  };
  respuestaAutenticador: string;
}

// Tipo genérico para respuestas de error
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
