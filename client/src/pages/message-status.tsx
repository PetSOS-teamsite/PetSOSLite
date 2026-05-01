import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle, Mail, MessageCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import { useTranslation } from "@/hooks/useTranslation";

interface Message {
  id: string;
  emergencyRequestId: string;
  hospitalId: string;
  messageType: string;
  recipient: string;
  content: string;
  status: string;
  sentAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
}

interface Hospital {
  id: string;
  nameEn: string;
  nameZh: string | null;
}

interface EmergencyRequest {
  id: string;
  symptom: string;
  contactName: string;
  contactPhone: string;
  status: string;
  createdAt: string;
}

export default function MessageStatusPage() {
  const [, params] = useRoute("/emergency-results/:requestId/messages");
  const { language } = useTranslation();
  const languageQuery = `?lang=${encodeURIComponent(language)}`;
  
  const { data: emergencyRequest, isLoading: requestLoading } = useQuery<EmergencyRequest>({
    queryKey: ['/api/emergency-requests', params?.requestId],
    enabled: !!params?.requestId,
  });

  const { data: messages = [], isLoading: messagesLoading, refetch } = useQuery<Message[]>({
    queryKey: ['/api/emergency-requests', params?.requestId, 'messages'],
    enabled: !!params?.requestId,
    refetchInterval: 5000, // Refresh every 5 seconds to get latest status
  });

  const { data: hospitals = [] } = useQuery<Hospital[]>({
    queryKey: ['/api/hospitals'],
  });

  const getHospitalName = (hospitalId: string) => {
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (!hospital) return 'Unknown Hospital';
    return language === "zh-HK"
      ? hospital.nameZh || hospital.nameEn
      : hospital.nameEn || hospital.nameZh || 'Unknown Hospital';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return (
          <Badge className="bg-green-600" data-testid={`badge-status-${status}`}>
            <CheckCircle className="h-3 w-3 mr-1" />
            {status === 'delivered' ? 'Delivered' : 'Sent'}
          </Badge>
        );
      case 'queued':
        return (
          <Badge className="bg-blue-600" data-testid="badge-status-queued">
            <Clock className="h-3 w-3 mr-1" />
            Queued
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" data-testid="badge-status-failed">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" data-testid="badge-status-unknown">
            <AlertCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const getMessageTypeIcon = (type: string) => {
    return type === 'whatsapp' ? (
      <MessageCircle className="h-4 w-4 text-green-600" />
    ) : (
      <Mail className="h-4 w-4 text-blue-600" />
    );
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const stats = {
    total: messages.length,
    sent: messages.filter(m => m.status === 'sent' || m.status === 'delivered').length,
    queued: messages.filter(m => m.status === 'queued').length,
    failed: messages.filter(m => m.status === 'failed').length,
  };

  return (
    <>
      <SEO
        title="Message Status - PetSOS"
        description="Track the status of your emergency broadcast messages"
        noindex={true}
      />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href={`/emergency-results/${params?.requestId}${languageQuery}`}>
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Broadcast Status
              </h1>
              {emergencyRequest && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Emergency Request: {emergencyRequest.symptom.substring(0, 50)}...
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              data-testid="button-refresh"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-total">
                {stats.total}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Successfully Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600" data-testid="text-sent">
                {stats.sent}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Queued
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600" data-testid="text-queued">
                {stats.queued}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600" data-testid="text-failed">
                {stats.failed}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Message Details
          </h2>

          {messagesLoading || requestLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No broadcast messages found for this emergency request.
                </p>
                <Link href={`/emergency-results/${params?.requestId}${languageQuery}`}>
                  <Button className="mt-4" data-testid="button-go-back">
                    Go Back to Results
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card key={message.id} className="hover:shadow-md transition-shadow" data-testid={`card-message-${message.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getMessageTypeIcon(message.messageType)}
                        {getHospitalName(message.hospitalId)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        To: {message.recipient}
                      </CardDescription>
                    </div>
                    {getStatusBadge(message.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Time Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Created:</span>
                        <p className="text-gray-900 dark:text-white">{formatTime(message.createdAt)}</p>
                      </div>
                      {message.sentAt && (
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">Sent:</span>
                          <p className="text-gray-900 dark:text-white">{formatTime(message.sentAt)}</p>
                        </div>
                      )}
                      {message.failedAt && (
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">Failed:</span>
                          <p className="text-red-600">{formatTime(message.failedAt)}</p>
                        </div>
                      )}
                    </div>

                    {/* Retry Information */}
                    {message.retryCount > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <RefreshCw className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Retry attempts: <span className="font-medium">{message.retryCount}</span>
                        </span>
                      </div>
                    )}

                    {/* Error Message */}
                    {message.errorMessage && (
                      <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          Error: {message.errorMessage}
                        </p>
                      </div>
                    )}

                    {/* Message Preview */}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        View Message Content
                      </summary>
                      <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <pre className="text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-sans">
                          {message.content}
                        </pre>
                      </div>
                    </details>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          </div>
        </main>
      </div>
    </>
  );
}
