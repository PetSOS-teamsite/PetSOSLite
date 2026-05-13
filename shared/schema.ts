import { pgTable, varchar, text, timestamp, integer, boolean, decimal, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { customType } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

const geography = customType<{ data: string }>({
  dataType() {
    return 'geography';
  },
});

// Sessions table
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Notification preferences structure for users
export const notificationPreferencesSchema = z.object({
  emergencyAlerts: z.boolean().default(true),    // Receive emergency-related notifications
  generalUpdates: z.boolean().default(true),     // Receive general platform updates
  promotions: z.boolean().default(false),        // Receive promotions and offers
  systemAlerts: z.boolean().default(true),       // Receive system maintenance alerts
  vetTips: z.boolean().default(true),            // Receive veterinary tips and articles
});

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

export const defaultNotificationPreferences: NotificationPreferences = {
  emergencyAlerts: true,
  generalUpdates: true,
  promotions: false,
  systemAlerts: true,
  vetTips: true,
};

// Storage quota configuration (in bytes)
export const STORAGE_QUOTA = {
  MAX_STORAGE_PER_USER: 100 * 1024 * 1024, // 100 MB per user
  MAX_RECORDS_PER_USER: 50, // Maximum 50 records per user
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB per file
};

export type StorageUsage = {
  usedBytes: number;
  recordCount: number;
  maxBytes: number;
  maxRecords: number;
  maxFileSize: number;
  percentUsed: number;
};

// Users table - unified auth system
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username"),
  password: text("password"),
  email: varchar("email").unique(),
  phone: text("phone"),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  openidSub: text("openid_sub").unique(),
  
  role: text("role").notNull().default('user'), // user, clinic_staff, hospital_staff, admin
  
  name: varchar("name"),
  avatar: text("avatar"),
  profileImageUrl: varchar("profile_image_url"),
  language: text("language").default('en'), // en, zh-HK
  languagePreference: text("language_preference"),
  region: text("region"), // HK district or region identifier
  regionPreference: text("region_preference"),
  clinicId: varchar("clinic_id").references(() => clinics.id, { onDelete: 'set null' }),
  
  // Notification preferences - stores user's notification opt-in choices
  notificationPreferences: jsonb("notification_preferences").$type<NotificationPreferences>(),
  
  // Two-Factor Authentication fields (for admin users)
  twoFactorSecret: text("two_factor_secret"), // Encrypted TOTP secret
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorBackupCodes: text("two_factor_backup_codes").array(), // Hashed one-time backup codes
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_user_email").on(table.email),
  index("idx_user_phone").on(table.phone),
]);

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Pets table
export const pets = pgTable("pets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  species: text("species").notNull(), // dog, cat, exotic, etc.
  breed: text("breed"),
  breedId: varchar("breed_id").references(() => petBreeds.id),
  age: integer("age"), // age in years/months
  weight: text("weight"), // in kg
  medicalNotes: text("medical_notes"), // primary medical notes field
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastVisitHospitalId: varchar("last_visit_hospital_id").references(() => clinics.id, { onDelete: 'set null' }),
  lastVisitDate: timestamp("last_visit_date"),
  type: text("type"), // alternate field for species
  color: text("color"),
  medicalHistory: text("medical_history"),
  microchipId: text("microchip_id"),
  photoUrl: text("photo_url"), // Pet profile photo URL
});

export const insertPetSchema = createInsertSchema(pets, {
  lastVisitDate: z.coerce.date().nullable().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof pets.$inferSelect;

// Countries table
export const countries = pgTable("countries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(), // HK, SG, US
  nameEn: text("name_en").notNull(),
  nameZh: text("name_zh"),
  region: text("region"), // asia, americas, etc.
  active: boolean("active"),
  phonePrefix: text("phone_prefix"),
  flag: text("flag"),
});

export const insertCountrySchema = createInsertSchema(countries).omit({
  id: true,
});

export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type Country = typeof countries.$inferSelect;

// Regions table (districts, states)
export const regions = pgTable("regions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryCode: text("country_code").notNull(), // Country code like 'HK'
  code: text("code").notNull(),
  nameEn: text("name_en").notNull(),
  nameZh: text("name_zh"),
  coordinates: jsonb("coordinates"),
  active: boolean("active").notNull().default(true),
}, (table) => [
  index("idx_region_country_code").on(table.countryCode),
]);

export const insertRegionSchema = createInsertSchema(regions).omit({
  id: true,
});

export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type Region = typeof regions.$inferSelect;

// Pet Breeds table
export const petBreeds = pgTable("pet_breeds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  species: text("species").notNull(), // dog, cat, exotic
  breedEn: text("breed_en").notNull(),
  breedZh: text("breed_zh"),
  countryCode: text("country_code"), // HK, SG, etc. - filters breeds by country
  isCommon: boolean("is_common").default(false), // whether this is a common breed
  active: boolean("active").notNull().default(true),
});

export const insertPetBreedSchema = createInsertSchema(petBreeds).omit({
  id: true,
});

export type InsertPetBreed = z.infer<typeof insertPetBreedSchema>;
export type PetBreed = typeof petBreeds.$inferSelect;

