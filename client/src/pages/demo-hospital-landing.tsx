import { useState } from "react";
import { Link } from "wouter";
import { 
  Phone, MessageCircle, MapPin, Clock, Shield, Star, 
  Stethoscope, Activity, Heart, Siren, ChevronDown, ChevronUp,
  CloudRain, Car, Camera, Users, Award, CheckCircle, ExternalLink,
  AlertTriangle, Thermometer, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

export default function DemoHospitalLandingPage() {
  const { t, language } = useTranslation();
  const [showAllServices, setShowAllServices] = useState(false);

  const hospitalData = {
    name: language === 'zh-HK' ? "東島24小時動物醫院" : "East Island 24-Hour Animal Hospital",
    tagline: language === 'zh-HK' ? "全天候守護您的毛孩" : "Around-the-Clock Care for Your Beloved Pets",
    phone: "+852 2888 8888",
    whatsapp: "85228888888",
    address: language === 'zh-HK' ? "香港鰂魚涌海澤街28號東港中心1樓" : "1/F, Eastmark, 28 Hoi Tze Street, Quarry Bay, Hong Kong",
    region: language === 'zh-HK' ? "東區" : "Eastern District",
    rating: 4.8,
    reviewCount: 328,
    yearsOpen: 15,
    lastVerified: "2025-01-28",
  };

  const trustSignals = [
    { 
      icon: Clock, 
      title: language === 'zh-HK' ? "24小時營業" : "24/7 Open",
      desc: language === 'zh-HK' ? "全年無休，包括颱風期間" : "Year-round, including typhoons"
    },
    { 
      icon: Shield, 
      title: language === 'zh-HK' ? "駐場獸醫" : "On-Site Vets",
      desc: language === 'zh-HK' ? "24小時專業獸醫當值" : "Professional vets on-site 24/7"
    },
    { 
      icon: Award, 
      title: language === 'zh-HK' ? "15年經驗" : "15 Years Experience",
      desc: language === 'zh-HK' ? "深受港島居民信賴" : "Trusted by Island residents"
    },
    { 
      icon: Star, 
      title: language === 'zh-HK' ? "4.8星評分" : "4.8 Star Rating",
      desc: language === 'zh-HK' ? "超過328則真實評價" : "Over 328 verified reviews"
    },
  ];

  const coreServices = [
    { icon: Siren, name: language === 'zh-HK' ? "緊急急症" : "Emergency Care", highlight: true },
    { icon: Activity, name: language === 'zh-HK' ? "深切治療 (ICU)" : "Intensive Care (ICU)", highlight: true },
    { icon: Stethoscope, name: language === 'zh-HK' ? "內科診症" : "Internal Medicine", highlight: false },
    { icon: Heart, name: language === 'zh-HK' ? "手術服務" : "Surgical Services", highlight: false },
    { icon: Camera, name: language === 'zh-HK' ? "X光及超聲波" : "X-Ray & Ultrasound", highlight: false },
    { icon: Thermometer, name: language === 'zh-HK' ? "血液檢驗" : "Blood Tests", highlight: false },
  ];

  const additionalServices = [
    language === 'zh-HK' ? "輸血服務" : "Blood Transfusion",
    language === 'zh-HK' ? "氧氣治療" : "Oxygen Therapy",
    language === 'zh-HK' ? "骨科手術" : "Orthopedic Surgery",
    language === 'zh-HK' ? "軟組織手術" : "Soft Tissue Surgery",
    language === 'zh-HK' ? "住院護理" : "Hospitalization",
    language === 'zh-HK' ? "寵物疫苗" : "Vaccination",
  ];

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

  const faqItems = [
    {
      q: language === 'zh-HK' ? "你們是否24小時有獸醫當值？" : "Do you have vets on-site 24/7?",
      a: language === 'zh-HK' ? "是的，我們全天候有專業獸醫駐場，無需等候獸醫趕回診所。" : "Yes, we have professional veterinarians on-site around the clock. No waiting for a vet to arrive."
    },
    {
      q: language === 'zh-HK' ? "颱風期間是否營業？" : "Are you open during typhoons?",
      a: language === 'zh-HK' ? "八號風球期間照常營業，十號風球維持緊急服務。我們明白寵物緊急情況不會因天氣而停止。" : "We operate normally during T8 signals and maintain emergency services during T10. We understand pet emergencies don't stop for weather."
    },
    {
      q: language === 'zh-HK' ? "夜間急症收費如何？" : "What are your night emergency fees?",
      a: language === 'zh-HK' ? "夜間急症診金由$800起，視乎情況而定。建議致電查詢詳細收費。" : "Night emergency consultation starts from $800, depending on the case. Please call for detailed pricing."
    },
    {
      q: language === 'zh-HK' ? "你們接受哪些付款方式？" : "What payment methods do you accept?",
      a: language === 'zh-HK' ? "我們接受現金、信用卡（Visa/Master）、八達通、PayMe及轉數快。" : "We accept cash, credit cards (Visa/Master), Octopus, PayMe, and FPS."
    },
    {
      q: language === 'zh-HK' ? "需要預約嗎？" : "Do I need an appointment?",
      a: language === 'zh-HK' ? "緊急情況無需預約，可直接帶寵物前來。一般診症建議預約以減少等候時間。" : "No appointment needed for emergencies - just bring your pet in. For regular consultations, appointments are recommended to reduce waiting time."
    },
  ];

  const handleCall = () => {
    window.location.href = `tel:${hospitalData.phone}`;
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(language === 'zh-HK' 
      ? "你好，我想查詢動物急症服務" 
      : "Hello, I'd like to inquire about emergency veterinary services");
    window.open(`https://wa.me/${hospitalData.whatsapp}?text=${message}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(hospitalData.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <>
      <SEO
        title={`${hospitalData.name} | ${language === 'zh-HK' ? '24小時動物醫院' : '24-Hour Animal Hospital'}`}
        description={language === 'zh-HK'
          ? `${hospitalData.name} - 香港${hospitalData.region}24小時動物醫院。全天候緊急服務，駐場獸醫，颱風期間照常營業。`
          : `${hospitalData.name} - 24-hour animal hospital in ${hospitalData.region}, Hong Kong. Round-the-clock emergency care, on-site vets, open during typhoons.`
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
                <Badge className="bg-green-500 text-white px-4 py-1 text-sm animate-pulse" data-testid="badge-live-status">
                  <span className="w-2 h-2 bg-white rounded-full mr-2 inline-block"></span>
                  {language === 'zh-HK' ? '現正營業' : 'OPEN NOW'}
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" data-testid="text-hospital-name">
                {hospitalData.name}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-6">
                {hospitalData.tagline}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center bg-white/20 backdrop-blur rounded-full px-4 py-2">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="font-medium">{language === 'zh-HK' ? '24小時營業' : '24/7 Open'}</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur rounded-full px-4 py-2">
                  <Star className="h-5 w-5 mr-2 text-yellow-300" />
                  <span className="font-medium">{hospitalData.rating} ({hospitalData.reviewCount} {language === 'zh-HK' ? '評價' : 'reviews'})</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur rounded-full px-4 py-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="font-medium">{hospitalData.region}</span>
                </div>
              </div>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <Button 
                  onClick={handleCall}
                  size="lg"
                  className="flex-1 bg-white text-red-600 hover:bg-gray-100 py-6 text-lg font-bold shadow-xl"
                  data-testid="button-call-hero"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  {language === 'zh-HK' ? '立即致電' : 'Call Now'}
                </Button>
                <Button 
                  onClick={handleWhatsApp}
                  size="lg"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-6 text-lg font-bold shadow-xl"
                  data-testid="button-whatsapp-hero"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
              </div>

              {/* Secondary CTA */}
              <Button 
                onClick={handleDirections}
                variant="outline"
                size="lg"
                className="mt-4 border-white/50 text-white hover:bg-white/10"
                data-testid="button-directions-hero"
              >
                <MapPin className="h-5 w-5 mr-2" />
                {language === 'zh-HK' ? '查看地圖導航' : 'Get Directions'}
              </Button>
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
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAllServices(!showAllServices)}
                  className="text-red-600"
                  data-testid="button-toggle-services"
                >
                  {showAllServices 
                    ? (language === 'zh-HK' ? '收起' : 'Show Less')
                    : (language === 'zh-HK' ? '查看更多服務' : 'View More Services')
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
            </div>
          </div>
        </section>

        {/* Weather Protocol - Important for HK */}
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
                    <CardTitle>{hospitalData.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 dark:text-gray-300">{hospitalData.address}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-red-500" />
                      <a href={`tel:${hospitalData.phone}`} className="text-red-600 font-medium hover:underline">
                        {hospitalData.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-red-500" />
                      <p className="text-gray-700 dark:text-gray-300">{language === 'zh-HK' ? '24小時營業' : 'Open 24 Hours'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-red-500" />
                      <p className="text-gray-700 dark:text-gray-300">{language === 'zh-HK' ? '鄰近有街邊泊車位' : 'Street parking available nearby'}</p>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-2">
                      <Button onClick={handleCall} className="w-full bg-red-600 hover:bg-red-700" data-testid="button-call-contact">
                        <Phone className="h-4 w-4 mr-2" />
                        {language === 'zh-HK' ? '立即致電' : 'Call Now'}
                      </Button>
                      <Button onClick={handleWhatsApp} className="w-full bg-green-500 hover:bg-green-600" data-testid="button-whatsapp-contact">
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
            >
              <Phone className="h-5 w-5 mr-2" />
              {language === 'zh-HK' ? '致電' : 'Call'}
            </Button>
            <Button 
              onClick={handleWhatsApp}
              className="flex-1 bg-green-500 hover:bg-green-600 py-5"
              data-testid="button-whatsapp-sticky"
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
                {language === 'zh-HK' 
                  ? `資料最後更新：${hospitalData.lastVerified} | 由PetSOS核實`
                  : `Last verified: ${hospitalData.lastVerified} | Verified by PetSOS`
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
