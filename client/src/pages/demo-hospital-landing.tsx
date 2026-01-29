import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Phone, MessageCircle, MapPin, Clock, Shield, Star, 
  Stethoscope, Activity, Heart, Siren, ChevronDown, ChevronUp,
  CloudRain, Car, Camera, Users, Award, CheckCircle, ExternalLink,
  AlertTriangle, Thermometer, Zap, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Footer } from "@/components/footer";
import { SEO } from "@/components/SEO";
import type { Hospital, HospitalConsultFee } from "@shared/schema";
import { format } from "date-fns";

const HOSPITAL_SLUG = "east-island-24-hours-animal-hospital";

export default function DemoHospitalLandingPage() {
  const { t, language } = useTranslation();
  const [showAllServices, setShowAllServices] = useState(false);

  const { data: hospital, isLoading: hospitalLoading } = useQuery<Hospital>({
    queryKey: [`/api/hospitals/slug/${HOSPITAL_SLUG}`],
  });

  const { data: consultFees } = useQuery<HospitalConsultFee[]>({
    queryKey: [`/api/hospitals/${hospital?.id}/fees`],
    enabled: !!hospital?.id,
  });

  const { data: regions } = useQuery<Array<{ id: string; nameEn: string; nameZh: string }>>({
    queryKey: ["/api/regions"],
  });

  const hospitalName = useMemo(() => {
    if (!hospital) return language === 'zh-HK' ? "東島24小時動物醫院" : "East Island 24-Hour Animal Hospital";
    return language === 'zh-HK' ? hospital.nameZh : hospital.nameEn;
  }, [hospital, language]);

  const hospitalAddress = useMemo(() => {
    if (!hospital) return "";
    return language === 'zh-HK' ? hospital.addressZh : hospital.addressEn;
  }, [hospital, language]);

  const regionName = useMemo(() => {
    if (!hospital || !regions) return language === 'zh-HK' ? '東區' : 'Eastern';
    const region = regions.find(r => r.id === hospital.regionId);
    return region ? (language === 'zh-HK' ? region.nameZh : region.nameEn) : '';
  }, [hospital, regions, language]);

  const verifiedDate = useMemo(() => {
    if (!hospital?.lastVerifiedAt) return null;
    return format(new Date(hospital.lastVerifiedAt), 'yyyy-MM-dd');
  }, [hospital?.lastVerifiedAt]);

  const nightFee = useMemo(() => {
    if (!consultFees || consultFees.length === 0) return null;
    const nightFees = consultFees.filter(f => f.feeType === 'night' && f.minFee);
    if (nightFees.length === 0) return null;
    return Math.min(...nightFees.map(f => parseFloat(f.minFee!)));
  }, [consultFees]);

  const liveStatusText = useMemo(() => {
    if (!hospital) return language === 'zh-HK' ? '現正營業' : 'OPEN NOW';
    switch (hospital.liveStatus) {
      case 'busy':
        return language === 'zh-HK' ? '繁忙中' : 'BUSY';
      case 'critical_only':
        return language === 'zh-HK' ? '只接緊急' : 'CRITICAL ONLY';
      default:
        return language === 'zh-HK' ? '現正營業' : 'OPEN NOW';
    }
  }, [hospital, language]);

  const liveStatusColor = useMemo(() => {
    if (!hospital) return 'bg-green-500';
    switch (hospital.liveStatus) {
      case 'busy':
        return 'bg-amber-500';
      case 'critical_only':
        return 'bg-red-600';
      default:
        return 'bg-green-500';
    }
  }, [hospital]);

  const trustSignals = useMemo(() => [
    { 
      icon: Clock, 
      title: language === 'zh-HK' ? "24小時營業" : "24/7 Open",
      desc: language === 'zh-HK' ? "全年無休，包括颱風期間" : "Year-round, including typhoons"
    },
    { 
      icon: Shield, 
      title: language === 'zh-HK' ? "駐場獸醫" : "On-Site Vets",
      desc: hospital?.onSiteVet247 
        ? (language === 'zh-HK' ? "24小時專業獸醫當值" : "Professional vets on-site 24/7")
        : (language === 'zh-HK' ? "專業獸醫服務" : "Professional vet services")
    },
    { 
      icon: Award, 
      title: language === 'zh-HK' ? "認證醫院" : "Verified Hospital",
      desc: hospital?.verified 
        ? (language === 'zh-HK' ? "PetSOS認證" : "PetSOS Verified")
        : (language === 'zh-HK' ? "資料已核實" : "Information verified")
    },
    { 
      icon: Star, 
      title: hospital?.isPartner 
        ? (language === 'zh-HK' ? "合作夥伴" : "Partner Hospital")
        : (language === 'zh-HK' ? "專業服務" : "Professional Care"),
      desc: hospital?.isPartner 
        ? (language === 'zh-HK' ? "PetSOS官方合作" : "Official PetSOS Partner")
        : (language === 'zh-HK' ? "專業緊急護理" : "Expert emergency care")
    },
  ], [hospital, language]);

  const coreServices = useMemo(() => {
    const services = [
      { icon: Siren, name: language === 'zh-HK' ? "緊急急症" : "Emergency Care", highlight: true, available: true },
      { icon: Activity, name: language === 'zh-HK' ? "深切治療 (ICU)" : "Intensive Care (ICU)", highlight: true, available: !!hospital?.icuLevel },
      { icon: Stethoscope, name: language === 'zh-HK' ? "內科診症" : "Internal Medicine", highlight: false, available: true },
      { icon: Heart, name: language === 'zh-HK' ? "手術服務" : "Surgical Services", highlight: false, available: hospital?.sxEmergencySoft || hospital?.sxEmergencyOrtho },
      { icon: Camera, name: language === 'zh-HK' ? "X光及超聲波" : "X-Ray & Ultrasound", highlight: false, available: hospital?.imagingXray || hospital?.imagingUS },
      { icon: Thermometer, name: language === 'zh-HK' ? "血液檢驗" : "Blood Tests", highlight: false, available: hospital?.inHouseLab },
    ];
    return services.filter(s => s.available !== false);
  }, [hospital, language]);

  const additionalServices = useMemo(() => {
    const services: string[] = [];
    if (hospital?.bloodTransfusion) services.push(language === 'zh-HK' ? "輸血服務" : "Blood Transfusion");
    if (hospital?.oxygenTherapy) services.push(language === 'zh-HK' ? "氧氣治療" : "Oxygen Therapy");
    if (hospital?.sxEmergencyOrtho) services.push(language === 'zh-HK' ? "骨科手術" : "Orthopedic Surgery");
    if (hospital?.sxEmergencySoft) services.push(language === 'zh-HK' ? "軟組織手術" : "Soft Tissue Surgery");
    if (hospital?.isolationWard) services.push(language === 'zh-HK' ? "隔離病房" : "Isolation Ward");
    if (hospital?.imagingCT) services.push(language === 'zh-HK' ? "CT掃描" : "CT Scan");
    if (hospital?.imagingMRI) services.push(language === 'zh-HK' ? "MRI磁力共振" : "MRI");
    if (hospital?.endoscopy) services.push(language === 'zh-HK' ? "內窺鏡檢查" : "Endoscopy");
    if (hospital?.ventilator) services.push(language === 'zh-HK' ? "呼吸機" : "Ventilator");
    if (hospital?.defibrillator) services.push(language === 'zh-HK' ? "心臟除顫器" : "Defibrillator");
    if (hospital?.exoticVet247) services.push(language === 'zh-HK' ? "特殊動物護理" : "Exotic Pet Care");
    if (hospital?.ambulanceSupport) services.push(language === 'zh-HK' ? "寵物救護車" : "Pet Ambulance");
    return services;
  }, [hospital, language]);

  const weatherProtocol = [
    {
      signal: "T8",
      status: language === 'zh-HK' ? "正常營業" : "Normal Operations",
      desc: language === 'zh-HK' ? "八號風球期間照常服務" : "Full service during Signal 8"
    },
    {
      signal: "T10",
      status: language === 'zh-HK' ? "緊急服務" : "Emergency Only",
      desc: language === 'zh-HK' ? "十號風球維持緊急服務" : "Emergency cases accepted"
    },
    {
      signal: language === 'zh-HK' ? "黑雨" : "Black Rain",
      status: language === 'zh-HK' ? "正常營業" : "Normal Operations",
      desc: language === 'zh-HK' ? "黑色暴雨警告照常服務" : "Full service during Black Rainstorm"
    },
  ];

  const teamHighlights = [
    {
      role: language === 'zh-HK' ? "主診獸醫" : "Lead Veterinarian",
      name: "Dr. Sarah Wong",
      specialty: language === 'zh-HK' ? "急症及深切治療" : "Emergency & Critical Care",
      experience: language === 'zh-HK' ? "12年經驗" : "12 years experience"
    },
    {
      role: language === 'zh-HK' ? "外科獸醫" : "Surgical Specialist",
      name: "Dr. Michael Chan",
      specialty: language === 'zh-HK' ? "骨科及軟組織手術" : "Orthopedic & Soft Tissue Surgery",
      experience: language === 'zh-HK' ? "10年經驗" : "10 years experience"
    },
  ];

  const faqItems = useMemo(() => [
    {
      q: language === 'zh-HK' ? "你們是否24小時有獸醫當值？" : "Do you have vets on-site 24/7?",
      a: hospital?.onSiteVet247 
        ? (language === 'zh-HK' ? "是的，我們全天候有專業獸醫駐場，無需等候獸醫趕回診所。" : "Yes, we have professional veterinarians on-site around the clock. No waiting for a vet to arrive.")
        : (language === 'zh-HK' ? "我們提供24小時服務，請致電確認當值獸醫安排。" : "We provide 24-hour service. Please call to confirm on-duty vet arrangements.")
    },
    {
      q: language === 'zh-HK' ? "颱風期間是否營業？" : "Are you open during typhoons?",
      a: language === 'zh-HK' ? "八號風球期間照常營業，十號風球維持緊急服務。我們明白寵物緊急情況不會因天氣而停止。" : "We operate normally during T8 signals and maintain emergency services during T10. We understand pet emergencies don't stop for weather."
    },
    {
      q: language === 'zh-HK' ? "夜間急症收費如何？" : "What are your night emergency fees?",
      a: nightFee 
        ? (language === 'zh-HK' ? `夜間急症診金由$${nightFee}起，視乎情況而定。建議致電查詢詳細收費。` : `Night emergency consultation starts from $${nightFee}, depending on the case. Please call for detailed pricing.`)
        : (language === 'zh-HK' ? "請致電查詢夜間急症收費詳情。" : "Please call for night emergency fee details.")
    },
    {
      q: language === 'zh-HK' ? "你們接受哪些付款方式？" : "What payment methods do you accept?",
      a: hospital?.payMethods && hospital.payMethods.length > 0
        ? (language === 'zh-HK' ? `我們接受${hospital.payMethods.join('、')}。` : `We accept ${hospital.payMethods.join(', ')}.`)
        : (language === 'zh-HK' ? "我們接受現金、信用卡（Visa/Master）、八達通、PayMe及轉數快。" : "We accept cash, credit cards (Visa/Master), Octopus, PayMe, and FPS.")
    },
    {
      q: language === 'zh-HK' ? "需要預約嗎？" : "Do I need an appointment?",
      a: language === 'zh-HK' ? "緊急情況無需預約，可直接帶寵物前來。一般診症建議預約以減少等候時間。" : "No appointment needed for emergencies - just bring your pet in. For regular consultations, appointments are recommended to reduce waiting time."
    },
  ], [hospital, nightFee, language]);

  const handleCall = () => {
    if (hospital?.phone) {
      window.location.href = `tel:${hospital.phone}`;
    }
  };

  const handleWhatsApp = () => {
    const whatsappNumber = hospital?.whatsapp || hospital?.phone?.replace(/[^0-9]/g, '');
    if (whatsappNumber) {
      const message = encodeURIComponent(language === 'zh-HK' 
        ? "你好，我想查詢動物急症服務" 
        : "Hello, I'd like to inquire about emergency veterinary services");
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    }
  };

  const handleDirections = () => {
    if (hospital?.latitude && hospital?.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`, '_blank');
    } else {
      const query = encodeURIComponent(hospitalAddress);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  if (hospitalLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">{language === 'zh-HK' ? '載入中...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${hospitalName} | ${language === 'zh-HK' ? '24小時動物醫院' : '24-Hour Animal Hospital'}`}
        description={language === 'zh-HK'
          ? `${hospitalName} - 香港${regionName}24小時動物醫院。全天候緊急服務，駐場獸醫，颱風期間照常營業。`
          : `${hospitalName} - 24-hour animal hospital in ${regionName}, Hong Kong. Round-the-clock emergency care, on-site vets, open during typhoons.`
        }
        canonical={`https://petsos.site/demo-hospital-landing`}
        language={language}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/">
                <span className="text-xl font-bold text-red-600 cursor-pointer" data-testid="link-home">PetSOS</span>
              </Link>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <Button 
                  onClick={handleCall}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  data-testid="button-call-top"
                  disabled={!hospital?.phone}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  {language === 'zh-HK' ? '立即致電' : 'Call Now'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Live Status Badge */}
              <div className="flex justify-center mb-4">
                <Badge className={`${liveStatusColor} text-white px-4 py-1 text-sm animate-pulse`} data-testid="badge-live-status">
                  <span className="w-2 h-2 bg-white rounded-full mr-2 inline-block"></span>
                  {liveStatusText}
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" data-testid="text-hospital-name">
                {hospitalName}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-6">
                {language === 'zh-HK' ? '全天候守護您的毛孩' : 'Around-the-Clock Care for Your Beloved Pets'}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center bg-white/20 backdrop-blur rounded-full px-4 py-2">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="font-medium">{language === 'zh-HK' ? '24小時營業' : '24/7 Open'}</span>
                </div>
                {hospital?.onSiteVet247 && (
                  <div className="flex items-center bg-white/20 backdrop-blur rounded-full px-4 py-2">
                    <Shield className="h-5 w-5 mr-2" />
                    <span className="font-medium">{language === 'zh-HK' ? '駐場獸醫' : 'On-Site Vet'}</span>
                  </div>
                )}
                <div className="flex items-center bg-white/20 backdrop-blur rounded-full px-4 py-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="font-medium">{regionName}</span>
                </div>
              </div>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <Button 
                  onClick={handleCall}
                  size="lg"
                  className="flex-1 bg-white text-red-600 hover:bg-gray-100 py-6 text-lg font-bold shadow-xl"
                  data-testid="button-call-hero"
                  disabled={!hospital?.phone}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  {language === 'zh-HK' ? '立即致電' : 'Call Now'}
                </Button>
                <Button 
                  onClick={handleWhatsApp}
                  size="lg"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-6 text-lg font-bold shadow-xl"
                  data-testid="button-whatsapp-hero"
                  disabled={!hospital?.whatsapp && !hospital?.phone}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
              </div>

              {/* Phone Number Display */}
              {hospital?.phone && (
                <p className="mt-4 text-white/80 text-lg font-medium">
                  {hospital.phone}
                </p>
              )}

              {/* Secondary CTA - Fixed visibility */}
              <Button 
                onClick={handleDirections}
                size="lg"
                className="mt-4 bg-white/20 backdrop-blur border-2 border-white text-white hover:bg-white hover:text-red-600 font-semibold transition-all"
                data-testid="button-directions-hero"
              >
                <MapPin className="h-5 w-5 mr-2" />
                {language === 'zh-HK' ? '查看地圖導航' : 'Get Directions'}
              </Button>
            </div>
          </div>
        </section>

        {/* Hospital Video Banner */}
        <section className="bg-gray-900">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                {/* Video Placeholder - Mockup */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                      <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {language === 'zh-HK' ? '醫院環境導覽' : 'Hospital Tour Video'}
                    </h3>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                      {language === 'zh-HK' 
                        ? '觀看我們的24小時急症室、ICU深切治療部、手術室及住院設施'
                        : 'Tour our 24-hour emergency room, ICU, surgery suite, and hospitalization facilities'}
                    </p>
                  </div>
                </div>
                
                {/* Video Overlay Elements */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-600 text-white">
                    <span className="w-2 h-2 bg-white rounded-full mr-2 inline-block animate-pulse"></span>
                    {language === 'zh-HK' ? '24小時運作' : '24/7 Operations'}
                  </Badge>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur rounded-full px-3 py-1">
                      <Activity className="h-4 w-4 text-green-400" />
                      <span>{language === 'zh-HK' ? 'ICU 深切治療' : 'ICU Critical Care'}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur rounded-full px-3 py-1">
                      <Siren className="h-4 w-4 text-red-400" />
                      <span>{language === 'zh-HK' ? '緊急急症室' : 'Emergency Room'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Video Caption */}
              <p className="text-center text-gray-400 text-sm mt-4">
                {language === 'zh-HK' 
                  ? '專業團隊 · 先進設備 · 全天候護理'
                  : 'Professional Team · Advanced Equipment · 24/7 Care'}
              </p>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-8 bg-white dark:bg-gray-800 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trustSignals.map((signal, index) => (
                <div key={index} className="text-center p-4">
                  <signal.icon className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{signal.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{signal.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Medical Disclaimer */}
        <section className="bg-amber-50 dark:bg-amber-900/20 border-y border-amber-200 dark:border-amber-800 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-start gap-3 max-w-4xl mx-auto">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {language === 'zh-HK' 
                  ? '緊急情況請立即致電或直接帶寵物前往醫院。網上查詢不能取代專業獸醫診斷。'
                  : 'For emergencies, call immediately or bring your pet directly. Online inquiries cannot replace professional veterinary diagnosis.'}
              </p>
            </div>
          </div>
        </section>

        {/* Core Services */}
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                {language === 'zh-HK' ? '我們的服務' : 'Our Services'}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {coreServices.map((service, index) => (
                  <Card key={index} className={`${service.highlight ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : ''}`}>
                    <CardContent className="p-4 text-center">
                      <service.icon className={`h-8 w-8 mx-auto mb-2 ${service.highlight ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`} />
                      <p className={`font-medium ${service.highlight ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {service.name}
                      </p>
                      {service.highlight && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {language === 'zh-HK' ? '24小時' : '24/7'}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Additional Services */}
              {additionalServices.length > 0 && (
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowAllServices(!showAllServices)}
                    className="text-red-600"
                    data-testid="button-toggle-services"
                  >
                    {showAllServices 
                      ? (language === 'zh-HK' ? '收起' : 'Show Less')
                      : (language === 'zh-HK' ? `查看更多服務 (${additionalServices.length})` : `View More Services (${additionalServices.length})`)
                    }
                    {showAllServices ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                  </Button>

                  {showAllServices && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {additionalServices.map((service, index) => (
                        <Badge key={index} variant="outline" className="py-1 px-3">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          {service}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Weather Protocol */}
        <section className="py-12 bg-slate-800 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-6">
                <CloudRain className="h-6 w-6" />
                <h2 className="text-2xl font-bold">
                  {language === 'zh-HK' ? '惡劣天氣安排' : 'Severe Weather Protocol'}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weatherProtocol.map((item, index) => (
                  <Card key={index} className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <Badge className="mb-2 bg-amber-500 text-white">
                        {item.signal}
                      </Badge>
                      <p className="font-bold text-green-400">{item.status}</p>
                      <p className="text-sm text-slate-300 mt-1">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <p className="text-center text-slate-400 text-sm mt-6">
                {language === 'zh-HK' 
                  ? '我們明白寵物緊急情況不會因天氣而停止。極端情況下請先致電確認。'
                  : 'We understand pet emergencies don\'t stop for weather. In extreme conditions, please call ahead to confirm.'}
              </p>
            </div>
          </div>
        </section>

        {/* Team Highlights */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-8">
                <Users className="h-6 w-6 text-red-600" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {language === 'zh-HK' ? '專業團隊' : 'Our Team'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamHighlights.map((member, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-xl font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm text-red-600 font-medium">{member.role}</p>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{member.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{member.specialty}</p>
                          <p className="text-sm text-gray-500 mt-1">{member.experience}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Facilities Preview */}
        <section className="py-12 bg-gray-100 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                {language === 'zh-HK' ? '設施環境' : 'Our Facilities'}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: language === 'zh-HK' ? '寬敞候診區' : 'Spacious Waiting Area' },
                  { label: language === 'zh-HK' ? '先進手術室' : 'Advanced Surgery Room' },
                  { label: language === 'zh-HK' ? 'ICU深切治療部' : 'ICU Unit' },
                  { label: language === 'zh-HK' ? '獨立住院區' : 'Hospitalization Ward' },
                ].map((facility, index) => (
                  <div key={index} className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center text-center p-4">
                    <div>
                      <Camera className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">{facility.label}</p>
                      <p className="text-xs text-gray-400 mt-1">{language === 'zh-HK' ? '(相片預留位)' : '(Photo placeholder)'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                {language === 'zh-HK' ? '常見問題' : 'Frequently Asked Questions'}
              </h2>

              <Accordion type="single" collapsible className="space-y-2">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left font-medium" data-testid={`accordion-faq-${index}`}>
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-400">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Location & Contact */}
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                {language === 'zh-HK' ? '位置及聯絡' : 'Location & Contact'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Map Placeholder */}
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center p-4">
                    <MapPin className="h-12 w-12 mx-auto mb-2 text-red-500" />
                    <p className="text-gray-600 dark:text-gray-400">{language === 'zh-HK' ? '(地圖預留位)' : '(Map placeholder)'}</p>
                    <Button 
                      onClick={handleDirections}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      data-testid="button-open-maps"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      {language === 'zh-HK' ? '在Google Maps開啟' : 'Open in Google Maps'}
                    </Button>
                  </div>
                </div>

                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>{hospitalName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 dark:text-gray-300">{hospitalAddress}</p>
                    </div>
                    {hospital?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-red-500" />
                        <a href={`tel:${hospital.phone}`} className="text-red-600 font-medium hover:underline">
                          {hospital.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-red-500" />
                      <p className="text-gray-700 dark:text-gray-300">{language === 'zh-HK' ? '24小時營業' : 'Open 24 Hours'}</p>
                    </div>
                    {hospital?.parking && (
                      <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-red-500" />
                        <p className="text-gray-700 dark:text-gray-300">{language === 'zh-HK' ? '設有泊車位' : 'Parking available'}</p>
                      </div>
                    )}

                    <Separator />

                    <div className="flex flex-col gap-2">
                      <Button 
                        onClick={handleCall} 
                        className="w-full bg-red-600 hover:bg-red-700" 
                        data-testid="button-call-contact"
                        disabled={!hospital?.phone}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {language === 'zh-HK' ? '立即致電' : 'Call Now'}
                      </Button>
                      <Button 
                        onClick={handleWhatsApp} 
                        className="w-full bg-green-500 hover:bg-green-600" 
                        data-testid="button-whatsapp-contact"
                        disabled={!hospital?.whatsapp && !hospital?.phone}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky Bottom CTA (Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t shadow-lg p-4 md:hidden z-40">
          <div className="flex gap-2">
            <Button 
              onClick={handleCall}
              className="flex-1 bg-red-600 hover:bg-red-700 py-5"
              data-testid="button-call-sticky"
              disabled={!hospital?.phone}
            >
              <Phone className="h-5 w-5 mr-2" />
              {language === 'zh-HK' ? '致電' : 'Call'}
            </Button>
            <Button 
              onClick={handleWhatsApp}
              className="flex-1 bg-green-500 hover:bg-green-600 py-5"
              data-testid="button-whatsapp-sticky"
              disabled={!hospital?.whatsapp && !hospital?.phone}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Verification Footer */}
        <div className="bg-gray-100 dark:bg-gray-800 py-4 border-t mb-16 md:mb-0">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>
                {verifiedDate 
                  ? (language === 'zh-HK' 
                      ? `資料最後更新：${verifiedDate} | 由PetSOS核實`
                      : `Last verified: ${verifiedDate} | Verified by PetSOS`)
                  : (language === 'zh-HK' 
                      ? '由PetSOS核實'
                      : 'Verified by PetSOS')
                }
              </span>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
