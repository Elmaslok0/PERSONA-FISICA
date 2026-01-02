import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

const FormSchema = z.object({
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

type FormData = z.infer<typeof FormSchema>;

interface BuroFormProps {
  onSuccess?: (consultationId: number) => void;
}

export function BuroForm({ onSuccess }: BuroFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const iniciarConsultaMutation = trpc.buro.iniciarConsulta.useMutation();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      rfc: '',
      fechaNacimiento: '',
      calle: '',
      numExt: '',
      numInt: '',
      colonia: '',
      delegacionMunicipio: '',
      ciudad: '',
      estado: '',
      codigoPostal: '',
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const result = await iniciarConsultaMutation.mutateAsync(data);
      toast.success('Consulta iniciada correctamente');
      if (onSuccess) {
        onSuccess(result.consultationId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar consulta';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Consulta de Buró de Crédito</CardTitle>
        <CardDescription>
          Ingresa tus datos personales para iniciar la consulta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Datos Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="nombre" render={({ field }) => (
                  <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Juan" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="apellidoPaterno" render={({ field }) => (
                  <FormItem><FormLabel>Apellido Paterno</FormLabel><FormControl><Input placeholder="García" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="apellidoMaterno" render={({ field }) => (
                  <FormItem><FormLabel>Apellido Materno</FormLabel><FormControl><Input placeholder="López" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="rfc" render={({ field }) => (
                  <FormItem><FormLabel>RFC</FormLabel><FormControl><Input placeholder="GAGL800101ABC" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="fechaNacimiento" render={({ field }) => (
                  <FormItem><FormLabel>Fecha de Nacimiento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Dirección</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="calle" render={({ field }) => (
                  <FormItem><FormLabel>Calle</FormLabel><FormControl><Input placeholder="Reforma" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-2">
                  <FormField control={form.control} name="numExt" render={({ field }) => (
                    <FormItem><FormLabel>Num Ext</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="numInt" render={({ field }) => (
                    <FormItem><FormLabel>Num Int</FormLabel><FormControl><Input placeholder="A" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="colonia" render={({ field }) => (
                  <FormItem><FormLabel>Colonia</FormLabel><FormControl><Input placeholder="Centro" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="delegacionMunicipio" render={({ field }) => (
                  <FormItem><FormLabel>Delegación/Municipio</FormLabel><FormControl><Input placeholder="Cuauhtémoc" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="ciudad" render={({ field }) => (
                  <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input placeholder="México" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="estado" render={({ field }) => (
                  <FormItem><FormLabel>Estado</FormLabel><FormControl><Input placeholder="CDMX" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="codigoPostal" render={({ field }) => (
                  <FormItem><FormLabel>CP</FormLabel><FormControl><Input placeholder="06500" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Consulta
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
