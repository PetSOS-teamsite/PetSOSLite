import { 
  type User, type InsertUser,
  type Pet, type InsertPet,
  type Country, type InsertCountry,
  type Region, type InsertRegion,
  type PetBreed, type InsertPetBreed,
  type Clinic, type InsertClinic,
  type EmergencyRequest, type InsertEmergencyRequest,
  type Message, type InsertMessage,
  type FeatureFlag, type InsertFeatureFlag,
  type AuditLog, type InsertAuditLog,
  type PrivacyConsent, type InsertPrivacyConsent,
  type Translation, type InsertTranslation,
  type Hospital, type InsertHospital,
  type HospitalConsultFee, type InsertHospitalConsultFee,
  type HospitalUpdate, type InsertHospitalUpdate,
  type PetMedicalRecord, type InsertPetMedicalRecord,
  type PetMedicalSharingConsent, type InsertPetMedicalSharingConsent,
  type PushSubscription, type InsertPushSubscription,
  type NotificationBroadcast, type InsertNotificationBroadcast,
  type ClinicReview, type InsertClinicReview,
  type WhatsappConversation, type InsertWhatsappConversation,
  type WhatsappChatMessage, type InsertWhatsappChatMessage,
  type TyphoonAlert, type InsertTyphoonAlert,
  type HkHoliday, type InsertHkHoliday,
  type HospitalEmergencyStatus, type InsertHospitalEmergencyStatus,
  type UserEmergencySubscription, type InsertUserEmergencySubscription,
  type TyphoonNotificationQueue, type InsertTyphoonNotificationQueue,
  type VetConsultant, type InsertVetConsultant, type VerifiedContentItem, type ContentVerification, type InsertContentVerification,
  type VetConsultantWithContent, type ContentWithVerifier,
  type VetApplication, type InsertVetApplication,
  type HospitalPingState, type InsertHospitalPingState, type HospitalPingLog, type InsertHospitalPingLog,
  type HospitalChangeLog, type InsertHospitalChangeLog,
  type HospitalEmergencyResponse, type InsertHospitalEmergencyResponse,
  users, pets, countries, regions, petBreeds, clinics, emergencyRequests, messages, featureFlags, auditLogs, privacyConsents, translations, hospitals, hospitalConsultFees, hospitalUpdates, petMedicalRecords, petMedicalSharingConsents, pushSubscriptions, notificationBroadcasts, clinicReviews, whatsappConversations, whatsappChatMessages,
  typhoonAlerts, hkHolidays, hospitalEmergencyStatus, userEmergencySubscriptions, typhoonNotificationQueue,
  vetConsultants, verifiedContentItems, contentVerifications, vetApplications,
  hospitalPingState, hospitalPingLogs, hospitalChangeLogs, hospitalEmergencyResponses
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, or, inArray, sql, desc, lte, gte, count, isNotNull } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  upsertUser(user: InsertUser): Promise<User>;
  
  // Two-Factor Authentication
  updateUserTwoFactor(userId: string, secret: string | null, backupCodes: string[] | null, enabled: boolean): Promise<User | undefined>;
  validateBackupCode(userId: string, code: string): Promise<boolean>;

  // Pets
  getPet(id: string): Promise<Pet | undefined>;
  getPetsByUserId(userId: string): Promise<Pet[]>;
  getAllPets(): Promise<Pet[]>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: string, pet: Partial<InsertPet>): Promise<Pet | undefined>;
  deletePet(id: string): Promise<boolean>;

  // Countries
  getCountry(id: string): Promise<Country | undefined>;
  getCountryByCode(code: string): Promise<Country | undefined>;
  getAllCountries(): Promise<Country[]>;
  getActiveCountries(): Promise<Country[]>;
  createCountry(country: InsertCountry): Promise<Country>;
  updateCountry(id: string, country: Partial<InsertCountry>): Promise<Country | undefined>;
  deleteCountry(id: string): Promise<boolean>;

  // Regions
  getRegion(id: string): Promise<Region | undefined>;
  getRegionByCode(code: string): Promise<Region | undefined>;
  getAllRegions(): Promise<Region[]>;
  getRegionsByCountry(countryCode: string): Promise<Region[]>;
  createRegion(region: InsertRegion): Promise<Region>;
  updateRegion(id: string, region: Partial<InsertRegion>): Promise<Region | undefined>;

  // Pet Breeds
  getPetBreed(id: string): Promise<PetBreed | undefined>;
  getPetBreedsBySpecies(species: string): Promise<PetBreed[]>;
  getPetBreedsByCountry(countryCode: string): Promise<PetBreed[]>;
  getCommonPetBreeds(species?: string): Promise<PetBreed[]>;
  getAllPetBreeds(): Promise<PetBreed[]>;
  createPetBreed(breed: InsertPetBreed): Promise<PetBreed>;
  updatePetBreed(id: string, breed: Partial<InsertPetBreed>): Promise<PetBreed | undefined>;
  deletePetBreed(id: string): Promise<boolean>;

  // Clinics
  getClinic(id: string): Promise<Clinic | undefined>;
  getClinicsByRegion(regionId: string): Promise<Clinic[]>;
  get24HourClinicsByRegion(regionId: string): Promise<Clinic[]>;
  getAllClinics(): Promise<Clinic[]>;
  getNearbyClinics(latitude: number, longitude: number, radiusMeters: number): Promise<(Clinic & { distance: number })[]>;
  createClinic(clinic: InsertClinic): Promise<Clinic>;
  updateClinic(id: string, clinic: Partial<InsertClinic>): Promise<Clinic | undefined>;
  deleteClinic(id: string): Promise<boolean>;

  // Emergency Requests
  getEmergencyRequest(id: string): Promise<any>; // Returns emergency request with pet data joined
  getEmergencyRequestsByUserId(userId: string): Promise<EmergencyRequest[]>;
  getEmergencyRequestsByClinicId(clinicId: string): Promise<any[]>;
  getAllEmergencyRequests(): Promise<EmergencyRequest[]>;
  createEmergencyRequest(request: InsertEmergencyRequest): Promise<EmergencyRequest>;
  updateEmergencyRequest(id: string, request: Partial<InsertEmergencyRequest>): Promise<EmergencyRequest | undefined>;

  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  getMessageByWhatsAppId(whatsappMessageId: string): Promise<Message | undefined>;
  getMessagesByEmergencyRequest(emergencyRequestId: string): Promise<Message[]>;
  getAllMessages(limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, message: Partial<InsertMessage>): Promise<Message | undefined>;
  updateMessageByWhatsAppId(whatsappMessageId: string, updateData: Partial<InsertMessage>): Promise<Message | undefined>;
  getQueuedMessages(): Promise<Message[]>;

  // Feature Flags
  getFeatureFlag(key: string): Promise<FeatureFlag | undefined>;
  getAllFeatureFlags(): Promise<FeatureFlag[]>;
  createFeatureFlag(flag: InsertFeatureFlag): Promise<FeatureFlag>;
  updateFeatureFlag(id: string, flag: Partial<InsertFeatureFlag>): Promise<FeatureFlag | undefined>;

  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;

  // Privacy Consents
  getPrivacyConsents(userId: string): Promise<PrivacyConsent[]>;
  createPrivacyConsent(consent: InsertPrivacyConsent): Promise<PrivacyConsent>;

  // Translations
  getTranslationsByLanguage(language: string): Promise<Translation[]>;
  getTranslation(key: string, language: string): Promise<Translation | undefined>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  updateTranslation(id: string, translation: Partial<InsertTranslation>): Promise<Translation | undefined>;

  // Hospitals
  getHospital(id: string): Promise<Hospital | undefined>;
  getHospitalBySlug(slug: string): Promise<Hospital | undefined>;
  getHospitalByAccessCode(accessCode: string): Promise<Hospital | undefined>;
  getHospitalsByRegion(region: string): Promise<Hospital[]>;
  getAllHospitals(): Promise<Hospital[]>;
  getNearbyHospitals(latitude: number, longitude: number, radiusMeters: number): Promise<(Hospital & { distance: number })[]>;
  createHospital(hospital: InsertHospital): Promise<Hospital>;
  updateHospital(id: string, hospital: Partial<InsertHospital>): Promise<Hospital | undefined>;
  deleteHospital(id: string): Promise<boolean>;
  generateAccessCodesForAllHospitals(): Promise<{ updated: number; errors: string[] }>;

  // Hospital Consult Fees
  getConsultFeesByHospitalId(hospitalId: string): Promise<HospitalConsultFee[]>;
  createConsultFee(fee: InsertHospitalConsultFee): Promise<HospitalConsultFee>;
  updateConsultFee(id: string, fee: Partial<InsertHospitalConsultFee>): Promise<HospitalConsultFee | undefined>;
  deleteConsultFee(id: string): Promise<boolean>;

  // Hospital Updates
  getHospitalUpdatesByHospitalId(hospitalId: string): Promise<HospitalUpdate[]>;
  createHospitalUpdate(update: InsertHospitalUpdate): Promise<HospitalUpdate>;
  updateHospitalUpdate(id: string, update: Partial<InsertHospitalUpdate>): Promise<HospitalUpdate | undefined>;

  // Pet Medical Records
  getMedicalRecordsByPetId(petId: string): Promise<PetMedicalRecord[]>;
  getMedicalRecord(id: string): Promise<PetMedicalRecord | undefined>;
  createMedicalRecord(record: InsertPetMedicalRecord): Promise<PetMedicalRecord>;
  updateMedicalRecord(id: string, record: Partial<InsertPetMedicalRecord>): Promise<PetMedicalRecord | undefined>;
  deleteMedicalRecord(id: string): Promise<boolean>;
  getUserStorageUsage(userId: string): Promise<{ usedBytes: number; recordCount: number }>;
  
  // Pet Medical Sharing Consents
  getMedicalSharingConsent(petId: string, userId: string, consentType: string): Promise<PetMedicalSharingConsent | undefined>;
  getMedicalSharingConsentsByPetId(petId: string): Promise<PetMedicalSharingConsent[]>;
  getMedicalSharingConsentsByUserId(userId: string): Promise<PetMedicalSharingConsent[]>;
  upsertMedicalSharingConsent(consent: InsertPetMedicalSharingConsent): Promise<PetMedicalSharingConsent>;

  // Push Subscriptions
  createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription>;
  getPushSubscriptionByToken(token: string): Promise<PushSubscription | undefined>;
  updatePushSubscription(id: string, data: Partial<InsertPushSubscription>): Promise<PushSubscription | undefined>;
  deactivatePushSubscription(token: string): Promise<boolean>;
  deactivatePushSubscriptions(tokens: string[]): Promise<number>;
  getAllActivePushSubscriptions(language?: string, role?: string): Promise<PushSubscription[]>;
  getActiveTokens(language?: string, role?: string): Promise<string[]>;
  
  // Launch Notification helpers
  getPetOwnerEmails(): Promise<{ id: string; email: string }[]>;
  getPetOwnerPushTokens(): Promise<string[]>;

  // Notification Broadcasts
  createNotificationBroadcast(broadcast: InsertNotificationBroadcast): Promise<NotificationBroadcast>;
  getNotificationBroadcast(id: string): Promise<NotificationBroadcast | undefined>;
  getRecentNotificationBroadcasts(limit?: number): Promise<NotificationBroadcast[]>;
  getAllNotificationBroadcasts(limit?: number, offset?: number): Promise<{ broadcasts: NotificationBroadcast[]; total: number }>;
  getScheduledNotifications(): Promise<NotificationBroadcast[]>;
  updateNotificationBroadcast(id: string, data: Partial<NotificationBroadcast>): Promise<NotificationBroadcast | undefined>;
  updateNotificationBroadcastStatus(id: string, status: string): Promise<NotificationBroadcast | undefined>;

  // Clinic Reviews
  createClinicReview(review: InsertClinicReview): Promise<ClinicReview>;
  getClinicReviews(clinicId: string): Promise<(ClinicReview & { user: { displayName: string | null } })[]>;
  getClinicReview(id: string): Promise<ClinicReview | undefined>;
  getUserReviewForClinic(userId: string, clinicId: string): Promise<ClinicReview | undefined>;
  updateClinicReview(id: string, data: Partial<InsertClinicReview>): Promise<ClinicReview | undefined>;
  deleteClinicReview(id: string): Promise<boolean>;
  updateClinicRatingStats(clinicId: string): Promise<void>;

  // GDPR/PDPO Compliance
  exportUserData(userId: string): Promise<{
    user: User | undefined;
    pets: Pet[];
    emergencyRequests: EmergencyRequest[];
    privacyConsents: PrivacyConsent[];
    auditLogs: AuditLog[];
  }>;
  deleteUserDataGDPR(userId: string): Promise<{
    success: boolean;
    deletedRecords: {
      pets: number;
      emergencyRequests: number;
      privacyConsents: number;
      messages: number;
      user: boolean;
    };
  }>;

  // Analytics
  getAnalyticsOverview(): Promise<{
    totalUsers: number;
    newUsers24h: number;
    newUsers7d: number;
    newUsers30d: number;
    totalPets: number;
    totalEmergencyRequests: number;
    emergencyByStatus: { status: string; count: number }[];
    totalClinics: number;
    activeClinics: number;
    totalHospitals: number;
  }>;
  getEmergencyTrends(days: number): Promise<{
    dailyTrends: { date: string; count: number }[];
    byRegion: { regionId: string; regionName: string; count: number }[];
    byStatus: { status: string; count: number }[];
  }>;
  getUserActivityTrends(days: number): Promise<{
    registrationTrends: { date: string; count: number }[];
    totalActiveUsers: number;
  }>;

  // WhatsApp Conversations
  getConversation(id: string): Promise<WhatsappConversation | undefined>;
  getConversationByPhone(phoneNumber: string): Promise<WhatsappConversation | undefined>;
  getAllConversations(includeArchived?: boolean): Promise<WhatsappConversation[]>;
  createConversation(data: InsertWhatsappConversation): Promise<WhatsappConversation>;
  updateConversation(id: string, data: Partial<InsertWhatsappConversation>): Promise<WhatsappConversation | undefined>;
  archiveConversation(id: string): Promise<boolean>;

  // WhatsApp Chat Messages
  getChatMessage(id: string): Promise<WhatsappChatMessage | undefined>;
  getChatMessageByWhatsAppId(whatsappMessageId: string): Promise<WhatsappChatMessage | undefined>;
  getChatMessagesByConversation(conversationId: string, limit?: number, offset?: number): Promise<WhatsappChatMessage[]>;
  createChatMessage(data: InsertWhatsappChatMessage): Promise<WhatsappChatMessage>;
  updateChatMessage(id: string, data: Partial<InsertWhatsappChatMessage>): Promise<WhatsappChatMessage | undefined>;
  updateChatMessageByWhatsAppId(whatsappMessageId: string, data: Partial<InsertWhatsappChatMessage>): Promise<WhatsappChatMessage | undefined>;
  markConversationAsRead(conversationId: string): Promise<void>;

  // Helper for WhatsApp
  findHospitalByPhone(phoneNumber: string): Promise<Hospital | undefined>;
  
  // Typhoon & Holiday Protocol
  getActiveTyphoonAlert(): Promise<any | null>;
  getUpcomingHoliday(days: number): Promise<any | null>;
  getHospitalEmergencyStatuses(referenceId: string): Promise<any[]>;
  updateHospitalEmergencyStatus(data: any): Promise<any>;
  createEmergencySubscription(data: any): Promise<any>;
  getHolidaysByYear(year: number): Promise<any[]>;
  createTyphoonAlert(data: any): Promise<any>;
  liftTyphoonAlert(alertId: string): Promise<any>;
  
  // Typhoon Notification Queue
  getPendingTyphoonNotifications(): Promise<TyphoonNotificationQueue[]>;
  createTyphoonNotification(data: InsertTyphoonNotificationQueue): Promise<TyphoonNotificationQueue>;
  updateTyphoonNotification(id: string, data: Partial<TyphoonNotificationQueue>): Promise<TyphoonNotificationQueue | undefined>;
  getActiveEmergencySubscriptions(subscriptionType?: string): Promise<UserEmergencySubscription[]>;

  // Vet Consultants & Content Verification
  getVetConsultants(): Promise<VetConsultant[]>;
  getVetConsultantById(id: string): Promise<VetConsultant | undefined>;
  getVetConsultantWithContent(id: string): Promise<VetConsultantWithContent | undefined>;
  getContentVerification(contentSlug: string): Promise<ContentWithVerifier | undefined>;

  // Vet Applications
  getVetApplications(status?: string): Promise<VetApplication[]>;
  getVetApplicationById(id: string): Promise<VetApplication | undefined>;
  createVetApplication(data: InsertVetApplication): Promise<VetApplication>;
  updateVetApplicationStatus(id: string, status: string, reviewedBy: string, reviewNotes?: string): Promise<VetApplication | undefined>;
  approveVetApplication(id: string, reviewedBy: string, reviewNotes?: string): Promise<{application: VetApplication, consultant: VetConsultant}>;

  // Admin Vet Consultant Management
  createVetConsultant(data: InsertVetConsultant): Promise<VetConsultant>;
  updateVetConsultant(id: string, data: Partial<InsertVetConsultant>): Promise<VetConsultant | undefined>;
  deleteVetConsultant(id: string): Promise<boolean>;

  // Content Verification Management
  createContentVerification(data: InsertContentVerification): Promise<ContentVerification>;
  deleteContentVerification(consultantId: string, contentId: string): Promise<boolean>;
  getVerifiedContentItems(): Promise<VerifiedContentItem[]>;

  // Hospital Ping State
  getHospitalPingState(hospitalId: string): Promise<HospitalPingState | undefined>;
  getAllHospitalPingStates(): Promise<HospitalPingState[]>;
  getActiveHospitalPingStates(): Promise<HospitalPingState[]>;
  upsertHospitalPingState(data: InsertHospitalPingState): Promise<HospitalPingState>;
  updateHospitalPingState(hospitalId: string, data: Partial<InsertHospitalPingState>): Promise<HospitalPingState | undefined>;
  getHospitalsNeedingNoReplyMarking(): Promise<HospitalPingState[]>;
  
  // Hospital Ping Logs
  createHospitalPingLog(data: InsertHospitalPingLog): Promise<HospitalPingLog>;
  getHospitalPingLogs(hospitalId: string, limit?: number): Promise<HospitalPingLog[]>;
  
  // Hospital Change Logs (Audit Trail)
  createHospitalChangeLog(data: InsertHospitalChangeLog): Promise<HospitalChangeLog>;
  createHospitalChangeLogs(data: InsertHospitalChangeLog[]): Promise<HospitalChangeLog[]>;
  getHospitalChangeLogs(hospitalId: string, limit?: number): Promise<HospitalChangeLog[]>;
  getRecentHospitalChangeLogs(limit?: number): Promise<(HospitalChangeLog & { hospitalName?: string })[]>;

  // Hospital Emergency Responses (WhatsApp replies linked to emergencies)
  createHospitalEmergencyResponse(data: InsertHospitalEmergencyResponse): Promise<HospitalEmergencyResponse>;
  getHospitalEmergencyResponsesByEmergencyId(emergencyRequestId: string): Promise<HospitalEmergencyResponse[]>;
  getActiveEmergencyForHospital(hospitalId: string, withinHours?: number): Promise<EmergencyRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pets: Map<string, Pet>;
  private countries: Map<string, Country>;
  private regions: Map<string, Region>;
  private petBreeds: Map<string, PetBreed>;
  private clinics: Map<string, Clinic>;
  private emergencyRequests: Map<string, EmergencyRequest>;
  private messages: Map<string, Message>;
  private featureFlags: Map<string, FeatureFlag>;
  private auditLogs: Map<string, AuditLog>;
  private privacyConsents: Map<string, PrivacyConsent>;
  private translations: Map<string, Translation>;
  private hospitals: Map<string, Hospital>;
  private hospitalConsultFees: Map<string, HospitalConsultFee>;
  private hospitalUpdates: Map<string, HospitalUpdate>;
  private petMedicalRecordsMap: Map<string, PetMedicalRecord>;
  private petMedicalSharingConsentsMap: Map<string, PetMedicalSharingConsent>;
  private pushSubscriptionsMap: Map<string, PushSubscription>;
  private notificationBroadcastsMap: Map<string, NotificationBroadcast>;
  private clinicReviewsMap: Map<string, ClinicReview>;

  constructor() {
    this.users = new Map();
    this.pets = new Map();
    this.countries = new Map();
    this.regions = new Map();
    this.petBreeds = new Map();
    this.clinics = new Map();
    this.emergencyRequests = new Map();
    this.messages = new Map();
    this.featureFlags = new Map();
    this.auditLogs = new Map();
    this.privacyConsents = new Map();
    this.translations = new Map();
    this.hospitals = new Map();
    this.hospitalConsultFees = new Map();
    this.hospitalUpdates = new Map();
    this.petMedicalRecordsMap = new Map();
    this.petMedicalSharingConsentsMap = new Map();
    this.pushSubscriptionsMap = new Map();
    this.notificationBroadcastsMap = new Map();
    this.clinicReviewsMap = new Map();
    
    // Seed test user
    const testUser: User = {
      id: 'temp-user-id',
      username: 'testuser',
      password: 'hashedpassword',
      passwordHash: null,
      googleId: null,
      openidSub: null,
      email: 'user@example.com',
      name: null,
      avatar: null,
      profileImageUrl: null,
      phone: '+852 9123 4567',
      language: 'en',
      languagePreference: 'en',
      region: null,
      regionPreference: null,
      role: 'user',
      clinicId: null,
      notificationPreferences: null,
      twoFactorSecret: null,
      twoFactorEnabled: false,
      twoFactorBackupCodes: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(testUser.id, testUser);
    
    // Seed test data for regions (not used - data comes from production DB)
    
    // Seed test data for clinics
    const clinics: Clinic[] = [
      {
        id: 'clinic-1',
        name: 'Central Veterinary Hospital',
        nameZh: '中環獸醫醫院',
        address: "123 Queen's Road Central, Hong Kong",
        addressZh: '香港皇后大道中123號',
        phone: '+852 2123 4567',
        whatsapp: '+85291234567',
        email: 'info@centralvet.hk',
        lineUserId: null,
        regionId: 'hki-region',
        is24Hour: true,
        isAvailable: true,
        isSupportHospital: false,
        latitude: '22.2820',
        longitude: '114.1585',
        location: null,
        status: 'active',
        services: ['emergency', 'surgery', 'dental'],
        ownerVerificationCode: null,
        ownerVerificationCodeExpiresAt: null,
        averageRating: null,
        reviewCount: 0,
        createdAt: new Date()
      },
      {
        id: 'clinic-2',
        name: 'Happy Pets Clinic TST',
        nameZh: '尖沙咀快樂寵物診所',
        address: '456 Nathan Road, Tsim Sha Tsui',
        addressZh: '尖沙咀彌敦道456號',
        phone: '+852 2234 5678',
        whatsapp: '+85292345678',
        email: 'contact@happypets.hk',
        lineUserId: null,
        regionId: 'kln-region',
        is24Hour: true,
        isAvailable: true,
        isSupportHospital: false,
        latitude: '22.2980',
        longitude: '114.1722',
        location: null,
        status: 'active',
        services: ['emergency', 'vaccination'],
        ownerVerificationCode: null,
        ownerVerificationCodeExpiresAt: null,
        averageRating: null,
        reviewCount: 0,
        createdAt: new Date()
      },
      {
        id: 'clinic-3',
        name: 'New Territories Animal Care',
        nameZh: '新界動物護理中心',
        address: '789 Castle Peak Road, Yuen Long',
        addressZh: '元朗青山公路789號',
        phone: '+852 2345 6789',
        whatsapp: '+85293456789',
        email: 'care@ntanimal.hk',
        lineUserId: null,
        regionId: 'nti-region',
        is24Hour: false,
        isAvailable: true,
        isSupportHospital: false,
        latitude: '22.4450',
        longitude: '114.0239',
        location: null,
        status: 'active',
        services: ['general', 'grooming'],
        ownerVerificationCode: null,
        ownerVerificationCodeExpiresAt: null,
        averageRating: null,
        reviewCount: 0,
        createdAt: new Date()
      },
      {
        id: 'clinic-4',
        name: 'Island Pet Emergency',
        nameZh: '港島寵物急症',
        address: '321 Hennessy Road, Causeway Bay',
        addressZh: '銅鑼灣軒尼詩道321號',
        phone: '+852 2456 7890',
        whatsapp: '+85294567890',
        email: 'emergency@islandpet.hk',
        lineUserId: null,
        regionId: 'hki-region',
        is24Hour: true,
        isAvailable: true,
        isSupportHospital: false,
        latitude: '22.2793',
        longitude: '114.1826',
        location: null,
        status: 'active',
        services: ['emergency', '24hour'],
        ownerVerificationCode: null,
        ownerVerificationCodeExpiresAt: null,
        averageRating: null,
        reviewCount: 0,
        createdAt: new Date()
      }
    ];
    clinics.forEach(clinic => this.clinics.set(clinic.id, clinic));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone,
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      googleId: insertUser.googleId ?? null,
      openidSub: insertUser.openidSub ?? null,
      avatar: insertUser.avatar ?? null,
      language: insertUser.language ?? 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
      languagePreference: insertUser.languagePreference ?? 'en',
      regionPreference: insertUser.regionPreference ?? null,
      role: insertUser.role ?? 'user',
      email: insertUser.email ?? null,
      name: insertUser.name ?? null,
      profileImageUrl: insertUser.profileImageUrl ?? null,
      username: insertUser.username ?? null,
      password: insertUser.password ?? null,
      passwordHash: insertUser.passwordHash ?? null,
      phone: insertUser.phone ?? null,
      region: insertUser.region ?? null,
      clinicId: insertUser.clinicId ?? null,
      notificationPreferences: insertUser.notificationPreferences ?? null,
      twoFactorSecret: insertUser.twoFactorSecret ?? null,
      twoFactorEnabled: insertUser.twoFactorEnabled ?? false,
      twoFactorBackupCodes: insertUser.twoFactorBackupCodes ?? null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updateData };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    // Check if user exists by openidSub or email
    let existingUser: User | undefined;
    
    if (userData.openidSub) {
      existingUser = Array.from(this.users.values()).find(u => u.openidSub === userData.openidSub);
    } else if (userData.email) {
      existingUser = Array.from(this.users.values()).find(u => u.email === userData.email);
    }
    
    if (existingUser) {
      // Update existing user
      const updated: User = {
        ...existingUser,
        ...userData,
        id: existingUser.id,
        updatedAt: new Date(),
      };
      this.users.set(existingUser.id, updated);
      return updated;
    }
    
    // Create new user
    const id = randomUUID();
    const user: User = {
      id,
      name: userData.name ?? null,
      username: userData.username ?? null,
      password: userData.password ?? null,
      email: userData.email ?? null,
      phone: userData.phone ?? null,
      passwordHash: userData.passwordHash ?? null,
      googleId: userData.googleId ?? null,
      openidSub: userData.openidSub ?? null,
      role: userData.role ?? 'user',
      avatar: userData.avatar ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      language: userData.language ?? 'en',
      languagePreference: userData.languagePreference ?? 'en',
      region: userData.region ?? null,
      regionPreference: userData.regionPreference ?? null,
      clinicId: userData.clinicId ?? null,
      notificationPreferences: userData.notificationPreferences ?? null,
      twoFactorSecret: userData.twoFactorSecret ?? null,
      twoFactorEnabled: userData.twoFactorEnabled ?? false,
      twoFactorBackupCodes: userData.twoFactorBackupCodes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Pets
  async getPet(id: string): Promise<Pet | undefined> {
    return this.pets.get(id);
  }

  async getPetsByUserId(userId: string): Promise<Pet[]> {
    return Array.from(this.pets.values()).filter(pet => pet.userId === userId);
  }

  async getAllPets(): Promise<Pet[]> {
    return Array.from(this.pets.values());
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const id = randomUUID();
    const pet: Pet = { 
      ...insertPet, 
      id, 
      createdAt: new Date(),
      name: insertPet.name,
      userId: insertPet.userId,
      species: insertPet.species,
      breedId: insertPet.breedId ?? null,
      breed: insertPet.breed ?? null,
      age: insertPet.age ?? null,
      weight: insertPet.weight ?? null,
      medicalNotes: insertPet.medicalNotes ?? null,
      lastVisitHospitalId: insertPet.lastVisitHospitalId ?? null,
      lastVisitDate: insertPet.lastVisitDate ?? null,
      type: insertPet.type ?? null,
      color: insertPet.color ?? null,
      medicalHistory: insertPet.medicalHistory ?? null,
      microchipId: insertPet.microchipId ?? null,
      photoUrl: insertPet.photoUrl ?? null,
    };
    this.pets.set(id, pet);
    return pet;
  }

  async updatePet(id: string, updateData: Partial<InsertPet>): Promise<Pet | undefined> {
    const pet = this.pets.get(id);
    if (!pet) return undefined;
    const updated = { ...pet, ...updateData };
    this.pets.set(id, updated);
    return updated;
  }

  async deletePet(id: string): Promise<boolean> {
    return this.pets.delete(id);
  }

  // Regions
  async getRegion(id: string): Promise<Region | undefined> {
    return this.regions.get(id);
  }

  async getRegionByCode(code: string): Promise<Region | undefined> {
    return Array.from(this.regions.values()).find(region => region.code === code);
  }

  async getAllRegions(): Promise<Region[]> {
    return Array.from(this.regions.values());
  }

  async createRegion(insertRegion: InsertRegion): Promise<Region> {
    const id = randomUUID();
    const region: Region = { 
      ...insertRegion, 
      id,
      countryCode: insertRegion.countryCode,
      code: insertRegion.code,
      nameEn: insertRegion.nameEn,
      nameZh: insertRegion.nameZh ?? null,
      coordinates: insertRegion.coordinates ?? null,
      active: insertRegion.active ?? true,
    };
    this.regions.set(id, region);
    return region;
  }

  async updateRegion(id: string, updateData: Partial<InsertRegion>): Promise<Region | undefined> {
    const region = this.regions.get(id);
    if (!region) return undefined;
    const updated = { ...region, ...updateData };
    this.regions.set(id, updated);
    return updated;
  }

  async getRegionsByCountry(countryCode: string): Promise<Region[]> {
    return Array.from(this.regions.values()).filter(region => region.countryCode === countryCode);
  }

  // Countries (stub implementations - app uses DatabaseStorage in production)
  async getCountry(id: string): Promise<Country | undefined> {
    return this.countries.get(id);
  }

  async getCountryByCode(code: string): Promise<Country | undefined> {
    return Array.from(this.countries.values()).find(country => country.code === code);
  }

  async getAllCountries(): Promise<Country[]> {
    return Array.from(this.countries.values());
  }

  async getActiveCountries(): Promise<Country[]> {
    return Array.from(this.countries.values()).filter(country => country.active);
  }

  async createCountry(insertCountry: InsertCountry): Promise<Country> {
    const id = randomUUID();
    const country: Country = { 
      ...insertCountry, 
      id,
      code: insertCountry.code,
      nameEn: insertCountry.nameEn,
      nameZh: insertCountry.nameZh ?? null,
      region: insertCountry.region ?? null,
      active: insertCountry.active ?? null,
      phonePrefix: insertCountry.phonePrefix ?? null,
      flag: insertCountry.flag ?? null
    };
    this.countries.set(id, country);
    return country;
  }

  async updateCountry(id: string, updateData: Partial<InsertCountry>): Promise<Country | undefined> {
    const country = this.countries.get(id);
    if (!country) return undefined;
    const updated = { ...country, ...updateData };
    this.countries.set(id, updated);
    return updated;
  }

  async deleteCountry(id: string): Promise<boolean> {
    return this.countries.delete(id);
  }

  // Pet Breeds (stub implementations - app uses DatabaseStorage in production)
  async getPetBreed(id: string): Promise<PetBreed | undefined> {
    return this.petBreeds.get(id);
  }

  async getPetBreedsBySpecies(species: string): Promise<PetBreed[]> {
    return Array.from(this.petBreeds.values()).filter(breed => breed.species === species);
  }

  async getPetBreedsByCountry(countryCode: string): Promise<PetBreed[]> {
    return Array.from(this.petBreeds.values()).filter(breed => 
      breed.countryCode === countryCode || breed.countryCode === null
    );
  }

  async getCommonPetBreeds(species?: string): Promise<PetBreed[]> {
    const breeds = Array.from(this.petBreeds.values()).filter(breed => breed.isCommon);
    if (species) {
      return breeds.filter(breed => breed.species === species);
    }
    return breeds;
  }

  async getAllPetBreeds(): Promise<PetBreed[]> {
    return Array.from(this.petBreeds.values());
  }

  async createPetBreed(insertBreed: InsertPetBreed): Promise<PetBreed> {
    const id = randomUUID();
    const breed: PetBreed = { 
      ...insertBreed, 
      id,
      breedZh: insertBreed.breedZh ?? null,
      countryCode: insertBreed.countryCode ?? null,
      isCommon: insertBreed.isCommon ?? false,
      active: insertBreed.active ?? true
    };
    this.petBreeds.set(id, breed);
    return breed;
  }

  async updatePetBreed(id: string, updateData: Partial<InsertPetBreed>): Promise<PetBreed | undefined> {
    const breed = this.petBreeds.get(id);
    if (!breed) return undefined;
    const updated = { ...breed, ...updateData };
    this.petBreeds.set(id, updated);
    return updated;
  }

  async deletePetBreed(id: string): Promise<boolean> {
    return this.petBreeds.delete(id);
  }

  // Clinics
  async getClinic(id: string): Promise<Clinic | undefined> {
    return this.clinics.get(id);
  }

  async getClinicsByRegion(regionId: string): Promise<Clinic[]> {
    return Array.from(this.clinics.values()).filter(
      clinic => clinic.regionId === regionId && clinic.status === 'active'
    );
  }

  async get24HourClinicsByRegion(regionId: string): Promise<Clinic[]> {
    return Array.from(this.clinics.values()).filter(
      clinic => clinic.regionId === regionId && clinic.is24Hour && clinic.status === 'active'
    );
  }

  async getAllClinics(): Promise<Clinic[]> {
    return Array.from(this.clinics.values()).filter(clinic => clinic.status !== 'deleted');
  }

  async getNearbyClinics(latitude: number, longitude: number, radiusMeters: number): Promise<(Clinic & { distance: number })[]> {
    // Haversine formula for distance calculation (for in-memory storage)
    const toRad = (deg: number) => deg * Math.PI / 180;
    const R = 6371000; // Earth's radius in meters
    
    const results = Array.from(this.clinics.values())
      .filter(clinic => 
        clinic.status === 'active' && 
        clinic.latitude !== null && 
        clinic.longitude !== null
      )
      .map(clinic => {
        const lat1 = toRad(latitude);
        const lat2 = toRad(Number(clinic.latitude));
        const dLat = toRad(Number(clinic.latitude) - latitude);
        const dLon = toRad(Number(clinic.longitude) - longitude);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return { ...clinic, distance };
      })
      .filter(result => result.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
    
    return results;
  }

  async createClinic(insertClinic: InsertClinic): Promise<Clinic> {
    const id = randomUUID();
    const clinic: Clinic = { 
      ...insertClinic, 
      id, 
      createdAt: new Date(),
      name: insertClinic.name,
      address: insertClinic.address,
      phone: insertClinic.phone,
      regionId: insertClinic.regionId,
      nameZh: insertClinic.nameZh ?? null,
      addressZh: insertClinic.addressZh ?? null,
      whatsapp: insertClinic.whatsapp ?? null,
      email: insertClinic.email ?? null,
      lineUserId: insertClinic.lineUserId ?? null,
      latitude: insertClinic.latitude ?? null,
      longitude: insertClinic.longitude ?? null,
      location: null,
      status: insertClinic.status ?? 'active',
      is24Hour: insertClinic.is24Hour ?? false,
      isAvailable: insertClinic.isAvailable ?? true,
      isSupportHospital: insertClinic.isSupportHospital ?? false,
      services: insertClinic.services ?? null,
      ownerVerificationCode: insertClinic.ownerVerificationCode ?? null,
      ownerVerificationCodeExpiresAt: insertClinic.ownerVerificationCodeExpiresAt ?? null,
      averageRating: insertClinic.averageRating ?? null,
      reviewCount: insertClinic.reviewCount ?? 0,
    };
    this.clinics.set(id, clinic);
    return clinic;
  }

  async updateClinic(id: string, updateData: Partial<InsertClinic>): Promise<Clinic | undefined> {
    const clinic = this.clinics.get(id);
    if (!clinic) return undefined;
    const updated = { ...clinic, ...updateData, updatedAt: new Date() };
    this.clinics.set(id, updated);
    return updated;
  }

  async deleteClinic(id: string): Promise<boolean> {
    const clinic = this.clinics.get(id);
    if (!clinic) return false;
    clinic.status = 'deleted';
    this.clinics.set(id, clinic);
    return true;
  }

  // Emergency Requests
  async getEmergencyRequest(id: string): Promise<any> {
    const request = this.emergencyRequests.get(id);
    if (!request) return undefined;
    
    // Include pet data if petId exists
    const pet = request.petId ? this.pets.get(request.petId) : null;
    return {
      ...request,
      pet
    };
  }

  async getEmergencyRequestsByUserId(userId: string): Promise<EmergencyRequest[]> {
    return Array.from(this.emergencyRequests.values()).filter(req => req.userId === userId);
  }

  async getEmergencyRequestsByClinicId(clinicId: string): Promise<any[]> {
    const requestIds = new Set(
      Array.from(this.messages.values())
        .filter(msg => msg.hospitalId === clinicId)
        .map(msg => msg.emergencyRequestId)
    );
    
    return Array.from(this.emergencyRequests.values())
      .filter(req => requestIds.has(req.id))
      .map(req => {
        const pet = req.petId ? this.pets.get(req.petId) : undefined;
        const user = req.userId ? this.users.get(req.userId) : undefined;
        return {
          ...req,
          pet,
          user
        };
      });
  }

  async getAllEmergencyRequests(): Promise<EmergencyRequest[]> {
    return Array.from(this.emergencyRequests.values());
  }

  async createEmergencyRequest(insertRequest: InsertEmergencyRequest): Promise<EmergencyRequest> {
    const id = randomUUID();
    const request: EmergencyRequest = { 
      ...insertRequest, 
      id, 
      createdAt: new Date(),
      contactName: insertRequest.contactName,
      contactPhone: insertRequest.contactPhone,
      status: insertRequest.status ?? 'pending',
      userId: insertRequest.userId ?? null,
      petId: insertRequest.petId ?? null,
      symptom: insertRequest.symptom ?? null,
      petSpecies: insertRequest.petSpecies ?? null,
      petBreed: insertRequest.petBreed ?? null,
      petAge: insertRequest.petAge ?? null,
      locationLatitude: insertRequest.locationLatitude ?? null,
      locationLongitude: insertRequest.locationLongitude ?? null,
      manualLocation: insertRequest.manualLocation ?? null,
      regionId: insertRequest.regionId ?? null,
      voiceTranscript: insertRequest.voiceTranscript ?? null,
      isVoiceRecording: insertRequest.isVoiceRecording ?? null,
      aiAnalyzedSymptoms: insertRequest.aiAnalyzedSymptoms ?? null
    };
    this.emergencyRequests.set(id, request);
    return request;
  }

  async updateEmergencyRequest(id: string, updateData: Partial<InsertEmergencyRequest>): Promise<EmergencyRequest | undefined> {
    const request = this.emergencyRequests.get(id);
    if (!request) return undefined;
    const updated = { ...request, ...updateData };
    this.emergencyRequests.set(id, updated);
    return updated;
  }

  // Messages
  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessageByWhatsAppId(whatsappMessageId: string): Promise<Message | undefined> {
    return Array.from(this.messages.values()).find(
      msg => msg.whatsappMessageId === whatsappMessageId
    );
  }

  async getMessagesByEmergencyRequest(emergencyRequestId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      msg => msg.emergencyRequestId === emergencyRequestId
    );
  }

  async getAllMessages(limit: number = 100): Promise<Message[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date(),
      status: insertMessage.status ?? 'queued',
      sentAt: insertMessage.sentAt ?? null,
      deliveredAt: insertMessage.deliveredAt ?? null,
      failedAt: insertMessage.failedAt ?? null,
      errorMessage: insertMessage.errorMessage ?? null,
      retryCount: insertMessage.retryCount ?? 0,
      whatsappMessageId: insertMessage.whatsappMessageId ?? null,
      readAt: insertMessage.readAt ?? null
    };
    this.messages.set(id, message);
    return message;
  }

  async updateMessage(id: string, updateData: Partial<InsertMessage>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    const updated = { ...message, ...updateData };
    this.messages.set(id, updated);
    return updated;
  }

  async updateMessageByWhatsAppId(whatsappMessageId: string, updateData: Partial<InsertMessage>): Promise<Message | undefined> {
    const message = await this.getMessageByWhatsAppId(whatsappMessageId);
    if (!message) return undefined;
    const updated = { ...message, ...updateData };
    this.messages.set(message.id, updated);
    return updated;
  }

  async getQueuedMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      msg => msg.status === 'queued'
    );
  }

  // Feature Flags
  async getFeatureFlag(key: string): Promise<FeatureFlag | undefined> {
    return Array.from(this.featureFlags.values()).find(flag => flag.key === key);
  }

  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    return Array.from(this.featureFlags.values());
  }

  async createFeatureFlag(insertFlag: InsertFeatureFlag): Promise<FeatureFlag> {
    const id = randomUUID();
    const flag: FeatureFlag = { 
      ...insertFlag, 
      id, 
      updatedAt: new Date(),
      enabled: insertFlag.enabled ?? false,
      value: insertFlag.value ?? null,
      description: insertFlag.description ?? null
    };
    this.featureFlags.set(id, flag);
    return flag;
  }

  async updateFeatureFlag(id: string, updateData: Partial<InsertFeatureFlag>): Promise<FeatureFlag | undefined> {
    const flag = this.featureFlags.get(id);
    if (!flag) return undefined;
    const updated = { ...flag, ...updateData, updatedAt: new Date() };
    this.featureFlags.set(id, updated);
    return updated;
  }

  // Audit Logs
  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const log: AuditLog = { 
      ...insertLog, 
      id, 
      createdAt: new Date(),
      userId: insertLog.userId ?? null,
      changes: insertLog.changes ?? null,
      ipAddress: insertLog.ipAddress ?? null,
      userAgent: insertLog.userAgent ?? null
    };
    this.auditLogs.set(id, log);
    return log;
  }

  async getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).filter(
      log => log.entityType === entityType && log.entityId === entityId
    );
  }

  // Privacy Consents
  async getPrivacyConsents(userId: string): Promise<PrivacyConsent[]> {
    return Array.from(this.privacyConsents.values()).filter(
      consent => consent.userId === userId
    );
  }

  async createPrivacyConsent(insertConsent: InsertPrivacyConsent): Promise<PrivacyConsent> {
    const id = randomUUID();
    const consent: PrivacyConsent = { 
      ...insertConsent, 
      id, 
      consentedAt: new Date(),
      accepted: insertConsent.accepted ?? false
    };
    this.privacyConsents.set(id, consent);
    return consent;
  }

  // Translations
  async getTranslationsByLanguage(language: string): Promise<Translation[]> {
    return Array.from(this.translations.values()).filter(
      t => t.language === language
    );
  }

  async getTranslation(key: string, language: string): Promise<Translation | undefined> {
    return Array.from(this.translations.values()).find(
      t => t.key === key && t.language === language
    );
  }

  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const id = randomUUID();
    const translation: Translation = { 
      ...insertTranslation, 
      id, 
      namespace: insertTranslation.namespace ?? 'common',
      updatedAt: new Date()
    };
    this.translations.set(id, translation);
    return translation;
  }

  async updateTranslation(id: string, updateData: Partial<InsertTranslation>): Promise<Translation | undefined> {
    const translation = this.translations.get(id);
    if (!translation) return undefined;
    const updated = { ...translation, ...updateData, updatedAt: new Date() };
    this.translations.set(id, updated);
    return updated;
  }

  // Hospitals
  async getHospital(id: string): Promise<Hospital | undefined> {
    return this.hospitals.get(id);
  }

  async getHospitalBySlug(slug: string): Promise<Hospital | undefined> {
    return Array.from(this.hospitals.values()).find(
      hospital => hospital.slug === slug
    );
  }

  async getHospitalsByRegion(regionId: string): Promise<Hospital[]> {
    return Array.from(this.hospitals.values()).filter(
      hospital => hospital.regionId === regionId
    );
  }

  async getAllHospitals(): Promise<Hospital[]> {
    return Array.from(this.hospitals.values());
  }

  async getNearbyHospitals(latitude: number, longitude: number, radiusMeters: number): Promise<(Hospital & { distance: number })[]> {
    // Haversine formula for distance calculation (for in-memory storage)
    const toRad = (deg: number) => deg * Math.PI / 180;
    const R = 6371000; // Earth's radius in meters
    
    const results = Array.from(this.hospitals.values())
      .filter(hospital => 
        hospital.isAvailable && 
        hospital.latitude !== null && 
        hospital.longitude !== null
      )
      .map(hospital => {
        const lat1 = toRad(latitude);
        const lat2 = toRad(Number(hospital.latitude));
        const dLat = toRad(Number(hospital.latitude) - latitude);
        const dLon = toRad(Number(hospital.longitude) - longitude);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return { ...hospital, distance };
      })
      .filter(result => result.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
    
    return results;
  }

  async createHospital(insertHospital: InsertHospital): Promise<Hospital> {
    const id = randomUUID();
    const now = new Date();
    const hospital: Hospital = {
      ...insertHospital,
      id,
      slug: insertHospital.slug,
      nameEn: insertHospital.nameEn,
      nameZh: insertHospital.nameZh,
      addressEn: insertHospital.addressEn,
      addressZh: insertHospital.addressZh,
      regionId: insertHospital.regionId,
      createdAt: now,
      updatedAt: now,
      email: insertHospital.email ?? null,
      latitude: insertHospital.latitude ?? null,
      longitude: insertHospital.longitude ?? null,
      location: null,
      phone: insertHospital.phone ?? null,
      whatsapp: insertHospital.whatsapp ?? null,
      websiteUrl: insertHospital.websiteUrl ?? null,
      open247: insertHospital.open247 ?? true,
      isAvailable: insertHospital.isAvailable ?? true,
      isPartner: insertHospital.isPartner ?? false,
      liveStatus: insertHospital.liveStatus ?? null,
      photos: insertHospital.photos ?? null,
      lastVerifiedAt: insertHospital.lastVerifiedAt ?? null,
      verifiedById: insertHospital.verifiedById ?? null,
      onSiteVet247: insertHospital.onSiteVet247 ?? null,
      triagePolicy: insertHospital.triagePolicy ?? null,
      typicalWaitBand: insertHospital.typicalWaitBand ?? null,
      isolationWard: insertHospital.isolationWard ?? null,
      ambulanceSupport: insertHospital.ambulanceSupport ?? null,
      icuLevel: insertHospital.icuLevel ?? null,
      nurse24h: insertHospital.nurse24h ?? null,
      ownerVisitPolicy: insertHospital.ownerVisitPolicy ?? null,
      eolSupport: insertHospital.eolSupport ?? null,
      imagingXray: insertHospital.imagingXray ?? null,
      imagingUS: insertHospital.imagingUS ?? null,
      imagingCT: insertHospital.imagingCT ?? null,
      sameDayCT: insertHospital.sameDayCT ?? null,
      inHouseLab: insertHospital.inHouseLab ?? null,
      extLabCutoff: insertHospital.extLabCutoff ?? null,
      bloodBankAccess: insertHospital.bloodBankAccess ?? null,
      sxEmergencySoft: insertHospital.sxEmergencySoft ?? null,
      ownerVerificationCode: insertHospital.ownerVerificationCode ?? null,
      ownerVerificationCodeExpiresAt: insertHospital.ownerVerificationCodeExpiresAt ?? null,
      verified: insertHospital.verified ?? false,
      sxEmergencyOrtho: insertHospital.sxEmergencyOrtho ?? null,
      anaesMonitoring: insertHospital.anaesMonitoring ?? null,
      specialistAvail: insertHospital.specialistAvail ?? null,
      speciesAccepted: insertHospital.speciesAccepted ?? null,
      whatsappTriage: insertHospital.whatsappTriage ?? null,
      languages: insertHospital.languages ?? null,
      parking: insertHospital.parking ?? null,
      wheelchairAccess: insertHospital.wheelchairAccess ?? null,
      payMethods: insertHospital.payMethods ?? null,
      admissionDeposit: insertHospital.admissionDeposit ?? null,
      depositBand: insertHospital.depositBand ?? null,
      insuranceSupport: insertHospital.insuranceSupport ?? null,
      recheckWindow: insertHospital.recheckWindow ?? null,
      refundPolicy: insertHospital.refundPolicy ?? null,
      oxygenTherapy: insertHospital.oxygenTherapy ?? null,
      ventilator: insertHospital.ventilator ?? null,
      bloodTransfusion: insertHospital.bloodTransfusion ?? null,
      imagingMRI: insertHospital.imagingMRI ?? null,
      endoscopy: insertHospital.endoscopy ?? null,
      dialysis: insertHospital.dialysis ?? null,
      defibrillator: insertHospital.defibrillator ?? null,
    };
    this.hospitals.set(id, hospital);
    return hospital;
  }

  async updateHospital(id: string, updateData: Partial<InsertHospital>): Promise<Hospital | undefined> {
    const hospital = this.hospitals.get(id);
    if (!hospital) return undefined;
    const updated = { ...hospital, ...updateData, updatedAt: new Date() };
    this.hospitals.set(id, updated);
    return updated;
  }

  async deleteHospital(id: string): Promise<boolean> {
    return this.hospitals.delete(id);
  }

  // Hospital Consult Fees
  async getConsultFeesByHospitalId(hospitalId: string): Promise<HospitalConsultFee[]> {
    return Array.from(this.hospitalConsultFees.values()).filter(
      fee => fee.hospitalId === hospitalId
    );
  }

  async createConsultFee(insertFee: InsertHospitalConsultFee): Promise<HospitalConsultFee> {
    const id = randomUUID();
    const fee: HospitalConsultFee = {
      ...insertFee,
      id,
      minFee: insertFee.minFee ?? null,
      maxFee: insertFee.maxFee ?? null,
      currency: insertFee.currency ?? 'HKD',
      notes: insertFee.notes ?? null,
      lastUpdated: insertFee.lastUpdated ?? new Date(),
    };
    this.hospitalConsultFees.set(id, fee);
    return fee;
  }

  async updateConsultFee(id: string, updateData: Partial<InsertHospitalConsultFee>): Promise<HospitalConsultFee | undefined> {
    const fee = this.hospitalConsultFees.get(id);
    if (!fee) return undefined;
    const updated = { ...fee, ...updateData, lastUpdated: new Date() };
    this.hospitalConsultFees.set(id, updated);
    return updated;
  }

  async deleteConsultFee(id: string): Promise<boolean> {
    return this.hospitalConsultFees.delete(id);
  }

  // Hospital Updates
  async getHospitalUpdatesByHospitalId(hospitalId: string): Promise<HospitalUpdate[]> {
    return Array.from(this.hospitalUpdates.values()).filter(
      update => update.hospitalId === hospitalId
    );
  }

  async createHospitalUpdate(insertUpdate: InsertHospitalUpdate): Promise<HospitalUpdate> {
    const id = randomUUID();
    const update: HospitalUpdate = {
      ...insertUpdate,
      id,
      createdAt: new Date(),
      submittedById: insertUpdate.submittedById ?? null,
      fieldName: insertUpdate.fieldName ?? null,
      oldValue: insertUpdate.oldValue ?? null,
      newValue: insertUpdate.newValue ?? null,
      status: insertUpdate.status ?? 'pending',
      reviewedById: insertUpdate.reviewedById ?? null,
      reviewedAt: insertUpdate.reviewedAt ?? null,
      notes: insertUpdate.notes ?? null,
    };
    this.hospitalUpdates.set(id, update);
    return update;
  }

  async updateHospitalUpdate(id: string, updateData: Partial<InsertHospitalUpdate>): Promise<HospitalUpdate | undefined> {
    const update = this.hospitalUpdates.get(id);
    if (!update) return undefined;
    const updated = { ...update, ...updateData };
    this.hospitalUpdates.set(id, updated);
    return updated;
  }

  async exportUserData(userId: string): Promise<{
    user: User | undefined;
    pets: Pet[];
    emergencyRequests: EmergencyRequest[];
    privacyConsents: PrivacyConsent[];
    auditLogs: AuditLog[];
  }> {
    const user = this.users.get(userId);
    const pets = Array.from(this.pets.values()).filter(p => p.userId === userId);
    const emergencyRequests = Array.from(this.emergencyRequests.values()).filter(r => r.userId === userId);
    const privacyConsents = Array.from(this.privacyConsents.values()).filter(c => c.userId === userId);
    const auditLogs = Array.from(this.auditLogs.values()).filter(l => l.entityType === 'user' && l.entityId === userId);

    return {
      user,
      pets,
      emergencyRequests,
      privacyConsents,
      auditLogs
    };
  }

  async deleteUserDataGDPR(userId: string): Promise<{
    success: boolean;
    deletedRecords: {
      pets: number;
      emergencyRequests: number;
      privacyConsents: number;
      messages: number;
      user: boolean;
    };
  }> {
    // Delete all user's pets
    const userPets = Array.from(this.pets.values()).filter(p => p.userId === userId);
    userPets.forEach(pet => this.pets.delete(pet.id));

    // Delete all user's emergency requests and associated messages
    const userRequests = Array.from(this.emergencyRequests.values()).filter(r => r.userId === userId);
    const requestIds = userRequests.map(r => r.id);
    userRequests.forEach(req => this.emergencyRequests.delete(req.id));

    // Delete messages associated with user's emergency requests
    const requestMessages = Array.from(this.messages.values()).filter(m => requestIds.includes(m.emergencyRequestId));
    requestMessages.forEach(msg => this.messages.delete(msg.id));

    // Delete all user's privacy consents
    const userConsents = Array.from(this.privacyConsents.values()).filter(c => c.userId === userId);
    userConsents.forEach(consent => this.privacyConsents.delete(consent.id));

    // Delete ALL audit logs related to this user
    // This includes:
    // - Logs where user is the entity (entityType='user', entityId=userId)
    // - Logs where user performed actions (userId=userId)
    // - This prevents user ID from persisting in changes JSONB or other fields
    const userRelatedLogs = Array.from(this.auditLogs.values()).filter(
      l => l.userId === userId || (l.entityType === 'user' && l.entityId === userId)
    );
    userRelatedLogs.forEach(log => this.auditLogs.delete(log.id));

    // Delete user account
    const userDeleted = this.users.delete(userId);

    return {
      success: userDeleted,
      deletedRecords: {
        pets: userPets.length,
        emergencyRequests: userRequests.length,
        privacyConsents: userConsents.length,
        messages: requestMessages.length,
        user: userDeleted
      }
    };
  }

  // Pet Medical Records - stub implementations
  async getMedicalRecordsByPetId(petId: string): Promise<PetMedicalRecord[]> {
    throw new Error("MemStorage does not support medical records - use DatabaseStorage");
  }

  async getMedicalRecord(id: string): Promise<PetMedicalRecord | undefined> {
    throw new Error("MemStorage does not support medical records - use DatabaseStorage");
  }

  async createMedicalRecord(record: InsertPetMedicalRecord): Promise<PetMedicalRecord> {
    throw new Error("MemStorage does not support medical records - use DatabaseStorage");
  }

  async updateMedicalRecord(id: string, record: Partial<InsertPetMedicalRecord>): Promise<PetMedicalRecord | undefined> {
    throw new Error("MemStorage does not support medical records - use DatabaseStorage");
  }

  async deleteMedicalRecord(id: string): Promise<boolean> {
    throw new Error("MemStorage does not support medical records - use DatabaseStorage");
  }

  async getUserStorageUsage(userId: string): Promise<{ usedBytes: number; recordCount: number }> {
    throw new Error("MemStorage does not support storage usage - use DatabaseStorage");
  }

  // Pet Medical Sharing Consents - stub implementations
  async getMedicalSharingConsent(petId: string, userId: string, consentType: string): Promise<PetMedicalSharingConsent | undefined> {
    throw new Error("MemStorage does not support medical sharing consents - use DatabaseStorage");
  }

  async getMedicalSharingConsentsByPetId(petId: string): Promise<PetMedicalSharingConsent[]> {
    throw new Error("MemStorage does not support medical sharing consents - use DatabaseStorage");
  }

  async getMedicalSharingConsentsByUserId(userId: string): Promise<PetMedicalSharingConsent[]> {
    throw new Error("MemStorage does not support medical sharing consents - use DatabaseStorage");
  }

  async upsertMedicalSharingConsent(consent: InsertPetMedicalSharingConsent): Promise<PetMedicalSharingConsent> {
    throw new Error("MemStorage does not support medical sharing consents - use DatabaseStorage");
  }

  // Push Subscriptions - stub implementations
  async createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription> {
    throw new Error("MemStorage does not support push subscriptions - use DatabaseStorage");
  }

  async getPushSubscriptionByToken(token: string): Promise<PushSubscription | undefined> {
    throw new Error("MemStorage does not support push subscriptions - use DatabaseStorage");
  }

  async updatePushSubscription(id: string, data: Partial<InsertPushSubscription>): Promise<PushSubscription | undefined> {
    throw new Error("MemStorage does not support push subscriptions - use DatabaseStorage");
  }

  async deactivatePushSubscription(token: string): Promise<boolean> {
    throw new Error("MemStorage does not support push subscriptions - use DatabaseStorage");
  }

  async deactivatePushSubscriptions(tokens: string[]): Promise<number> {
    throw new Error("MemStorage does not support push subscriptions - use DatabaseStorage");
  }

  async getAllActivePushSubscriptions(language?: string, role?: string): Promise<PushSubscription[]> {
    throw new Error("MemStorage does not support push subscriptions - use DatabaseStorage");
  }

  async getActiveTokens(language?: string, role?: string): Promise<string[]> {
    throw new Error("MemStorage does not support push subscriptions - use DatabaseStorage");
  }

  async getPetOwnerEmails(): Promise<{ id: string; email: string }[]> {
    throw new Error("MemStorage does not support getting pet owner emails - use DatabaseStorage");
  }

  async getPetOwnerPushTokens(): Promise<string[]> {
    throw new Error("MemStorage does not support getting pet owner push tokens - use DatabaseStorage");
  }

  // Notification Broadcasts - in-memory implementations
  async createNotificationBroadcast(broadcast: InsertNotificationBroadcast): Promise<NotificationBroadcast> {
    const id = randomUUID();
    const newBroadcast: NotificationBroadcast = {
      id,
      title: broadcast.title,
      message: broadcast.message,
      targetLanguage: broadcast.targetLanguage ?? null,
      targetAudience: broadcast.targetAudience ?? 'all',
      targetRole: broadcast.targetRole ?? null,
      url: broadcast.url ?? null,
      adminId: broadcast.adminId,
      status: broadcast.status ?? 'pending',
      scheduledFor: broadcast.scheduledFor ?? null,
      sentAt: null,
      recipientCount: null,
      providerResponse: null,
      createdAt: new Date()
    };
    this.notificationBroadcastsMap.set(id, newBroadcast);
    return newBroadcast;
  }

  async getNotificationBroadcast(id: string): Promise<NotificationBroadcast | undefined> {
    return this.notificationBroadcastsMap.get(id);
  }

  async getRecentNotificationBroadcasts(limit: number = 50): Promise<NotificationBroadcast[]> {
    const broadcasts = Array.from(this.notificationBroadcastsMap.values());
    return broadcasts
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async updateNotificationBroadcast(id: string, data: Partial<NotificationBroadcast>): Promise<NotificationBroadcast | undefined> {
    const broadcast = this.notificationBroadcastsMap.get(id);
    if (!broadcast) return undefined;
    const updated = { ...broadcast, ...data };
    this.notificationBroadcastsMap.set(id, updated);
    return updated;
  }

  async getAllNotificationBroadcasts(limit: number = 50, offset: number = 0): Promise<{ broadcasts: NotificationBroadcast[]; total: number }> {
    const allBroadcasts = Array.from(this.notificationBroadcastsMap.values());
    const sorted = allBroadcasts.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    return {
      broadcasts: sorted.slice(offset, offset + limit),
      total: allBroadcasts.length
    };
  }

  async getScheduledNotifications(): Promise<NotificationBroadcast[]> {
    const now = new Date();
    return Array.from(this.notificationBroadcastsMap.values())
      .filter(broadcast => 
        broadcast.status === 'scheduled' && 
        broadcast.scheduledFor !== null && 
        broadcast.scheduledFor <= now
      )
      .sort((a, b) => (a.scheduledFor?.getTime() || 0) - (b.scheduledFor?.getTime() || 0));
  }

  async updateNotificationBroadcastStatus(id: string, status: string): Promise<NotificationBroadcast | undefined> {
    const broadcast = this.notificationBroadcastsMap.get(id);
    if (!broadcast) return undefined;
    const updated = { ...broadcast, status };
    this.notificationBroadcastsMap.set(id, updated);
    return updated;
  }

  // Clinic Reviews - in-memory implementations
  async createClinicReview(review: InsertClinicReview): Promise<ClinicReview> {
    const id = randomUUID();
    const now = new Date();
    const newReview: ClinicReview = {
      id,
      clinicId: review.clinicId,
      userId: review.userId,
      rating: review.rating,
      reviewText: review.reviewText ?? null,
      status: review.status ?? 'pending',
      createdAt: now,
      updatedAt: now,
    };
    this.clinicReviewsMap.set(id, newReview);
    return newReview;
  }

  async getClinicReviews(clinicId: string): Promise<(ClinicReview & { user: { displayName: string | null } })[]> {
    const reviews = Array.from(this.clinicReviewsMap.values())
      .filter(review => review.clinicId === clinicId && review.status === 'approved');
    
    return reviews.map(review => {
      const user = this.users.get(review.userId);
      const displayName = user?.name || user?.username || null;
      return {
        ...review,
        user: { displayName }
      };
    });
  }

  async getClinicReview(id: string): Promise<ClinicReview | undefined> {
    return this.clinicReviewsMap.get(id);
  }

  async getUserReviewForClinic(userId: string, clinicId: string): Promise<ClinicReview | undefined> {
    return Array.from(this.clinicReviewsMap.values()).find(
      review => review.userId === userId && review.clinicId === clinicId
    );
  }

  async updateClinicReview(id: string, data: Partial<InsertClinicReview>): Promise<ClinicReview | undefined> {
    const review = this.clinicReviewsMap.get(id);
    if (!review) return undefined;
    const updated: ClinicReview = {
      ...review,
      ...data,
      updatedAt: new Date(),
    };
    this.clinicReviewsMap.set(id, updated);
    return updated;
  }

  async deleteClinicReview(id: string): Promise<boolean> {
    return this.clinicReviewsMap.delete(id);
  }

  async updateClinicRatingStats(clinicId: string): Promise<void> {
    const approvedReviews = Array.from(this.clinicReviewsMap.values())
      .filter(review => review.clinicId === clinicId && review.status === 'approved');
    
    const clinic = this.clinics.get(clinicId);
    if (!clinic) return;

    if (approvedReviews.length === 0) {
      const updated = { ...clinic, averageRating: null, reviewCount: 0 };
      this.clinics.set(clinicId, updated);
      return;
    }

    const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / approvedReviews.length).toFixed(2);
    
    const updated = {
      ...clinic,
      averageRating: averageRating,
      reviewCount: approvedReviews.length,
    };
    this.clinics.set(clinicId, updated);
  }

  // Two-Factor Authentication methods
  async updateUserTwoFactor(userId: string, secret: string | null, backupCodes: string[] | null, enabled: boolean): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      twoFactorSecret: secret,
      twoFactorBackupCodes: backupCodes,
      twoFactorEnabled: enabled,
      updatedAt: new Date()
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async validateBackupCode(userId: string, code: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.twoFactorBackupCodes || user.twoFactorBackupCodes.length === 0) {
      return false;
    }
    
    const bcrypt = require('bcrypt');
    const backupCodes = user.twoFactorBackupCodes;
    
    for (let i = 0; i < backupCodes.length; i++) {
      const isMatch = await bcrypt.compare(code, backupCodes[i]);
      if (isMatch) {
        // SECURITY FIX: Remove used backup code - codes are single-use only
        // Create new array without the matched code and update the user in the Map
        const remainingCodes = backupCodes.filter((_, index) => index !== i);
        await this.updateUserTwoFactor(userId, user.twoFactorSecret, remainingCodes, user.twoFactorEnabled);
        return true;
      }
    }
    
    return false;
  }

  // WhatsApp Conversations - stub implementations
  async getConversation(id: string): Promise<WhatsappConversation | undefined> {
    throw new Error("MemStorage does not support WhatsApp conversations - use DatabaseStorage");
  }

  async getConversationByPhone(phoneNumber: string): Promise<WhatsappConversation | undefined> {
    throw new Error("MemStorage does not support WhatsApp conversations - use DatabaseStorage");
  }

  async getAllConversations(includeArchived?: boolean): Promise<WhatsappConversation[]> {
    throw new Error("MemStorage does not support WhatsApp conversations - use DatabaseStorage");
  }

  async createConversation(data: InsertWhatsappConversation): Promise<WhatsappConversation> {
    throw new Error("MemStorage does not support WhatsApp conversations - use DatabaseStorage");
  }

  async updateConversation(id: string, data: Partial<InsertWhatsappConversation>): Promise<WhatsappConversation | undefined> {
    throw new Error("MemStorage does not support WhatsApp conversations - use DatabaseStorage");
  }

  async archiveConversation(id: string): Promise<boolean> {
    throw new Error("MemStorage does not support WhatsApp conversations - use DatabaseStorage");
  }

  // WhatsApp Chat Messages - stub implementations
  async getChatMessage(id: string): Promise<WhatsappChatMessage | undefined> {
    throw new Error("MemStorage does not support WhatsApp chat messages - use DatabaseStorage");
  }

  async getChatMessageByWhatsAppId(whatsappMessageId: string): Promise<WhatsappChatMessage | undefined> {
    throw new Error("MemStorage does not support WhatsApp chat messages - use DatabaseStorage");
  }

  async getChatMessagesByConversation(conversationId: string, limit?: number, offset?: number): Promise<WhatsappChatMessage[]> {
    throw new Error("MemStorage does not support WhatsApp chat messages - use DatabaseStorage");
  }

  async createChatMessage(data: InsertWhatsappChatMessage): Promise<WhatsappChatMessage> {
    throw new Error("MemStorage does not support WhatsApp chat messages - use DatabaseStorage");
  }

  async updateChatMessage(id: string, data: Partial<InsertWhatsappChatMessage>): Promise<WhatsappChatMessage | undefined> {
    throw new Error("MemStorage does not support WhatsApp chat messages - use DatabaseStorage");
  }

  async updateChatMessageByWhatsAppId(whatsappMessageId: string, data: Partial<InsertWhatsappChatMessage>): Promise<WhatsappChatMessage | undefined> {
    throw new Error("MemStorage does not support WhatsApp chat messages - use DatabaseStorage");
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    throw new Error("MemStorage does not support WhatsApp chat messages - use DatabaseStorage");
  }

  // Helper for WhatsApp - stub implementation
  async findHospitalByPhone(phoneNumber: string): Promise<Hospital | undefined> {
    throw new Error("MemStorage does not support findHospitalByPhone - use DatabaseStorage");
  }

  // Typhoon & Holiday Protocol - stub implementations
  async getActiveTyphoonAlert(): Promise<any | null> {
    throw new Error("MemStorage does not support typhoon alerts - use DatabaseStorage");
  }
  async getUpcomingHoliday(days: number): Promise<any | null> {
    throw new Error("MemStorage does not support holidays - use DatabaseStorage");
  }
  async getHospitalEmergencyStatuses(referenceId: string): Promise<any[]> {
    throw new Error("MemStorage does not support hospital emergency statuses - use DatabaseStorage");
  }
  async updateHospitalEmergencyStatus(data: any): Promise<any> {
    throw new Error("MemStorage does not support hospital emergency statuses - use DatabaseStorage");
  }
  async createEmergencySubscription(data: any): Promise<any> {
    throw new Error("MemStorage does not support emergency subscriptions - use DatabaseStorage");
  }
  async getHolidaysByYear(year: number): Promise<any[]> {
    throw new Error("MemStorage does not support holidays - use DatabaseStorage");
  }
  async createTyphoonAlert(data: any): Promise<any> {
    throw new Error("MemStorage does not support typhoon alerts - use DatabaseStorage");
  }
  async liftTyphoonAlert(alertId: string): Promise<any> {
    throw new Error("MemStorage does not support typhoon alerts - use DatabaseStorage");
  }
  async getPendingTyphoonNotifications(): Promise<TyphoonNotificationQueue[]> {
    throw new Error("MemStorage does not support typhoon notifications - use DatabaseStorage");
  }
  async createTyphoonNotification(data: InsertTyphoonNotificationQueue): Promise<TyphoonNotificationQueue> {
    throw new Error("MemStorage does not support typhoon notifications - use DatabaseStorage");
  }
  async updateTyphoonNotification(id: string, data: Partial<TyphoonNotificationQueue>): Promise<TyphoonNotificationQueue | undefined> {
    throw new Error("MemStorage does not support typhoon notifications - use DatabaseStorage");
  }
  async getActiveEmergencySubscriptions(subscriptionType?: string): Promise<UserEmergencySubscription[]> {
    throw new Error("MemStorage does not support emergency subscriptions - use DatabaseStorage");
  }

  // Analytics Methods - stub implementations for MemStorage
  async getAnalyticsOverview(): Promise<{
    totalUsers: number;
    newUsers24h: number;
    newUsers7d: number;
    newUsers30d: number;
    totalPets: number;
    totalEmergencyRequests: number;
    emergencyByStatus: { status: string; count: number }[];
    totalClinics: number;
    activeClinics: number;
    totalHospitals: number;
  }> {
    const now = new Date();
    const h24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const d7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const d30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const allUsers = Array.from(this.users.values());
    const allPets = Array.from(this.pets.values());
    const allRequests = Array.from(this.emergencyRequests.values());
    const allClinics = Array.from(this.clinics.values());
    const allHospitals = Array.from(this.hospitals.values());

    const statusCounts = allRequests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers: allUsers.length,
      newUsers24h: allUsers.filter(u => u.createdAt >= h24Ago).length,
      newUsers7d: allUsers.filter(u => u.createdAt >= d7Ago).length,
      newUsers30d: allUsers.filter(u => u.createdAt >= d30Ago).length,
      totalPets: allPets.length,
      totalEmergencyRequests: allRequests.length,
      emergencyByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      totalClinics: allClinics.length,
      activeClinics: allClinics.filter(c => c.isAvailable).length,
      totalHospitals: allHospitals.length,
    };
  }

  async getEmergencyTrends(days: number): Promise<{
    dailyTrends: { date: string; count: number }[];
    byRegion: { regionId: string; regionName: string; count: number }[];
    byStatus: { status: string; count: number }[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const allRequests = Array.from(this.emergencyRequests.values()).filter(r => r.createdAt >= startDate);

    const dailyCounts = allRequests.reduce((acc, req) => {
      const dateStr = req.createdAt.toISOString().split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const regionCounts = allRequests.reduce((acc, req) => {
      const regionId = req.regionId || 'unknown';
      acc[regionId] = (acc[regionId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusCounts = allRequests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      dailyTrends: Object.entries(dailyCounts).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
      byRegion: Object.entries(regionCounts).map(([regionId, count]) => ({ regionId, regionName: 'Unknown Region', count })),
      byStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    };
  }

  async getUserActivityTrends(days: number): Promise<{
    registrationTrends: { date: string; count: number }[];
    totalActiveUsers: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const allUsers = Array.from(this.users.values()).filter(u => u.createdAt >= startDate);
    const allRequests = Array.from(this.emergencyRequests.values()).filter(r => r.createdAt >= startDate);

    const registrationCounts = allUsers.reduce((acc, user) => {
      const dateStr = user.createdAt.toISOString().split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeUserIds = new Set(allRequests.filter(r => r.userId).map(r => r.userId));

    return {
      registrationTrends: Object.entries(registrationCounts).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
      totalActiveUsers: activeUserIds.size,
    };
  }

  // Vet Consultants & Content Verification - stub implementations
  async getVetConsultants(): Promise<VetConsultant[]> {
    return [];
  }

  async getVetConsultantById(id: string): Promise<VetConsultant | undefined> {
    return undefined;
  }

  async getVetConsultantWithContent(id: string): Promise<VetConsultantWithContent | undefined> {
    return undefined;
  }

  async getContentVerification(contentSlug: string): Promise<ContentWithVerifier | undefined> {
    return undefined;
  }

  // Vet Applications - stub implementations
  async getVetApplications(status?: string): Promise<VetApplication[]> {
    throw new Error("MemStorage does not support vet applications - use DatabaseStorage");
  }

  async getVetApplicationById(id: string): Promise<VetApplication | undefined> {
    throw new Error("MemStorage does not support vet applications - use DatabaseStorage");
  }

  async createVetApplication(data: InsertVetApplication): Promise<VetApplication> {
    throw new Error("MemStorage does not support vet applications - use DatabaseStorage");
  }

  async updateVetApplicationStatus(id: string, status: string, reviewedBy: string, reviewNotes?: string): Promise<VetApplication | undefined> {
    throw new Error("MemStorage does not support vet applications - use DatabaseStorage");
  }

  async approveVetApplication(id: string, reviewedBy: string, reviewNotes?: string): Promise<{application: VetApplication, consultant: VetConsultant}> {
    throw new Error("MemStorage does not support vet applications - use DatabaseStorage");
  }

  // Admin Vet Consultant Management - stub implementations
  async createVetConsultant(data: InsertVetConsultant): Promise<VetConsultant> {
    throw new Error("MemStorage does not support vet consultants - use DatabaseStorage");
  }

  async updateVetConsultant(id: string, data: Partial<InsertVetConsultant>): Promise<VetConsultant | undefined> {
    throw new Error("MemStorage does not support vet consultants - use DatabaseStorage");
  }

  async deleteVetConsultant(id: string): Promise<boolean> {
    throw new Error("MemStorage does not support vet consultants - use DatabaseStorage");
  }

  // Content Verification Management - stub implementations
  async createContentVerification(data: InsertContentVerification): Promise<ContentVerification> {
    throw new Error("MemStorage does not support content verifications - use DatabaseStorage");
  }

  async deleteContentVerification(consultantId: string, contentId: string): Promise<boolean> {
    throw new Error("MemStorage does not support content verifications - use DatabaseStorage");
  }

  async getVerifiedContentItems(): Promise<VerifiedContentItem[]> {
    throw new Error("MemStorage does not support verified content items - use DatabaseStorage");
  }

  // Hospital Ping State - stub implementations
  async getHospitalPingState(hospitalId: string): Promise<HospitalPingState | undefined> {
    throw new Error("MemStorage does not support hospital ping state - use DatabaseStorage");
  }

  async getAllHospitalPingStates(): Promise<HospitalPingState[]> {
    throw new Error("MemStorage does not support hospital ping state - use DatabaseStorage");
  }

  async getActiveHospitalPingStates(): Promise<HospitalPingState[]> {
    throw new Error("MemStorage does not support hospital ping state - use DatabaseStorage");
  }

  async upsertHospitalPingState(data: InsertHospitalPingState): Promise<HospitalPingState> {
    throw new Error("MemStorage does not support hospital ping state - use DatabaseStorage");
  }

  async updateHospitalPingState(hospitalId: string, data: Partial<InsertHospitalPingState>): Promise<HospitalPingState | undefined> {
    throw new Error("MemStorage does not support hospital ping state - use DatabaseStorage");
  }

  async getHospitalsNeedingNoReplyMarking(): Promise<HospitalPingState[]> {
    throw new Error("MemStorage does not support hospital ping state - use DatabaseStorage");
  }

  // Hospital Ping Logs - stub implementations
  async createHospitalPingLog(data: InsertHospitalPingLog): Promise<HospitalPingLog> {
    throw new Error("MemStorage does not support hospital ping logs - use DatabaseStorage");
  }

  async getHospitalPingLogs(hospitalId: string, limit?: number): Promise<HospitalPingLog[]> {
    throw new Error("MemStorage does not support hospital ping logs - use DatabaseStorage");
  }

  // Hospital Change Logs - stub implementations
  async createHospitalChangeLog(data: InsertHospitalChangeLog): Promise<HospitalChangeLog> {
    throw new Error("MemStorage does not support hospital change logs - use DatabaseStorage");
  }

  async createHospitalChangeLogs(data: InsertHospitalChangeLog[]): Promise<HospitalChangeLog[]> {
    throw new Error("MemStorage does not support hospital change logs - use DatabaseStorage");
  }

  async getHospitalChangeLogs(hospitalId: string, limit?: number): Promise<HospitalChangeLog[]> {
    throw new Error("MemStorage does not support hospital change logs - use DatabaseStorage");
  }

  async getRecentHospitalChangeLogs(limit?: number): Promise<(HospitalChangeLog & { hospitalName?: string })[]> {
    throw new Error("MemStorage does not support hospital change logs - use DatabaseStorage");
  }

  // Hospital Emergency Responses - stub implementations
  async createHospitalEmergencyResponse(data: InsertHospitalEmergencyResponse): Promise<HospitalEmergencyResponse> {
    throw new Error("MemStorage does not support hospital emergency responses - use DatabaseStorage");
  }

  async getHospitalEmergencyResponsesByEmergencyId(emergencyRequestId: string): Promise<HospitalEmergencyResponse[]> {
    throw new Error("MemStorage does not support hospital emergency responses - use DatabaseStorage");
  }

  async getActiveEmergencyForHospital(hospitalId: string, withinHours: number = 24): Promise<EmergencyRequest | undefined> {
    throw new Error("MemStorage does not support getActiveEmergencyForHospital - use DatabaseStorage");
  }
}

// Database storage implementation using PostgreSQL
class DatabaseStorage implements IStorage {
  async getAllClinics(): Promise<Clinic[]> {
    return await db.select().from(clinics).where(eq(clinics.status, 'active'));
  }

  async getClinic(id: string): Promise<Clinic | undefined> {
    const result = await db.select().from(clinics).where(eq(clinics.id, id));
    return result[0];
  }

  async getClinicsByRegion(regionId: string): Promise<Clinic[]> {
    return await db.select().from(clinics).where(
      and(eq(clinics.regionId, regionId), eq(clinics.status, 'active'))
    );
  }

  async get24HourClinicsByRegion(regionId: string): Promise<Clinic[]> {
    return await db.select().from(clinics).where(
      and(
        eq(clinics.regionId, regionId),
        eq(clinics.is24Hour, true),
        eq(clinics.status, 'active')
      )
    );
  }

  async getNearbyClinics(latitude: number, longitude: number, radiusMeters: number): Promise<(Clinic & { distance: number })[]> {
    // Use PostGIS ST_DWithin for efficient spatial query with index
    const result = await db.execute<Clinic & { distance: number }>(
      sql`
        SELECT *, 
               ST_Distance(location, ST_MakePoint(${longitude}, ${latitude})::geography) as distance
        FROM clinics
        WHERE status = 'active'
          AND location IS NOT NULL
          AND ST_DWithin(
            location,
            ST_MakePoint(${longitude}, ${latitude})::geography,
            ${radiusMeters}
          )
        ORDER BY distance ASC
      `
    );
    return result.rows;
  }

  async createClinic(insertClinic: InsertClinic): Promise<Clinic> {
    const result = await db.insert(clinics).values(insertClinic).returning();
    return result[0];
  }

  async updateClinic(id: string, updateData: Partial<InsertClinic>): Promise<Clinic | undefined> {
    const result = await db.update(clinics)
      .set({ ...updateData })
      .where(eq(clinics.id, id))
      .returning();
    return result[0];
  }

  async deleteClinic(id: string): Promise<boolean> {
    const result = await db.update(clinics)
      .set({ status: 'inactive' })
      .where(eq(clinics.id, id))
      .returning();
    return result.length > 0;
  }

  async getAllRegions(): Promise<Region[]> {
    try {
      return await db.select().from(regions);
    } catch (error) {
      console.warn('getAllRegions query failed:', error instanceof Error ? error.message : error);
      return [];
    }
  }

  async getRegion(id: string): Promise<Region | undefined> {
    const result = await db.select().from(regions).where(eq(regions.id, id));
    return result[0];
  }

  async getRegionByCode(code: string): Promise<Region | undefined> {
    const result = await db.select().from(regions).where(eq(regions.code, code));
    return result[0];
  }

  async createRegion(insertRegion: InsertRegion): Promise<Region> {
    const result = await db.insert(regions).values(insertRegion).returning();
    return result[0];
  }

  async updateRegion(id: string, updateData: Partial<InsertRegion>): Promise<Region | undefined> {
    const result = await db.update(regions)
      .set(updateData)
      .where(eq(regions.id, id))
      .returning();
    return result[0];
  }

  async getRegionsByCountry(countryCode: string): Promise<Region[]> {
    try {
      // Try to filter by countryCode first, fallback if column doesn't exist
      return await db.select().from(regions).where(eq(regions.countryCode, countryCode));
    } catch (error) {
      console.warn('getRegionsByCountry query failed (countryCode column may not exist):', error instanceof Error ? error.message : error);
      return [];
    }
  }

  async getCountry(id: string): Promise<Country | undefined> {
    try {
      const result = await db.select().from(countries).where(eq(countries.id, id));
      return result[0];
    } catch (error) {
      console.warn('getCountry query failed:', error instanceof Error ? error.message : error);
      return undefined;
    }
  }

  async getCountryByCode(code: string): Promise<Country | undefined> {
    try {
      const result = await db.select().from(countries).where(eq(countries.code, code));
      return result[0];
    } catch (error) {
      console.warn('getCountryByCode query failed:', error instanceof Error ? error.message : error);
      return undefined;
    }
  }

  async getAllCountries(): Promise<Country[]> {
    try {
      return await db.select().from(countries);
    } catch (error) {
      console.warn('getAllCountries query failed:', error instanceof Error ? error.message : error);
      return [];
    }
  }

  async getActiveCountries(): Promise<Country[]> {
    try {
      return await db.select().from(countries).where(eq(countries.active, true));
    } catch (error) {
      console.warn('getActiveCountries query failed:', error instanceof Error ? error.message : error);
      return [];
    }
  }

  async createCountry(insertCountry: InsertCountry): Promise<Country> {
    const result = await db.insert(countries).values(insertCountry).returning();
    return result[0];
  }

  async updateCountry(id: string, updateData: Partial<InsertCountry>): Promise<Country | undefined> {
    const result = await db.update(countries)
      .set(updateData)
      .where(eq(countries.id, id))
      .returning();
    return result[0];
  }

  async deleteCountry(id: string): Promise<boolean> {
    const result = await db.update(countries)
      .set({ active: false })
      .where(eq(countries.id, id))
      .returning();
    return result.length > 0;
  }

  async getPetBreed(id: string): Promise<PetBreed | undefined> {
    const result = await db.select().from(petBreeds).where(eq(petBreeds.id, id));
    return result[0];
  }

  async getPetBreedsBySpecies(species: string): Promise<PetBreed[]> {
    try {
      return await db.select().from(petBreeds).where(
        and(eq(petBreeds.species, species), eq(petBreeds.active, true))
      );
    } catch (error) {
      console.warn('getPetBreedsBySpecies query failed:', error instanceof Error ? error.message : error);
      return [];
    }
  }

  async getPetBreedsByCountry(countryCode: string): Promise<PetBreed[]> {
    try {
      // Try to filter by countryCode, fallback if column doesn't exist
      return await db.select().from(petBreeds).where(
        and(eq(petBreeds.countryCode, countryCode), eq(petBreeds.active, true))
      );
    } catch (error) {
      console.warn('getPetBreedsByCountry query failed (countryCode column may not exist):', error instanceof Error ? error.message : error);
      // Return all active breeds as fallback
      try {
        return await db.select().from(petBreeds).where(eq(petBreeds.active, true));
      } catch {
        return [];
      }
    }
  }

  async getCommonPetBreeds(species?: string): Promise<PetBreed[]> {
    try {
      const conditions = [eq(petBreeds.isCommon, true), eq(petBreeds.active, true)];
      if (species) {
        conditions.push(eq(petBreeds.species, species));
      }
      return await db.select().from(petBreeds).where(and(...conditions));
    } catch (error) {
      console.warn('getCommonPetBreeds query failed:', error instanceof Error ? error.message : error);
      return [];
    }
  }

  async getAllPetBreeds(): Promise<PetBreed[]> {
    try {
      return await db.select().from(petBreeds).where(eq(petBreeds.active, true));
    } catch (error) {
      console.warn('getAllPetBreeds query failed:', error instanceof Error ? error.message : error);
      return [];
    }
  }

  async createPetBreed(insertBreed: InsertPetBreed): Promise<PetBreed> {
    const result = await db.insert(petBreeds).values(insertBreed).returning();
    return result[0];
  }

  async updatePetBreed(id: string, updateData: Partial<InsertPetBreed>): Promise<PetBreed | undefined> {
    const result = await db.update(petBreeds)
      .set(updateData)
      .where(eq(petBreeds.id, id))
      .returning();
    return result[0];
  }

  async deletePetBreed(id: string): Promise<boolean> {
    const result = await db.update(petBreeds)
      .set({ active: false })
      .where(eq(petBreeds.id, id))
      .returning();
    return result.length > 0;
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.phone, phone));
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users);
    return result;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    // Handle upsert based on openidSub (for OIDC users) or email
    if (userData.openidSub) {
      // Try to find existing user by openidSub
      const existing = await db.select().from(users).where(eq(users.openidSub, userData.openidSub));
      if (existing.length > 0) {
        // Update existing user
        const [user] = await db
          .update(users)
          .set({
            ...userData,
            updatedAt: new Date(),
          })
          .where(eq(users.openidSub, userData.openidSub))
          .returning();
        return user;
      }
    } else if (userData.email) {
      // Try to find existing user by email
      const existing = await db.select().from(users).where(eq(users.email, userData.email));
      if (existing.length > 0) {
        // Update existing user
        const [user] = await db
          .update(users)
          .set({
            ...userData,
            updatedAt: new Date(),
          })
          .where(eq(users.email, userData.email))
          .returning();
        return user;
      }
    }
    
    // Create new user
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUserTwoFactor(userId: string, secret: string | null, backupCodes: string[] | null, enabled: boolean): Promise<User | undefined> {
    const result = await db.update(users)
      .set({
        twoFactorSecret: secret,
        twoFactorBackupCodes: backupCodes,
        twoFactorEnabled: enabled,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async validateBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.twoFactorBackupCodes) {
      return false;
    }
    
    const bcrypt = await import('bcrypt');
    const backupCodes = user.twoFactorBackupCodes;
    
    for (let i = 0; i < backupCodes.length; i++) {
      const isMatch = await bcrypt.compare(code, backupCodes[i]);
      if (isMatch) {
        const newBackupCodes = [...backupCodes];
        newBackupCodes.splice(i, 1);
        await this.updateUserTwoFactor(userId, user.twoFactorSecret, newBackupCodes, user.twoFactorEnabled);
        return true;
      }
    }
    
    return false;
  }

  async getPet(id: string): Promise<Pet | undefined> {
    const result = await db.select().from(pets).where(eq(pets.id, id));
    return result[0];
  }

  async getPetsByUserId(userId: string): Promise<Pet[]> {
    return await db.select().from(pets).where(eq(pets.userId, userId));
  }

  async getAllPets(): Promise<Pet[]> {
    return await db.select().from(pets);
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const result = await db.insert(pets).values(insertPet).returning();
    return result[0];
  }

  async updatePet(id: string, updateData: Partial<InsertPet>): Promise<Pet | undefined> {
    const result = await db.update(pets)
      .set(updateData)
      .where(eq(pets.id, id))
      .returning();
    return result[0];
  }

  async deletePet(id: string): Promise<boolean> {
    const result = await db.delete(pets).where(eq(pets.id, id)).returning();
    return result.length > 0;
  }

  async getEmergencyRequest(id: string): Promise<any> {
    const results = await db
      .select({
        request: emergencyRequests,
        pet: pets,
      })
      .from(emergencyRequests)
      .leftJoin(pets, eq(pets.id, emergencyRequests.petId))
      .where(eq(emergencyRequests.id, id));
    
    if (results.length === 0) return undefined;
    
    const { request, pet } = results[0];
    return {
      ...request,
      pet
    };
  }

  async getEmergencyRequestsByUserId(userId: string): Promise<EmergencyRequest[]> {
    return await db.select().from(emergencyRequests).where(eq(emergencyRequests.userId, userId));
  }

  async getEmergencyRequestsByClinicId(clinicId: string): Promise<any[]> {
    const results = await db
      .selectDistinct({
        request: emergencyRequests,
        pet: pets,
        user: users,
      })
      .from(emergencyRequests)
      .innerJoin(messages, eq(messages.emergencyRequestId, emergencyRequests.id))
      .leftJoin(pets, eq(pets.id, emergencyRequests.petId))
      .leftJoin(users, eq(users.id, emergencyRequests.userId))
      .where(eq(messages.hospitalId, clinicId))
      .orderBy(emergencyRequests.createdAt);

    return results.map(({ request, pet, user }) => ({
      ...request,
      pet,
      user
    }));
  }

  async getAllEmergencyRequests(): Promise<EmergencyRequest[]> {
    return await db.select().from(emergencyRequests);
  }

  async createEmergencyRequest(insertRequest: InsertEmergencyRequest): Promise<EmergencyRequest> {
    const result = await db.insert(emergencyRequests).values(insertRequest).returning();
    return result[0];
  }

  async updateEmergencyRequest(id: string, updateData: Partial<InsertEmergencyRequest>): Promise<EmergencyRequest | undefined> {
    const result = await db.update(emergencyRequests)
      .set(updateData)
      .where(eq(emergencyRequests.id, id))
      .returning();
    return result[0];
  }

  async getMessage(id: string): Promise<Message | undefined> {
    const result = await db.select().from(messages).where(eq(messages.id, id));
    return result[0];
  }

  async getMessageByWhatsAppId(whatsappMessageId: string): Promise<Message | undefined> {
    const result = await db.select().from(messages).where(eq(messages.whatsappMessageId, whatsappMessageId));
    return result[0];
  }

  async getMessagesByEmergencyRequest(emergencyRequestId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.emergencyRequestId, emergencyRequestId));
  }

  async getAllMessages(limit: number = 100): Promise<Message[]> {
    return await db.select().from(messages)
      .orderBy(sql`${messages.createdAt} DESC`)
      .limit(limit);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(insertMessage).returning();
    return result[0];
  }

  async updateMessage(id: string, updateData: Partial<InsertMessage>): Promise<Message | undefined> {
    const result = await db.update(messages)
      .set(updateData)
      .where(eq(messages.id, id))
      .returning();
    return result[0];
  }

  async updateMessageByWhatsAppId(whatsappMessageId: string, updateData: Partial<InsertMessage>): Promise<Message | undefined> {
    const result = await db.update(messages)
      .set(updateData)
      .where(eq(messages.whatsappMessageId, whatsappMessageId))
      .returning();
    return result[0];
  }

  async getQueuedMessages(): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.status, 'pending'));
  }

  async getFeatureFlag(key: string): Promise<FeatureFlag | undefined> {
    const result = await db.select().from(featureFlags).where(eq(featureFlags.key, key));
    return result[0];
  }

  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    return await db.select().from(featureFlags);
  }

  async createFeatureFlag(insertFlag: InsertFeatureFlag): Promise<FeatureFlag> {
    const result = await db.insert(featureFlags).values(insertFlag).returning();
    return result[0];
  }

  async updateFeatureFlag(id: string, updateData: Partial<InsertFeatureFlag>): Promise<FeatureFlag | undefined> {
    const result = await db.update(featureFlags)
      .set(updateData)
      .where(eq(featureFlags.id, id))
      .returning();
    return result[0];
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const result = await db.insert(auditLogs).values(insertLog).returning();
    return result[0];
  }

  async getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).where(
      and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId))
    );
  }

  async getPrivacyConsents(userId: string): Promise<PrivacyConsent[]> {
    return await db.select().from(privacyConsents).where(eq(privacyConsents.userId, userId));
  }

  async createPrivacyConsent(insertConsent: InsertPrivacyConsent): Promise<PrivacyConsent> {
    const result = await db.insert(privacyConsents).values(insertConsent).returning();
    return result[0];
  }

  async getTranslationsByLanguage(language: string): Promise<Translation[]> {
    try {
      // Use raw SQL to ensure correct column mapping
      const result = await db.execute(
        sql`SELECT id, key, language, value, namespace, updated_at as "updatedAt" FROM translations WHERE language = ${language}`
      );
      return result.rows as Translation[];
    } catch (error) {
      console.error('Translation table error:', error instanceof Error ? error.stack : error);
      return [];
    }
  }

  async getTranslation(key: string, language: string): Promise<Translation | undefined> {
    try {
      const result = await db.select().from(translations).where(
        and(eq(translations.key, key), eq(translations.language, language))
      );
      return result[0];
    } catch (error) {
      console.warn('Translation query failed:', error instanceof Error ? error.message : error);
      return undefined;
    }
  }

  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const result = await db.insert(translations).values(insertTranslation).returning();
    return result[0];
  }

  async updateTranslation(id: string, updateData: Partial<InsertTranslation>): Promise<Translation | undefined> {
    const result = await db.update(translations)
      .set(updateData)
      .where(eq(translations.id, id))
      .returning();
    return result[0];
  }

  // Hospitals
  async getHospital(id: string): Promise<Hospital | undefined> {
    try {
      const result = await db.select().from(hospitals).where(eq(hospitals.id, id));
      return result[0];
    } catch (error) {
      console.warn('getHospital query failed:', error instanceof Error ? error.message : error);
      return undefined;
    }
  }

  async getHospitalBySlug(slug: string): Promise<Hospital | undefined> {
    try {
      const result = await db.select().from(hospitals).where(eq(hospitals.slug, slug));
      return result[0];
    } catch (error) {
      console.warn('getHospitalBySlug query failed:', error instanceof Error ? error.message : error);
      return undefined;
    }
  }

  async getHospitalByAccessCode(accessCode: string): Promise<Hospital | undefined> {
    try {
      const result = await db.select().from(hospitals).where(eq(hospitals.accessCode, accessCode));
      return result[0];
    } catch (error) {
      console.warn('getHospitalByAccessCode query failed:', error instanceof Error ? error.message : error);
      return undefined;
    }
  }

  async generateAccessCodesForAllHospitals(): Promise<{ updated: number; errors: string[] }> {
    const allHospitals = await this.getAllHospitals();
    let updated = 0;
    const errors: string[] = [];
    
    for (const hospital of allHospitals) {
      if (!hospital.accessCode) {
        try {
          const code = this.generateUniqueAccessCode();
          await this.updateHospital(hospital.id, { accessCode: code } as any);
          updated++;
        } catch (err) {
          errors.push(`Failed to update ${hospital.nameEn}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    }
    
    return { updated, errors };
  }

  private generateUniqueAccessCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async getHospitalsByRegion(regionId: string): Promise<Hospital[]> {
    try {
      return await db.select().from(hospitals).where(eq(hospitals.regionId, regionId));
    } catch (error) {
      console.warn('getHospitalsByRegion query failed:', error instanceof Error ? error.message : error);
      return [];
    }
  }

  async getAllHospitals(): Promise<Hospital[]> {
    try {
      return await db.select().from(hospitals);
    } catch (error) {
      console.warn('getAllHospitals query failed:', error instanceof Error ? error.message : error);
      return [];
    }
  }

  async getNearbyHospitals(latitude: number, longitude: number, radiusMeters: number): Promise<(Hospital & { distance: number })[]> {
    try {
      // Use PostGIS ST_DWithin for efficient spatial query
      const results = await db
        .select({
          hospital: hospitals,
          distance: sql<number>`ST_Distance(
            ${hospitals.location}::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
          )`.as('distance')
        })
        .from(hospitals)
        .where(
          and(
            eq(hospitals.isAvailable, true),
            sql`${hospitals.location} IS NOT NULL`,
            sql`ST_DWithin(
              ${hospitals.location}::geography,
              ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
              ${radiusMeters}
            )`
          )
        )
        .orderBy(sql`distance`);

      return results.map(r => ({
        ...r.hospital,
        distance: r.distance
      }));
    } catch (error) {
      console.warn('getNearbyHospitals query failed:', error instanceof Error ? error.message : error);
      return [];
    }
  }

  async createHospital(insertHospital: InsertHospital): Promise<Hospital> {
    const result = await db.insert(hospitals).values({
      ...insertHospital,
      ownerVerificationCode: insertHospital.ownerVerificationCode ?? null,
      ownerVerificationCodeExpiresAt: insertHospital.ownerVerificationCodeExpiresAt ?? null
    }).returning();
    return result[0];
  }

  async updateHospital(id: string, updateData: Partial<InsertHospital>): Promise<Hospital | undefined> {
    const result = await db.update(hospitals)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(hospitals.id, id))
      .returning();
    return result[0];
  }

  async deleteHospital(id: string): Promise<boolean> {
    const result = await db.delete(hospitals)
      .where(eq(hospitals.id, id))
      .returning();
    return result.length > 0;
  }

  // Hospital Consult Fees
  async getConsultFeesByHospitalId(hospitalId: string): Promise<HospitalConsultFee[]> {
    return await db.select().from(hospitalConsultFees).where(eq(hospitalConsultFees.hospitalId, hospitalId));
  }

  async createConsultFee(insertFee: InsertHospitalConsultFee): Promise<HospitalConsultFee> {
    const result = await db.insert(hospitalConsultFees).values(insertFee).returning();
    return result[0];
  }

  async updateConsultFee(id: string, updateData: Partial<InsertHospitalConsultFee>): Promise<HospitalConsultFee | undefined> {
    const result = await db.update(hospitalConsultFees)
      .set({ ...updateData, lastUpdated: new Date() })
      .where(eq(hospitalConsultFees.id, id))
      .returning();
    return result[0];
  }

  async deleteConsultFee(id: string): Promise<boolean> {
    const result = await db.delete(hospitalConsultFees)
      .where(eq(hospitalConsultFees.id, id))
      .returning();
    return result.length > 0;
  }

  // Hospital Updates
  async getHospitalUpdatesByHospitalId(hospitalId: string): Promise<HospitalUpdate[]> {
    return await db.select().from(hospitalUpdates).where(eq(hospitalUpdates.hospitalId, hospitalId));
  }

  async createHospitalUpdate(insertUpdate: InsertHospitalUpdate): Promise<HospitalUpdate> {
    const result = await db.insert(hospitalUpdates).values(insertUpdate).returning();
    return result[0];
  }

  async updateHospitalUpdate(id: string, updateData: Partial<InsertHospitalUpdate>): Promise<HospitalUpdate | undefined> {
    const result = await db.update(hospitalUpdates)
      .set(updateData)
      .where(eq(hospitalUpdates.id, id))
      .returning();
    return result[0];
  }

  async exportUserData(userId: string): Promise<{
    user: User | undefined;
    pets: Pet[];
    emergencyRequests: EmergencyRequest[];
    privacyConsents: PrivacyConsent[];
    auditLogs: AuditLog[];
  }> {
    const user = await this.getUser(userId);
    const userPets = await db.select().from(pets).where(eq(pets.userId, userId));
    const requests = await db.select().from(emergencyRequests).where(eq(emergencyRequests.userId, userId));
    const consents = await db.select().from(privacyConsents).where(eq(privacyConsents.userId, userId));
    const logs = await db.select().from(auditLogs).where(
      and(
        eq(auditLogs.entityType, 'user'),
        eq(auditLogs.entityId, userId)
      )
    );

    return {
      user,
      pets: userPets,
      emergencyRequests: requests,
      privacyConsents: consents,
      auditLogs: logs
    };
  }

  async deleteUserDataGDPR(userId: string): Promise<{
    success: boolean;
    deletedRecords: {
      pets: number;
      emergencyRequests: number;
      privacyConsents: number;
      messages: number;
      user: boolean;
    };
  }> {
    // Get emergency request IDs for this user
    const userRequests = await db.select().from(emergencyRequests).where(eq(emergencyRequests.userId, userId));
    const requestIds = userRequests.map(r => r.id);

    // Delete messages associated with user's emergency requests
    let deletedMessages = 0;
    if (requestIds.length > 0) {
      const msgResults = await db.delete(messages).where(
        inArray(messages.emergencyRequestId, requestIds)
      ).returning();
      deletedMessages = msgResults.length;
    }

    // Delete all user's pets
    const deletedPets = await db.delete(pets).where(eq(pets.userId, userId)).returning();

    // Delete all user's emergency requests
    const deletedRequests = await db.delete(emergencyRequests).where(eq(emergencyRequests.userId, userId)).returning();

    // Delete all user's privacy consents
    const deletedConsents = await db.delete(privacyConsents).where(eq(privacyConsents.userId, userId)).returning();

    // Delete ALL audit logs related to this user
    // This includes:
    // - Logs where user is the entity (entityType='user', entityId=userId)
    // - Logs where user performed actions (userId=userId)
    // This prevents user ID from persisting in changes JSONB or other fields
    // Includes the gdpr_delete_request log we just created
    await db.delete(auditLogs).where(
      eq(auditLogs.userId, userId)
    );

    // Also delete logs where user is the entity
    await db.delete(auditLogs).where(
      and(
        eq(auditLogs.entityType, 'user'),
        eq(auditLogs.entityId, userId)
      )
    );

    // Delete user account
    const deletedUser = await db.delete(users).where(eq(users.id, userId)).returning();

    return {
      success: deletedUser.length > 0,
      deletedRecords: {
        pets: deletedPets.length,
        emergencyRequests: deletedRequests.length,
        privacyConsents: deletedConsents.length,
        messages: deletedMessages,
        user: deletedUser.length > 0
      }
    };
  }

  // Pet Medical Records
  async getMedicalRecordsByPetId(petId: string): Promise<PetMedicalRecord[]> {
    return await db.select().from(petMedicalRecords).where(eq(petMedicalRecords.petId, petId));
  }

  async getMedicalRecord(id: string): Promise<PetMedicalRecord | undefined> {
    const result = await db.select().from(petMedicalRecords).where(eq(petMedicalRecords.id, id));
    return result[0];
  }

  async createMedicalRecord(record: InsertPetMedicalRecord): Promise<PetMedicalRecord> {
    const result = await db.insert(petMedicalRecords).values(record).returning();
    return result[0];
  }

  async updateMedicalRecord(id: string, record: Partial<InsertPetMedicalRecord>): Promise<PetMedicalRecord | undefined> {
    const result = await db.update(petMedicalRecords).set(record).where(eq(petMedicalRecords.id, id)).returning();
    return result[0];
  }

  async deleteMedicalRecord(id: string): Promise<boolean> {
    const result = await db.delete(petMedicalRecords).where(eq(petMedicalRecords.id, id)).returning();
    return result.length > 0;
  }

  async getUserStorageUsage(userId: string): Promise<{ usedBytes: number; recordCount: number }> {
    const result = await db.select({
      usedBytes: sql<number>`COALESCE(SUM(${petMedicalRecords.fileSize}), 0)`,
      recordCount: sql<number>`COUNT(*)`,
    })
    .from(petMedicalRecords)
    .where(eq(petMedicalRecords.userId, userId));
    
    return {
      usedBytes: Number(result[0]?.usedBytes) || 0,
      recordCount: Number(result[0]?.recordCount) || 0,
    };
  }

  // Pet Medical Sharing Consents
  async getMedicalSharingConsent(petId: string, userId: string, consentType: string): Promise<PetMedicalSharingConsent | undefined> {
    const result = await db.select().from(petMedicalSharingConsents)
      .where(and(
        eq(petMedicalSharingConsents.petId, petId),
        eq(petMedicalSharingConsents.userId, userId),
        eq(petMedicalSharingConsents.consentType, consentType)
      ));
    return result[0];
  }

  async getMedicalSharingConsentsByPetId(petId: string): Promise<PetMedicalSharingConsent[]> {
    return await db.select().from(petMedicalSharingConsents).where(eq(petMedicalSharingConsents.petId, petId));
  }

  async getMedicalSharingConsentsByUserId(userId: string): Promise<PetMedicalSharingConsent[]> {
    return await db.select().from(petMedicalSharingConsents).where(eq(petMedicalSharingConsents.userId, userId));
  }

  async upsertMedicalSharingConsent(consent: InsertPetMedicalSharingConsent): Promise<PetMedicalSharingConsent> {
    const existing = await this.getMedicalSharingConsent(consent.petId, consent.userId, consent.consentType);
    if (existing) {
      const result = await db.update(petMedicalSharingConsents)
        .set({ enabled: consent.enabled, updatedAt: new Date() })
        .where(eq(petMedicalSharingConsents.id, existing.id))
        .returning();
      return result[0];
    }
    const result = await db.insert(petMedicalSharingConsents).values(consent).returning();
    return result[0];
  }

  // Push Subscriptions
  async createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription> {
    const existing = await this.getPushSubscriptionByToken(subscription.token);
    if (existing) {
      const result = await db.update(pushSubscriptions)
        .set({ 
          ...subscription, 
          isActive: true,
          lastActiveAt: new Date() 
        })
        .where(eq(pushSubscriptions.id, existing.id))
        .returning();
      return result[0];
    }
    const result = await db.insert(pushSubscriptions).values(subscription).returning();
    return result[0];
  }

  async getPushSubscriptionByToken(token: string): Promise<PushSubscription | undefined> {
    const result = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.token, token));
    return result[0];
  }

  async updatePushSubscription(id: string, data: Partial<InsertPushSubscription>): Promise<PushSubscription | undefined> {
    const result = await db.update(pushSubscriptions)
      .set({ ...data, lastActiveAt: new Date() })
      .where(eq(pushSubscriptions.id, id))
      .returning();
    return result[0];
  }

  async deactivatePushSubscription(token: string): Promise<boolean> {
    const result = await db.update(pushSubscriptions)
      .set({ isActive: false })
      .where(eq(pushSubscriptions.token, token))
      .returning();
    return result.length > 0;
  }

  async deactivatePushSubscriptions(tokens: string[]): Promise<number> {
    if (tokens.length === 0) return 0;
    const result = await db.update(pushSubscriptions)
      .set({ isActive: false })
      .where(inArray(pushSubscriptions.token, tokens))
      .returning();
    return result.length;
  }

  async getAllActivePushSubscriptions(language?: string, role?: string): Promise<PushSubscription[]> {
    const conditions = [eq(pushSubscriptions.isActive, true)];
    
    if (language) {
      conditions.push(eq(pushSubscriptions.language, language));
    }
    
    // If role filter is specified, we need to join with users table
    if (role) {
      // Map role to user roles
      // pet_owner = 'user' role
      // hospital_clinic = 'hospital_staff' OR 'clinic_staff' roles
      if (role === 'pet_owner') {
        const result = await db.select({ subscription: pushSubscriptions })
          .from(pushSubscriptions)
          .innerJoin(users, eq(pushSubscriptions.userId, users.id))
          .where(and(
            ...conditions,
            eq(users.role, 'user')
          ));
        return result.map(r => r.subscription);
      } else if (role === 'hospital_clinic') {
        const result = await db.select({ subscription: pushSubscriptions })
          .from(pushSubscriptions)
          .innerJoin(users, eq(pushSubscriptions.userId, users.id))
          .where(and(
            ...conditions,
            or(
              eq(users.role, 'hospital_staff'),
              eq(users.role, 'clinic_staff')
            )
          ));
        return result.map(r => r.subscription);
      }
    }
    
    // No role filter - return all active subscriptions
    if (conditions.length === 1) {
      return await db.select().from(pushSubscriptions).where(conditions[0]);
    }
    return await db.select().from(pushSubscriptions).where(and(...conditions));
  }

  async getActiveTokens(language?: string, role?: string): Promise<string[]> {
    const subscriptions = await this.getAllActivePushSubscriptions(language, role);
    return subscriptions.map(s => s.token);
  }

  async getPetOwnerEmails(): Promise<{ id: string; email: string }[]> {
    const result = await db.select({
      id: users.id,
      email: users.email
    })
    .from(users)
    .where(and(
      eq(users.role, 'user'),
      isNotNull(users.email)
    ));
    return result.filter(u => u.email !== null) as { id: string; email: string }[];
  }

  async getPetOwnerPushTokens(): Promise<string[]> {
    const result = await db.select({ token: pushSubscriptions.token })
      .from(pushSubscriptions)
      .innerJoin(users, eq(pushSubscriptions.userId, users.id))
      .where(and(
        eq(pushSubscriptions.isActive, true),
        eq(users.role, 'user')
      ));
    return result.map(r => r.token);
  }

  // Notification Broadcasts
  async createNotificationBroadcast(broadcast: InsertNotificationBroadcast): Promise<NotificationBroadcast> {
    const result = await db.insert(notificationBroadcasts).values(broadcast).returning();
    return result[0];
  }

  async getNotificationBroadcast(id: string): Promise<NotificationBroadcast | undefined> {
    const result = await db.select().from(notificationBroadcasts).where(eq(notificationBroadcasts.id, id));
    return result[0];
  }

  async getRecentNotificationBroadcasts(limit: number = 50): Promise<NotificationBroadcast[]> {
    return await db.select().from(notificationBroadcasts)
      .orderBy(desc(notificationBroadcasts.createdAt))
      .limit(limit);
  }

  async getAllNotificationBroadcasts(limit: number = 50, offset: number = 0): Promise<{ broadcasts: NotificationBroadcast[]; total: number }> {
    const broadcasts = await db.select().from(notificationBroadcasts)
      .orderBy(desc(notificationBroadcasts.createdAt))
      .limit(limit)
      .offset(offset);
    
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(notificationBroadcasts);
    const total = Number(countResult[0]?.count) || 0;
    
    return { broadcasts, total };
  }

  async getScheduledNotifications(): Promise<NotificationBroadcast[]> {
    return await db.select().from(notificationBroadcasts)
      .where(and(
        eq(notificationBroadcasts.status, 'scheduled'),
        lte(notificationBroadcasts.scheduledFor, new Date())
      ))
      .orderBy(notificationBroadcasts.scheduledFor);
  }

  async updateNotificationBroadcast(id: string, data: Partial<NotificationBroadcast>): Promise<NotificationBroadcast | undefined> {
    const result = await db.update(notificationBroadcasts)
      .set(data)
      .where(eq(notificationBroadcasts.id, id))
      .returning();
    return result[0];
  }

  async updateNotificationBroadcastStatus(id: string, status: string): Promise<NotificationBroadcast | undefined> {
    const result = await db.update(notificationBroadcasts)
      .set({ status })
      .where(eq(notificationBroadcasts.id, id))
      .returning();
    return result[0];
  }

  // Clinic Reviews
  async createClinicReview(review: InsertClinicReview): Promise<ClinicReview> {
    const result = await db.insert(clinicReviews).values(review).returning();
    return result[0];
  }

  async getClinicReviews(clinicId: string): Promise<(ClinicReview & { user: { displayName: string | null } })[]> {
    const result = await db.select({
      id: clinicReviews.id,
      clinicId: clinicReviews.clinicId,
      userId: clinicReviews.userId,
      rating: clinicReviews.rating,
      reviewText: clinicReviews.reviewText,
      status: clinicReviews.status,
      createdAt: clinicReviews.createdAt,
      updatedAt: clinicReviews.updatedAt,
      user: {
        displayName: sql<string | null>`COALESCE(${users.name}, ${users.username})`,
      }
    })
    .from(clinicReviews)
    .innerJoin(users, eq(clinicReviews.userId, users.id))
    .where(and(
      eq(clinicReviews.clinicId, clinicId),
      eq(clinicReviews.status, 'approved')
    ))
    .orderBy(desc(clinicReviews.createdAt));
    return result;
  }

  async getClinicReview(id: string): Promise<ClinicReview | undefined> {
    const result = await db.select().from(clinicReviews).where(eq(clinicReviews.id, id));
    return result[0];
  }

  async getUserReviewForClinic(userId: string, clinicId: string): Promise<ClinicReview | undefined> {
    const result = await db.select().from(clinicReviews).where(
      and(eq(clinicReviews.userId, userId), eq(clinicReviews.clinicId, clinicId))
    );
    return result[0];
  }

  async updateClinicReview(id: string, data: Partial<InsertClinicReview>): Promise<ClinicReview | undefined> {
    const result = await db.update(clinicReviews)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clinicReviews.id, id))
      .returning();
    return result[0];
  }

  async deleteClinicReview(id: string): Promise<boolean> {
    const result = await db.delete(clinicReviews).where(eq(clinicReviews.id, id)).returning();
    return result.length > 0;
  }

  async updateClinicRatingStats(clinicId: string): Promise<void> {
    const stats = await db.select({
      avgRating: sql<string>`AVG(${clinicReviews.rating})::decimal(3,2)`,
      count: sql<number>`COUNT(*)::int`
    })
    .from(clinicReviews)
    .where(and(
      eq(clinicReviews.clinicId, clinicId),
      eq(clinicReviews.status, 'approved')
    ));
    
    const avgRating = stats[0]?.avgRating || null;
    const reviewCount = stats[0]?.count || 0;
    
    await db.update(clinics)
      .set({ 
        averageRating: avgRating,
        reviewCount: reviewCount
      })
      .where(eq(clinics.id, clinicId));
  }

  // Analytics Methods
  async getAnalyticsOverview(): Promise<{
    totalUsers: number;
    newUsers24h: number;
    newUsers7d: number;
    newUsers30d: number;
    totalPets: number;
    totalEmergencyRequests: number;
    emergencyByStatus: { status: string; count: number }[];
    totalClinics: number;
    activeClinics: number;
    totalHospitals: number;
  }> {
    const now = new Date();
    const h24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const d7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const d30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsersResult,
      newUsers24hResult,
      newUsers7dResult,
      newUsers30dResult,
      totalPetsResult,
      totalEmergencyResult,
      emergencyByStatusResult,
      totalClinicsResult,
      activeClinicsResult,
      totalHospitalsResult
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(users),
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.createdAt, h24Ago)),
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.createdAt, d7Ago)),
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.createdAt, d30Ago)),
      db.select({ count: sql<number>`count(*)::int` }).from(pets),
      db.select({ count: sql<number>`count(*)::int` }).from(emergencyRequests),
      db.select({ 
        status: emergencyRequests.status, 
        count: sql<number>`count(*)::int` 
      }).from(emergencyRequests).groupBy(emergencyRequests.status),
      db.select({ count: sql<number>`count(*)::int` }).from(clinics),
      db.select({ count: sql<number>`count(*)::int` }).from(clinics).where(eq(clinics.isAvailable, true)),
      db.select({ count: sql<number>`count(*)::int` }).from(hospitals)
    ]);

    return {
      totalUsers: Number(totalUsersResult[0]?.count || 0),
      newUsers24h: Number(newUsers24hResult[0]?.count || 0),
      newUsers7d: Number(newUsers7dResult[0]?.count || 0),
      newUsers30d: Number(newUsers30dResult[0]?.count || 0),
      totalPets: Number(totalPetsResult[0]?.count || 0),
      totalEmergencyRequests: Number(totalEmergencyResult[0]?.count || 0),
      emergencyByStatus: emergencyByStatusResult.map(r => ({ status: r.status, count: Number(r.count || 0) })),
      totalClinics: Number(totalClinicsResult[0]?.count || 0),
      activeClinics: Number(activeClinicsResult[0]?.count || 0),
      totalHospitals: Number(totalHospitalsResult[0]?.count || 0)
    };
  }

  async getEmergencyTrends(days: number): Promise<{
    dailyTrends: { date: string; count: number }[];
    byRegion: { regionId: string; regionName: string; count: number }[];
    byStatus: { status: string; count: number }[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [dailyTrendsResult, byRegionResult, byStatusResult] = await Promise.all([
      db.select({
        date: sql<string>`DATE(${emergencyRequests.createdAt})::text`,
        count: sql<number>`count(*)::int`
      })
      .from(emergencyRequests)
      .where(gte(emergencyRequests.createdAt, startDate))
      .groupBy(sql`DATE(${emergencyRequests.createdAt})`)
      .orderBy(sql`DATE(${emergencyRequests.createdAt})`),
      
      db.select({
        regionId: emergencyRequests.regionId,
        regionName: sql<string>`COALESCE(${regions.nameEn}, 'Unknown Region')`,
        count: sql<number>`count(*)::int`
      })
      .from(emergencyRequests)
      .leftJoin(regions, eq(emergencyRequests.regionId, regions.id))
      .where(gte(emergencyRequests.createdAt, startDate))
      .groupBy(emergencyRequests.regionId, regions.nameEn)
      .orderBy(sql`count(*) DESC`)
      .limit(10),
      
      db.select({
        status: emergencyRequests.status,
        count: sql<number>`count(*)::int`
      })
      .from(emergencyRequests)
      .where(gte(emergencyRequests.createdAt, startDate))
      .groupBy(emergencyRequests.status)
    ]);

    return {
      dailyTrends: dailyTrendsResult.map(r => ({ date: r.date, count: Number(r.count || 0) })),
      byRegion: byRegionResult.map(r => ({ 
        regionId: r.regionId || 'unknown', 
        regionName: r.regionName || 'Unknown Region', 
        count: Number(r.count || 0) 
      })),
      byStatus: byStatusResult.map(r => ({ status: r.status, count: Number(r.count || 0) }))
    };
  }

  async getUserActivityTrends(days: number): Promise<{
    registrationTrends: { date: string; count: number }[];
    totalActiveUsers: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [registrationTrendsResult, activeUsersResult] = await Promise.all([
      db.select({
        date: sql<string>`DATE(${users.createdAt})::text`,
        count: sql<number>`count(*)::int`
      })
      .from(users)
      .where(gte(users.createdAt, startDate))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`),
      
      db.select({ count: sql<number>`count(DISTINCT ${emergencyRequests.userId})::int` })
        .from(emergencyRequests)
        .where(gte(emergencyRequests.createdAt, startDate))
    ]);

    return {
      registrationTrends: registrationTrendsResult.map(r => ({ date: r.date, count: Number(r.count || 0) })),
      totalActiveUsers: Number(activeUsersResult[0]?.count || 0)
    };
  }

  // WhatsApp Conversations
  async getConversation(id: string): Promise<WhatsappConversation | undefined> {
    const result = await db.select().from(whatsappConversations).where(eq(whatsappConversations.id, id));
    return result[0];
  }

  async getConversationByPhone(phoneNumber: string): Promise<WhatsappConversation | undefined> {
    const sanitizedPhone = phoneNumber.replace(/\D/g, '');
    const result = await db.select().from(whatsappConversations).where(eq(whatsappConversations.phoneNumber, sanitizedPhone));
    return result[0];
  }

  async getAllConversations(includeArchived: boolean = false): Promise<WhatsappConversation[]> {
    if (includeArchived) {
      return await db.select().from(whatsappConversations).orderBy(desc(whatsappConversations.lastMessageAt));
    }
    return await db.select().from(whatsappConversations)
      .where(eq(whatsappConversations.isArchived, false))
      .orderBy(desc(whatsappConversations.lastMessageAt));
  }

  async createConversation(data: InsertWhatsappConversation): Promise<WhatsappConversation> {
    const sanitizedData = {
      ...data,
      phoneNumber: data.phoneNumber.replace(/\D/g, '')
    };
    const result = await db.insert(whatsappConversations).values(sanitizedData).returning();
    return result[0];
  }

  async updateConversation(id: string, data: Partial<InsertWhatsappConversation>): Promise<WhatsappConversation | undefined> {
    const updateData = { ...data, updatedAt: new Date() };
    if (data.phoneNumber) {
      updateData.phoneNumber = data.phoneNumber.replace(/\D/g, '');
    }
    const result = await db.update(whatsappConversations)
      .set(updateData)
      .where(eq(whatsappConversations.id, id))
      .returning();
    return result[0];
  }

  async archiveConversation(id: string): Promise<boolean> {
    const result = await db.update(whatsappConversations)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(eq(whatsappConversations.id, id))
      .returning();
    return result.length > 0;
  }

  // WhatsApp Chat Messages
  async getChatMessage(id: string): Promise<WhatsappChatMessage | undefined> {
    const result = await db.select().from(whatsappChatMessages).where(eq(whatsappChatMessages.id, id));
    return result[0];
  }

  async getChatMessageByWhatsAppId(whatsappMessageId: string): Promise<WhatsappChatMessage | undefined> {
    const result = await db.select().from(whatsappChatMessages).where(eq(whatsappChatMessages.whatsappMessageId, whatsappMessageId));
    return result[0];
  }

  async getChatMessagesByConversation(conversationId: string, limit: number = 100, offset: number = 0): Promise<WhatsappChatMessage[]> {
    return await db.select().from(whatsappChatMessages)
      .where(eq(whatsappChatMessages.conversationId, conversationId))
      .orderBy(whatsappChatMessages.createdAt)
      .limit(limit)
      .offset(offset);
  }

  async createChatMessage(data: InsertWhatsappChatMessage): Promise<WhatsappChatMessage> {
    const result = await db.insert(whatsappChatMessages).values(data).returning();
    return result[0];
  }

  async updateChatMessage(id: string, data: Partial<InsertWhatsappChatMessage>): Promise<WhatsappChatMessage | undefined> {
    const result = await db.update(whatsappChatMessages)
      .set(data)
      .where(eq(whatsappChatMessages.id, id))
      .returning();
    return result[0];
  }

  async updateChatMessageByWhatsAppId(whatsappMessageId: string, data: Partial<InsertWhatsappChatMessage>): Promise<WhatsappChatMessage | undefined> {
    const result = await db.update(whatsappChatMessages)
      .set(data)
      .where(eq(whatsappChatMessages.whatsappMessageId, whatsappMessageId))
      .returning();
    return result[0];
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    const now = new Date();
    await Promise.all([
      db.update(whatsappChatMessages)
        .set({ status: 'read', readAt: now })
        .where(
          and(
            eq(whatsappChatMessages.conversationId, conversationId),
            eq(whatsappChatMessages.direction, 'inbound'),
            sql`${whatsappChatMessages.readAt} IS NULL`
          )
        ),
      db.update(whatsappConversations)
        .set({ unreadCount: 0, updatedAt: now })
        .where(eq(whatsappConversations.id, conversationId))
    ]);
  }

  // Helper for WhatsApp
  async findHospitalByPhone(phoneNumber: string): Promise<Hospital | undefined> {
    const sanitizedPhone = phoneNumber.replace(/\D/g, '');
    const result = await db.select().from(hospitals).where(
      or(
        eq(hospitals.phone, sanitizedPhone),
        eq(hospitals.whatsapp, sanitizedPhone)
      )
    );
    return result[0];
  }

  // Typhoon & Holiday Protocol
  async getActiveTyphoonAlert(): Promise<TyphoonAlert | null> {
    const result = await db.select().from(typhoonAlerts)
      .where(eq(typhoonAlerts.isActive, true))
      .orderBy(desc(typhoonAlerts.issuedAt))
      .limit(1);
    return result[0] || null;
  }

  async getUpcomingHoliday(days: number): Promise<HkHoliday | null> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const result = await db.select().from(hkHolidays)
      .where(and(
        gte(hkHolidays.date, now),
        lte(hkHolidays.date, futureDate)
      ))
      .orderBy(hkHolidays.date)
      .limit(1);
    return result[0] || null;
  }

  async getHospitalEmergencyStatuses(referenceId: string): Promise<HospitalEmergencyStatus[]> {
    const now = new Date();
    return await db.select().from(hospitalEmergencyStatus)
      .where(and(
        eq(hospitalEmergencyStatus.referenceId, referenceId),
        or(
          sql`${hospitalEmergencyStatus.expiresAt} IS NULL`,
          gte(hospitalEmergencyStatus.expiresAt, now)
        )
      ));
  }

  async updateHospitalEmergencyStatus(data: InsertHospitalEmergencyStatus): Promise<HospitalEmergencyStatus> {
    const existing = await db.select().from(hospitalEmergencyStatus)
      .where(and(
        eq(hospitalEmergencyStatus.hospitalId, data.hospitalId),
        eq(hospitalEmergencyStatus.referenceId, data.referenceId || '')
      ))
      .limit(1);
    
    if (existing[0]) {
      const result = await db.update(hospitalEmergencyStatus)
        .set({ ...data, confirmedAt: new Date() })
        .where(eq(hospitalEmergencyStatus.id, existing[0].id))
        .returning();
      return result[0];
    }
    
    const result = await db.insert(hospitalEmergencyStatus).values({
      id: randomUUID(),
      ...data,
      confirmedAt: new Date()
    }).returning();
    return result[0];
  }

  async createEmergencySubscription(data: InsertUserEmergencySubscription): Promise<UserEmergencySubscription> {
    const result = await db.insert(userEmergencySubscriptions).values({
      id: randomUUID(),
      ...data
    }).returning();
    return result[0];
  }

  async getHolidaysByYear(year: number): Promise<HkHoliday[]> {
    return await db.select().from(hkHolidays)
      .where(eq(hkHolidays.year, year))
      .orderBy(hkHolidays.date);
  }

  async createTyphoonAlert(data: InsertTyphoonAlert): Promise<TyphoonAlert> {
    const result = await db.insert(typhoonAlerts).values({
      id: randomUUID(),
      ...data
    }).returning();
    return result[0];
  }

  async liftTyphoonAlert(alertId: string): Promise<TyphoonAlert | null> {
    const result = await db.update(typhoonAlerts)
      .set({ isActive: false, liftedAt: new Date() })
      .where(eq(typhoonAlerts.id, alertId))
      .returning();
    return result[0] || null;
  }

  async getPendingTyphoonNotifications(): Promise<TyphoonNotificationQueue[]> {
    const now = new Date();
    return await db.select().from(typhoonNotificationQueue)
      .where(and(
        eq(typhoonNotificationQueue.status, 'pending'),
        or(
          sql`${typhoonNotificationQueue.scheduledFor} IS NULL`,
          lte(typhoonNotificationQueue.scheduledFor, now)
        )
      ))
      .orderBy(typhoonNotificationQueue.createdAt);
  }

  async createTyphoonNotification(data: InsertTyphoonNotificationQueue): Promise<TyphoonNotificationQueue> {
    const result = await db.insert(typhoonNotificationQueue).values({
      id: randomUUID(),
      ...data
    }).returning();
    return result[0];
  }

  async updateTyphoonNotification(id: string, data: Partial<TyphoonNotificationQueue>): Promise<TyphoonNotificationQueue | undefined> {
    const result = await db.update(typhoonNotificationQueue)
      .set(data)
      .where(eq(typhoonNotificationQueue.id, id))
      .returning();
    return result[0];
  }

  async getActiveEmergencySubscriptions(subscriptionType?: string): Promise<UserEmergencySubscription[]> {
    if (subscriptionType) {
      return await db.select().from(userEmergencySubscriptions)
        .where(and(
          eq(userEmergencySubscriptions.isActive, true),
          or(
            eq(userEmergencySubscriptions.subscriptionType, subscriptionType),
            eq(userEmergencySubscriptions.subscriptionType, 'all')
          )
        ));
    }
    return await db.select().from(userEmergencySubscriptions)
      .where(eq(userEmergencySubscriptions.isActive, true));
  }

  // Vet Consultants & Content Verification
  async getVetConsultants(): Promise<VetConsultant[]> {
    return await db.select().from(vetConsultants)
      .where(and(
        eq(vetConsultants.isActive, true),
        eq(vetConsultants.isPublic, true)
      ))
      .orderBy(vetConsultants.nameEn);
  }

  async getVetConsultantById(id: string): Promise<VetConsultant | undefined> {
    const result = await db.select().from(vetConsultants)
      .where(eq(vetConsultants.id, id))
      .limit(1);
    return result[0];
  }

  async getVetConsultantWithContent(id: string): Promise<VetConsultantWithContent | undefined> {
    const consultant = await this.getVetConsultantById(id);
    if (!consultant) return undefined;

    const verifications = await db.select({
      content: verifiedContentItems,
      verifiedAt: contentVerifications.verifiedAt,
    })
      .from(contentVerifications)
      .innerJoin(verifiedContentItems, eq(contentVerifications.contentId, verifiedContentItems.id))
      .where(and(
        eq(contentVerifications.consultantId, id),
        eq(contentVerifications.isVisible, true),
        eq(verifiedContentItems.isPublished, true)
      ))
      .orderBy(desc(contentVerifications.verifiedAt));

    const verifiedContent = verifications.map(v => ({
      ...v.content,
      verifiedAt: v.verifiedAt,
    }));

    return {
      ...consultant,
      verifiedContent,
    };
  }

  async getContentVerification(contentSlug: string): Promise<ContentWithVerifier | undefined> {
    const result = await db.select({
      content: verifiedContentItems,
      verifier: vetConsultants,
      verifiedAt: contentVerifications.verifiedAt,
    })
      .from(verifiedContentItems)
      .leftJoin(contentVerifications, and(
        eq(contentVerifications.contentId, verifiedContentItems.id),
        eq(contentVerifications.isVisible, true)
      ))
      .leftJoin(vetConsultants, and(
        eq(vetConsultants.id, contentVerifications.consultantId),
        eq(vetConsultants.isActive, true),
        eq(vetConsultants.isPublic, true)
      ))
      .where(eq(verifiedContentItems.contentSlug, contentSlug))
      .limit(1);

    if (result.length === 0) return undefined;

    const { content, verifier, verifiedAt } = result[0];
    return {
      ...content,
      verifier: verifier || null,
      verifiedAt: verifiedAt || null,
    };
  }

  // Vet Applications
  async getVetApplications(status?: string): Promise<VetApplication[]> {
    if (status) {
      return await db.select().from(vetApplications)
        .where(eq(vetApplications.status, status))
        .orderBy(desc(vetApplications.createdAt));
    }
    return await db.select().from(vetApplications)
      .orderBy(desc(vetApplications.createdAt));
  }

  async getVetApplicationById(id: string): Promise<VetApplication | undefined> {
    const result = await db.select().from(vetApplications)
      .where(eq(vetApplications.id, id))
      .limit(1);
    return result[0];
  }

  async createVetApplication(data: InsertVetApplication): Promise<VetApplication> {
    const result = await db.insert(vetApplications).values(data).returning();
    return result[0];
  }

  async updateVetApplicationStatus(id: string, status: string, reviewedBy: string, reviewNotes?: string): Promise<VetApplication | undefined> {
    const result = await db.update(vetApplications)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null,
        updatedAt: new Date()
      })
      .where(eq(vetApplications.id, id))
      .returning();
    return result[0];
  }

  async approveVetApplication(id: string, reviewedBy: string, reviewNotes?: string): Promise<{application: VetApplication, consultant: VetConsultant}> {
    return await db.transaction(async (tx) => {
      // Get the application
      const appResult = await tx.select().from(vetApplications)
        .where(eq(vetApplications.id, id))
        .limit(1);
      
      if (!appResult[0]) {
        throw new Error('Vet application not found');
      }
      
      const application = appResult[0];
      
      // Validate required fields for new schema
      if (!application.fullName && !application.nameEn) {
        throw new Error('Full name is required to approve application');
      }
      
      // Create the consultant from application data
      // Note: Phone/Email is intentionally NOT copied to protect applicant privacy
      // The consultant record is public, so we don't expose contact info
      const consultantResult = await tx.insert(vetConsultants).values({
        // New schema fields
        fullName: application.fullName || application.nameEn || 'Unknown',
        role: application.role || 'vet',
        vetType: application.vetType,
        clinicName: application.clinicName || application.hospitalAffiliationEn,
        educationBackground: application.educationBackground,
        // Legacy fields for backward compatibility
        nameEn: application.nameEn || application.fullName,
        nameZh: application.nameZh,
        titleEn: application.titleEn || application.educationBackground || 'Veterinary Professional',
        titleZh: application.titleZh,
        specialtyEn: application.specialtyEn,
        specialtyZh: application.specialtyZh,
        licenseNumber: application.licenseNumber,
        hospitalAffiliationEn: application.hospitalAffiliationEn || application.clinicName,
        hospitalAffiliationZh: application.hospitalAffiliationZh,
        yearsExperience: application.yearsExperience,
        // Privacy & visibility defaults
        visibilityPreference: 'name_role',
        // Phone/Email is private - admin can view in application record if needed
        // Do not expose to public consultant profile
        isActive: true,
        isPublic: true,
        joinedAt: new Date()
      }).returning();
      
      const consultant = consultantResult[0];
      
      // Update the application status
      const updatedAppResult = await tx.update(vetApplications)
        .set({
          status: 'approved',
          reviewedBy,
          reviewedAt: new Date(),
          reviewNotes: reviewNotes || null,
          createdConsultantId: consultant.id,
          updatedAt: new Date()
        })
        .where(eq(vetApplications.id, id))
        .returning();
      
      return {
        application: updatedAppResult[0],
        consultant
      };
    });
  }

  // Admin Vet Consultant Management
  async createVetConsultant(data: InsertVetConsultant): Promise<VetConsultant> {
    const result = await db.insert(vetConsultants).values(data).returning();
    return result[0];
  }

  async updateVetConsultant(id: string, data: Partial<InsertVetConsultant>): Promise<VetConsultant | undefined> {
    const result = await db.update(vetConsultants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(vetConsultants.id, id))
      .returning();
    return result[0];
  }

  async deleteVetConsultant(id: string): Promise<boolean> {
    const result = await db.delete(vetConsultants)
      .where(eq(vetConsultants.id, id))
      .returning();
    return result.length > 0;
  }

  // Content Verification Management
  async createContentVerification(data: InsertContentVerification): Promise<ContentVerification> {
    const result = await db.insert(contentVerifications).values(data).returning();
    return result[0];
  }

  async deleteContentVerification(consultantId: string, contentId: string): Promise<boolean> {
    const result = await db.delete(contentVerifications)
      .where(and(
        eq(contentVerifications.consultantId, consultantId),
        eq(contentVerifications.contentId, contentId)
      ))
      .returning();
    return result.length > 0;
  }

  async getVerifiedContentItems(): Promise<VerifiedContentItem[]> {
    return await db.select().from(verifiedContentItems)
      .orderBy(verifiedContentItems.titleEn);
  }

  // Hospital Ping State
  async getHospitalPingState(hospitalId: string): Promise<HospitalPingState | undefined> {
    const result = await db.select().from(hospitalPingState)
      .where(eq(hospitalPingState.hospitalId, hospitalId));
    return result[0];
  }

  async getAllHospitalPingStates(): Promise<HospitalPingState[]> {
    return await db.select().from(hospitalPingState);
  }

  async getActiveHospitalPingStates(): Promise<HospitalPingState[]> {
    return await db.select().from(hospitalPingState)
      .where(and(
        eq(hospitalPingState.pingEnabled, true),
        eq(hospitalPingState.pingStatus, 'active')
      ));
  }

  async upsertHospitalPingState(data: InsertHospitalPingState): Promise<HospitalPingState> {
    const result = await db.insert(hospitalPingState)
      .values(data)
      .onConflictDoUpdate({
        target: hospitalPingState.hospitalId,
        set: { ...data, updatedAt: new Date() }
      })
      .returning();
    return result[0];
  }

  async updateHospitalPingState(hospitalId: string, data: Partial<InsertHospitalPingState>): Promise<HospitalPingState | undefined> {
    const result = await db.update(hospitalPingState)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(hospitalPingState.hospitalId, hospitalId))
      .returning();
    return result[0];
  }

  async getHospitalsNeedingNoReplyMarking(): Promise<HospitalPingState[]> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return await db.select().from(hospitalPingState)
      .where(and(
        eq(hospitalPingState.pingStatus, 'active'),
        isNotNull(hospitalPingState.lastPingSentAt),
        lte(hospitalPingState.lastPingSentAt, oneDayAgo),
        or(
          sql`${hospitalPingState.lastInboundReplyAt} IS NULL`,
          sql`${hospitalPingState.lastInboundReplyAt} < ${hospitalPingState.lastPingSentAt}`
        )
      ));
  }

  // Hospital Ping Logs
  async createHospitalPingLog(data: InsertHospitalPingLog): Promise<HospitalPingLog> {
    const result = await db.insert(hospitalPingLogs).values(data).returning();
    return result[0];
  }

  async getHospitalPingLogs(hospitalId: string, limit: number = 50): Promise<HospitalPingLog[]> {
    return await db.select().from(hospitalPingLogs)
      .where(eq(hospitalPingLogs.hospitalId, hospitalId))
      .orderBy(desc(hospitalPingLogs.createdAt))
      .limit(limit);
  }

  // Hospital Change Logs (Audit Trail)
  async createHospitalChangeLog(data: InsertHospitalChangeLog): Promise<HospitalChangeLog> {
    const result = await db.insert(hospitalChangeLogs).values(data).returning();
    return result[0];
  }

  async createHospitalChangeLogs(data: InsertHospitalChangeLog[]): Promise<HospitalChangeLog[]> {
    if (data.length === 0) return [];
    const result = await db.insert(hospitalChangeLogs).values(data).returning();
    return result;
  }

  async getHospitalChangeLogs(hospitalId: string, limit: number = 50): Promise<HospitalChangeLog[]> {
    return await db.select().from(hospitalChangeLogs)
      .where(eq(hospitalChangeLogs.hospitalId, hospitalId))
      .orderBy(desc(hospitalChangeLogs.createdAt))
      .limit(limit);
  }

  async getRecentHospitalChangeLogs(limit: number = 100): Promise<(HospitalChangeLog & { hospitalName?: string })[]> {
    const results = await db.select({
      id: hospitalChangeLogs.id,
      hospitalId: hospitalChangeLogs.hospitalId,
      fieldName: hospitalChangeLogs.fieldName,
      oldValue: hospitalChangeLogs.oldValue,
      newValue: hospitalChangeLogs.newValue,
      changedBy: hospitalChangeLogs.changedBy,
      changeSource: hospitalChangeLogs.changeSource,
      changeType: hospitalChangeLogs.changeType,
      ipAddress: hospitalChangeLogs.ipAddress,
      userAgent: hospitalChangeLogs.userAgent,
      createdAt: hospitalChangeLogs.createdAt,
      hospitalName: hospitals.nameEn,
    })
      .from(hospitalChangeLogs)
      .leftJoin(hospitals, eq(hospitalChangeLogs.hospitalId, hospitals.id))
      .orderBy(desc(hospitalChangeLogs.createdAt))
      .limit(limit);
    return results;
  }

  // Hospital Emergency Responses
  async createHospitalEmergencyResponse(data: InsertHospitalEmergencyResponse): Promise<HospitalEmergencyResponse> {
    const result = await db.insert(hospitalEmergencyResponses).values(data).returning();
    return result[0];
  }

  async getHospitalEmergencyResponsesByEmergencyId(emergencyRequestId: string): Promise<HospitalEmergencyResponse[]> {
    return await db.select()
      .from(hospitalEmergencyResponses)
      .where(eq(hospitalEmergencyResponses.emergencyRequestId, emergencyRequestId))
      .orderBy(desc(hospitalEmergencyResponses.respondedAt));
  }

  async getActiveEmergencyForHospital(hospitalId: string, withinHours: number = 24): Promise<EmergencyRequest | undefined> {
    const cutoff = new Date(Date.now() - withinHours * 60 * 60 * 1000);
    // Find the most recent message sent to this hospital
    const recentMessages = await db.select()
      .from(messages)
      .where(
        and(
          eq(messages.hospitalId, hospitalId),
          gte(messages.createdAt, cutoff)
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(1);

    if (recentMessages.length === 0) return undefined;

    const request = await db.select()
      .from(emergencyRequests)
      .where(eq(emergencyRequests.id, recentMessages[0].emergencyRequestId))
      .limit(1);

    return request[0];
  }
}

export const storage = new DatabaseStorage();
