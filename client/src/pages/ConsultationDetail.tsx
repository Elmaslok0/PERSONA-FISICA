import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Download, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ConsultationDetail() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams();
  const consultationId = params?.id ? parseInt(params.id) : null;

  const consultationQuery = trpc.buro.obtenerConsulta.useQuery(consultationId || 0, {
    enabled: isAuthenticated && !!consultationId,
  });

  const descargarPDFMutation = trpc.buro.descargarPDF.useMutation();

  const handleDownloadPDF = async () => {
    try {
      const result = await descargarPDFMutation.mutateAsync(consultationId || 0);
      
      const binaryString = atob(result.buffer);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF descargado correctamente');
    } catch (error) {
      toast.error('Error al descargar PDF');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Debes iniciar sesión</p>
      </div>
    );
  }

  if (consultationQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (consultationQuery.isError || !consultationQuery.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Error al cargar la consulta</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const consultation = consultationQuery.data;
  const prospectorData = consultation.prospectorData;
  const incomeData = consultation.incomeEstimate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Consulta de Buró de Crédito
          </h1>
          <p className="text-slate-600">
            {consultation.firstName} {consultation.lastName} • RFC: {consultation.rfc}
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Estado de la consulta</p>
                <p className="text-lg font-semibold">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                    consultation.status === 'failed' ? 'bg-red-100 text-red-800' :
                    consultation.status === 'authenticated' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {consultation.status.toUpperCase()}
                  </span>
                </p>
              </div>
              
              {consultation.status === 'completed' && (
                <Button onClick={handleDownloadPDF} disabled={descargarPDFMutation.isPending} className="flex items-center gap-2">
                  {descargarPDFMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Descargar PDF
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {consultation.status === 'completed' && (
          <Tabs defaultValue="cuentas" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cuentas">Cuentas</TabsTrigger>
              <TabsTrigger value="consultas">Consultas</TabsTrigger>
              <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
            </TabsList>

            <TabsContent value="cuentas" className="space-y-4">
              {prospectorData?.respuesta?.cuentas && prospectorData.respuesta.cuentas.length > 0 ? (
                prospectorData.respuesta.cuentas.map((cuenta: any, idx: number) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="text-lg">{cuenta.nombreOtorgante}</CardTitle>
                      <CardDescription>{cuenta.tipoCuenta}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Saldo Actual</p>
                          <p className="font-semibold">${cuenta.saldoActual}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Saldo Vencido</p>
                          <p className="font-semibold">${cuenta.saldoVencido}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Límite de Crédito</p>
                          <p className="font-semibold">${cuenta.limiteCredito}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Pagos Vencidos</p>
                          <p className="font-semibold">{cuenta.numeroPagosVencidos}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-slate-600">No hay cuentas registradas</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="consultas" className="space-y-4">
              {prospectorData?.respuesta?.consultasEfectuadas && prospectorData.respuesta.consultasEfectuadas.length > 0 ? (
                prospectorData.respuesta.consultasEfectuadas.map((consulta: any, idx: number) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="text-lg">{consulta.nombreOtorgante}</CardTitle>
                      <CardDescription>{new Date(consulta.fechaConsulta).toLocaleDateString('es-MX')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Tipo de Contrato</p>
                          <p className="font-semibold">{consulta.tipoContrato}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Importe</p>
                          <p className="font-semibold">${consulta.importeContrato}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-slate-600">No hay consultas registradas</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="ingresos" className="space-y-4">
              {incomeData?.respuesta?.estimacionIngresos ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Estimación de Ingresos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-slate-600">Ingreso Estimado</p>
                        <p className="text-2xl font-bold">${incomeData.respuesta.estimacionIngresos.ingresoEstimado}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Periodicidad</p>
                        <p className="font-semibold">{incomeData.respuesta.estimacionIngresos.periodicidad}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Confiabilidad</p>
                        <p className="font-semibold">{incomeData.respuesta.estimacionIngresos.confiabilidad}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-slate-600">No hay datos de ingresos disponibles</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        {consultation.status === 'failed' && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Error en la Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-800">{consultation.errorMessage}</p>
            </CardContent>
          </Card>
        )}

        {(consultation.status === 'pending' || consultation.status === 'authenticated') && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Consulta en Proceso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800">
                La consulta está siendo procesada. Por favor, espera a que se complete.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