// Clinics table
export const clinics = pgTable("clinics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameZh: text("name_zh"),
  address: text("address").notNull(),
  addressZh: text("address_zh"),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  email: text("email"),
  lineUserId: text("line_user_id"), // LINE Official Account user ID for receiving emergency notifications
  regionId: varchar("region_id").notNull().references(() => regions.id),
  is24Hour: boolean("is_24_hour").notNull().default(false),
  isAvailable: boolean("is_available").notNull().default(true), // Real-time availability toggle
  isSupportHospital: boolean("is_support_hospital").notNull().default(false), // Official PetSOS support partner
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  location: geography("location"), // PostGIS geography point for efficient spatial queries
  status: text("status").notNull().default('active'), // active, inactive, deleted
  services: text("services").array(),
  ownerVerificationCode: text("owner_verification_code"), // 6-digit passcode for clinic owner edit link
  ownerVerificationCodeExpiresAt: timestamp("owner_verification_code_expires_at"), // When the code expires
  averageRating: decimal("average_rating"), // Calculated average of approved reviews (1-5)
  reviewCount: integer("review_count").notNull().default(0), // Total number of approved reviews
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertClinicSchema = createInsertSchema(clinics).omit({
  id: true,
  location: true,
  createdAt: true,
});

export type InsertClinic = z.infer<typeof insertClinicSchema>;
export type Clinic = typeof clinics.$inferSelect;

// Emergency Requests table
export const emergencyRequests = pgTable("emergency_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'set null' }),
  petId: varchar("pet_id").references(() => pets.id, { onDelete: 'set null' }),
  symptom: text("symptom").notNull(), // single symptom field - required
  locationLatitude: decimal("location_latitude"),
  locationLongitude: decimal("location_longitude"),
  manualLocation: text("manual_location"),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  status: text("status").notNull().default('pending'), // pending, in_progress, completed, cancelled
  regionId: varchar("region_id").references(() => regions.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  petSpecies: text("pet_species"),
  petBreed: text("pet_breed"),
  petAge: integer("pet_age"), // integer to match database
  voiceTranscript: text("voice_transcript"),
  aiAnalyzedSymptoms: text("ai_analyzed_symptoms"),
  isVoiceRecording: boolean("is_voice_recording").notNull().default(false),
});

export const insertEmergencyRequestSchema = createInsertSchema(emergencyRequests).omit({
  id: true,
  createdAt: true,
});

export type InsertEmergencyRequest = z.infer<typeof insertEmergencyRequestSchema>;
export type EmergencyRequest = typeof emergencyRequests.$inferSelect;

// Hospitals table - detailed 24-hour animal hospital profiles
export const hospitals = pgTable("hospitals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameZh: text("name_zh").notNull(),
  addressEn: text("address_en").notNull(),
  addressZh: text("address_zh").notNull(),
  regionId: varchar("region_id").notNull().references(() => regions.id),
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  location: geography("location"), // PostGIS geography point
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  websiteUrl: text("website_url"),
  open247: boolean("open_247").notNull().default(true),
  isAvailable: boolean("is_available").notNull().default(true), // Admin can disable hospital
  isPartner: boolean("is_partner").notNull().default(false), // Official PetSOS partner hospital
  liveStatus: text("live_status"), // normal | busy | critical_only
  photos: jsonb("photos"), // Array of photo URLs
  lastVerifiedAt: timestamp("last_verified_at"),
  verifiedById: varchar("verified_by_id").references(() => users.id, { onDelete: 'set null' }),
  
  // Owner-centric details
  onSiteVet247: boolean("on_site_vet_247"),
  triagePolicy: text("triage_policy"),
  typicalWaitBand: text("typical_wait_band"),
  isolationWard: boolean("isolation_ward"),
  ambulanceSupport: boolean("ambulance_support"),
  icuLevel: text("icu_level"),
  nurse24h: boolean("nurse_24h"),
  ownerVisitPolicy: text("owner_visit_policy"),
  eolSupport: boolean("eol_support"),
  imagingXray: boolean("imaging_xray"),
  imagingUS: boolean("imaging_us"),
  imagingCT: boolean("imaging_ct"),
  sameDayCT: boolean("same_day_ct"),
  inHouseLab: boolean("in_house_lab"),
  extLabCutoff: text("ext_lab_cutoff"),
  bloodBankAccess: text("blood_bank_access"),
  sxEmergencySoft: boolean("sx_emergency_soft"),
  sxEmergencyOrtho: boolean("sx_emergency_ortho"),
  anaesMonitoring: text("anaes_monitoring"),
  specialistAvail: text("specialist_avail"),
  // Additional Medical Equipment
  oxygenTherapy: boolean("oxygen_therapy"), // Oxygen tanks/support
  ventilator: boolean("ventilator"), // Ventilator/respirator
  bloodTransfusion: boolean("blood_transfusion"), // Blood transfusion capability
  imagingMRI: boolean("imaging_mri"), // MRI imaging
  endoscopy: boolean("endoscopy"), // Endoscopy services
  dialysis: boolean("dialysis"), // Dialysis/renal support
  defibrillator: boolean("defibrillator"), // Defibrillator/AED
  speciesAccepted: text("species_accepted").array(),
  whatsappTriage: boolean("whatsapp_triage"),
  languages: text("languages").array(),
  parking: boolean("parking"),
  wheelchairAccess: boolean("wheelchair_access"),
  payMethods: text("pay_methods").array(),
  admissionDeposit: boolean("admission_deposit"),
  depositBand: text("deposit_band"),
  insuranceSupport: text("insurance_support").array(),
  recheckWindow: text("recheck_window"),
  refundPolicy: text("refund_policy"),
  ownerVerificationCode: text("owner_verification_code"), // 6-digit passcode for hospital owner edit link
  ownerVerificationCodeExpiresAt: timestamp("owner_verification_code_expires_at"), // When the code expires
  verified: boolean("verified").notNull().default(false),
  
  // ========== DEEP DATA FIELDS FOR GEO & SEARCH ==========
  
  // 1. Blood Bank Details
  bloodBankCanine: boolean("blood_bank_canine"), // On-site canine blood stock
  bloodBankFeline: boolean("blood_bank_feline"), // On-site feline blood stock
  bloodTypesAvailable: text("blood_types_available").array(), // e.g., ["DEA 1.1+", "DEA 1.1-", "Type A", "Type B"]
  
  // 2. Emergency Fee Structure
  consultFeeDay: integer("consult_fee_day"), // Daytime consultation fee ($)
  consultFeeEvening: integer("consult_fee_evening"), // Evening consultation fee ($)
  consultFeeMidnight: integer("consult_fee_midnight"), // Midnight/late night fee ($)
  eveningSurchargeStart: text("evening_surcharge_start"), // e.g., "18:00"
  midnightSurchargeStart: text("midnight_surcharge_start"), // e.g., "00:00"
  holidaySurchargePercent: integer("holiday_surcharge_percent"), // e.g., 50 for 50%
  
  // 3. ICU/Oxygen Capacity
  oxygenCageCount: integer("oxygen_cage_count"), // Number of oxygen cages
  icuBedCount: integer("icu_bed_count"), // Number of ICU beds
  icuNurseCount: integer("icu_nurse_count"), // ICU-specific nurse count
  overnightVetNurseRatio: text("overnight_vet_nurse_ratio"), // e.g., "1:3"
  
  // 4. Exotic Species Support
  exoticVet247: boolean("exotic_vet_247"), // Specialized exotic vet on-site 24/7
  exoticSpecies247: text("exotic_species_247").array(), // Species seen 24/7: ["rabbit", "bird", "reptile", "small_mammal"]
  
  // 5. Advanced Imaging Details
  imagingTech247: boolean("imaging_tech_247"), // 24/7 imaging technician available
  ctScanOnSite: boolean("ct_scan_on_site"), // On-site CT (vs. mobile/referral)
  mriOnSite: boolean("mri_on_site"), // On-site MRI (vs. referral)
  
  // 6. Toxin/Antidote Readiness
  antivenomStock: boolean("antivenom_stock"), // Snake antivenom available
  ratPoisonAntidote: boolean("rat_poison_antidote"), // Vitamin K / rat poison antidote
  gastricLavageKit: boolean("gastric_lavage_kit"), // Stomach pump equipment
  activatedCharcoal: boolean("activated_charcoal"), // Activated charcoal for poisoning
  
  // 7. Surgical Readiness Details
  surgeon247: text("surgeon_247"), // "on_site" | "on_call" | "referral_only"
  surgeonCalloutTime: text("surgeon_callout_time"), // e.g., "30 mins"
  
  // 8. In-Patient Quality
  cctvMonitoring: boolean("cctv_monitoring"), // Remote CCTV monitoring for owners
  visitationHours: text("visitation_hours"), // e.g., "10:00-20:00" or "24h"
  
  // 9. Panic Logistics
  emergencyEntranceEn: text("emergency_entrance_en"), // e.g., "Side door on Smith St"
  emergencyEntranceZh: text("emergency_entrance_zh"),
  parkingDetailsEn: text("parking_details_en"), // e.g., "Free 30-min parking at ABC Lot"
  parkingDetailsZh: text("parking_details_zh"),
  taxiDropoffEn: text("taxi_dropoff_en"), // e.g., "Ask for Happy Valley Road entrance"
  taxiDropoffZh: text("taxi_dropoff_zh"),
  
  // 10. Typhoon/Holiday Policies
  openT8: boolean("open_t8"), // Open during Typhoon Signal 8
  openT10: boolean("open_t10"), // Open during Typhoon Signal 10
  openBlackRainstorm: boolean("open_black_rainstorm"), // Open during Black Rainstorm
  lunarNewYearOpen: boolean("lunar_new_year_open"), // Open during Lunar New Year
  lunarNewYearSurcharge: integer("lunar_new_year_surcharge"), // Surcharge % during CNY
  christmasOpen: boolean("christmas_open"), // Open during Christmas
  
  // Self-service portal fields
  accessCode: varchar("access_code", { length: 8 }).unique(), // 8-character unique code for hospital self-service
  lastConfirmedAt: timestamp("last_confirmed_at"), // When hospital last confirmed their info is correct
  confirmedByName: text("confirmed_by_name"), // Name of person who confirmed the info
  inviteSentAt: timestamp("invite_sent_at"), // When WhatsApp invitation was last sent
  
  // 11. Data Source & Confidence (for transparency + legal safety)
  feeSource: text("fee_source"), // self_reported | verified_call | website | unknown
  waitTimeSource: text("wait_time_source"), // self_reported | verified_call | website | unknown
  statusSource: text("status_source"), // self_reported | verified_call | website | unknown
  dataConfidenceScore: integer("data_confidence_score"), // 0-100 confidence score
  
  // 12. Responsiveness Tracking (for GEO moat)
  lastReplyAt: timestamp("last_reply_at"), // Last time hospital responded to any communication
  replyChannel: text("reply_channel"), // whatsapp | api | manual
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_hospital_location").using("gist", table.location),
  index("idx_hospital_region").on(table.regionId),
  uniqueIndex("idx_hospital_access_code").on(table.accessCode),
]);

