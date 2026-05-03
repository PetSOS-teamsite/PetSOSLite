import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FcGoogle } from "react-icons/fc";
import { Separator } from "@/components/ui/separator";
import { PhoneInput } from "@/components/PhoneInput";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Lock, Key } from "lucide-react";

// Email-specific schemas
const emailLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
});

// Phone-specific schemas
const phoneLoginSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  countryCode: z.string().default("+852"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().optional(),
});

const unifiedSignupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  countryCode: z.string().default("+852"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const [location, setLocation] = useLocation();
  const [isSignup, setIsSignup] = useState(location === '/signup');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // 2FA state
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [pendingUserInfo, setPendingUserInfo] = useState<{ id: string; email?: string; name?: string } | null>(null);

  const emailLoginForm = useForm({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      phone: "",
      countryCode: "+852",
    },
  });

  const phoneLoginForm = useForm({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      phone: "",
      countryCode: "+852",
      password: "",
      email: "",
    },
  });

  const signupForm = useForm({
    resolver: zodResolver(unifiedSignupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      countryCode: "+852",
      password: "",
    },
    mode: "onSubmit",
  });


  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google?returnTo=/profile";
  };

  const onLogin = async (data: any) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      
      const result = await response.json();
      
      // Check if 2FA is required
      if (result.requiresTwoFactor) {
        setPendingUserInfo(result.user);
        setShowTwoFactorModal(true);
        return;
      }
      
      // Wait for the user query to refetch before redirecting
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      
      setLocation("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    }
  };
  
  const handleVerify2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length < 6) return;
    
    setIsVerifying2FA(true);
    try {
      const response = await fetch("/api/auth/2fa/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: twoFactorCode,
          useBackupCode: useBackupCode
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Verification failed");
      }
      
      // Wait for the user query to refetch before redirecting
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      
      setShowTwoFactorModal(false);
      setTwoFactorCode('');
      setPendingUserInfo(null);
      setLocation("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Verification failed",
        variant: "destructive",
      });
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const onSignup = async (data: any) => {
    try {
      const cleanedData = authMethod === 'email'
        ? { ...data, phone: undefined, countryCode: undefined }
        : { ...data, email: undefined };
      
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Signup failed");
      }
      
      // Wait for the user query to refetch before redirecting
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      
      setLocation("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Signup failed",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <SEO noindex={true} />
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1" />
            <CardTitle className="text-3xl font-bold text-red-600 flex-1 text-center">
              PetSOS
            </CardTitle>
            <div className="flex-1 flex justify-end">
              <LanguageSwitcher />
            </div>
          </div>
          <CardDescription>
            {isSignup ? t("login.create_account", "Create your account") : t("login.sign_in", "Sign in to your account")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Sign In */}
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full"
            data-testid="button-google-login"
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            {t("login.google", "Continue with Google")}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("login.or_continue", "Or continue with")}
              </span>
            </div>
          </div>

          {/* Email/Phone Tabs */}
          <Tabs value={authMethod} className="w-full" onValueChange={(value) => setAuthMethod(value as 'email' | 'phone')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" data-testid="tab-email">{t("login.email", "Email")}</TabsTrigger>
              <TabsTrigger value="phone" data-testid="tab-phone">{t("login.phone", "Phone")}</TabsTrigger>
            </TabsList>
            
          </Tabs>

          {authMethod === "email" ? (
            isSignup ? (
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                name={field.name}
                                ref={field.ref}
                                value={field.value ?? ""}
                                onBlur={field.onBlur}
                                onChange={(event) => field.onChange(event.target.value)}
                                data-testid="input-name"
                                placeholder="Enter your name"
                              />
                            </FormControl>
                            <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                name={field.name}
                                ref={field.ref}
                                value={field.value ?? ""}
                                onBlur={field.onBlur}
                                onChange={(event) => field.onChange(event.target.value)}
                                data-testid="input-email"
                              />
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                name={field.name}
                                ref={field.ref}
                                value={field.value ?? ""}
                                onBlur={field.onBlur}
                                onChange={(event) => field.onChange(event.target.value)}
                                data-testid="input-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                  />
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" data-testid="button-signup">
                    Create Account
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...emailLoginForm}>
                <form onSubmit={emailLoginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={emailLoginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailLoginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} data-testid="input-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" data-testid="button-login">
                    Sign In
                  </Button>
                </form>
              </Form>
            )
          ) : isSignup ? (
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            name={field.name}
                            ref={field.ref}
                            value={field.value ?? ""}
                            onBlur={field.onBlur}
                            onChange={(event) => field.onChange(event.target.value)}
                            data-testid="input-name-phone"
                            placeholder="Enter your name"
                          />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value || ""}
                          onChange={field.onChange}
                          countryCode={signupForm.watch("countryCode") || "+852"}
                          onCountryCodeChange={(code) => signupForm.setValue("countryCode", code)}
                          testId="input-phone"
                        />
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            name={field.name}
                            ref={field.ref}
                            value={field.value ?? ""}
                            onBlur={field.onBlur}
                            onChange={(event) => field.onChange(event.target.value)}
                            data-testid="input-password-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                />
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" data-testid="button-signup-phone">
                  Create Account
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...phoneLoginForm}>
              <form onSubmit={phoneLoginForm.handleSubmit(onLogin)} className="space-y-4">
                <FormField
                  control={phoneLoginForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value || ""}
                          onChange={field.onChange}
                          countryCode={phoneLoginForm.watch("countryCode") || "+852"}
                          onCountryCodeChange={(code) => phoneLoginForm.setValue("countryCode", code)}
                          testId="input-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={phoneLoginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} data-testid="input-password-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" data-testid="button-login-phone">
                  Sign In
                </Button>
              </form>
            </Form>
          )}

          {/* Toggle between login and signup */}
          <div className="text-center text-sm">
            {isSignup ? (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignup(false)}
                  className="text-red-600 hover:underline font-medium"
                  data-testid="link-signin"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => setIsSignup(true)}
                  className="text-red-600 hover:underline font-medium"
                  data-testid="link-signup"
                >
                  Create account
                </button>
              </p>
            )}
          </div>

          {/* Back to home */}
          <div className="text-center">
            <a href="/" className="text-sm text-muted-foreground hover:underline">
              ← Back to home
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication Modal */}
      <Dialog open={showTwoFactorModal} onOpenChange={(open) => {
        if (!open) {
          setShowTwoFactorModal(false);
          setTwoFactorCode('');
          setUseBackupCode(false);
          setPendingUserInfo(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" />
              {t("login.2fa.title", "Two-Factor Authentication")}
            </DialogTitle>
            <DialogDescription>
              {pendingUserInfo?.email && (
                <span className="block text-sm text-gray-500 mb-2">
                  {t("login.2fa.logging_in_as", "Logging in as")} {pendingUserInfo.email}
                </span>
              )}
              {useBackupCode 
                ? t("login.2fa.backup_desc", "Enter one of your backup codes to continue logging in.")
                : t("login.2fa.desc", "Enter the 6-digit code from your authenticator app to continue logging in.")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              {useBackupCode ? (
                <Input
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXX"
                  className="text-center font-mono text-lg"
                  maxLength={8}
                  data-testid="input-backup-code"
                />
              ) : (
                <InputOTP
                  value={twoFactorCode}
                  onChange={setTwoFactorCode}
                  maxLength={6}
                  data-testid="input-2fa-login-code"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              )}
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setTwoFactorCode('');
                }}
                className="text-sm text-blue-600 hover:underline"
                data-testid="button-toggle-backup-code"
              >
                {useBackupCode 
                  ? t("login.2fa.use_app", "Use authenticator app instead")
                  : t("login.2fa.use_backup", "Use a backup code instead")}
              </button>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowTwoFactorModal(false);
                setTwoFactorCode('');
                setUseBackupCode(false);
                setPendingUserInfo(null);
              }}
              data-testid="button-cancel-2fa"
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              onClick={handleVerify2FA}
              disabled={(useBackupCode ? twoFactorCode.length < 6 : twoFactorCode.length !== 6) || isVerifying2FA}
              data-testid="button-verify-2fa-login"
            >
              {isVerifying2FA ? (
                <>
                  <Key className="w-4 h-4 mr-2 animate-spin" />
                  {t("login.2fa.verifying", "Verifying...")}
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  {t("login.2fa.verify", "Verify & Sign In")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
