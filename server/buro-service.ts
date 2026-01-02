import axios, { AxiosError } from 'axios';
import {
  BURO_API_ENDPOINTS,
  BURO_API_CREDENTIALS,
  AutenticacionBCRequest,
  AutenticacionBCResponse,
  ProspectorRequest,
  ProspectorResponse,
  EstimadorIngresosRequest,
  EstimadorIngresosResponse,
  InformeBuroRequest,
  InformeBuroResponse,
  MonitorRequest,
  MonitorResponse,
  ReporteCreditoRequest,
  ReporteCreditoResponse,
  APIError,
  PersonaBCAutenticador,
} from '../shared/buro-api';

/**
 * Cliente HTTP para comunicarse con las APIs del Buró de Crédito
 */
class BuroAPIClient {
  private axiosInstance = axios.create({
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Agrega autenticación a las solicitudes
   */
  private getHeaders() {
    // Usar las credenciales proporcionadas por el usuario
    const apiKey = process.env.BURO_API_KEY || 'l7f4ab9619923343069e3a48c3209b61e4';
    const apiSecret = process.env.BURO_API_SECRET || 'ee9ba699e9f54cd7bbe7948e0884ccc9';
    
    // Las APIs de Buró de Crédito suelen requerir x-api-key y autenticación básica o específica
    return {
      'x-api-key': apiKey,
      'username': apiKey,
      'password': apiSecret,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  }

  /**
   * Maneja errores de API de forma consistente
   */
  private handleError(error: unknown, context: string): APIError {
    console.error(`[BURO_API_ERROR] Context: ${context}`);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      console.error(`[BURO_API_ERROR] Status: ${axiosError.response?.status}`);
      console.error(`[BURO_API_ERROR] Data:`, JSON.stringify(axiosError.response?.data, null, 2));
      console.error(`[BURO_API_ERROR] Headers:`, JSON.stringify(axiosError.response?.headers, null, 2));
      
      return {
        code: `BURO_API_ERROR_${context}`,
        message: axiosError.response?.data?.message || axiosError.message || 'Error desconocido',
        details: axiosError.response?.data,
      };
    }
    
    if (error instanceof Error) {
      return {
        code: `BURO_SERVICE_ERROR_${context}`,
        message: error.message,
      };
    }

    return {
      code: `BURO_SERVICE_ERROR_${context}`,
      message: 'Error desconocido',
    };
  }

  /**
   * Consulta el API de Autenticador para validar la identidad
   */
  async autenticar(persona: PersonaBCAutenticador): Promise<AutenticacionBCResponse> {
    try {
      const request: AutenticacionBCRequest = { consulta: { persona } };
      const response = await this.axiosInstance.post<AutenticacionBCResponse>(
        BURO_API_ENDPOINTS.AUTENTICADOR,
        request,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'AUTENTICADOR');
    }
  }

  /**
   * Consulta el API de Monitor
   */
  async consultarMonitor(persona: PersonaBCAutenticador): Promise<MonitorResponse> {
    try {
      const request: MonitorRequest = { consulta: { persona } };
      const response = await this.axiosInstance.post<MonitorResponse>(
        BURO_API_ENDPOINTS.MONITOR,
        request,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'MONITOR');
    }
  }

  /**
   * Consulta el API de Prospector para obtener historial de crédito
   */
  async consultarProspector(persona: PersonaBCAutenticador): Promise<ProspectorResponse> {
    try {
      const request: ProspectorRequest = { consulta: { persona } };
      const response = await this.axiosInstance.post<ProspectorResponse>(
        BURO_API_ENDPOINTS.PROSPECTOR,
        request,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'PROSPECTOR');
    }
  }

  /**
   * Consulta el API de Estimador de Ingresos
   */
  async estimarIngresos(persona: PersonaBCAutenticador): Promise<EstimadorIngresosResponse> {
    try {
      const request: EstimadorIngresosRequest = { consulta: { persona } };
      const response = await this.axiosInstance.post<EstimadorIngresosResponse>(
        BURO_API_ENDPOINTS.ESTIMADOR_INGRESOS,
        request,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'ESTIMADOR_INGRESOS');
    }
  }

  /**
   * Consulta el API de Informe de Buró para obtener el reporte completo
   */
  async obtenerInformeBuro(persona: PersonaBCAutenticador): Promise<InformeBuroResponse> {
    try {
      const request: InformeBuroRequest = { consulta: { persona } };
      const response = await this.axiosInstance.post<InformeBuroResponse>(
        BURO_API_ENDPOINTS.INFORME_BURO,
        request,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'INFORME_BURO');
    }
  }

  /**
   * Consulta el API de Reporte de Crédito
   */
  async obtenerReporteCredito(persona: PersonaBCAutenticador): Promise<ReporteCreditoResponse> {
    try {
      const request: ReporteCreditoRequest = { consulta: { persona } };
      const response = await this.axiosInstance.post<ReporteCreditoResponse>(
        BURO_API_ENDPOINTS.REPORTE_CREDITO,
        request,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'REPORTE_CREDITO');
    }
  }
}

// Exportar instancia singleton
export const buroAPIClient = new BuroAPIClient();
