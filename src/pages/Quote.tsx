
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Define el esquema de validación con zod
const quoteFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().optional(),
  company: z.string().optional(),
  minerCount: z.string().min(1, { message: "Indique el número de mineros" }),
  minerType: z.string().min(1, { message: "Seleccione un tipo de minero" }),
  powerRequirement: z.string().optional(),
  location: z.string().min(1, { message: "Seleccione una ubicación" }),
  additionalInfo: z.string().optional(),
  contactConsent: z.boolean().refine(val => val === true, {
    message: "Debes aceptar los términos para continuar"
  })
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

const Quote = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      minerCount: "",
      minerType: "",
      powerRequirement: "",
      location: "",
      additionalInfo: "",
      contactConsent: false,
    },
  });

  function onSubmit(data: QuoteFormValues) {
    setIsSubmitting(true);
    
    // Simulamos el envío del formulario
    setTimeout(() => {
      console.log("Datos del formulario:", data);
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Formulario enviado correctamente", {
        description: "Nos pondremos en contacto contigo pronto.",
      });
    }, 1500);
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quote</h1>
        <p className="text-muted-foreground">Solicita una cotización personalizada para tu operación minera</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border border-border rounded-lg p-6 bg-tmcdark-card">
          <h2 className="text-xl font-medium mb-4">Solicitud de Cotización</h2>
          <p className="text-muted-foreground mb-6">
            Complete el formulario a continuación para obtener una cotización personalizada para su operación de minería a gran escala. Nuestro equipo revisará sus necesidades y se pondrá en contacto con usted dentro de 24-48 horas.
          </p>
          
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100/10 mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">¡Solicitud enviada con éxito!</h3>
              <p className="text-muted-foreground mb-6">
                Gracias por tu interés en TMC Watch. Nos pondremos en contacto contigo en breve para discutir tus necesidades de hosting.
              </p>
              <Button onClick={() => setIsSubmitted(false)}>Enviar otra solicitud</Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 123-456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Mining Company LLC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="minerCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad de mineros *</FormLabel>
                        <FormControl>
                          <Input placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minerType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de minero *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo de minero" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="antminer_s19">Antminer S19</SelectItem>
                            <SelectItem value="antminer_s19j">Antminer S19j Pro</SelectItem>
                            <SelectItem value="antminer_s19_pro">Antminer S19 Pro</SelectItem>
                            <SelectItem value="whatsminer_m30s">Whatsminer M30S</SelectItem>
                            <SelectItem value="whatsminer_m30s+">Whatsminer M30S+</SelectItem>
                            <SelectItem value="mixed">Mixto</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="powerRequirement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requerimiento de energía (kW)</FormLabel>
                        <FormControl>
                          <Input placeholder="30" {...field} />
                        </FormControl>
                        <FormDescription>
                          Si no lo conoces, podemos ayudarte a calcularlo.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación preferida *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar ubicación" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="usa_texas">USA - Texas</SelectItem>
                            <SelectItem value="usa_wyoming">USA - Wyoming</SelectItem>
                            <SelectItem value="canada">Canadá</SelectItem>
                            <SelectItem value="paraguay">Paraguay</SelectItem>
                            <SelectItem value="no_preference">Sin preferencia</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Información adicional</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detalles adicionales sobre tu proyecto o necesidades específicas" 
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactConsent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Acepto ser contactado acerca de mi solicitud de cotización *
                        </FormLabel>
                        <FormDescription>
                          Respetamos tu privacidad y no compartiremos tus datos con terceros.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Solicitar cotización"}
                </Button>
              </form>
            </Form>
          )}
        </div>

        <div className="border border-border rounded-lg p-6 bg-tmcdark-card">
          <h2 className="text-xl font-medium mb-4">Por qué elegir TMC Watch</h2>
          
          <div className="space-y-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-bitcoin/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-bitcoin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Energía de bajo costo</h3>
                <p className="text-muted-foreground text-sm">Acceso a fuentes de energía confiables y económicas para maximizar la rentabilidad de tu minería.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-bitcoin/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-bitcoin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Seguridad 24/7</h3>
                <p className="text-muted-foreground text-sm">Instalaciones con vigilancia y seguridad las 24 horas, acceso controlado y cámaras de seguridad.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-bitcoin/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-bitcoin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Monitoreo avanzado</h3>
                <p className="text-muted-foreground text-sm">Acceso a nuestra plataforma TMC Watch para monitoreo en tiempo real y gestión remota de tus equipos.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-bitcoin/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-bitcoin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Soporte técnico experto</h3>
                <p className="text-muted-foreground text-sm">Equipo de técnicos especializados disponibles para mantenimiento y reparación de tu hardware.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-bitcoin/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-bitcoin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Precios transparentes</h3>
                <p className="text-muted-foreground text-sm">Sin costos ocultos. Nuestras tarifas incluyen todos los servicios necesarios para tu operación.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 rounded-lg bg-tmcdark border border-border">
            <h3 className="font-semibold mb-2">¿Necesitas una cotización urgente?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Contáctanos directamente para atención prioritaria:
            </p>
            <div className="flex items-center text-sm mb-2">
              <svg className="w-4 h-4 mr-2 text-bitcoin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              sales@tmcwatch.com
            </div>
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 mr-2 text-bitcoin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              +1 (555) 123-4567
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Quote;