export const insertHospitalSchema = createInsertSchema(hospitals).omit({
  id: true,
  location: true, // Auto-populated from lat/lng
  createdAt: true,
  updatedAt: true,
});

export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type Hospital = typeof hospitals.$inferSelect;

// Hospital Change Log table (audit trail for hospital updates)
export const hospitalChangeLogs = pgTable("hospital_change_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalId: varchar("hospital_id").notNull().references(() => hospitals.id, { onDelete: 'cascade' }),
  fieldName: text("field_name").notNull(), // The field that was changed (e.g., "phone", "open247")
  oldValue: text("old_value"), // Previous value (stringified)
  newValue: text("new_value"), // New value (stringified)
  changedBy: text("changed_by"), // Name of person who made the change
  changeSource: text("change_source").notNull(), // "access_code" | "verification_code" | "admin" | "api"
  changeType: text("change_type").notNull().default('update'), // "update" | "confirm" | "status_change"
  ipAddress: text("ip_address"), // Optional IP for audit
  userAgent: text("user_agent"), // Optional user agent for audit
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_hospital_change_log_hospital").on(table.hospitalId),
  index("idx_hospital_change_log_created").on(table.createdAt),
]);

export const insertHospitalChangeLogSchema = createInsertSchema(hospitalChangeLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertHospitalChangeLog = z.infer<typeof insertHospitalChangeLogSchema>;
export type HospitalChangeLog = typeof hospitalChangeLogs.$inferSelect;

// Messages table (for tracking hospital broadcasts)
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  emergencyRequestId: varchar("emergency_request_id").notNull().references(() => emergencyRequests.id, { onDelete: 'cascade' }),
  hospitalId: varchar("hospital_id").notNull().references(() => hospitals.id, { onDelete: 'cascade' }),
  messageType: text("message_type").notNull(), // whatsapp, email, line
  recipient: text("recipient").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default('queued'), // queued, in_progress, sent, delivered, read, failed
  whatsappMessageId: text("whatsapp_message_id"), // Meta's wamid for tracking delivery status
  templateName: text("template_name"), // WhatsApp template name (persisted at queue time)
  templateVariables: jsonb("template_variables").$type<string[]>(), // Template variables (persisted at queue time)
  templateLanguage: text("template_language"), // Template language code (en, zh_HK)
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"), // When recipient opened/read the message
  failedAt: timestamp("failed_at"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Feature Flags table
export const featureFlags = pgTable("feature_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  enabled: boolean("enabled").notNull().default(false),
  value: jsonb("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
  id: true,
  updatedAt: true,
});

export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;
export type FeatureFlag = typeof featureFlags.$inferSelect;

// Audit Logs table
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(), // create, update, delete, generate_code, broadcast_offer
  userId: varchar("user_id").references(() => users.id, { onDelete: 'set null' }),
  changes: jsonb("changes"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// Privacy Consents table
export const privacyConsents = pgTable("privacy_consents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  consentType: text("consent_type").notNull(), // marketing, analytics, data_sharing
  accepted: boolean("accepted").notNull(),
  consentedAt: timestamp("consented_at").notNull().defaultNow(),
});

export const insertPrivacyConsentSchema = createInsertSchema(privacyConsents).omit({
  id: true,
  consentedAt: true,
});

export type InsertPrivacyConsent = z.infer<typeof insertPrivacyConsentSchema>;
export type PrivacyConsent = typeof privacyConsents.$inferSelect;

// Translations table
export const translations = pgTable("translations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull(), // e.g., "common.emergency_alert"
  language: text("language").notNull(), // e.g., "en", "zh-HK"
  value: text("value").notNull(),
  namespace: text("namespace").notNull().default('common'),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
  updatedAt: true,
});

export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

// Hospital Consult Fees table
export const hospitalConsultFees = pgTable("hospital_consult_fees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalId: varchar("hospital_id").notNull().references(() => hospitals.id, { onDelete: 'cascade' }),
  feeType: text("fee_type").notNull(), // day | evening | night_ph
  species: text("species").notNull(), // dog | cat | exotic
  minFee: decimal("min_fee"),
  maxFee: decimal("max_fee"),
  currency: text("currency").notNull().default('HKD'),
  notes: text("notes"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
}, (table) => [
  index("idx_consult_fees_hospital").on(table.hospitalId),
  uniqueIndex("idx_consult_fees_unique").on(table.hospitalId, table.feeType, table.species),
]);

export const insertHospitalConsultFeeSchema = createInsertSchema(hospitalConsultFees).omit({
  id: true,
});

export type InsertHospitalConsultFee = z.infer<typeof insertHospitalConsultFeeSchema>;
export type HospitalConsultFee = typeof hospitalConsultFees.$inferSelect;

// Hospital Updates table - tracks changes and user submissions
export const hospitalUpdates = pgTable("hospital_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalId: varchar("hospital_id").notNull().references(() => hospitals.id, { onDelete: 'cascade' }),
  submittedById: varchar("submitted_by_id").references(() => users.id, { onDelete: 'set null' }),
  updateType: text("update_type").notNull(), // info_correction | fee_update | service_update
  fieldName: text("field_name"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  status: text("status").notNull().default('pending'), // pending | approved | rejected
  reviewedById: varchar("reviewed_by_id").references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp("reviewed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_hospital_updates_hospital").on(table.hospitalId),
]);

export const insertHospitalUpdateSchema = createInsertSchema(hospitalUpdates).omit({
  id: true,
  createdAt: true,
});

export type InsertHospitalUpdate = z.infer<typeof insertHospitalUpdateSchema>;
export type HospitalUpdate = typeof hospitalUpdates.$inferSelect;

// Pet Medical Records table - stores medical documents for pets
export const petMedicalRecords = pgTable("pet_medical_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  petId: varchar("pet_id").notNull().references(() => pets.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id), // uploader, for ownership
  documentType: text("document_type").notNull(), // blood_test, xray, vaccination, surgery_report, prescription, other
  title: text("title").notNull(), // user-provided title like "Blood Test Dec 2024"
  description: text("description"), // optional notes
  filePath: text("file_path").notNull(), // object storage path
  fileSize: integer("file_size").notNull(), // in bytes
  mimeType: text("mime_type").notNull(), // application/pdf, image/jpeg, etc.
  isConfidential: boolean("is_confidential").notNull().default(false), // if true, requires explicit sharing consent
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"), // optional, for time-limited documents
}, (table) => [
  index("idx_pet_medical_records_pet").on(table.petId),
  index("idx_pet_medical_records_user").on(table.userId),
]);

