/**
 * Constantes y tipos para la integración con las APIs de Buró de Crédito
 */

export const BURO_API_ENDPOINTS = {
  AUTENTICADOR: process.env.BURO_API_AUTENTICADOR_URL || 'https://api.burodecredito.com.mx:4431/devpf/autenticador',
  MONITOR: process.env.BURO_API_MONITOR_URL || 'https://api.burodecredito.com.mx:4431/devpf/monitor',
  ESTIMADOR_INGRESOS: process.env.BURO_API_ESTIMADOR_INGRESOS_URL || 'https://api.burodecredito.com.mx:4431/devpf/estimador-ingresos',
  PROSPECTOR: process.env.BURO_API_PROSPECTOR_URL || 'https://api.burodecredito.com.mx:4431/devpf/prospector',
  INFORME_BURO: process.env.BURO_API_INFORME_BURO_URL || 'https://api.burodecredito.com.mx:4431/devpf/informe-buro',
  REPORTE_CREDITO: process.env.BURO_API_REPORTE_CREDITO_URL || 'https://api.burodecredito.com.mx:4431/devpf/reporte-de-credito',
};

export const BURO_API_CREDENTIALS = {
  API_KEY: process.env.BURO_API_KEY || '',
  API_SECRET: process.env.BURO_API_SECRET || '',
};

// Tipos base
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

export interface PersonaBCAutenticador {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rfc: string;
  fechaNacimiento: string; // YYYY-MM-DD
  direccion: Direccion;
  cuentas: CuentaClienteBC[];
}

// Tipos para Autenticador
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
    errores?: Record<string, string>;
  };
  respuestaAutenticador: string;
}

// Tipos comunes para respuestas de crédito
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

// Tipos para Monitor
export interface MonitorRequest {
  consulta: {
    persona: PersonaBCAutenticador;
  };
}

export interface MonitorResponse {
  respuesta: {
    cuentas: CuentasRespBC[];
    consultasEfectuadas: ConsultaEfectuadaRespBC[];
    declaraciones: DeclaracionesClienteRespBC[];
    errores?: Record<string, string>;
  };
  respuestaAutenticador: string;
}

// Tipos para Prospector
export interface ProspectorRequest {
  consulta: {
    persona: PersonaBCAutenticador;
  };
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

// Tipos para Reporte de Crédito
export interface ReporteCreditoRequest {
  consulta: {
    persona: PersonaBCAutenticador;
  };
}

export interface ReporteCreditoResponse {
  respuesta: {
    datosPersonales: {
      nombre: string;
      rfc: string;
      fechaNacimiento: string;
      direccion: Direccion;
    };
    cuentas: CuentasRespBC[];
    consultasEfectuadas: ConsultaEfectuadaRespBC[];
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
