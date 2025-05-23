import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const authSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const Auth = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      if (activeTab === 'login') {
        await signIn(data.email, data.password);
      } else {
        await signUp(data.email, data.password);
        setActiveTab('login');
        form.reset();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      // Mapear errores de Firebase a mensajes amigables
      switch (error.code) {
        case 'auth/user-not-found':
          setError('Usuario no encontrado. Verifica tu email.');
          break;
        case 'auth/wrong-password':
          setError('Contraseña incorrecta.');
          break;
        case 'auth/email-already-in-use':
          setError('El email ya está registrado.');
          break;
        case 'auth/invalid-email':
          setError('Email inválido.');
          break;
        default:
          setError('Error: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-tmcdark p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-bitcoin mx-auto flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Hashira AI</h1>
          <p className="text-muted-foreground">Plataforma de gestión de minería Bitcoin</p>
        </div>

        <Card className="p-6 bg-tmcdark-card border-border">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="tu@email.com" 
                            type="email" 
                            {...field} 
                            autoComplete="username"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="******" 
                            type="password" 
                            {...field} 
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-bitcoin hover:bg-bitcoin/90" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Procesando...' : 'Iniciar Sesión'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="register">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="tu@email.com" 
                            type="email" 
                            {...field} 
                            autoComplete="new-username"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="******" 
                            type="password" 
                            {...field} 
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-bitcoin hover:bg-bitcoin/90" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Procesando...' : 'Registrarse'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;