export const insertPetMedicalRecordSchema = createInsertSchema(petMedicalRecords).omit({
  id: true,
  uploadedAt: true,
});

export type InsertPetMedicalRecord = z.infer<typeof insertPetMedicalRecordSchema>;
export type PetMedicalRecord = typeof petMedicalRecords.$inferSelect;

// Pet Medical Sharing Consent table - manages consent for sharing medical records
export const petMedicalSharingConsents = pgTable("pet_medical_sharing_consents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  petId: varchar("pet_id").notNull().references(() => pets.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  consentType: text("consent_type").notNull(), // emergency_broadcast, hospital_view
  enabled: boolean("enabled").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_pet_medical_sharing_consent_pet").on(table.petId),
  index("idx_pet_medical_sharing_consent_user").on(table.userId),
]);

export const insertPetMedicalSharingConsentSchema = createInsertSchema(petMedicalSharingConsents).omit({
  id: true,
  updatedAt: true,
});

export type InsertPetMedicalSharingConsent = z.infer<typeof insertPetMedicalSharingConsentSchema>;
export type PetMedicalSharingConsent = typeof petMedicalSharingConsents.$inferSelect;

// Push Notification Subscriptions table - stores FCM tokens for push notifications
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  token: text("token").notNull().unique(), // FCM device token
  provider: text("provider").notNull().default('fcm'), // fcm, onesignal (for migration)
  platform: text("platform").notNull(), // web, ios, android
  browserInfo: text("browser_info"),
  language: text("language").default('en'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),
}, (table) => [
  index("idx_push_subscriptions_user").on(table.userId),
  index("idx_push_subscriptions_token").on(table.token),
]);

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});

