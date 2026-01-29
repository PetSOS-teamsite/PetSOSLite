import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Phone, MessageCircle, MapPin, Clock, Shield, Star, 
  Stethoscope, Activity, Heart, Siren, ChevronDown, ChevronUp,
  CloudRain, Car, Camera, Users, Award, CheckCircle, ExternalLink,
  AlertTriangle, Thermometer, Zap, Loader2, DollarSign, CreditCard,
  Droplets, Wind, Monitor, Scissors, Dog, Cat, Rabbit, Globe,
  Calendar, BadgeCheck, CircleDollarSign, Timer, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  const [showAllEquipment, setShowAllEquipment] = useState(false);

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

  const consultationFees = useMemo(() => {
    return {
      day: hospital?.consultFeeDay || null,
      evening: hospital?.consultFeeEvening || null,
      midnight: hospital?.consultFeeMidnight || null,
      eveningStart: hospital?.eveningSurchargeStart || '18:00',
      midnightStart: hospital?.midnightSurchargeStart || '00:00',
      holidaySurcharge: hospital?.holidaySurchargePercent || null,
    };
  }, [hospital]);

  const equipmentList = useMemo(() => {
    const items: Array<{ name: string; available: boolean; icon: any; category: string }> = [];
    
    if (hospital) {
      items.push({ name: language === 'zh-HK' ? 'X光' : 'X-Ray', available: !!hospital.imagingXray, icon: Camera, category: 'imaging' });
      items.push({ name: language === 'zh-HK' ? '超聲波' : 'Ultrasound', available: !!hospital.imagingUS, icon: Monitor, category: 'imaging' });
      items.push({ name: language === 'zh-HK' ? 'CT掃描' : 'CT Scan', available: !!hospital.imagingCT, icon: Monitor, category: 'imaging' });
      items.push({ name: language === 'zh-HK' ? 'MRI磁力共振' : 'MRI', available: !!hospital.imagingMRI, icon: Monitor, category: 'imaging' });
      items.push({ name: language === 'zh-HK' ? '氧氣治療' : 'Oxygen Therapy', available: !!hospital.oxygenTherapy, icon: Wind, category: 'critical' });
      items.push({ name: language === 'zh-HK' ? '輸血服務' : 'Blood Transfusion', available: !!hospital.bloodTransfusion, icon: Droplets, category: 'critical' });
      items.push({ name: language === 'zh-HK' ? '呼吸機' : 'Ventilator', available: !!hospital.ventilator, icon: Wind, category: 'critical' });
      items.push({ name: language === 'zh-HK' ? '心臟除顫器' : 'Defibrillator', available: !!hospital.defibrillator, icon: Zap, category: 'critical' });
      items.push({ name: language === 'zh-HK' ? '內窺鏡' : 'Endoscopy', available: !!hospital.endoscopy, icon: Camera, category: 'diagnostic' });
      items.push({ name: language === 'zh-HK' ? '院內化驗室' : 'In-House Lab', available: !!hospital.inHouseLab, icon: Thermometer, category: 'diagnostic' });
      items.push({ name: language === 'zh-HK' ? '隔離病房' : 'Isolation Ward', available: !!hospital.isolationWard, icon: Building2, category: 'facility' });
      items.push({ name: language === 'zh-HK' ? '緊急軟組織手術' : 'Soft Tissue Surgery', available: !!hospital.sxEmergencySoft, icon: Scissors, category: 'surgery' });
      items.push({ name: language === 'zh-HK' ? '緊急骨科手術' : 'Orthopedic Surgery', available: !!hospital.sxEmergencyOrtho, icon: Scissors, category: 'surgery' });
    }
    
    return items.filter(item => item.available);
  }, [hospital, language]);

  const emergencyReadiness = useMemo(() => {
    return {
      openT8: hospital?.openT8 ?? true,
      openT10: hospital?.openT10 ?? false,
      openBlackRain: hospital?.openBlackRainstorm ?? true,
      lunarNewYear: hospital?.lunarNewYearOpen ?? false,
      christmas: hospital?.christmasOpen ?? false,
      icuLevel: hospital?.icuLevel,
      onSiteVet247: hospital?.onSiteVet247,
      nurse24h: hospital?.nurse24h,
      bloodBankCanine: hospital?.bloodBankCanine,
      bloodBankFeline: hospital?.bloodBankFeline,
    };
  }, [hospital]);

  const trustSignals = useMemo(() => [
    { 
      icon: Clock, 
      title: language === 'zh-HK' ? "24小時營業" : "24/7 Open",
      desc: language === 'zh-HK' ? "全年無休" : "Year-round service",
      highlight: true
    },
    { 
      icon: Shield, 
      title: language === 'zh-HK' ? "駐場獸醫" : "On-Site Vets",
      desc: hospital?.onSiteVet247 
        ? (language === 'zh-HK' ? "24小時專業獸醫當值" : "Professional vets 24/7")
        : (language === 'zh-HK' ? "專業獸醫服務" : "Professional vet services"),
      highlight: !!hospital?.onSiteVet247
    },
    { 
      icon: Activity, 
      title: language === 'zh-HK' ? "ICU深切治療" : "ICU Available",
      desc: hospital?.icuLevel === 'full'
        ? (language === 'zh-HK' ? "完整ICU設備" : "Full ICU capabilities")
        : (language === 'zh-HK' ? "深切治療服務" : "Critical care services"),
      highlight: !!hospital?.icuLevel
    },
    { 
      icon: Droplets, 
      title: language === 'zh-HK' ? "血庫服務" : "Blood Bank",
      desc: (hospital?.bloodBankCanine && hospital?.bloodBankFeline)
        ? (language === 'zh-HK' ? "貓狗血庫" : "Canine & Feline")
        : (language === 'zh-HK' ? "輸血服務" : "Transfusion available"),
      highlight: !!(hospital?.bloodBankCanine || hospital?.bloodBankFeline)
    },
  ], [hospital, language]);

  const coreServices = useMemo(() => {
    const services = [
      { icon: Siren, name: language === 'zh-HK' ? "24小時急症" : "24/7 Emergency", highlight: true, available: true },
      { icon: Activity, name: language === 'zh-HK' ? "深切治療 ICU" : "ICU Critical Care", highlight: true, available: !!hospital?.icuLevel },
      { icon: Droplets, name: language === 'zh-HK' ? "輸血服務" : "Blood Transfusion", highlight: true, available: !!hospital?.bloodTransfusion },
      { icon: Stethoscope, name: language === 'zh-HK' ? "內科診症" : "Internal Medicine", highlight: false, available: true },
      { icon: Scissors, name: language === 'zh-HK' ? "緊急手術" : "Emergency Surgery", highlight: false, available: hospital?.sxEmergencySoft || hospital?.sxEmergencyOrtho },
      { icon: Camera, name: language === 'zh-HK' ? "影像診斷" : "Diagnostic Imaging", highlight: false, available: hospital?.imagingXray || hospital?.imagingUS || hospital?.imagingCT },
    ];
    return services.filter(s => s.available !== false);
  }, [hospital, language]);

  const weatherProtocol = useMemo(() => [
    {
      signal: "T8",
      signalZh: "八號風球",
      status: emergencyReadiness.openT8 
        ? (language === 'zh-HK' ? "正常營業" : "Open")
        : (language === 'zh-HK' ? "暫停服務" : "Closed"),
      open: emergencyReadiness.openT8
    },
    {
      signal: "T10",
      signalZh: "十號風球",
      status: emergencyReadiness.openT10 
        ? (language === 'zh-HK' ? "緊急服務" : "Emergency Only")
        : (language === 'zh-HK' ? "暫停服務" : "Closed"),
      open: emergencyReadiness.openT10
    },
    {
      signal: language === 'zh-HK' ? "黑雨" : "Black Rain",
      signalZh: "黑色暴雨",
      status: emergencyReadiness.openBlackRain 
        ? (language === 'zh-HK' ? "正常營業" : "Open")
        : (language === 'zh-HK' ? "暫停服務" : "Closed"),
      open: emergencyReadiness.openBlackRain
    },
  ], [emergencyReadiness, language]);

  const holidaySchedule = useMemo(() => [
    {
      holiday: language === 'zh-HK' ? "農曆新年" : "Lunar New Year",
      status: emergencyReadiness.lunarNewYear 
        ? (language === 'zh-HK' ? "正常營業" : "Open")
        : (language === 'zh-HK' ? "請致電查詢" : "Call to confirm"),
      open: emergencyReadiness.lunarNewYear
    },
    {
      holiday: language === 'zh-HK' ? "聖誕節" : "Christmas",
      status: emergencyReadiness.christmas 
        ? (language === 'zh-HK' ? "正常營業" : "Open")
        : (language === 'zh-HK' ? "請致電查詢" : "Call to confirm"),
      open: emergencyReadiness.christmas
    },
  ], [emergencyReadiness, language]);

  const faqItems = useMemo(() => [
    {
      q: language === 'zh-HK' ? "夜間急症收費如何？" : "What are your consultation fees?",
      a: consultationFees.day 
        ? (language === 'zh-HK' 
            ? `日間診金 $${consultationFees.day}，傍晚 $${consultationFees.evening || 'N/A'}，深夜 $${consultationFees.midnight || 'N/A'}。以上為診金，不包括藥物及檢查費用。`
            : `Day: $${consultationFees.day}, Evening: $${consultationFees.evening || 'N/A'}, Midnight: $${consultationFees.midnight || 'N/A'}. These are consultation fees only, excluding medication and tests.`)
        : (language === 'zh-HK' ? "請致電查詢診金詳情。" : "Please call for fee details.")
    },
    {
      q: language === 'zh-HK' ? "你們是否24小時有獸醫當值？" : "Do you have vets on-site 24/7?",
      a: hospital?.onSiteVet247 
        ? (language === 'zh-HK' ? "是的，我們全天候有專業獸醫駐場，無需等候獸醫趕回診所。" : "Yes, we have professional veterinarians on-site around the clock. No waiting for a vet to arrive.")
        : (language === 'zh-HK' ? "我們提供24小時服務，請致電確認當值獸醫安排。" : "We provide 24-hour service. Please call to confirm on-duty vet arrangements.")
    },
    {
      q: language === 'zh-HK' ? "颱風期間是否營業？" : "Are you open during typhoons?",
      a: language === 'zh-HK' 
        ? `八號風球${emergencyReadiness.openT8 ? '照常營業' : '暫停服務'}，十號風球${emergencyReadiness.openT10 ? '維持緊急服務' : '暫停服務'}，黑色暴雨${emergencyReadiness.openBlackRain ? '照常營業' : '暫停服務'}。極端情況請先致電確認。`
        : `T8: ${emergencyReadiness.openT8 ? 'Open' : 'Closed'}, T10: ${emergencyReadiness.openT10 ? 'Emergency only' : 'Closed'}, Black Rain: ${emergencyReadiness.openBlackRain ? 'Open' : 'Closed'}. Please call to confirm in extreme conditions.`
    },
    {
      q: language === 'zh-HK' ? "你們有血庫嗎？" : "Do you have a blood bank?",
      a: (hospital?.bloodBankCanine || hospital?.bloodBankFeline)
        ? (language === 'zh-HK' 
            ? `有，我們設有${hospital?.bloodBankCanine ? '狗' : ''}${hospital?.bloodBankCanine && hospital?.bloodBankFeline ? '及' : ''}${hospital?.bloodBankFeline ? '貓' : ''}血庫，可進行緊急輸血。`
            : `Yes, we have ${hospital?.bloodBankCanine ? 'canine' : ''}${hospital?.bloodBankCanine && hospital?.bloodBankFeline ? ' and ' : ''}${hospital?.bloodBankFeline ? 'feline' : ''} blood bank for emergency transfusions.`)
        : (language === 'zh-HK' ? "我們可提供輸血服務，詳情請致電查詢。" : "We offer blood transfusion services. Please call for details.")
    },
    {
      q: language === 'zh-HK' ? "需要預約嗎？" : "Do I need an appointment?",
      a: language === 'zh-HK' 
        ? "緊急情況無需預約，可直接帶寵物前來。一般診症建議預約以減少等候時間。" 
        : "No appointment needed for emergencies - just bring your pet in. For regular consultations, appointments are recommended to reduce waiting time."
    },
    {
      q: language === 'zh-HK' ? "有什麼影像診斷設備？" : "What imaging equipment do you have?",
      a: language === 'zh-HK'
        ? `我們設有${hospital?.imagingXray ? 'X光、' : ''}${hospital?.imagingUS ? '超聲波、' : ''}${hospital?.imagingCT ? 'CT掃描、' : ''}${hospital?.imagingMRI ? 'MRI磁力共振' : ''}等影像診斷設備${hospital?.sameDayCT ? '，CT可即日進行' : ''}。`
        : `We have ${hospital?.imagingXray ? 'X-Ray, ' : ''}${hospital?.imagingUS ? 'Ultrasound, ' : ''}${hospital?.imagingCT ? 'CT Scan, ' : ''}${hospital?.imagingMRI ? 'MRI' : ''} imaging equipment${hospital?.sameDayCT ? '. Same-day CT available' : ''}.`
    },
  ], [hospital, consultationFees, emergencyReadiness, language]);

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
          ? `${hospitalName} - 香港${regionName}24小時動物醫院。全天候緊急服務，駐場獸醫，颱風期間照常營業。診金由$${consultationFees.day || 370}起。`
          : `${hospitalName} - 24-hour animal hospital in ${regionName}, Hong Kong. Consultation from $${consultationFees.day || 370}. On-site vets, open during typhoons.`
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
        <section className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white py-12 md:py-16">
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
              <div className="flex flex-wrap justify-center gap-3 mb-8">
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
                {consultationFees.day && (
                  <div className="flex items-center bg-white/20 backdrop-blur rounded-full px-4 py-2">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span className="font-medium">{language === 'zh-HK' ? `診金$${consultationFees.day}起` : `From $${consultationFees.day}`}</span>
                  </div>
                )}
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

              {/* Secondary CTA */}
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
                
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-600 text-white">
                    <span className="w-2 h-2 bg-white rounded-full mr-2 inline-block animate-pulse"></span>
                    {language === 'zh-HK' ? '24小時運作' : '24/7 Operations'}
                  </Badge>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex flex-wrap items-center gap-2 text-white/80 text-sm">
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
                <div key={index} className={`text-center p-4 rounded-lg ${signal.highlight ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                  <signal.icon className={`h-8 w-8 mx-auto mb-2 ${signal.highlight ? 'text-red-600' : 'text-gray-500'}`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{signal.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{signal.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONSULTATION FEES - Pet owners want to know pricing upfront */}
        <section className="py-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-6">
                <CircleDollarSign className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {language === 'zh-HK' ? '診金收費' : 'Consultation Fees'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Day Fee */}
                <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">
                      {language === 'zh-HK' ? '日間' : 'Daytime'}
                    </p>
                    <p className="text-3xl font-bold text-green-800 dark:text-green-300">
                      ${consultationFees.day || '---'}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                      {language === 'zh-HK' ? '09:00 - 18:00' : '9am - 6pm'}
                    </p>
                  </CardContent>
                </Card>

                {/* Evening Fee */}
                <Card className="border-2 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-1">
                      {language === 'zh-HK' ? '傍晚' : 'Evening'}
                    </p>
                    <p className="text-3xl font-bold text-amber-800 dark:text-amber-300">
                      ${consultationFees.evening || '---'}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                      {language === 'zh-HK' ? '18:00 - 00:00' : '6pm - 12am'}
                    </p>
                  </CardContent>
                </Card>

                {/* Midnight Fee */}
                <Card className="border-2 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-400 font-medium mb-1">
                      {language === 'zh-HK' ? '深夜/凌晨' : 'Midnight'}
                    </p>
                    <p className="text-3xl font-bold text-purple-800 dark:text-purple-300">
                      ${consultationFees.midnight || '---'}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">
                      {language === 'zh-HK' ? '00:00 - 09:00' : '12am - 9am'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <p className="text-center text-gray-500 text-sm mt-4">
                {language === 'zh-HK' 
                  ? '* 以上為診金，不包括藥物、檢查及手術費用。實際收費以診所報價為準。'
                  : '* Consultation fees only. Excludes medication, tests, and procedures. Final charges may vary.'}
              </p>

              {/* Payment Methods */}
              {hospital?.payMethods && hospital.payMethods.length > 0 && (
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'zh-HK' ? '付款方式：' : 'Payment: '}
                      {hospital.payMethods.join(' · ')}
                    </span>
                  </div>
                </div>
              )}
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

        {/* EQUIPMENT & CAPABILITIES */}
        <section className="py-10 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Stethoscope className="h-6 w-6 text-red-600" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {language === 'zh-HK' ? '設備及服務' : 'Equipment & Services'}
                </h2>
              </div>

              {/* Core Services Grid */}
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

              {/* Equipment List */}
              {equipmentList.length > 0 && (
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowAllEquipment(!showAllEquipment)}
                    className="text-red-600"
                    data-testid="button-toggle-equipment"
                  >
                    {showAllEquipment 
                      ? (language === 'zh-HK' ? '收起設備列表' : 'Hide Equipment')
                      : (language === 'zh-HK' ? `查看所有設備 (${equipmentList.length})` : `View All Equipment (${equipmentList.length})`)
                    }
                    {showAllEquipment ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                  </Button>

                  {showAllEquipment && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {equipmentList.map((item, index) => (
                        <Badge key={index} variant="outline" className="py-2 px-3">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* WEATHER & HOLIDAY AVAILABILITY */}
        <section className="py-10 bg-slate-800 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-6">
                <CloudRain className="h-6 w-6" />
                <h2 className="text-2xl font-bold">
                  {language === 'zh-HK' ? '惡劣天氣及假日安排' : 'Weather & Holiday Schedule'}
                </h2>
              </div>
              
              {/* Weather Protocol */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {weatherProtocol.map((item, index) => (
                  <Card key={index} className={`${item.open ? 'bg-slate-700 border-green-500' : 'bg-slate-700 border-slate-600'}`}>
                    <CardContent className="p-4 text-center">
                      <Badge className={`mb-2 ${item.open ? 'bg-amber-500' : 'bg-gray-500'} text-white`}>
                        {item.signal}
                      </Badge>
                      <p className={`font-bold ${item.open ? 'text-green-400' : 'text-gray-400'}`}>
                        {item.status}
                      </p>
                      {item.open && (
                        <CheckCircle className="h-4 w-4 text-green-400 mx-auto mt-2" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Holiday Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {holidaySchedule.map((item, index) => (
                  <Card key={index} className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-amber-400" />
                        <span className="font-medium">{item.holiday}</span>
                      </div>
                      <Badge className={`${item.open ? 'bg-green-500' : 'bg-amber-500'} text-white`}>
                        {item.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <p className="text-center text-slate-400 text-sm mt-6">
                {language === 'zh-HK' 
                  ? '寵物緊急情況不會因天氣而停止。極端情況下請先致電確認。'
                  : 'Pet emergencies don\'t stop for weather. Please call ahead in extreme conditions.'}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-10 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                {language === 'zh-HK' ? '常見問題' : 'Frequently Asked Questions'}
              </h2>

              <Accordion type="single" collapsible className="space-y-2">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-4 bg-white dark:bg-gray-800">
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
        <section className="py-10 bg-white dark:bg-gray-800">
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
                    <CardTitle className="text-lg">{hospitalName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{hospitalAddress}</p>
                    </div>
                    {hospital?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-red-500" />
                        <a href={`tel:${hospital.phone}`} className="text-red-600 font-medium hover:underline">
                          {hospital.phone}
                        </a>
                      </div>
                    )}
                    {hospital?.whatsapp && (
                      <div className="flex items-center gap-3">
                        <MessageCircle className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          WhatsApp: {hospital.whatsapp}
                        </span>
                      </div>
                    )}
                    {hospital?.websiteUrl && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-blue-500" />
                        <a href={`https://${hospital.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                          {hospital.websiteUrl}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-red-500" />
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{language === 'zh-HK' ? '24小時營業' : 'Open 24 Hours'}</p>
                    </div>

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
              <BadgeCheck className="h-4 w-4" />
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
