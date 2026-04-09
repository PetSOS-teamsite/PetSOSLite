import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertCircle, CheckCircle2, Send, RefreshCw, Phone, MessageCircle,
  Key, Globe, Zap, FileText, ExternalLink, Info, Copy, Mail
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Expected template names PetSOS uses
const REQUIRED_TEMPLATES = [
  { name: "emergency_pet_alert_basic_en", lang: "en", desc: "Basic alert (no profile) — English" },
  { name: "emergency_pet_alert_basic_zh_hk", lang: "zh_HK", desc: "Basic alert (no profile) — 繁體中文" },
  { name: "emergency_pet_alert_new_en", lang: "en", desc: "New registered pet — English" },
  { name: "emergency_pet_alert_new_zh_hk", lang: "zh_HK", desc: "New registered pet — 繁體中文" },
  { name: "emergency_pet_alert_full_en", lang: "en", desc: "Full profile with history — English" },
  { name: "emergency_pet_alert_full_zh_hk", lang: "zh_HK", desc: "Full profile with history — 繁體中文" },
];

const TEST_TEMPLATES = [
  { name: "hello_world", lang: "en", desc: "✅ Pre-approved by Meta — use this to test connection now" },
  ...REQUIRED_TEMPLATES,
];

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block h-2.5 w-2.5 rounded-full flex-shrink-0 ${ok ? "bg-green-500" : "bg-red-500"}`} />
  );
}

function CopyButton({ value }: { value: string }) {
  const { toast } = useToast();
  return (
    <button
      className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
      onClick={() => { navigator.clipboard.writeText(value); toast({ title: "Copied!" }); }}
    >
      <Copy className="h-3 w-3" />
    </button>
  );
}

export default function AdminDiagnosticsPage() {
  const { toast } = useToast();
  const [testPhone, setTestPhone] = useState("+85265727136");
  const [testMessage, setTestMessage] = useState("PetSOS WhatsApp Test — please ignore.");
  const [selectedTemplate, setSelectedTemplate] = useState("hello_world");

  // Fetch WhatsApp status (credentials + phone info + templates from Meta)
  const {
    data: waStatus,
    isLoading: loadingStatus,
    refetch: refetchStatus,
    error: statusError,
  } = useQuery<any>({
    queryKey: ["/api/admin/whatsapp-status"],
    refetchOnWindowFocus: false,
  });

  // Get failed messages
  const {
    data: failedMessages,
    isLoading: loadingFailed,
    refetch: refetchFailed,
  } = useQuery<any>({
    queryKey: ["/api/admin/failed-messages"],
  });

  // Send free-text test message
  const testTextMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; message: string }) => {
      const res = await apiRequest("POST", "/api/admin/test-whatsapp", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({ title: "Sent!", description: `Message ID: ${data.debugInfo?.messageId || "unknown"}` });
      } else {
        toast({ title: "Send failed", description: data.error || "Unknown error", variant: "destructive" });
      }
    },
    onError: (err: any) => {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    },
  });

  // Send test template message
  const testTemplateMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; templateName: string }) => {
      const res = await apiRequest("POST", "/api/admin/test-whatsapp-template", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({ title: "Template sent!", description: `Message ID: ${data.messageId || "unknown"}` });
      } else {
        toast({ title: "Template send failed", description: data.error || "Unknown error", variant: "destructive" });
      }
    },
    onError: (err: any) => {
      toast({ title: "Template send failed", description: err.message, variant: "destructive" });
    },
  });

  // Send daily report email
  const dailyReportMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/daily-report/send", {});
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({ title: "Daily report sent!", description: data.message || "Report emailed successfully." });
      } else {
        toast({ title: "Report send failed", description: data.message || "Unknown error", variant: "destructive" });
      }
    },
    onError: (err: any) => {
      toast({ title: "Report send failed", description: err.message, variant: "destructive" });
    },
  });

  const cred = waStatus?.credentialStatus;
  const phoneInfo = waStatus?.phoneInfo;
  const liveTemplates: any[] = waStatus?.templates || [];
  const tokenError: string | null = waStatus?.tokenError || null;
  const isTokenExpired = !!tokenError?.startsWith("TOKEN_EXPIRED");

  // Cross-reference required vs live templates
  const templateStatus = REQUIRED_TEMPLATES.map((req) => {
    const live = liveTemplates.find((t: any) => t.name === req.name);
    return { ...req, live, status: live?.status || "missing" };
  });

  const allTemplatesApproved = !isTokenExpired && templateStatus.every((t) => t.status === "APPROVED");
  const credentialsOk = cred?.hasAccessToken && cred?.hasPhoneNumberId && cred?.hasBusinessAccountId && !isTokenExpired;
  const phoneOk = phoneInfo && !phoneInfo.error;

  // Webhook URL — matches the actual route registered in server/routes.ts
  const webhookUrl = `https://petsos.site/api/webhooks/whatsapp`;

  return (
    <>
      <SEO noindex={true} />
      <div className="container mx-auto p-4 sm:p-6 max-w-5xl space-y-6">
        <div className="mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
            <MessageCircle className="h-7 w-7 text-green-600" />
            WhatsApp Setup & Launch Centre
          </h1>
          <p className="text-muted-foreground text-sm">
            Verify credentials, templates, and test live messages before going live.
          </p>
        </div>

        {/* ─── CRITICAL: Token Expired Banner ─── */}
        {isTokenExpired && (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950/40" data-testid="alert-token-expired">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <AlertDescription>
              <p className="font-bold text-red-700 dark:text-red-400 text-base mb-2">
                🚨 Access Token Expired — No messages can be sent until this is fixed
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                {tokenError?.replace("TOKEN_EXPIRED: ", "")}
              </p>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-gray-800 dark:text-gray-200">How to fix — get a permanent System User token:</p>
                <ol className="list-decimal ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Go to <a href="https://business.facebook.com/settings/system-users/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline inline-flex items-center gap-0.5">Meta Business Settings → System Users <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Select (or create) a System User with <strong>ADMIN</strong> role</li>
                  <li>Click <strong>"Generate New Token"</strong> → select your WhatsApp app</li>
                  <li>Grant permissions: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">whatsapp_business_messaging</code> and <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">whatsapp_business_management</code></li>
                  <li>Set expiry to <strong>"Never"</strong> (System User tokens can be permanent)</li>
                  <li>Copy the token and update the <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">WHATSAPP_ACCESS_TOKEN</code> secret in Replit</li>
                </ol>
                <a href="https://business.facebook.com/settings/system-users/" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700 text-white gap-1">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Meta Business Settings
                  </Button>
                </a>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* ─── Launch Readiness Summary ─── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Launch Readiness
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => refetchStatus()} disabled={loadingStatus}>
                <RefreshCw className={`h-4 w-4 ${loadingStatus ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingStatus ? (
              <p className="text-sm text-muted-foreground">Checking...</p>
            ) : (
              <div className="space-y-2">
                {[
                  {
                    label: "API credentials set",
                    ok: !!credentialsOk,
                    detail: isTokenExpired
                      ? "Token expired — generate a new System User token in Meta Business Settings"
                      : credentialsOk
                      ? "Token, Phone ID & Business Account ID all present"
                      : "One or more credentials missing — see Credentials section below",
                  },
                  {
                    label: "Phone number verified",
                    ok: phoneOk && phoneInfo?.status !== "FLAGGED",
                    detail: phoneOk
                      ? `${phoneInfo.display_phone_number} — ${phoneInfo.verified_name} (${phoneInfo.quality_rating || "N/A"} quality)`
                      : "Cannot verify — check token",
                  },
                  {
                    label: "All 6 templates approved",
                    ok: allTemplatesApproved,
                    detail: allTemplatesApproved
                      ? "All templates have APPROVED status on Meta"
                      : `${templateStatus.filter((t) => t.status !== "APPROVED").length} template(s) not yet approved`,
                  },
                  {
                    label: "Webhook verify token set",
                    ok: !!cred?.hasWebhookToken,
                    detail: cred?.hasWebhookToken
                      ? `Webhook URL: ${webhookUrl}`
                      : "WHATSAPP_WEBHOOK_VERIFY_TOKEN secret not set — hospitals cannot reply until this is configured. Add any random string as this secret, then register the same value in Meta App → WhatsApp → Configuration.",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 py-1.5">
                    <StatusDot ok={item.ok} />
                    <div>
                      <p className={`text-sm font-semibold ${item.ok ? "text-gray-800 dark:text-gray-200" : "text-red-600 dark:text-red-400"}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Credentials ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-4 w-4" />
              Credentials
            </CardTitle>
            <CardDescription className="text-xs">
              Set these in the Replit Secrets pane. Never commit them to code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStatus ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : cred ? (
              <div className="space-y-2">
                {[
                  {
                    key: "WHATSAPP_ACCESS_TOKEN",
                    ok: cred.hasAccessToken,
                    detail: cred.hasAccessToken ? `${cred.accessTokenLength} chars` : "Not set",
                    link: "https://developers.facebook.com/apps/",
                    linkLabel: "Meta App Dashboard",
                  },
                  {
                    key: "WHATSAPP_PHONE_NUMBER_ID",
                    ok: cred.hasPhoneNumberId,
                    detail: cred.phoneNumberId || "Not set",
                    link: null,
                  },
                  {
                    key: "WHATSAPP_BUSINESS_ACCOUNT_ID",
                    ok: cred.hasBusinessAccountId,
                    detail: cred.businessAccountId || "Not set",
                    link: null,
                  },
                  {
                    key: "WHATSAPP_WEBHOOK_VERIFY_TOKEN",
                    ok: cred.hasWebhookToken,
                    detail: cred.hasWebhookToken ? "Set (value hidden)" : "Not set — needed for webhook verification",
                    link: null,
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-3 py-1.5 border-b last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <StatusDot ok={item.ok} />
                      <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded truncate">{item.key}</code>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{item.detail}</span>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs flex items-center gap-1">
                          {item.linkLabel} <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-red-500">{statusError ? "Failed to load status" : "Unknown"}</p>
            )}
          </CardContent>
        </Card>

        {/* ─── Phone Number Info ─── */}
        {phoneInfo && !phoneInfo.error && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-600" />
                Registered Phone Number
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Number", value: phoneInfo.display_phone_number },
                  { label: "Display Name", value: phoneInfo.verified_name },
                  { label: "Quality Rating", value: phoneInfo.quality_rating || "N/A" },
                  { label: "Status", value: phoneInfo.status || "N/A" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Message Templates ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Message Templates
            </CardTitle>
            <CardDescription className="text-xs">
              All 6 templates must be APPROVED on Meta before going live. Create them in the{" "}
              <a href="https://business.facebook.com/wa/manage/message-templates/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-0.5">
                Meta Business Manager <ExternalLink className="h-3 w-3" />
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStatus ? (
              <p className="text-sm text-muted-foreground">Checking templates...</p>
            ) : (
              <div className="space-y-2">
                {templateStatus.map((t) => (
                  <div key={t.name} className="flex items-center justify-between gap-3 py-1.5 border-b last:border-0">
                    <div className="flex items-start gap-2">
                      <StatusDot ok={t.status === "APPROVED"} />
                      <div>
                        <code className="text-xs font-mono">{t.name}</code>
                        <p className="text-xs text-muted-foreground">{t.desc}</p>
                      </div>
                    </div>
                    <Badge
                      variant={t.status === "APPROVED" ? "default" : t.status === "missing" ? "outline" : "secondary"}
                      className={`text-xs flex-shrink-0 ${t.status === "APPROVED" ? "bg-green-600" : t.status === "PENDING" ? "bg-yellow-500" : t.status === "REJECTED" ? "bg-red-500 text-white" : ""}`}
                    >
                      {t.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            {liveTemplates.length > REQUIRED_TEMPLATES.length && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Other templates on your account:</p>
                <div className="flex flex-wrap gap-1">
                  {liveTemplates.filter((t: any) => !REQUIRED_TEMPLATES.find((r) => r.name === t.name)).map((t: any) => (
                    <Badge key={t.name} variant="outline" className="text-xs font-mono">
                      {t.name} ({t.status})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Webhook Configuration ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Webhook Configuration
            </CardTitle>
            <CardDescription className="text-xs">
              Configure this in the Meta App Dashboard → WhatsApp → Configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Callback URL (Webhook URL)</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded font-mono break-all">
                  {webhookUrl}
                </code>
                <CopyButton value={webhookUrl} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Verify Token</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded font-mono">
                  {cred?.hasWebhookToken ? "(stored in WHATSAPP_WEBHOOK_VERIFY_TOKEN secret)" : "❌ Not set"}
                </code>
              </div>
            </div>
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs">
                Subscribe to the <strong>messages</strong> webhook field. The webhook receives inbound hospital replies
                and delivery receipts. Make sure your deployed domain (not dev) is registered in Meta.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* ─── Live Test Section ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="h-4 w-4 text-green-600" />
              Live Message Tests
            </CardTitle>
            <CardDescription className="text-xs">
              Send real messages to your phone to verify end-to-end delivery.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Free text test */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">1. Free-text message (only works if number has messaged PetSOS first)</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Phone Number</Label>
                  <Input
                    placeholder="+85265727136"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    data-testid="input-test-phone"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Message Text</Label>
                  <Input
                    placeholder="Test message"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    data-testid="input-test-message"
                  />
                </div>
              </div>
              <Button
                onClick={() => testTextMutation.mutate({ phoneNumber: testPhone, message: testMessage })}
                disabled={testTextMutation.isPending}
                variant="outline"
                data-testid="button-test-whatsapp"
              >
                {testTextMutation.isPending ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Sending...</> : <><Send className="mr-2 h-4 w-4" />Send Text</>}
              </Button>
              {testTextMutation.data && (
                <Alert className={(testTextMutation.data as any).success ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-red-500 bg-red-50 dark:bg-red-950/30"} data-testid="alert-test-result">
                  {(testTextMutation.data as any).success ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                  <AlertDescription className="text-xs">
                    {(testTextMutation.data as any).success
                      ? `✅ Sent! Message ID: ${(testTextMutation.data as any).debugInfo?.messageId}`
                      : `❌ ${(testTextMutation.data as any).error}`}
                    {(testTextMutation.data as any).details && (
                      <pre className="mt-2 p-2 bg-white dark:bg-gray-900 rounded overflow-x-auto">
                        {JSON.stringify((testTextMutation.data as any).details, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* Template test */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">2. Approved template message (works to any number)</p>
              <p className="text-xs text-muted-foreground">
                This sends a real emergency alert template with placeholder data — perfect for hospital onboarding demos.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Phone Number</Label>
                  <Input
                    placeholder="+85265727136"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger data-testid="select-template">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEST_TEMPLATES.map((t) => (
                        <SelectItem key={t.name} value={t.name}>
                          <span className="font-mono text-xs">{t.name}</span>
                          <span className="ml-2 text-muted-foreground text-xs">{t.desc}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => testTemplateMutation.mutate({ phoneNumber: testPhone, templateName: selectedTemplate })}
                disabled={testTemplateMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-test-template"
              >
                {testTemplateMutation.isPending ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Sending...</> : <><Send className="mr-2 h-4 w-4" />Send Template</>}
              </Button>
              {testTemplateMutation.data && (
                <Alert className={(testTemplateMutation.data as any).success ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-red-500 bg-red-50 dark:bg-red-950/30"}>
                  {(testTemplateMutation.data as any).success ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                  <AlertDescription className="text-xs">
                    {(testTemplateMutation.data as any).success
                      ? `✅ Template sent! Message ID: ${(testTemplateMutation.data as any).messageId}`
                      : `❌ ${(testTemplateMutation.data as any).error}`}
                    {(testTemplateMutation.data as any).details && (
                      <pre className="mt-2 p-2 bg-white dark:bg-gray-900 rounded overflow-x-auto text-xs">
                        {JSON.stringify((testTemplateMutation.data as any).details, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── Daily Report Email ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              Daily Operations Report
            </CardTitle>
            <CardDescription className="text-xs">
              Send the daily case summary email to all configured recipients (DAILY_REPORT_EMAIL env var). Covers the last 24 hours split into 3×8-hour periods.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => dailyReportMutation.mutate()}
              disabled={dailyReportMutation.isPending}
              className="gap-2"
              data-testid="button-send-daily-report"
            >
              {dailyReportMutation.isPending ? (
                <><RefreshCw className="h-4 w-4 animate-spin" />Sending Report...</>
              ) : (
                <><Mail className="h-4 w-4" />Send Daily Report Now</>
              )}
            </Button>
            {dailyReportMutation.data && (
              <Alert className={(dailyReportMutation.data as any).success ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-red-500 bg-red-50 dark:bg-red-950/30"}>
                {(dailyReportMutation.data as any).success
                  ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                  : <AlertCircle className="h-4 w-4 text-red-600" />}
                <AlertDescription className="text-xs">
                  {(dailyReportMutation.data as any).success
                    ? `✅ ${(dailyReportMutation.data as any).message}`
                    : `❌ ${(dailyReportMutation.data as any).message || "Failed to send report"}`}
                </AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-muted-foreground">
              Note: The daily report is also scheduled to send automatically at 08:00 HKT every morning.
            </p>
          </CardContent>
        </Card>

        {/* ─── Failed Messages ─── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Failed Messages
              </CardTitle>
              <CardDescription className="text-xs">
                Messages that failed to deliver via WhatsApp
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => refetchFailed()} disabled={loadingFailed} data-testid="button-refresh-failed">
              <RefreshCw className={`h-4 w-4 ${loadingFailed ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {loadingFailed ? (
              <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
            ) : failedMessages && failedMessages.total > 0 ? (
              <div className="space-y-3">
                <Badge variant="destructive" data-testid="badge-failed-count">{failedMessages.total} failed</Badge>
                {failedMessages.messages.map((msg: any, idx: number) => (
                  <div key={msg.id} className="border rounded-lg p-3 space-y-1 text-sm" data-testid={`failed-message-${idx}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">To: {msg.recipient}</span>
                      <Badge variant="outline">{msg.retryCount}/3 retries</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Type: {msg.messageType}</p>
                    {msg.error && <p className="text-xs text-red-600 dark:text-red-400">Error: {msg.error}</p>}
                    {msg.failedAt && <p className="text-xs text-muted-foreground">{new Date(msg.failedAt).toLocaleString()}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6 text-sm">No failed messages — all clear ✅</p>
            )}
          </CardContent>
        </Card>

        {/* ─── Quick Links ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Useful Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: "Meta App Dashboard", url: "https://developers.facebook.com/apps/" },
                { label: "Message Templates Manager", url: "https://business.facebook.com/wa/manage/message-templates/" },
                { label: "WhatsApp Business Manager", url: "https://business.facebook.com/wa/manage/phone-numbers/" },
                { label: "Cloud API Docs", url: "https://developers.facebook.com/docs/whatsapp/cloud-api/" },
                { label: "Webhook Setup Guide", url: "https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks" },
                { label: "System User Tokens", url: "https://business.facebook.com/settings/system-users/" },
              ].map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                  {link.label}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