export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;

// Admin Notification Broadcasts table - stores sent notifications for audit
export const notificationBroadcasts = pgTable("notification_broadcasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  targetLanguage: text("target_language"), // null = all, 'en', 'zh-HK'
  targetAudience: text("target_audience").notNull().default('all'), // all, subscribed_users
  targetRole: text("target_role"), // null = all, 'pet_owner', 'hospital_clinic'
  url: text("url"), // click-through URL
  recipientCount: integer("recipient_count"),
  status: text("status").notNull().default('pending'), // pending, scheduled, sent, failed, cancelled
  scheduledFor: timestamp("scheduled_for"), // null = immediate, otherwise the scheduled time
  providerResponse: jsonb("provider_response"), // FCM or other provider response data
  createdAt: timestamp("created_at").notNull().defaultNow(),
  sentAt: timestamp("sent_at"),
}, (table) => [
  index("idx_notification_broadcasts_admin").on(table.adminId),
  index("idx_notification_broadcasts_status").on(table.status),
  index("idx_notification_broadcasts_scheduled").on(table.scheduledFor),
]);

export const insertNotificationBroadcastSchema = createInsertSchema(notificationBroadcasts).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  recipientCount: true,
  providerResponse: true,
});

export type InsertNotificationBroadcast = z.infer<typeof insertNotificationBroadcastSchema>;
export type NotificationBroadcast = typeof notificationBroadcasts.$inferSelect;

// Clinic Reviews table - stores user reviews for clinics
export const clinicReviews = pgTable("clinic_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer("rating").notNull(), // 1-5 stars
  reviewText: text("review_text"), // Optional comment
  status: text("status").notNull().default('pending'), // pending, approved, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_clinic_reviews_clinic").on(table.clinicId),
  index("idx_clinic_reviews_user").on(table.userId),
  index("idx_clinic_reviews_status").on(table.status),
]);

export const insertClinicReviewSchema = createInsertSchema(clinicReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  rating: z.number().min(1).max(5),
});

export type InsertClinicReview = z.infer<typeof insertClinicReviewSchema>;
export type ClinicReview = typeof clinicReviews.$inferSelect;

// WhatsApp Conversations table - tracks two-way chat sessions with hospitals
export const whatsappConversations = pgTable("whatsapp_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalId: varchar("hospital_id").references(() => hospitals.id, { onDelete: 'set null' }),
  phoneNumber: text("phone_number").notNull(), // Sanitized WhatsApp number (digits only)
  displayName: text("display_name"), // Hospital name or WhatsApp profile name
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  lastMessagePreview: text("last_message_preview"), // First 100 chars of last message
  unreadCount: integer("unread_count").notNull().default(0),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_whatsapp_conversations_phone").on(table.phoneNumber),
  index("idx_whatsapp_conversations_hospital").on(table.hospitalId),
  index("idx_whatsapp_conversations_last_message").on(table.lastMessageAt),
]);

export const insertWhatsappConversationSchema = createInsertSchema(whatsappConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWhatsappConversation = z.infer<typeof insertWhatsappConversationSchema>;
export type WhatsappConversation = typeof whatsappConversations.$inferSelect;

// WhatsApp Chat Messages table - stores individual messages in conversations
export const whatsappChatMessages = pgTable("whatsapp_chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => whatsappConversations.id, { onDelete: 'cascade' }),
  direction: text("direction").notNull(), // 'inbound' (from hospital) or 'outbound' (from PetSOS)
  content: text("content").notNull(),
  messageType: text("message_type").notNull().default('text'), // text, image, document, audio, video
  mediaUrl: text("media_url"), // URL for media messages
  whatsappMessageId: text("whatsapp_message_id"), // Meta's wamid for tracking
  status: text("status").notNull().default('sent'), // sent, delivered, read, failed (for outbound)
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_whatsapp_chat_messages_conversation").on(table.conversationId),
  index("idx_whatsapp_chat_messages_created").on(table.createdAt),
  index("idx_whatsapp_chat_messages_whatsapp_id").on(table.whatsappMessageId),
]);

