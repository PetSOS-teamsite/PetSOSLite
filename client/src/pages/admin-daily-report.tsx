import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Calendar,
  Building2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface Enquiry {
  requestId: string;
  time: string;
  symptom: string;
  aiAnalyzedSymptoms: string | null;
  location: string | null;
  contactName: string;
  contactPhone: string;
  petSpecies: string | null;
  petBreed: string | null;
  petAge: number | null;
  requestStatus: string;
  messageStatus: string;
  messageType: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
}

interface HospitalReport {
  hospitalId: string;
  hospitalNameEn: string;
  hospitalNameZh: string;
  hospitalAddress: string;
  hospitalPhone: string;
  hospitalWhatsapp: string;
  enquiries: Enquiry[];
}

interface DailyReport {
  date: string;
  totalEnquiries: number;
  totalHospitalsContacted: number;
  hospitalReports: HospitalReport[];
}

function getMessageStatusBadge(status: string) {
  switch (status) {
    case "queued":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"><Clock className="h-3 w-3 mr-1" />Queued</Badge>;
    case "sent":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"><MessageSquare className="h-3 w-3 mr-1" />Sent</Badge>;
    case "delivered":
      return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"><CheckCircle2 className="h-3 w-3 mr-1" />Delivered</Badge>;
    case "read":
      return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"><Eye className="h-3 w-3 mr-1" />Read</Badge>;
    case "failed":
      return <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getRequestStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
    case "broadcasting":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Broadcasting</Badge>;
    case "completed":
      return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
    case "cancelled":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function HospitalReportCard({ report }: { report: HospitalReport }) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border border-gray-200 dark:border-gray-700">
        <CollapsibleTrigger asChild>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-t-lg transition-colors"
            data-testid={`hospital-report-header-${report.hospitalId}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                    {report.hospitalNameEn}
                  </CardTitle>
                  {report.hospitalNameZh && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{report.hospitalNameZh}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-1">
                    {report.hospitalAddress && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {report.hospitalAddress}
                      </span>
                    )}
                    {report.hospitalPhone && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <Phone className="h-3 w-3" />
                        {report.hospitalPhone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm font-medium" data-testid={`enquiry-count-${report.hospitalId}`}>
                  {report.enquiries.length} {report.enquiries.length === 1 ? "enquiry" : "enquiries"}
                </Badge>
                {open ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Time</TableHead>
                    <TableHead>Symptom / Condition</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Pet</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Request</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.enquiries.map((enquiry) => (
                    <TableRow key={enquiry.requestId} data-testid={`enquiry-row-${enquiry.requestId}`}>
                      <TableCell className="text-sm font-mono whitespace-nowrap">
                        {format(parseISO(enquiry.time), "HH:mm:ss")}
                      </TableCell>
                      <TableCell className="max-w-[220px]">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={enquiry.symptom}>
                          {enquiry.symptom}
                        </p>
                        {enquiry.aiAnalyzedSymptoms && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5" title={enquiry.aiAnalyzedSymptoms}>
                            AI: {enquiry.aiAnalyzedSymptoms}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-300 max-w-[160px] truncate" title={enquiry.location || "—"}>
                        {enquiry.location || <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                        {enquiry.petSpecies ? (
                          <div>
                            <span className="capitalize">{enquiry.petSpecies}</span>
                            {enquiry.petBreed && <span className="text-gray-400 dark:text-gray-500"> · {enquiry.petBreed}</span>}
                            {enquiry.petAge != null && <span className="text-gray-400 dark:text-gray-500"> · {enquiry.petAge}y</span>}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                        <p className="font-medium">{enquiry.contactName}</p>
                        <p className="text-gray-400 dark:text-gray-500 font-mono text-xs">{enquiry.contactPhone}</p>
                      </TableCell>
                      <TableCell>{getRequestStatusBadge(enquiry.requestStatus)}</TableCell>
                      <TableCell>{getMessageStatusBadge(enquiry.messageStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function AdminDailyReportPage() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const { data: report, isLoading, refetch } = useQuery<DailyReport>({
    queryKey: ["/api/admin/daily-report", selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/admin/daily-report?date=${selectedDate}`);
      if (!res.ok) throw new Error("Failed to fetch daily report");
      return res.json();
    },
  });

  const handleExportCSV = () => {
    if (!report) return;

    const rows: string[][] = [
      ["Hospital", "Hospital (Chinese)", "Address", "Phone", "Time", "Symptom", "AI Symptoms", "Location", "Pet Species", "Pet Breed", "Pet Age", "Contact Name", "Contact Phone", "Request Status", "Message Status", "Message Type", "Sent At", "Delivered At", "Read At"],
    ];

    for (const hospital of report.hospitalReports) {
      for (const enquiry of hospital.enquiries) {
        rows.push([
          hospital.hospitalNameEn,
          hospital.hospitalNameZh,
          hospital.hospitalAddress,
          hospital.hospitalPhone,
          format(parseISO(enquiry.time), "HH:mm:ss"),
          enquiry.symptom,
          enquiry.aiAnalyzedSymptoms || "",
          enquiry.location || "",
          enquiry.petSpecies || "",
          enquiry.petBreed || "",
          enquiry.petAge != null ? String(enquiry.petAge) : "",
          enquiry.contactName,
          enquiry.contactPhone,
          enquiry.requestStatus,
          enquiry.messageStatus,
          enquiry.messageType,
          enquiry.sentAt ? format(parseISO(enquiry.sentAt), "HH:mm:ss") : "",
          enquiry.deliveredAt ? format(parseISO(enquiry.deliveredAt), "HH:mm:ss") : "",
          enquiry.readAt ? format(parseISO(enquiry.readAt), "HH:mm:ss") : "",
        ]);
      }
    }

    const csv = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `petsos-emergency-report-${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SEO noindex={true} />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin">
                  <Button variant="ghost" size="icon" data-testid="button-back">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Daily Emergency Report
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Emergency enquiries per hospital by day
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  data-testid="button-refresh"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={!report || report.totalEnquiries === 0}
                  data-testid="button-export-csv"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Date Picker */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <label htmlFor="report-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Report Date
                  </label>
                </div>
                <input
                  id="report-date"
                  type="date"
                  value={selectedDate}
                  max={today}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  data-testid="input-report-date"
                />
                {selectedDate !== today && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(today)}
                    data-testid="button-today"
                  >
                    Back to Today
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
            </div>
          ) : report ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Enquiries</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-total-enquiries">
                        {report.totalEnquiries}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Hospitals Contacted</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-hospitals-contacted">
                        {report.totalHospitalsContacted}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Report Date</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-report-date">
                        {format(parseISO(report.date), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Hospital Reports */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}
            </div>
          ) : report && report.totalEnquiries === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <AlertCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No emergency enquiries on this date</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {selectedDate === today ? "No enquiries have been submitted today." : `No enquiries were submitted on ${format(parseISO(selectedDate), "d MMMM yyyy")}.`}
                </p>
              </CardContent>
            </Card>
          ) : report ? (
            <div className="space-y-4">
              {report.hospitalReports.map(hospital => (
                <HospitalReportCard key={hospital.hospitalId} report={hospital} />
              ))}
            </div>
          ) : null}
        </main>
      </div>
    </>
  );
}
