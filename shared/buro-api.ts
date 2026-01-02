/**
 * Constantes y tipos para la integración con las APIs de Buró de Crédito
 * Basado en las especificaciones oficiales (Swagger)
 */

export const BURO_API_ENDPOINTS = {
  AUTENTICADOR: process.env.BURO_API_AUTENTICADOR_URL || '',
  PROSPECTOR: process.env.BURO_API_PROSPECTOR_URL || '',
  ESTIMADOR_INGRESOS: process.env.BURO_API_ESTIMADOR_INGRESOS_URL || '',
  INFORME_BURO: process.env.BURO_API_INFORME_BURO_URL || '',
  MONITOR: process.env.BURO_API_MONITOR_URL || '',
  REPORTE_CREDITO: process.env.BURO_API_REPORTE_CREDITO_URL || '',
};

export const BURO_API_CREDENTIALS = {
  API_KEY: process.env.BURO_API_KEY || '',
  API_SECRET: process.env.BURO_API_SECRET || '',
};

export interface Direccion {
  calle: string;
  numExt: string;
  numInt?: string;
  colonia: string;
  delegacionMunicipio: string;
  ciudad: string;
  estado: string;
  codPais: string;
  codPostal: string;
}

export interface PersonaBCAutenticador {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rfc: string;
  fechaNacimiento: string; // DDMMYYYY o YYYY-MM-DD según API
  direccion: Direccion;
  cuentas?: CuentaClienteBC[];
}

export interface CuentaClienteBC {
  claveOtorgante?: string;
  nombreOtorgante?: string;
  numeroCuenta: string;
}

export interface AutenticacionBC {
  ejercidoCreditoAutomotriz?: string;
  ejercidoCreditoHipotecario?: string;
  tarjetaCredito?: string;
  tipoReporte?: string;
  tipoSalidaAU?: string;
  ultimosCuatroDigitos?: string;
  referenciaOperador?: string;
}

export interface AutenticacionBCRequest {
  consulta: {
    persona: PersonaBCAutenticador;
  };
}

export interface AR {
  claveOPasswordErroneo?: string;
  errorReporteBloqueado?: string;
  errorSistemaBC?: string;
  etiquetaSegmentoErronea?: string;
  faltaCampoRequerido?: string;
  referenciaOperador?: string;
  sujetoNoAutenticado?: string;
}

export interface CreditReportResponse {
  respuesta?: {
    autenticacion?: AutenticacionBC;
    errores?: AR;
    personales?: any;
    domicilios?: any[];
    empleos?: any[];
    cuentas?: any[];
    consultas?: any[];
    puntuacion?: any;
  };
  respuestaAutenticador: string;
}

// Alias para compatibilidad con el código existente
export type AutenticacionBCResponse = CreditReportResponse;
export type ProspectorResponse = CreditReportResponse;
export type EstimadorIngresosResponse = CreditReportResponse;
export type InformeBuroResponse = CreditReportResponse;

export interface ProspectorRequest {
  consulta: {
    persona: PersonaBCAutenticador;
  };
}

export interface EstimadorIngresosRequest {
  consulta: {
    persona: PersonaBCAutenticador;
  };
}

export interface InformeBuroRequest {
  consulta: {
    persona: PersonaBCAutenticador;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}