export const insertWhatsappChatMessageSchema = createInsertSchema(whatsappChatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertWhatsappChatMessage = z.infer<typeof insertWhatsappChatMessageSchema>;
export type WhatsappChatMessage = typeof whatsappChatMessages.$inferSelect;

// =====================================================
// TYPHOON & HOLIDAY PROTOCOL TABLES
// =====================================================

// Typhoon Alerts table - tracks current and historical typhoon signals
export const typhoonAlerts = pgTable("typhoon_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  signalCode: text("signal_code").notNull(), // T1, T3, T8NW, T8NE, T8SW, T8SE, T9, T10
  signalNameEn: text("signal_name_en").notNull(),
  signalNameZh: text("signal_name_zh").notNull(),
  issuedAt: timestamp("issued_at").notNull(),
  liftedAt: timestamp("lifted_at"),
  isActive: boolean("is_active").notNull().default(true),
  observatoryBulletinId: text("observatory_bulletin_id"), // HKO bulletin reference
  severityLevel: integer("severity_level").notNull(), // 1-10 based on signal
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_typhoon_alerts_active").on(table.isActive),
  index("idx_typhoon_alerts_issued").on(table.issuedAt),
]);

export const insertTyphoonAlertSchema = createInsertSchema(typhoonAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTyphoonAlert = z.infer<typeof insertTyphoonAlertSchema>;
export type TyphoonAlert = typeof typhoonAlerts.$inferSelect;

// HK Holiday Calendar table - pre-populated with Hong Kong public holidays
export const hkHolidays = pgTable("hk_holidays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  nameEn: text("name_en").notNull(),
  nameZh: text("name_zh").notNull(),
  holidayType: text("holiday_type").notNull(), // public, bank, special
  year: integer("year").notNull(),
  isGazetted: boolean("is_gazetted").notNull().default(true),
  notes: text("notes"),
}, (table) => [
  index("idx_hk_holidays_date").on(table.date),
  index("idx_hk_holidays_year").on(table.year),
  uniqueIndex("idx_hk_holidays_unique").on(table.date, table.nameEn),
]);

export const insertHkHolidaySchema = createInsertSchema(hkHolidays).omit({
  id: true,
});

export type InsertHkHoliday = z.infer<typeof insertHkHolidaySchema>;
export type HkHoliday = typeof hkHolidays.$inferSelect;

// Hospital Emergency Status table - tracks hospital availability during emergencies
export const hospitalEmergencyStatus = pgTable("hospital_emergency_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalId: varchar("hospital_id").notNull().references(() => hospitals.id, { onDelete: 'cascade' }),
  statusType: text("status_type").notNull(), // typhoon, holiday, special
  referenceId: varchar("reference_id"), // typhoon_alert ID or hk_holiday ID
  isOpen: boolean("is_open").notNull(),
  openingTime: text("opening_time"), // e.g., "09:00"
  closingTime: text("closing_time"), // e.g., "18:00"
  confirmedAt: timestamp("confirmed_at").notNull().defaultNow(),
  confirmedBy: varchar("confirmed_by").references(() => users.id, { onDelete: 'set null' }),
  confirmationMethod: text("confirmation_method"), // phone_call, whatsapp, self_report, auto
  notes: text("notes"),
  expiresAt: timestamp("expires_at"), // when this status should be considered stale
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_hospital_emergency_status_hospital").on(table.hospitalId),
  index("idx_hospital_emergency_status_type").on(table.statusType),
  index("idx_hospital_emergency_status_reference").on(table.referenceId),
]);

export const insertHospitalEmergencyStatusSchema = createInsertSchema(hospitalEmergencyStatus).omit({
  id: true,
  createdAt: true,
});

export type InsertHospitalEmergencyStatus = z.infer<typeof insertHospitalEmergencyStatusSchema>;
export type HospitalEmergencyStatus = typeof hospitalEmergencyStatus.$inferSelect;

// Typhoon Notification Queue table - tracks pending notifications to send
export const typhoonNotificationQueue = pgTable("typhoon_notification_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  typhoonAlertId: varchar("typhoon_alert_id").references(() => typhoonAlerts.id, { onDelete: 'cascade' }),
  holidayId: varchar("holiday_id").references(() => hkHolidays.id, { onDelete: 'cascade' }),
  notificationType: text("notification_type").notNull(), // typhoon_warning, holiday_reminder, status_update
  targetAudience: text("target_audience").notNull(), // all_users, subscribed, hospitals
  channel: text("channel").notNull(), // push, email, whatsapp
  titleEn: text("title_en").notNull(),
  titleZh: text("title_zh").notNull(),
  bodyEn: text("body_en").notNull(),
  bodyZh: text("body_zh").notNull(),
  status: text("status").notNull().default('pending'), // pending, sending, sent, failed
  retryCount: integer("retry_count").notNull().default(0),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  recipientCount: integer("recipient_count"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_typhoon_notification_queue_status").on(table.status),
  index("idx_typhoon_notification_queue_scheduled").on(table.scheduledFor),
]);

export const insertTyphoonNotificationQueueSchema = createInsertSchema(typhoonNotificationQueue).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  recipientCount: true,
});

export type InsertTyphoonNotificationQueue = z.infer<typeof insertTyphoonNotificationQueueSchema>;
export type TyphoonNotificationQueue = typeof typhoonNotificationQueue.$inferSelect;

// User Emergency Alert Subscriptions - opt-in for typhoon/holiday notifications
export const userEmergencySubscriptions = pgTable("user_emergency_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  email: text("email"),
  phone: text("phone"),
  pushToken: text("push_token"), // FCM token for anonymous users
  subscriptionType: text("subscription_type").notNull(), // typhoon, holiday, all
  notifyChannels: text("notify_channels").array().notNull().default(sql`ARRAY['push']::text[]`), // push, email, sms
  preferredLanguage: text("preferred_language").notNull().default('en'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_user_emergency_subscriptions_user").on(table.userId),
  index("idx_user_emergency_subscriptions_active").on(table.isActive),
]);

