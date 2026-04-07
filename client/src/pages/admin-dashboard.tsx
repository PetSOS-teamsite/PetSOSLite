import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Building2,
  MapPin,
  Phone,
  Calendar,
  Users,
  Heart,
  Stethoscope,
  Bell,
  MessageSquare,
  MessagesSquare,
  TrendingUp
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import type { EmergencyRequest, Region, Pet, User } from "@shared/schema";
import { format } from "date-fns";

interface UnreadCount {
  unreadCount: number;
  unreadConversations: number;
}

export default function AdminDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");

  const { data: emergencyRequests, isLoading: requestsLoading } = useQuery<any[]>({
    queryKey: ["/api/emergency-requests"],
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  const { data: regions } = useQuery<Region[]>({
    queryKey: ["/api/regions"],
  });

  const { data: unreadData } = useQuery<UnreadCount>({
    queryKey: ["/api/admin/conversations/unread-count"],
    refetchInterval: 30000,
  });

  // Calculate stats
  const stats = {
    total: emergencyRequests?.length ?? 0,
    pending: (emergencyRequests?.filter(r => r.status === 'pending') ?? []).length,
    active: (emergencyRequests?.filter(r => r.status === 'broadcasting') ?? []).length,
    completed: (emergencyRequests?.filter(r => r.status === 'completed') ?? []).length,
    last24Hours: (emergencyRequests?.filter(r => {
      const created = new Date(r.createdAt);
      const now = new Date();
      const diff = now.getTime() - created.getTime();
      return diff < 24 * 60 * 60 * 1000;
    }) ?? []).length,
  };

  // Filter logic
  const filteredRequests = emergencyRequests?.filter(request => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const symptomMatch = request.symptom?.toLowerCase().includes(search);
      const locationMatch = request.manualLocation?.toLowerCase().includes(search);
      if (!symptomMatch && !locationMatch) return false;
    }

    // Status filter
    if (statusFilter !== "all" && request.status !== statusFilter) return false;

    // Region filter
    if (regionFilter !== "all" && request.regionId !== regionFilter) return false;

    // Time filter
    if (timeFilter !== "all") {
      const created = new Date(request.createdAt);
      const now = new Date();
      const diff = now.getTime() - created.getTime();
      
      if (timeFilter === "1h" && diff > 60 * 60 * 1000) return false;
      if (timeFilter === "24h" && diff > 24 * 60 * 60 * 1000) return false;
      if (timeFilter === "7d" && diff > 7 * 24 * 60 * 60 * 1000) return false;
    }

    return true;
  }) ?? [];

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/emergency-requests"] });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'broadcasting':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><AlertCircle className="h-3 w-3 mr-1" />Broadcasting</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRegionName = (regionId: string | null) => {
    if (!regionId) return "Unknown";
    const region = regions?.find(r => r.id === regionId);
    return region ? region.nameEn : regionId;
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
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Admin: Emergency Queue
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monitor and manage active emergency requests
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                data-testid="button-refresh"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Link href="/admin/users">
                <Button variant="outline" size="sm" data-testid="button-admin-users">
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </Button>
              </Link>
              <Link href="/admin/pets">
                <Button variant="outline" size="sm" data-testid="button-admin-pets">
                  <Heart className="h-4 w-4 mr-2" />
                  Pets
                </Button>
              </Link>
              <Link href="/admin/clinics">
                <Button variant="outline" size="sm" data-testid="button-admin-clinics">
                  <Building2 className="h-4 w-4 mr-2" />
                  Clinics
                </Button>
              </Link>
              <Link href="/admin/hospitals">
                <Button variant="outline" size="sm" data-testid="button-admin-hospitals">
                  <Building2 className="h-4 w-4 mr-2" />
                  Hospitals
                </Button>
              </Link>
              <Link href="/admin/diagnostics">
                <Button variant="outline" size="sm" data-testid="button-admin-diagnostics">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Diagnostics
                </Button>
              </Link>
              <Link href="/admin/notifications">
                <Button variant="outline" size="sm" data-testid="button-admin-notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
              </Link>
              <Link href="/admin/messages">
                <Button variant="outline" size="sm" data-testid="button-admin-messages">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
              </Link>
              <Link href="/admin/chats">
                <Button variant="outline" size="sm" className="relative" data-testid="button-admin-chats">
                  <MessagesSquare className="h-4 w-4 mr-2" />
                  Chats
                  {unreadData && unreadData.unreadConversations > 0 && (
                    <Badge 
                      className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 bg-red-500 text-white text-xs"
                    >
                      {unreadData.unreadConversations}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" size="sm" data-testid="button-admin-analytics">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link href="/admin/daily-report">
                <Button variant="outline" size="sm" data-testid="button-admin-daily-report">
                  <Calendar className="h-4 w-4 mr-2" />
                  Daily Report
                </Button>
              </Link>
              <Link href="/admin/consultants">
                <Button variant="outline" size="sm" data-testid="button-admin-consultants">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Consultants
                </Button>
              </Link>
              <Link href="/admin/config">
                <Button variant="outline" size="sm" data-testid="button-admin-config">
                  <Settings className="h-4 w-4 mr-2" />
                  Config
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-total-requests">
                      {requestsLoading ? "..." : stats.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-pending-requests">
                      {requestsLoading ? "..." : stats.pending}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Broadcasting</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-active-requests">
                      {requestsLoading ? "..." : stats.active}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {requestsLoading ? "..." : stats.completed}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last 24h</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {requestsLoading ? "..." : stats.last24Hours}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search symptoms, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="broadcasting">Broadcasting</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {/* Region Filter */}
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger data-testid="select-region">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions?.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Time Filter */}
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger data-testid="select-time">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Showing {filteredRequests.length} of {stats.total} requests</span>
                {(searchTerm || statusFilter !== "all" || regionFilter !== "all" || timeFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setRegionFilter("all");
                      setTimeFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Requests Table */}
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No emergency requests found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Symptom</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Contact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id} data-testid={`row-request-${request.id}`}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {format(new Date(request.createdAt), 'MMM d, HH:mm')}
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {request.symptom || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              {getRegionName(request.regionId)}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {request.manualLocation || 'GPS Only'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {request.contactPhone || 'N/A'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </>
  );
}
