import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Loader2, ArrowLeft, Building2, MapPin, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import lacerLogo from '@/assets/lacer-logo-clean.png';

const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Email inválido' }).max(255),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres' }).max(100),
});

const signupSchema = z.object({
  email: z.string().trim().email({ message: 'Email inválido' }).max(255),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres' }).max(100),
  clinic_name: z.string().min(1, { message: 'Requerido' }).max(200),
  locality: z.string().min(1, { message: 'Requerido' }).max(200),
  province: z.string().min(1, { message: 'Requerido' }).max(200),
});

const forgotSchema = z.object({
  email: z.string().trim().email({ message: 'Email inválido' }).max(255),
});

const resetSchema = z
  .object({
    password: z.string().min(6, { message: 'Mínimo 6 caracteres' }).max(100),
    confirm: z.string().min(6, { message: 'Mínimo 6 caracteres' }).max(100),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type ForgotFormData = z.infer<typeof forgotSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', clinic_name: '', locality: '', province: '' },
  });

  const forgotForm = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirm: '' },
  });

  // Detect password recovery flow from Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && user && !isRecoveryMode) {
      (async () => {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        navigate(data ? '/admin' : '/');
      })();
    }
  }, [user, authLoading, navigate, isRecoveryMode]);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast({
          title: 'Error de inicio de sesión',
          description: error.message === 'Invalid login credentials'
            ? 'Credenciales incorrectas'
            : error.message,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Sesión iniciada correctamente' });
        const { data: sessionData } = await supabase.auth.getSession();
        const uid = sessionData.session?.user?.id;
        if (uid) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', uid)
            .eq('role', 'admin')
            .maybeSingle();
          navigate(roleData ? '/admin' : '/');
        } else {
          navigate('/');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, {
        clinic_name: data.clinic_name,
        locality: data.locality,
        province: data.province,
      });
      if (error) {
        const message = error.message.includes('already registered')
          ? 'Este email ya está registrado'
          : error.message;
        toast({
          title: 'Error de registro',
          description: message,
          variant: 'destructive',
        });
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          toast({ title: 'Cuenta creada correctamente' });
          navigate('/');
        } else {
          toast({
            title: 'Revisa tu email',
            description: 'Te hemos enviado un enlace de confirmación para activar tu cuenta.',
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (data: ForgotFormData) => {
    setForgotLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      toast({
        title: 'Email enviado',
        description: 'Si el email existe, recibirás un enlace de recuperación en breve.',
      });
      setForgotOpen(false);
      forgotForm.reset();
    } catch (e) {
      toast({
        title: 'Email enviado',
        description: 'Si el email existe, recibirás un enlace de recuperación en breve.',
      });
      setForgotOpen(false);
      forgotForm.reset();
    } finally {
      setForgotLoading(false);
    }
  };

  const handleReset = async (data: ResetFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Contraseña actualizada correctamente' });
        setIsRecoveryMode(false);
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openForgot = () => {
    const currentEmail = loginForm.getValues('email');
    forgotForm.reset({ email: currentEmail || '' });
    setForgotOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  // Password recovery view
  if (isRecoveryMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-secondary/5 via-background to-secondary/10 p-4 pt-safe">
        <Card className="w-full max-w-md border-secondary/20 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4 border border-secondary/10">
              <img src={lacerLogo} alt="Lacer" className="w-14 h-14 object-contain" />
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              Nueva contraseña
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Introduce tu nueva contraseña para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-3">
                <FormField
                  control={resetForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="password" placeholder="••••••••" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={resetForm.control}
                  name="confirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="password" placeholder="••••••••" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full btn-gradient-red" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Actualizar contraseña
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-secondary/5 via-background to-secondary/10 p-4 pt-safe">
      <Card className="w-full max-w-md border-secondary/20 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4 border border-secondary/10">
            <img src={lacerLogo} alt="Lacer" className="w-14 h-14 object-contain" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            Acceso Profesional
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Inicia sesión o crea una cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="mt-4">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-3">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="tu@email.com" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="password" placeholder="••••••••" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end -mt-1">
                    <button
                      type="button"
                      onClick={openForgot}
                      className="text-xs text-muted-foreground hover:text-secondary transition-colors underline-offset-2 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <Button type="submit" className="w-full btn-gradient-red" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Iniciar sesión
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="mt-4">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-3">
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="tu@email.com" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="password" placeholder="••••••••" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="clinic_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clínica / Profesional</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Nombre de clínica o profesional" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={signupForm.control}
                      name="locality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localidad</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Ciudad" className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provincia</FormLabel>
                          <FormControl>
                            <Input placeholder="Provincia" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full btn-gradient-red" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear cuenta
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <p className="text-[10px] text-muted-foreground text-center leading-tight">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </CardContent>
      </Card>
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 text-muted-foreground hover:text-foreground"
        onClick={() => {
          localStorage.removeItem('lacer_user_mode');
          navigate('/');
        }}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Volver al inicio
      </Button>

      {/* Forgot password dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-2">
              <KeyRound className="w-5 h-5 text-secondary" />
            </div>
            <DialogTitle className="text-center">Recuperar contraseña</DialogTitle>
            <DialogDescription className="text-center">
              Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
            </DialogDescription>
          </DialogHeader>
          <Form {...forgotForm}>
            <form onSubmit={forgotForm.handleSubmit(handleForgot)} className="space-y-4">
              <FormField
                control={forgotForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="tu@email.com" className="pl-9" autoFocus {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotOpen(false)}
                  disabled={forgotLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="btn-gradient-red" disabled={forgotLoading}>
                  {forgotLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar enlace
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