export const insertUserEmergencySubscriptionSchema = createInsertSchema(userEmergencySubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserEmergencySubscription = z.infer<typeof insertUserEmergencySubscriptionSchema>;
export type UserEmergencySubscription = typeof userEmergencySubscriptions.$inferSelect;

// =====================================================
// VET CONSULTANT & CONTENT VERIFICATION TABLES
// =====================================================

// Vet Consultants table - verified veterinary professionals
export const vetConsultants = pgTable("vet_consultants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Core identity
  fullName: text("full_name").notNull(), // Primary name field
  nameEn: text("name_en"), // Legacy - for backward compatibility
  nameZh: text("name_zh"),
  // Role & type (per spec)
  role: text("role").notNull().default('vet'), // vet, nurse, practice_manager, other
  vetType: text("vet_type"), // GP, Specialist, GP_with_interest (only if role=vet)
  // Professional info
  clinicName: text("clinic_name"), // Primary clinic / organisation
  educationBackground: text("education_background"), // Free text: BVSc / DVM / VN Diploma / FANZCVS
  specialtyOrInterest: text("specialty_or_interest"), // Optional specialty or special interest
  // Legacy fields (kept for backward compatibility)
  titleEn: text("title_en"), // Legacy credential field
  titleZh: text("title_zh"),
  specialtyEn: text("specialty_en"), // Legacy specialty field
  specialtyZh: text("specialty_zh"),
  bioEn: text("bio_en"),
  bioZh: text("bio_zh"),
  photoUrl: text("photo_url"),
  licenseNumber: text("license_number"), // Optional - not displayed publicly per GEO guidelines
  hospitalAffiliationEn: text("hospital_affiliation_en"), // Legacy
  hospitalAffiliationZh: text("hospital_affiliation_zh"), // Legacy
  yearsExperience: integer("years_experience"),
  // Visibility & privacy (per spec - NO contact info stored)
  visibilityPreference: text("visibility_preference").notNull().default('name_role'), // name_role, clinic_only, anonymous
  internalNotes: text("internal_notes"), // Admin-only notes
  // Status
  isActive: boolean("is_active").notNull().default(true),
  isPublic: boolean("is_public").notNull().default(true),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_vet_consultants_active").on(table.isActive),
  index("idx_vet_consultants_public").on(table.isPublic),
  index("idx_vet_consultants_role").on(table.role),
]);

export const insertVetConsultantSchema = createInsertSchema(vetConsultants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVetConsultant = z.infer<typeof insertVetConsultantSchema>;
export type VetConsultant = typeof vetConsultants.$inferSelect;

// Verified Content Items table - tracks all content that can be verified
export const verifiedContentItems = pgTable("verified_content_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentType: text("content_type").notNull(), // emergency_symptom, blog, guide, faq
  contentSlug: text("content_slug").notNull().unique(), // e.g., "cat-panting", "dog-bloat"
  titleEn: text("title_en").notNull(),
  titleZh: text("title_zh"),
  descriptionEn: text("description_en"),
  descriptionZh: text("description_zh"),
  url: text("url"), // relative URL path, e.g., "/emergency-symptoms#cat-panting"
  isPublished: boolean("is_published").notNull().default(true),
  publishedAt: timestamp("published_at"),
  lastUpdatedAt: timestamp("last_updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_verified_content_type").on(table.contentType),
  index("idx_verified_content_slug").on(table.contentSlug),
  index("idx_verified_content_published").on(table.isPublished),
]);

export const insertVerifiedContentItemSchema = createInsertSchema(verifiedContentItems).omit({
  id: true,
  createdAt: true,
});

export type InsertVerifiedContentItem = z.infer<typeof insertVerifiedContentItemSchema>;
export type VerifiedContentItem = typeof verifiedContentItems.$inferSelect;

// Content Verifications table - junction table linking consultants to verified content
export const contentVerifications = pgTable("content_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").notNull().references(() => vetConsultants.id, { onDelete: 'cascade' }),
  contentId: varchar("content_id").notNull().references(() => verifiedContentItems.id, { onDelete: 'cascade' }),
  // Verification scope per spec: what aspect was verified
  verificationScope: text("verification_scope").notNull().default('clarity'), // clarity, safety, triage_language
  verifiedAt: timestamp("verified_at").notNull().defaultNow(),
  verificationNotes: text("verification_notes"),
  adminNote: text("admin_note"), // Admin-only note about this verification
  isVisible: boolean("is_visible").notNull().default(true), // show this verification publicly
  contentVersion: text("content_version"), // track which version was verified
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_content_verifications_consultant").on(table.consultantId),
  index("idx_content_verifications_content").on(table.contentId),
  uniqueIndex("idx_content_verifications_unique").on(table.consultantId, table.contentId),
]);

export const insertContentVerificationSchema = createInsertSchema(contentVerifications).omit({
  id: true,
  createdAt: true,
});

export type InsertContentVerification = z.infer<typeof insertContentVerificationSchema>;
export type ContentVerification = typeof contentVerifications.$inferSelect;

// Extended type for consultant with their verified content
export type VetConsultantWithContent = VetConsultant & {
  verifiedContent: (VerifiedContentItem & { verifiedAt: Date })[];
};

// Extended type for content with its verifier
export type ContentWithVerifier = VerifiedContentItem & {
  verifier: VetConsultant | null;
  verifiedAt: Date | null;
};

