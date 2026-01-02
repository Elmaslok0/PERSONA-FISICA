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
    return {
      'Authorization': `Bearer ${BURO_API_CREDENTIALS.API_KEY}`,
      'X-API-Key': BURO_API_CREDENTIALS.API_KEY,
    };
  }

  /**
   * Maneja errores de API de forma consistente
   */
  private handleError(error: unknown, context: string): APIError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
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
      if (!BURO_API_ENDPOINTS.AUTENTICADOR) {
        throw new Error('BURO_API_AUTENTICADOR_URL no configurado');
      }

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
   * Consulta el API de Prospector para obtener historial de crédito
   */
  async consultarProspector(persona: PersonaBCAutenticador): Promise<ProspectorResponse> {
    try {
      if (!BURO_API_ENDPOINTS.PROSPECTOR) {
        throw new Error('BURO_API_PROSPECTOR_URL no configurado');
      }

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
      if (!BURO_API_ENDPOINTS.ESTIMADOR_INGRESOS) {
        throw new Error('BURO_API_ESTIMADOR_INGRESOS_URL no configurado');
      }

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
      if (!BURO_API_ENDPOINTS.INFORME_BURO) {
        throw new Error('BURO_API_INFORME_BURO_URL no configurado');
      }

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
   * Integración para API #5 (pendiente de detalles)
   */
  async consultarAPIQuinta(data: unknown): Promise<unknown> {
    try {
      if (!BURO_API_ENDPOINTS.API_QUINTA) {
        throw new Error('BURO_API_QUINTA_URL no configurado');
      }

      const response = await this.axiosInstance.post(
        BURO_API_ENDPOINTS.API_QUINTA,
        data,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'API_QUINTA');
    }
  }

  /**
   * Integración para API #6 (pendiente de detalles)
   */
  async consultarAPISexta(data: unknown): Promise<unknown> {
    try {
      if (!BURO_API_ENDPOINTS.API_SEXTA) {
        throw new Error('BURO_API_SEXTA_URL no configurado');
      }

      const response = await this.axiosInstance.post(
        BURO_API_ENDPOINTS.API_SEXTA,
        data,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'API_SEXTA');
    }
  }
}

// Exportar instancia singleton
export const buroAPIClient = new BuroAPIClient();
