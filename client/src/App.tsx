import { Switch, Route, useLocation } from "wouter";
import { useEffect, lazy, Suspense, Component, type ErrorInfo, type ReactNode } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { CookieConsent } from "@/components/CookieConsent";
import { PushNotificationBanner } from "@/components/PushNotificationBanner";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { usePageTracking } from "@/hooks/useAnalytics";
import { initSentry } from "@/lib/sentry";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { initializeCapacitor, isNativePlatform } from "@/lib/capacitor";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";

// Cache-busting: Force new bundle hash for Cloudflare bypass
const BUILD_VERSION = "2025-12-04-capacitor-mobile-ready";

// Lazy-loaded pages - only load when needed
import EmergencyPage from "./pages/emergency";
//const EmergencyPage = lazy(() => import("@/pages/emergency"));
import ClinicResultsPage from "@/pages/clinic-results";
//const ClinicResultsPage = lazy(() => import("@/pages/clinic-results"));
import MessageStatusPage from "@/pages/message-status";
//const MessageStatusPage = lazy(() => import("@/pages/message-status"));
const EmergencyProfilePage = lazy(() => import("@/pages/emergency-profile"));
import ProfilePage from "@/pages/profile";
//const ProfilePage = lazy(() => import("@/pages/profile"));
import PetsPage from "@/pages/pets";
//const PetsPage = lazy(() => import("@/pages/pets"));
import ClinicsPage from "@/pages/clinics";
//const ClinicsPage = lazy(() => import("@/pages/clinics"));
const DistrictPage = lazy(() => import("@/pages/district"));
const DistrictsIndexPage = lazy(() => import("@/pages/districts-index"));
const ResourcesPage = lazy(() => import("@/pages/resources"));
const FAQPage = lazy(() => import("@/pages/faq"));
const AboutPage = lazy(() => import("@/pages/about"));
const MedicalAdvisoryPage = lazy(() => import("@/pages/medical-advisory"));
const VerificationProcessPage = lazy(() => import("@/pages/verification-process"));
const ConsultantsPage = lazy(() => import("@/pages/consultants"));
const EmergencySymptomsPage = lazy(() => import("@/pages/emergency-symptoms"));
const EmergencyChecklistPage = lazy(() => import("@/pages/emergency-checklist"));
const TyphoonStatusPage = lazy(() => import("@/pages/typhoon-status"));
const HospitalsPage = lazy(() => import("@/pages/hospitals"));
const HospitalDetailPage = lazy(() => import("@/pages/hospital-detail"));
const ClinicOwnerEditPage = lazy(() => import("@/pages/clinic-owner-edit"));
const ClinicOwnerEditVerifiedPage = lazy(() => import("@/pages/clinic-owner-edit-verified"));
const HospitalOwnerEditVerifiedPage = lazy(() => import("@/pages/hospital-owner-edit-verified"));
const HospitalUpdatePage = lazy(() => import("@/pages/hospital-update"));
const PrivacyPolicyPage = lazy(() => import("@/pages/privacy-policy"));
const TermsOfServicePage = lazy(() => import("@/pages/terms-of-service"));
const MidnightFeeBlogPage = lazy(() => import("@/pages/blog-midnight-fees"));
const BloodBankBlogPage = lazy(() => import("@/pages/blog-blood-bank"));
const TyphoonGuideBlogPage = lazy(() => import("@/pages/blog-typhoon-guide"));
const ImagingDiagnosticsBlogPage = lazy(() => import("@/pages/blog-imaging-diagnostics"));
const ExoticEmergencyBlogPage = lazy(() => import("@/pages/blog-exotic-emergency"));
const DemoHospitalLandingPage = lazy(() => import("@/pages/demo-hospital-landing"));