// Vet Applications table - applications from veterinary professionals
export const vetApplications = pgTable("vet_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // SECTION A - Professional Snapshot (per spec)
  fullName: text("full_name").notNull(), // Required
  role: text("role").notNull(), // vet, nurse, practice_manager, other
  vetType: text("vet_type"), // GP, Specialist, GP_with_interest (only if role=vet)
  clinicName: text("clinic_name").notNull(), // Primary Clinic / Organisation
  phoneWhatsapp: text("phone_whatsapp").notNull(), // Private - admin only
  email: text("email"), // Optional email
  
  // SECTION B - Background
  educationBackground: text("education_background"), // Free text: BVSc / DVM / VN Diploma
  
  // SECTION C - Verification Scope (stored as JSON array)
  verificationScope: text("verification_scope").array(), // clarity, emergency_discovery, safety_messaging
  
  // SECTION D - Future Involvement (stored as JSON array)
  futureContactInterest: text("future_contact_interest").array(), // reviewing_guides, cpd_sessions, workshops, videos, community_education
  
  // SECTION E - Additional
  additionalComments: text("additional_comments"), // Optional free text
  
  // Consent tracking (per spec)
  consentAcknowledged: boolean("consent_acknowledged").notNull().default(false),
  consentVersion: text("consent_version").notNull().default('v1'),
  
  // Legacy fields (kept for backward compatibility)
  nameEn: text("name_en"), // Legacy
  nameZh: text("name_zh"), // Legacy
  phone: text("phone"), // Legacy
  licenseNumber: text("license_number"), // Legacy
  titleEn: text("title_en"), // Legacy
  titleZh: text("title_zh"), // Legacy
  specialtyEn: text("specialty_en"), // Legacy
  specialtyZh: text("specialty_zh"), // Legacy
  hospitalAffiliationEn: text("hospital_affiliation_en"), // Legacy
  hospitalAffiliationZh: text("hospital_affiliation_zh"), // Legacy
  yearsExperience: integer("years_experience"), // Legacy
  motivationEn: text("motivation_en"), // Legacy
  motivationZh: text("motivation_zh"), // Legacy
  cvUrl: text("cv_url"), // Legacy
  
  // Status tracking
  status: text("status").notNull().default('pending'), // pending, approved, rejected
  reviewedBy: varchar("reviewed_by").references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  createdConsultantId: varchar("created_consultant_id").references(() => vetConsultants.id, { onDelete: 'set null' }),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_vet_applications_status").on(table.status),
  index("idx_vet_applications_role").on(table.role),
]);

export const insertVetApplicationSchema = createInsertSchema(vetApplications).omit({
  id: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  reviewNotes: true,
  createdConsultantId: true,
  submittedAt: true,
  createdAt: true,
  updatedAt: true,
  // Legacy fields - not used in new form
  nameEn: true,
  nameZh: true,
  phone: true,
  licenseNumber: true,
  titleEn: true,
  titleZh: true,
  specialtyEn: true,
  specialtyZh: true,
  hospitalAffiliationEn: true,
  hospitalAffiliationZh: true,
  yearsExperience: true,
  motivationEn: true,
  motivationZh: true,
  cvUrl: true,
});

export type InsertVetApplication = z.infer<typeof insertVetApplicationSchema>;
export type VetApplication = typeof vetApplications.$inferSelect;

// Hospital Ping State table - tracks daily ping/reply status per hospital
export const hospitalPingState = pgTable("hospital_ping_state", {
  hospitalId: varchar("hospital_id").primaryKey().references(() => hospitals.id, { onDelete: 'cascade' }),
  pingEnabled: boolean("ping_enabled").notNull().default(true),
  pingStatus: text("ping_status").notNull().default('active'), // active, no_reply, paused
  lastPingSentAt: timestamp("last_ping_sent_at"),
  lastPingMessageId: text("last_ping_message_id"),
  lastInboundReplyAt: timestamp("last_inbound_reply_at"),
  lastReplyLatencySeconds: integer("last_reply_latency_seconds"),
  noReplySince: timestamp("no_reply_since"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertHospitalPingStateSchema = createInsertSchema(hospitalPingState).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertHospitalPingState = z.infer<typeof insertHospitalPingStateSchema>;
export type HospitalPingState = typeof hospitalPingState.$inferSelect;

// Hospital Ping Logs table - audit trail for ping events
export const hospitalPingLogs = pgTable("hospital_ping_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalId: varchar("hospital_id").notNull().references(() => hospitals.id, { onDelete: 'cascade' }),
  direction: text("direction").notNull(), // outbound, inbound
  providerMessageId: text("provider_message_id"),
  eventType: text("event_type").notNull(), // ping_sent, reply_received, no_reply_marked
  sentAt: timestamp("sent_at"),
  receivedAt: timestamp("received_at"),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_ping_logs_hospital").on(table.hospitalId),
  index("idx_ping_logs_created").on(table.createdAt),
]);

export const insertHospitalPingLogSchema = createInsertSchema(hospitalPingLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertHospitalPingLog = z.infer<typeof insertHospitalPingLogSchema>;
export type HospitalPingLog = typeof hospitalPingLogs.$inferSelect;

// =====================================================
// HOSPITAL EMERGENCY RESPONSES
// Tracks when a hospital replies to a specific emergency broadcast via WhatsApp
// =====================================================
export const hospitalEmergencyResponses = pgTable("hospital_emergency_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  emergencyRequestId: varchar("emergency_request_id").notNull().references(() => emergencyRequests.id, { onDelete: 'cascade' }),
  hospitalId: varchar("hospital_id").notNull().references(() => hospitals.id, { onDelete: 'cascade' }),
  message: text("message").notNull(),
  responseType: varchar("response_type", { length: 32 }).default('other'), // 'can_accept' | 'full' | 'call_requested' | 'other'
  respondedAt: timestamp("responded_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_emergency_responses_request").on(table.emergencyRequestId),
  index("idx_emergency_responses_hospital").on(table.hospitalId),
]);

export const insertHospitalEmergencyResponseSchema = createInsertSchema(hospitalEmergencyResponses).omit({
  id: true,
  createdAt: true,
});

export type InsertHospitalEmergencyResponse = z.infer<typeof insertHospitalEmergencyResponseSchema>;
export type HospitalEmergencyResponse = typeof hospitalEmergencyResponses.$inferSelect;
