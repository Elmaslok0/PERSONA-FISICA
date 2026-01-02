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

class BuroAPIClient {
  private axiosInstance = axios.create({
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private getHeaders() {
    return {
      'x-api-key': BURO_API_CREDENTIALS.API_KEY,
      'Authorization': `Bearer ${BURO_API_CREDENTIALS.API_KEY}`, // Algunos gateways usan Bearer con la API Key
    };
  }

  private handleError(error: unknown, context: string): APIError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      console.error(`[Buro API ${context}] Error:`, axiosError.response?.data || axiosError.message);
      return {
        code: `BURO_API_ERROR_${context}`,
        message: axiosError.response?.data?.message || axiosError.message || 'Error en la comunicación con Buró',
        details: axiosError.response?.data,
      };
    }
    
    return {
      code: `BURO_SERVICE_ERROR_${context}`,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }

  async autenticar(persona: PersonaBCAutenticador): Promise<AutenticacionBCResponse> {
    try {
      if (!BURO_API_ENDPOINTS.AUTENTICADOR) throw new Error('BURO_API_AUTENTICADOR_URL no configurado');

      const request: AutenticacionBCRequest = { consulta: { persona } };
      console.log('[Buro] Llamando Autenticador con RFC:', persona.rfc);

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

  async consultarProspector(persona: PersonaBCAutenticador): Promise<ProspectorResponse> {
    try {
      if (!BURO_API_ENDPOINTS.PROSPECTOR) throw new Error('BURO_API_PROSPECTOR_URL no configurado');
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

  async estimarIngresos(persona: PersonaBCAutenticador): Promise<EstimadorIngresosResponse> {
    try {
      if (!BURO_API_ENDPOINTS.ESTIMADOR_INGRESOS) throw new Error('BURO_API_ESTIMADOR_INGRESOS_URL no configurado');
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

  async obtenerInformeBuro(persona: PersonaBCAutenticador): Promise<InformeBuroResponse> {
    try {
      if (!BURO_API_ENDPOINTS.INFORME_BURO) throw new Error('BURO_API_INFORME_BURO_URL no configurado');
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
}

export const buroAPIClient = new BuroAPIClient();