// Admin pages - lazy loaded (heavy bundle)
const AdminHospitalsPage = lazy(() => import("@/pages/admin-hospitals"));
const AdminClinicsPage = lazy(() => import("@/pages/admin-clinics"));
const AdminConfigPage = lazy(() => import("@/pages/admin-config"));
const AdminDashboardPage = lazy(() => import("@/pages/admin-dashboard"));
const AdminAnalyticsPage = lazy(() => import("@/pages/admin-analytics"));
const AdminUsersPage = lazy(() => import("@/pages/admin-users"));
const AdminPetsPage = lazy(() => import("@/pages/admin-pets"));
const AdminDiagnosticsPage = lazy(() => import("@/pages/admin-diagnostics"));
const AdminNotificationsPage = lazy(() => import("@/pages/admin-notifications"));
const AdminMessagesPage = lazy(() => import("@/pages/admin-messages"));
const AdminChatsPage = lazy(() => import("@/pages/admin-chats"));
const AdminHospitalOutreachPage = lazy(() => import("@/pages/admin-hospital-outreach"));
const AdminHospitalAuditPage = lazy(() => import("@/pages/admin-hospital-audit"));
const AdminConsultantsPage = lazy(() => import("@/pages/admin-consultants"));
const AdminDailyReportPage = lazy(() => import("@/pages/admin-daily-report"));
const AdminLoginPage = lazy(() => import("@/pages/admin-login"));
const ClinicDashboardPage = lazy(() => import("@/pages/clinic-dashboard"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
    </div>
  );
}

function PublicRouter() {
  const [location] = useLocation();
  
  // Track page views
  usePageTracking();
  
  // Don't handle API routes - let them go to the server
  if (location.startsWith('/api/')) {
    return null;
  }

  return (
    <Switch>
      {/* Public routes - render immediately without waiting for auth */}
      <Route path="/clinics" component={ClinicsPage} />
      <Route path="/hospitals" component={HospitalsPage} />
      <Route path="/hospitals/:slug" component={HospitalDetailPage} />
      <Route path="/clinic/edit/:id" component={ClinicOwnerEditVerifiedPage} />
      <Route path="/hospital/edit/:slug" component={HospitalOwnerEditVerifiedPage} />
      <Route path="/hospital-update" component={HospitalUpdatePage} />
      <Route path="/districts" component={DistrictsIndexPage} />
      <Route path="/district/:district" component={DistrictPage} />
      <Route path="/resources" component={ResourcesPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/medical-advisory" component={MedicalAdvisoryPage} />
      <Route path="/verification-process" component={VerificationProcessPage} />
      <Route path="/consultants" component={ConsultantsPage} />
      <Route path="/emergency-symptoms" component={EmergencySymptomsPage} />
      <Route path="/emergency-checklist" component={EmergencyChecklistPage} />
      <Route path="/typhoon-status" component={TyphoonStatusPage} />
      <Route path="/emergency" component={EmergencyPage} />
      <Route path="/emergency-results/:requestId" component={ClinicResultsPage} />
      <Route path="/emergency-results/:requestId/messages" component={MessageStatusPage} />
      <Route path="/emergency-profile/:requestId" component={EmergencyProfilePage} />
      <Route path="/privacy" component={PrivacyPolicyPage} />
      <Route path="/terms" component={TermsOfServicePage} />
      <Route path="/blog/midnight-fees" component={MidnightFeeBlogPage} />
      <Route path="/blog/blood-bank" component={BloodBankBlogPage} />
      <Route path="/blog/typhoon-guide" component={TyphoonGuideBlogPage} />
      <Route path="/blog/imaging-diagnostics" component={ImagingDiagnosticsBlogPage} />
      <Route path="/blog/exotic-emergency" component={ExoticEmergencyBlogPage} />
      <Route path="/demo-hospital-landing" component={DemoHospitalLandingPage} />
      
      {/* Home route - show landing page for everyone */}
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={LoginPage} />
      
      {/* Protected routes - handled by ProtectedRouter */}
      <Route path="/profile" component={ProtectedProfileRoute} />
      <Route path="/pets" component={ProtectedPetsRoute} />
      <Route path="/clinic/dashboard" component={ProtectedClinicRoute} />
      
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin" component={ProtectedAdminRoute} />
      <Route path="/admin/analytics" component={ProtectedAdminAnalyticsRoute} />
      <Route path="/admin/hospitals" component={ProtectedAdminHospitalsRoute} />
      <Route path="/admin/clinics" component={ProtectedAdminClinicsRoute} />
      <Route path="/admin/users" component={ProtectedAdminUsersRoute} />
      <Route path="/admin/pets" component={ProtectedAdminPetsRoute} />
      <Route path="/admin/config" component={ProtectedAdminConfigRoute} />
      <Route path="/admin/diagnostics" component={ProtectedAdminDiagnosticsRoute} />
      <Route path="/admin/notifications" component={ProtectedAdminNotificationsRoute} />
      <Route path="/admin/messages" component={ProtectedAdminMessagesRoute} />
      <Route path="/admin/chats" component={ProtectedAdminChatsRoute} />
      <Route path="/admin/hospital-outreach" component={ProtectedAdminHospitalOutreachRoute} />
      <Route path="/admin/hospital-audit" component={ProtectedAdminHospitalAuditRoute} />
      <Route path="/admin/consultants" component={ProtectedAdminConsultantsRoute} />
      <Route path="/admin/daily-report" component={ProtectedAdminDailyReportRoute} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function ProtectedProfileRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated ? <ProfilePage /> : <LoginPage />;
}

function ProtectedPetsRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated ? <PetsPage /> : <LandingPage />;
}

function ProtectedClinicRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  const hasClinicAccess = user?.role === 'clinic_staff' || user?.role === 'hospital_staff';
  return isAuthenticated && hasClinicAccess ? <ClinicDashboardPage /> : <LandingPage />;
}

function ProtectedAdminRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated && user?.role === 'admin' ? <AdminDashboardPage /> : <AdminLoginPage />;
}

function ProtectedAdminAnalyticsRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated && user?.role === 'admin' ? <AdminAnalyticsPage /> : <AdminLoginPage />;
}

function ProtectedAdminHospitalsRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated && user?.role === 'admin' ? <AdminHospitalsPage /> : <AdminLoginPage />;
}

function ProtectedAdminClinicsRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated && user?.role === 'admin' ? <AdminClinicsPage /> : <AdminLoginPage />;
}

function ProtectedAdminUsersRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated && user?.role === 'admin' ? <AdminUsersPage /> : <AdminLoginPage />;
}

function ProtectedAdminPetsRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated && user?.role === 'admin' ? <AdminPetsPage /> : <AdminLoginPage />;
}

function ProtectedAdminConfigRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated && user?.role === 'admin' ? <AdminConfigPage /> : <AdminLoginPage />;
}

function ProtectedAdminDiagnosticsRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated && user?.role === 'admin' ? <AdminDiagnosticsPage /> : <AdminLoginPage />;
}

function ProtectedAdminNotificationsRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated && user?.role === 'admin' ? <AdminNotificationsPage /> : <AdminLoginPage />;
}

function ProtectedAdminMessagesRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated && user?.role === 'admin' ? <AdminMessagesPage /> : <AdminLoginPage />;
}

function ProtectedAdminChatsRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated && user?.role === 'admin' ? <AdminChatsPage /> : <AdminLoginPage />;
}

function ProtectedAdminHospitalOutreachRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated && user?.role === 'admin' ? <AdminHospitalOutreachPage /> : <AdminLoginPage />;
}

function ProtectedAdminConsultantsRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated && user?.role === 'admin' ? <AdminConsultantsPage /> : <AdminLoginPage />;
}

function ProtectedAdminHospitalAuditRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated && user?.role === 'admin' ? <AdminHospitalAuditPage /> : <AdminLoginPage />;
}

function ProtectedAdminDailyReportRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated && user?.role === 'admin' ? <AdminDailyReportPage /> : <AdminLoginPage />;
}

// Class-based error boundary for non-critical components (silently hides errors)
class SilentErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[SilentErrorBoundary] Non-critical component error:', error.message);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function App() {
  useEffect(() => {
    document.title = "PetSOS";
    
    // Defer Sentry initialization to post-mount to avoid blocking FCP
    initSentry();
    
    // Initialize Capacitor for native mobile support
    initializeCapacitor();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Suspense fallback={<PageLoader />}>
              <PublicRouter />
            </Suspense>
            <CookieConsent />
            <PushNotificationBanner />
            <SilentErrorBoundary>
              <OfflineIndicator />
            </SilentErrorBoundary>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
