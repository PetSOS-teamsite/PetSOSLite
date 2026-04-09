var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  STORAGE_QUOTA: () => STORAGE_QUOTA,
  auditLogs: () => auditLogs,
  clinicReviews: () => clinicReviews,
  clinics: () => clinics,
  contentVerifications: () => contentVerifications,
  countries: () => countries,
  defaultNotificationPreferences: () => defaultNotificationPreferences,
  emergencyRequests: () => emergencyRequests,
  featureFlags: () => featureFlags,
  hkHolidays: () => hkHolidays,
  hospitalChangeLogs: () => hospitalChangeLogs,
  hospitalConsultFees: () => hospitalConsultFees,
  hospitalEmergencyResponses: () => hospitalEmergencyResponses,
  hospitalEmergencyStatus: () => hospitalEmergencyStatus,
  hospitalPingLogs: () => hospitalPingLogs,
  hospitalPingState: () => hospitalPingState,
  hospitalUpdates: () => hospitalUpdates,
  hospitals: () => hospitals,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertClinicReviewSchema: () => insertClinicReviewSchema,
  insertClinicSchema: () => insertClinicSchema,
  insertContentVerificationSchema: () => insertContentVerificationSchema,
  insertCountrySchema: () => insertCountrySchema,
  insertEmergencyRequestSchema: () => insertEmergencyRequestSchema,
  insertFeatureFlagSchema: () => insertFeatureFlagSchema,
  insertHkHolidaySchema: () => insertHkHolidaySchema,
  insertHospitalChangeLogSchema: () => insertHospitalChangeLogSchema,
  insertHospitalConsultFeeSchema: () => insertHospitalConsultFeeSchema,
  insertHospitalEmergencyResponseSchema: () => insertHospitalEmergencyResponseSchema,
  insertHospitalEmergencyStatusSchema: () => insertHospitalEmergencyStatusSchema,
  insertHospitalPingLogSchema: () => insertHospitalPingLogSchema,
  insertHospitalPingStateSchema: () => insertHospitalPingStateSchema,
  insertHospitalSchema: () => insertHospitalSchema,
  insertHospitalUpdateSchema: () => insertHospitalUpdateSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNotificationBroadcastSchema: () => insertNotificationBroadcastSchema,
  insertPetBreedSchema: () => insertPetBreedSchema,
  insertPetMedicalRecordSchema: () => insertPetMedicalRecordSchema,
  insertPetMedicalSharingConsentSchema: () => insertPetMedicalSharingConsentSchema,
  insertPetSchema: () => insertPetSchema,
  insertPrivacyConsentSchema: () => insertPrivacyConsentSchema,
  insertPushSubscriptionSchema: () => insertPushSubscriptionSchema,
  insertRegionSchema: () => insertRegionSchema,
  insertTranslationSchema: () => insertTranslationSchema,
  insertTyphoonAlertSchema: () => insertTyphoonAlertSchema,
  insertTyphoonNotificationQueueSchema: () => insertTyphoonNotificationQueueSchema,
  insertUserEmergencySubscriptionSchema: () => insertUserEmergencySubscriptionSchema,
  insertUserSchema: () => insertUserSchema,
  insertVerifiedContentItemSchema: () => insertVerifiedContentItemSchema,
  insertVetApplicationSchema: () => insertVetApplicationSchema,
  insertVetConsultantSchema: () => insertVetConsultantSchema,
  insertWhatsappChatMessageSchema: () => insertWhatsappChatMessageSchema,
  insertWhatsappConversationSchema: () => insertWhatsappConversationSchema,
  messages: () => messages,
  notificationBroadcasts: () => notificationBroadcasts,
  notificationPreferencesSchema: () => notificationPreferencesSchema,
  petBreeds: () => petBreeds,
  petMedicalRecords: () => petMedicalRecords,
  petMedicalSharingConsents: () => petMedicalSharingConsents,
  pets: () => pets,
  privacyConsents: () => privacyConsents,
  pushSubscriptions: () => pushSubscriptions,
  regions: () => regions,
  sessions: () => sessions,
  translations: () => translations,
  typhoonAlerts: () => typhoonAlerts,
  typhoonNotificationQueue: () => typhoonNotificationQueue,
  userEmergencySubscriptions: () => userEmergencySubscriptions,
  users: () => users,
  verifiedContentItems: () => verifiedContentItems,
  vetApplications: () => vetApplications,
  vetConsultants: () => vetConsultants,
  whatsappChatMessages: () => whatsappChatMessages,
  whatsappConversations: () => whatsappConversations
});
import { pgTable, varchar, text, timestamp, integer, boolean, decimal, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var geography, sessions, notificationPreferencesSchema, defaultNotificationPreferences, STORAGE_QUOTA, users, insertUserSchema, pets, insertPetSchema, countries, insertCountrySchema, regions, insertRegionSchema, petBreeds, insertPetBreedSchema, clinics, insertClinicSchema, emergencyRequests, insertEmergencyRequestSchema, hospitals, insertHospitalSchema, hospitalChangeLogs, insertHospitalChangeLogSchema, messages, insertMessageSchema, featureFlags, insertFeatureFlagSchema, auditLogs, insertAuditLogSchema, privacyConsents, insertPrivacyConsentSchema, translations, insertTranslationSchema, hospitalConsultFees, insertHospitalConsultFeeSchema, hospitalUpdates, insertHospitalUpdateSchema, petMedicalRecords, insertPetMedicalRecordSchema, petMedicalSharingConsents, insertPetMedicalSharingConsentSchema, pushSubscriptions, insertPushSubscriptionSchema, notificationBroadcasts, insertNotificationBroadcastSchema, clinicReviews, insertClinicReviewSchema, whatsappConversations, insertWhatsappConversationSchema, whatsappChatMessages, insertWhatsappChatMessageSchema, typhoonAlerts, insertTyphoonAlertSchema, hkHolidays, insertHkHolidaySchema, hospitalEmergencyStatus, insertHospitalEmergencyStatusSchema, typhoonNotificationQueue, insertTyphoonNotificationQueueSchema, userEmergencySubscriptions, insertUserEmergencySubscriptionSchema, vetConsultants, insertVetConsultantSchema, verifiedContentItems, insertVerifiedContentItemSchema, contentVerifications, insertContentVerificationSchema, vetApplications, insertVetApplicationSchema, hospitalPingState, insertHospitalPingStateSchema, hospitalPingLogs, insertHospitalPingLogSchema, hospitalEmergencyResponses, insertHospitalEmergencyResponseSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    geography = customType({
      dataType() {
        return "geography";
      }
    });
    sessions = pgTable("sessions", {
      sid: varchar("sid").primaryKey(),
      sess: jsonb("sess").notNull(),
      expire: timestamp("expire").notNull()
    });
    notificationPreferencesSchema = z.object({
      emergencyAlerts: z.boolean().default(true),
      // Receive emergency-related notifications
      generalUpdates: z.boolean().default(true),
      // Receive general platform updates
      promotions: z.boolean().default(false),
      // Receive promotions and offers
      systemAlerts: z.boolean().default(true),
      // Receive system maintenance alerts
      vetTips: z.boolean().default(true)
      // Receive veterinary tips and articles
    });
    defaultNotificationPreferences = {
      emergencyAlerts: true,
      generalUpdates: true,
      promotions: false,
      systemAlerts: true,
      vetTips: true
    };
    STORAGE_QUOTA = {
      MAX_STORAGE_PER_USER: 100 * 1024 * 1024,
      // 100 MB per user
      MAX_RECORDS_PER_USER: 50,
      // Maximum 50 records per user
      MAX_FILE_SIZE: 10 * 1024 * 1024
      // 10 MB per file
    };
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      username: text("username"),
      password: text("password"),
      email: varchar("email").unique(),
      phone: text("phone"),
      passwordHash: text("password_hash"),
      googleId: text("google_id").unique(),
      openidSub: text("openid_sub").unique(),
      role: text("role").notNull().default("user"),
      // user, clinic_staff, hospital_staff, admin
      name: varchar("name"),
      avatar: text("avatar"),
      profileImageUrl: varchar("profile_image_url"),
      language: text("language").default("en"),
      // en, zh-HK
      languagePreference: text("language_preference"),
      region: text("region"),
      // HK district or region identifier
      regionPreference: text("region_preference"),
      clinicId: varchar("clinic_id").references(() => clinics.id, { onDelete: "set null" }),
      // Notification preferences - stores user's notification opt-in choices
      notificationPreferences: jsonb("notification_preferences").$type(),
      // Two-Factor Authentication fields (for admin users)
      twoFactorSecret: text("two_factor_secret"),
      // Encrypted TOTP secret
      twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
      twoFactorBackupCodes: text("two_factor_backup_codes").array(),
      // Hashed one-time backup codes
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => [
      index("idx_user_email").on(table.email),
      index("idx_user_phone").on(table.phone)
    ]);
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    pets = pgTable("pets", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      name: text("name").notNull(),
      species: text("species").notNull(),
      // dog, cat, exotic, etc.
      breed: text("breed"),
      breedId: varchar("breed_id").references(() => petBreeds.id),
      age: integer("age"),
      // age in years/months
      weight: text("weight"),
      // in kg
      medicalNotes: text("medical_notes"),
      // primary medical notes field
      createdAt: timestamp("created_at").notNull().defaultNow(),
      lastVisitHospitalId: varchar("last_visit_hospital_id").references(() => hospitals.id, { onDelete: "set null" }),
      lastVisitDate: timestamp("last_visit_date"),
      type: text("type"),
      // alternate field for species
      color: text("color"),
      medicalHistory: text("medical_history"),
      microchipId: text("microchip_id"),
      photoUrl: text("photo_url")
      // Pet profile photo URL
    });
    insertPetSchema = createInsertSchema(pets).omit({
      id: true,
      createdAt: true
    });
    countries = pgTable("countries", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      code: text("code").notNull().unique(),
      // HK, SG, US
      nameEn: text("name_en").notNull(),
      nameZh: text("name_zh"),
      region: text("region"),
      // asia, americas, etc.
      active: boolean("active"),
      phonePrefix: text("phone_prefix"),
      flag: text("flag")
    });
    insertCountrySchema = createInsertSchema(countries).omit({
      id: true
    });
    regions = pgTable("regions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      countryCode: text("country_code").notNull(),
      // Country code like 'HK'
      code: text("code").notNull(),
      nameEn: text("name_en").notNull(),
      nameZh: text("name_zh"),
      coordinates: jsonb("coordinates"),
      active: boolean("active").notNull().default(true)
    }, (table) => [
      index("idx_region_country_code").on(table.countryCode)
    ]);
    insertRegionSchema = createInsertSchema(regions).omit({
      id: true
    });
    petBreeds = pgTable("pet_breeds", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      species: text("species").notNull(),
      // dog, cat, exotic
      breedEn: text("breed_en").notNull(),
      breedZh: text("breed_zh"),
      countryCode: text("country_code"),
      // HK, SG, etc. - filters breeds by country
      isCommon: boolean("is_common").default(false),
      // whether this is a common breed
      active: boolean("active").notNull().default(true)
    });
    insertPetBreedSchema = createInsertSchema(petBreeds).omit({
      id: true
    });
    clinics = pgTable("clinics", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      nameZh: text("name_zh"),
      address: text("address").notNull(),
      addressZh: text("address_zh"),
      phone: text("phone").notNull(),
      whatsapp: text("whatsapp"),
      email: text("email"),
      lineUserId: text("line_user_id"),
      // LINE Official Account user ID for receiving emergency notifications
      regionId: varchar("region_id").notNull().references(() => regions.id),
      is24Hour: boolean("is_24_hour").notNull().default(false),
      isAvailable: boolean("is_available").notNull().default(true),
      // Real-time availability toggle
      isSupportHospital: boolean("is_support_hospital").notNull().default(false),
      // Official PetSOS support partner
      latitude: decimal("latitude"),
      longitude: decimal("longitude"),
      location: geography("location"),
      // PostGIS geography point for efficient spatial queries
      status: text("status").notNull().default("active"),
      // active, inactive, deleted
      services: text("services").array(),
      ownerVerificationCode: text("owner_verification_code"),
      // 6-digit passcode for clinic owner edit link
      ownerVerificationCodeExpiresAt: timestamp("owner_verification_code_expires_at"),
      // When the code expires
      averageRating: decimal("average_rating"),
      // Calculated average of approved reviews (1-5)
      reviewCount: integer("review_count").notNull().default(0),
      // Total number of approved reviews
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertClinicSchema = createInsertSchema(clinics).omit({
      id: true,
      location: true,
      createdAt: true
    });
    emergencyRequests = pgTable("emergency_requests", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
      petId: varchar("pet_id").references(() => pets.id, { onDelete: "set null" }),
      symptom: text("symptom").notNull(),
      // single symptom field - required
      locationLatitude: decimal("location_latitude"),
      locationLongitude: decimal("location_longitude"),
      manualLocation: text("manual_location"),
      contactName: text("contact_name").notNull(),
      contactPhone: text("contact_phone").notNull(),
      status: text("status").notNull().default("pending"),
      // pending, in_progress, completed, cancelled
      regionId: varchar("region_id").references(() => regions.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      petSpecies: text("pet_species"),
      petBreed: text("pet_breed"),
      petAge: integer("pet_age"),
      // integer to match database
      voiceTranscript: text("voice_transcript"),
      aiAnalyzedSymptoms: text("ai_analyzed_symptoms"),
      isVoiceRecording: boolean("is_voice_recording").notNull().default(false)
    });
    insertEmergencyRequestSchema = createInsertSchema(emergencyRequests).omit({
      id: true,
      createdAt: true
    });
    hospitals = pgTable("hospitals", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      slug: text("slug").notNull().unique(),
      nameEn: text("name_en").notNull(),
      nameZh: text("name_zh").notNull(),
      addressEn: text("address_en").notNull(),
      addressZh: text("address_zh").notNull(),
      regionId: varchar("region_id").notNull().references(() => regions.id),
      latitude: decimal("latitude"),
      longitude: decimal("longitude"),
      location: geography("location"),
      // PostGIS geography point
      phone: text("phone"),
      whatsapp: text("whatsapp"),
      email: text("email"),
      websiteUrl: text("website_url"),
      open247: boolean("open_247").notNull().default(true),
      isAvailable: boolean("is_available").notNull().default(true),
      // Admin can disable hospital
      isPartner: boolean("is_partner").notNull().default(false),
      // Official PetSOS partner hospital
      liveStatus: text("live_status"),
      // normal | busy | critical_only
      photos: jsonb("photos"),
      // Array of photo URLs
      lastVerifiedAt: timestamp("last_verified_at"),
      verifiedById: varchar("verified_by_id").references(() => users.id, { onDelete: "set null" }),
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
      oxygenTherapy: boolean("oxygen_therapy"),
      // Oxygen tanks/support
      ventilator: boolean("ventilator"),
      // Ventilator/respirator
      bloodTransfusion: boolean("blood_transfusion"),
      // Blood transfusion capability
      imagingMRI: boolean("imaging_mri"),
      // MRI imaging
      endoscopy: boolean("endoscopy"),
      // Endoscopy services
      dialysis: boolean("dialysis"),
      // Dialysis/renal support
      defibrillator: boolean("defibrillator"),
      // Defibrillator/AED
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
      ownerVerificationCode: text("owner_verification_code"),
      // 6-digit passcode for hospital owner edit link
      ownerVerificationCodeExpiresAt: timestamp("owner_verification_code_expires_at"),
      // When the code expires
      verified: boolean("verified").notNull().default(false),
      // ========== DEEP DATA FIELDS FOR GEO & SEARCH ==========
      // 1. Blood Bank Details
      bloodBankCanine: boolean("blood_bank_canine"),
      // On-site canine blood stock
      bloodBankFeline: boolean("blood_bank_feline"),
      // On-site feline blood stock
      bloodTypesAvailable: text("blood_types_available").array(),
      // e.g., ["DEA 1.1+", "DEA 1.1-", "Type A", "Type B"]
      // 2. Emergency Fee Structure
      consultFeeDay: integer("consult_fee_day"),
      // Daytime consultation fee ($)
      consultFeeEvening: integer("consult_fee_evening"),
      // Evening consultation fee ($)
      consultFeeMidnight: integer("consult_fee_midnight"),
      // Midnight/late night fee ($)
      eveningSurchargeStart: text("evening_surcharge_start"),
      // e.g., "18:00"
      midnightSurchargeStart: text("midnight_surcharge_start"),
      // e.g., "00:00"
      holidaySurchargePercent: integer("holiday_surcharge_percent"),
      // e.g., 50 for 50%
      // 3. ICU/Oxygen Capacity
      oxygenCageCount: integer("oxygen_cage_count"),
      // Number of oxygen cages
      icuBedCount: integer("icu_bed_count"),
      // Number of ICU beds
      icuNurseCount: integer("icu_nurse_count"),
      // ICU-specific nurse count
      overnightVetNurseRatio: text("overnight_vet_nurse_ratio"),
      // e.g., "1:3"
      // 4. Exotic Species Support
      exoticVet247: boolean("exotic_vet_247"),
      // Specialized exotic vet on-site 24/7
      exoticSpecies247: text("exotic_species_247").array(),
      // Species seen 24/7: ["rabbit", "bird", "reptile", "small_mammal"]
      // 5. Advanced Imaging Details
      imagingTech247: boolean("imaging_tech_247"),
      // 24/7 imaging technician available
      ctScanOnSite: boolean("ct_scan_on_site"),
      // On-site CT (vs. mobile/referral)
      mriOnSite: boolean("mri_on_site"),
      // On-site MRI (vs. referral)
      // 6. Toxin/Antidote Readiness
      antivenomStock: boolean("antivenom_stock"),
      // Snake antivenom available
      ratPoisonAntidote: boolean("rat_poison_antidote"),
      // Vitamin K / rat poison antidote
      gastricLavageKit: boolean("gastric_lavage_kit"),
      // Stomach pump equipment
      activatedCharcoal: boolean("activated_charcoal"),
      // Activated charcoal for poisoning
      // 7. Surgical Readiness Details
      surgeon247: text("surgeon_247"),
      // "on_site" | "on_call" | "referral_only"
      surgeonCalloutTime: text("surgeon_callout_time"),
      // e.g., "30 mins"
      // 8. In-Patient Quality
      cctvMonitoring: boolean("cctv_monitoring"),
      // Remote CCTV monitoring for owners
      visitationHours: text("visitation_hours"),
      // e.g., "10:00-20:00" or "24h"
      // 9. Panic Logistics
      emergencyEntranceEn: text("emergency_entrance_en"),
      // e.g., "Side door on Smith St"
      emergencyEntranceZh: text("emergency_entrance_zh"),
      parkingDetailsEn: text("parking_details_en"),
      // e.g., "Free 30-min parking at ABC Lot"
      parkingDetailsZh: text("parking_details_zh"),
      taxiDropoffEn: text("taxi_dropoff_en"),
      // e.g., "Ask for Happy Valley Road entrance"
      taxiDropoffZh: text("taxi_dropoff_zh"),
      // 10. Typhoon/Holiday Policies
      openT8: boolean("open_t8"),
      // Open during Typhoon Signal 8
      openT10: boolean("open_t10"),
      // Open during Typhoon Signal 10
      openBlackRainstorm: boolean("open_black_rainstorm"),
      // Open during Black Rainstorm
      lunarNewYearOpen: boolean("lunar_new_year_open"),
      // Open during Lunar New Year
      lunarNewYearSurcharge: integer("lunar_new_year_surcharge"),
      // Surcharge % during CNY
      christmasOpen: boolean("christmas_open"),
      // Open during Christmas
      // Self-service portal fields
      accessCode: varchar("access_code", { length: 8 }).unique(),
      // 8-character unique code for hospital self-service
      lastConfirmedAt: timestamp("last_confirmed_at"),
      // When hospital last confirmed their info is correct
      confirmedByName: text("confirmed_by_name"),
      // Name of person who confirmed the info
      inviteSentAt: timestamp("invite_sent_at"),
      // When WhatsApp invitation was last sent
      // 11. Data Source & Confidence (for transparency + legal safety)
      feeSource: text("fee_source"),
      // self_reported | verified_call | website | unknown
      waitTimeSource: text("wait_time_source"),
      // self_reported | verified_call | website | unknown
      statusSource: text("status_source"),
      // self_reported | verified_call | website | unknown
      dataConfidenceScore: integer("data_confidence_score"),
      // 0-100 confidence score
      // 12. Responsiveness Tracking (for GEO moat)
      lastReplyAt: timestamp("last_reply_at"),
      // Last time hospital responded to any communication
      replyChannel: text("reply_channel"),
      // whatsapp | api | manual
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => [
      index("idx_hospital_location").using("gist", table.location),
      index("idx_hospital_region").on(table.regionId),
      uniqueIndex("idx_hospital_access_code").on(table.accessCode)
    ]);
    insertHospitalSchema = createInsertSchema(hospitals).omit({
      id: true,
      location: true,
      // Auto-populated from lat/lng
      createdAt: true,
      updatedAt: true
    });
    hospitalChangeLogs = pgTable("hospital_change_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      hospitalId: varchar("hospital_id").notNull().references(() => hospitals.id, { onDelete: "cascade" }),
      fieldName: text("field_name").notNull(),
      // The field that was changed (e.g., "phone", "open247")
      oldValue: text("old_value"),
      // Previous value (stringified)
      newValue: text("new_value"),
      // New value (stringified)
      changedBy: text("changed_by"),
      // Name of person who made the change
      changeSource: text("change_source").notNull(),
      // "access_code" | "verification_code" | "admin" | "api"
      changeType: text("change_type").notNull().default("update"),
      // "update" | "confirm" | "status_change"
      ipAddress: text("ip_address"),
      // Optional IP for audit
      userAgent: text("user_agent"),
      // Optional user agent for audit
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => [
      index("idx_hospital_change_log_hospital").on(table.hospitalId),
      index("idx_hospital_change_log_created").on(table.createdAt)
    ]);
    insertHospitalChangeLogSchema = createInsertSchema(hospitalChangeLogs).omit({
      id: true,
      createdAt: true
    });
    messages = pgTable("messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      emergencyRequestId: varchar("emergency_request_id").notNull().references(() => emergencyRequests.id, { onDelete: "cascade" }),
      hospitalId: varchar("hospital_id").notNull().references(() => hospitals.id, { onDelete: "cascade" }),
      messageType: text("message_type").notNull(),
      // whatsapp, email, line
      recipient: text("recipient").notNull(),
      content: text("content").notNull(),
      status: text("status").notNull().default("queued"),
      // queued, in_progress, sent, delivered, read, failed
      whatsappMessageId: text("whatsapp_message_id"),
      // Meta's wamid for tracking delivery status
      templateName: text("template_name"),
      // WhatsApp template name (persisted at queue time)
      templateVariables: jsonb("template_variables").$type(),
      // Template variables (persisted at queue time)
      templateLanguage: text("template_language"),
      // Template language code (en, zh_HK)
      sentAt: timestamp("sent_at"),
      deliveredAt: timestamp("delivered_at"),
      readAt: timestamp("read_at"),
      // When recipient opened/read the message
      failedAt: timestamp("failed_at"),
      errorMessage: text("error_message"),
      retryCount: integer("retry_count").notNull().default(0),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertMessageSchema = createInsertSchema(messages).omit({
      id: true,
      createdAt: true
    });
    featureFlags = pgTable("feature_flags", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      key: text("key").notNull().unique(),
      enabled: boolean("enabled").notNull().default(false),
      value: jsonb("value"),
      description: text("description"),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
      id: true,
      updatedAt: true
    });
    auditLogs = pgTable("audit_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      entityType: text("entity_type").notNull(),
      entityId: text("entity_id").notNull(),
      action: text("action").notNull(),
      // create, update, delete, generate_code, broadcast_offer
      userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
      changes: jsonb("changes"),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertAuditLogSchema = createInsertSchema(auditLogs).omit({
      id: true,
      createdAt: true
    });
    privacyConsents = pgTable("privacy_consents", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      consentType: text("consent_type").notNull(),
      // marketing, analytics, data_sharing
      accepted: boolean("accepted").notNull(),
      consentedAt: timestamp("consented_at").notNull().defaultNow()
    });
    insertPrivacyConsentSchema = createInsertSchema(privacyConsents).omit({
      id: true,
      consentedAt: true
    });
    translations = pgTable("translations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      key: text("key").notNull(),
      // e.g., "common.emergency_alert"
      language: text("language").notNull(),
      // e.g., "en", "zh-HK"
      value: text("value").notNull(),
      namespace: text("namespace").notNull().default("common"),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    insertTranslationSchema = createInsertSchema(translations).omit({
      id: true,
      updatedAt: true
    });
    hospitalConsultFees = pgTable("hospital_consult_fees", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      hospitalId: varchar("hospital_id").notNull().references(() => hospitals.id, { onDelete: "cascade" }),
      feeType: text("fee_type").notNull(),
      // day | evening | night_ph
      species: text("species").notNull(),
      // dog | cat | exotic
      minFee: decimal("min_fee"),
      maxFee: decimal("max_fee"),
      currency: text("currency").notNull().default("HKD"),
      notes: text("notes"),
      lastUpdated: timestamp("last_updated").notNull().defaultNow()
    }, (table) => [
      index("idx_consult_fees_hospital").on(table.hospitalId),
      uniqueIndex("idx_consult_fees_unique").on(table.hospitalId, table.feeType, table.species)
    ]);
    insertHospitalConsultFeeSchema = createInsertSchema(hospitalConsultFees).omit({
      id: true
    });
    hospitalUpdates = pgTable("hospital_updates", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      hospitalId: varchar("hospital_id").notNull().references(() => hospitals.id, { onDelete: "cascade" }),
      submittedById: varchar("submitted_by_id").references(() => users.id, { onDelete: "set null" }),
      updateType: text("update_type").notNull(),
      // info_correction | fee_update | service_update
      fieldName: text("field_name"),
      oldValue: text("old_value"),
      newValue: text("new_value"),
      status: text("status").notNull().default("pending"),
      // pending | approved | rejected
      reviewedById: varchar("reviewed_by_id").references(() => users.id, { onDelete: "set null" }),
      reviewedAt: timestamp("reviewed_at"),
      notes: text("notes"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => [
      index("idx_hospital_updates_hospital").on(table.hospitalId)
    ]);
    insertHospitalUpdateSchema = createInsertSchema(hospitalUpdates).omit({
      id: true,
      createdAt: true
    });
    petMedicalRecords = pgTable("pet_medical_records", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      petId: varchar("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
      userId: varchar("user_id").notNull().references(() => users.id),
      // uploader, for ownership
      documentType: text("document_type").notNull(),
      // blood_test, xray, vaccination, surgery_report, prescription, other
      title: text("title").notNull(),
      // user-provided title like "Blood Test Dec 2024"
      description: text("description"),
      // optional notes
      filePath: text("file_path").notNull(),
      // object storage path
      fileSize: integer("file_size").notNull(),
      // in bytes
      mimeType: text("mime_type").notNull(),
      // application/pdf, image/jpeg, etc.
      isConfidential: boolean("is_confidential").notNull().default(false),
      // if true, requires explicit sharing consent
      uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
      expiresAt: timestamp("expires_at")
      // optional, for time-limited documents
    }, (table) => [
      index("idx_pet_medical_records_pet").on(table.petId),
      index("idx_pet_medical_records_user").on(table.userId)
    ]);
    insertPetMedicalRecordSchema = createInsertSchema(petMedicalRecords).omit({
      id: true,
      uploadedAt: true
    });
    petMedicalSharingConsents = pgTable("pet_medical_sharing_consents", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      petId: varchar("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      consentType: text("consent_type").notNull(),
      // emergency_broadcast, hospital_view
      enabled: boolean("enabled").notNull().default(false),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => [
      index("idx_pet_medical_sharing_consent_pet").on(table.petId),
      index("idx_pet_medical_sharing_consent_user").on(table.userId)
    ]);
    insertPetMedicalSharingConsentSchema = createInsertSchema(petMedicalSharingConsents).omit({
      id: true,
      updatedAt: true
    });
    pushSubscriptions = pgTable("push_subscriptions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
      token: text("token").notNull().unique(),
      // FCM device token
      provider: text("provider").notNull().default("fcm"),
      // fcm, onesignal (for migration)
      platform: text("platform").notNull(),
      // web, ios, android
      browserInfo: text("browser_info"),
      language: text("language").default("en"),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      lastActiveAt: timestamp("last_active_at").notNull().defaultNow()
    }, (table) => [
      index("idx_push_subscriptions_user").on(table.userId),
      index("idx_push_subscriptions_token").on(table.token)
    ]);
    insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
      id: true,
      createdAt: true,
      lastActiveAt: true
    });
    notificationBroadcasts = pgTable("notification_broadcasts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      adminId: varchar("admin_id").notNull().references(() => users.id),
      title: text("title").notNull(),
      message: text("message").notNull(),
      targetLanguage: text("target_language"),
      // null = all, 'en', 'zh-HK'
      targetAudience: text("target_audience").notNull().default("all"),
      // all, subscribed_users
      targetRole: text("target_role"),
      // null = all, 'pet_owner', 'hospital_clinic'
      url: text("url"),
      // click-through URL
      recipientCount: integer("recipient_count"),
      status: text("status").notNull().default("pending"),
      // pending, scheduled, sent, failed, cancelled
      scheduledFor: timestamp("scheduled_for"),
      // null = immediate, otherwise the scheduled time
      providerResponse: jsonb("provider_response"),
      // FCM or other provider response data
      createdAt: timestamp("created_at").notNull().defaultNow(),
      sentAt: timestamp("sent_at")
    }, (table) => [
      index("idx_notification_broadcasts_admin").on(table.adminId),
      index("idx_notification_broadcasts_status").on(table.status),
      index("idx_notification_broadcasts_scheduled").on(table.scheduledFor)
    ]);
    insertNotificationBroadcastSchema = createInsertSchema(notificationBroadcasts).omit({
      id: true,
      createdAt: true,
      sentAt: true,
      recipientCount: true,
      providerResponse: true
    });
    clinicReviews = pgTable("clinic_reviews", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      clinicId: varchar("clinic_id").notNull().references(() => clinics.id, { onDelete: "cascade" }),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      rating: integer("rating").notNull(),
      // 1-5 stars
      reviewText: text("review_text"),
      // Optional comment
      status: text("status").notNull().default("pending"),
      // pending, approved, rejected
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => [
      index("idx_clinic_reviews_clinic").on(table.clinicId),
      index("idx_clinic_reviews_user").on(table.userId),
      index("idx_clinic_reviews_status").on(table.status)
    ]);
    insertClinicReviewSchema = createInsertSchema(clinicReviews).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      rating: z.number().min(1).max(5)
    });
    whatsappConversations = pgTable("whatsapp_conversations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      hospitalId: varchar("hospital_id").references(() => hospitals.id, { onDelete: "set null" }),
      phoneNumber: text("phone_number").notNull(),
      // Sanitized WhatsApp number (digits only)
      displayName: text("display_name"),
      // Hospital name or WhatsApp profile name
      lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
      lastMessagePreview: text("last_message_preview"),
      // First 100 chars of last message
      unreadCount: integer("unread_count").notNull().default(0),
      isArchived: boolean("is_archived").notNull().default(false),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => [
      index("idx_whatsapp_conversations_phone").on(table.phoneNumber),
      index("idx_whatsapp_conversations_hospital").on(table.hospitalId),
      index("idx_whatsapp_conversations_last_message").on(table.lastMessageAt)
    ]);
    insertWhatsappConversationSchema = createInsertSchema(whatsappConversations).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    whatsappChatMessages = pgTable("whatsapp_chat_messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      conversationId: varchar("conversation_id").notNull().references(() => whatsappConversations.id, { onDelete: "cascade" }),
      direction: text("direction").notNull(),
      // 'inbound' (from hospital) or 'outbound' (from PetSOS)
      content: text("content").notNull(),
      messageType: text("message_type").notNull().default("text"),
      // text, image, document, audio, video
      mediaUrl: text("media_url"),
      // URL for media messages
      whatsappMessageId: text("whatsapp_message_id"),
      // Meta's wamid for tracking
      status: text("status").notNull().default("sent"),
      // sent, delivered, read, failed (for outbound)
      sentAt: timestamp("sent_at"),
      deliveredAt: timestamp("delivered_at"),
      readAt: timestamp("read_at"),
      errorMessage: text("error_message"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => [
      index("idx_whatsapp_chat_messages_conversation").on(table.conversationId),
      index("idx_whatsapp_chat_messages_created").on(table.createdAt),
      index("idx_whatsapp_chat_messages_whatsapp_id").on(table.whatsappMessageId)
    ]);
    insertWhatsappChatMessageSchema = createInsertSchema(whatsappChatMessages).omit({
      id: true,
      createdAt: true
    });
    typhoonAlerts = pgTable("typhoon_alerts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      signalCode: text("signal_code").notNull(),
      // T1, T3, T8NW, T8NE, T8SW, T8SE, T9, T10
      signalNameEn: text("signal_name_en").notNull(),
      signalNameZh: text("signal_name_zh").notNull(),
      issuedAt: timestamp("issued_at").notNull(),
      liftedAt: timestamp("lifted_at"),
      isActive: boolean("is_active").notNull().default(true),
      observatoryBulletinId: text("observatory_bulletin_id"),
      // HKO bulletin reference
      severityLevel: integer("severity_level").notNull(),
      // 1-10 based on signal
      notes: text("notes"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => [
      index("idx_typhoon_alerts_active").on(table.isActive),
      index("idx_typhoon_alerts_issued").on(table.issuedAt)
    ]);
    insertTyphoonAlertSchema = createInsertSchema(typhoonAlerts).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    hkHolidays = pgTable("hk_holidays", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      date: timestamp("date").notNull(),
      nameEn: text("name_en").notNull(),
      nameZh: text("name_zh").notNull(),
      holidayType: text("holiday_type").notNull(),
      // public, bank, special
      year: integer("year").notNull(),
      isGazetted: boolean("is_gazetted").notNull().default(true),
      notes: text("notes")
    }, (table) => [
      index("idx_hk_holidays_date").on(table.date),
      index("idx_hk_holidays_year").on(table.year),
      uniqueIndex("idx_hk_holidays_unique").on(table.date, table.nameEn)
    ]);
    insertHkHolidaySchema = createInsertSchema(hkHolidays).omit({
      id: true
    });
    hospitalEmergencyStatus = pgTable("hospital_emergency_status", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      hospitalId: varchar("hospital_id").notNull().references(() => hospitals.id, { onDelete: "cascade" }),
      statusType: text("status_type").notNull(),
      // typhoon, holiday, special
      referenceId: varchar("reference_id"),
      // typhoon_alert ID or hk_holiday ID
      isOpen: boolean("is_open").notNull(),
      openingTime: text("opening_time"),
      // e.g., "09:00"
      closingTime: text("closing_time"),
      // e.g., "18:00"
      confirmedAt: timestamp("confirmed_at").notNull().defaultNow(),
      confirmedBy: varchar("confirmed_by").references(() => users.id, { onDelete: "set null" }),
      confirmationMethod: text("confirmation_method"),
      // phone_call, whatsapp, self_report, auto
      notes: text("notes"),
      expiresAt: timestamp("expires_at"),
      // when this status should be considered stale
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => [
      index("idx_hospital_emergency_status_hospital").on(table.hospitalId),
      index("idx_hospital_emergency_status_type").on(table.statusType),
      index("idx_hospital_emergency_status_reference").on(table.referenceId)
    ]);
    insertHospitalEmergencyStatusSchema = createInsertSchema(hospitalEmergencyStatus).omit({
      id: true,
      createdAt: true
    });
    typhoonNotificationQueue = pgTable("typhoon_notification_queue", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      typhoonAlertId: varchar("typhoon_alert_id").references(() => typhoonAlerts.id, { onDelete: "cascade" }),
      holidayId: varchar("holiday_id").references(() => hkHolidays.id, { onDelete: "cascade" }),
      notificationType: text("notification_type").notNull(),
      // typhoon_warning, holiday_reminder, status_update
      targetAudience: text("target_audience").notNull(),
      // all_users, subscribed, hospitals
      channel: text("channel").notNull(),
      // push, email, whatsapp
      titleEn: text("title_en").notNull(),
      titleZh: text("title_zh").notNull(),
      bodyEn: text("body_en").notNull(),
      bodyZh: text("body_zh").notNull(),
      status: text("status").notNull().default("pending"),
      // pending, sending, sent, failed
      retryCount: integer("retry_count").notNull().default(0),
      scheduledFor: timestamp("scheduled_for"),
      sentAt: timestamp("sent_at"),
      recipientCount: integer("recipient_count"),
      errorMessage: text("error_message"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => [
      index("idx_typhoon_notification_queue_status").on(table.status),
      index("idx_typhoon_notification_queue_scheduled").on(table.scheduledFor)
    ]);
    insertTyphoonNotificationQueueSchema = createInsertSchema(typhoonNotificationQueue).omit({
      id: true,
      createdAt: true,
      sentAt: true,
      recipientCount: true
    });
    userEmergencySubscriptions = pgTable("user_emergency_subscriptions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
      email: text("email"),
      phone: text("phone"),
      pushToken: text("push_token"),
      // FCM token for anonymous users
      subscriptionType: text("subscription_type").notNull(),
      // typhoon, holiday, all
      notifyChannels: text("notify_channels").array().notNull().default(sql`ARRAY['push']::text[]`),
      // push, email, sms
      preferredLanguage: text("preferred_language").notNull().default("en"),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => [
      index("idx_user_emergency_subscriptions_user").on(table.userId),
      index("idx_user_emergency_subscriptions_active").on(table.isActive)
    ]);
    insertUserEmergencySubscriptionSchema = createInsertSchema(userEmergencySubscriptions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    vetConsultants = pgTable("vet_consultants", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      // Core identity
      fullName: text("full_name").notNull(),
      // Primary name field
      nameEn: text("name_en"),
      // Legacy - for backward compatibility
      nameZh: text("name_zh"),
      // Role & type (per spec)
      role: text("role").notNull().default("vet"),
      // vet, nurse, practice_manager, other
      vetType: text("vet_type"),
      // GP, Specialist, GP_with_interest (only if role=vet)
      // Professional info
      clinicName: text("clinic_name"),
      // Primary clinic / organisation
      educationBackground: text("education_background"),
      // Free text: BVSc / DVM / VN Diploma / FANZCVS
      specialtyOrInterest: text("specialty_or_interest"),
      // Optional specialty or special interest
      // Legacy fields (kept for backward compatibility)
      titleEn: text("title_en"),
      // Legacy credential field
      titleZh: text("title_zh"),
      specialtyEn: text("specialty_en"),
      // Legacy specialty field
      specialtyZh: text("specialty_zh"),
      bioEn: text("bio_en"),
      bioZh: text("bio_zh"),
      photoUrl: text("photo_url"),
      licenseNumber: text("license_number"),
      // Optional - not displayed publicly per GEO guidelines
      hospitalAffiliationEn: text("hospital_affiliation_en"),
      // Legacy
      hospitalAffiliationZh: text("hospital_affiliation_zh"),
      // Legacy
      yearsExperience: integer("years_experience"),
      // Visibility & privacy (per spec - NO contact info stored)
      visibilityPreference: text("visibility_preference").notNull().default("name_role"),
      // name_role, clinic_only, anonymous
      internalNotes: text("internal_notes"),
      // Admin-only notes
      // Status
      isActive: boolean("is_active").notNull().default(true),
      isPublic: boolean("is_public").notNull().default(true),
      joinedAt: timestamp("joined_at").notNull().defaultNow(),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => [
      index("idx_vet_consultants_active").on(table.isActive),
      index("idx_vet_consultants_public").on(table.isPublic),
      index("idx_vet_consultants_role").on(table.role)
    ]);
    insertVetConsultantSchema = createInsertSchema(vetConsultants).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    verifiedContentItems = pgTable("verified_content_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      contentType: text("content_type").notNull(),
      // emergency_symptom, blog, guide, faq
      contentSlug: text("content_slug").notNull().unique(),
      // e.g., "cat-panting", "dog-bloat"
      titleEn: text("title_en").notNull(),
      titleZh: text("title_zh"),
      descriptionEn: text("description_en"),
      descriptionZh: text("description_zh"),
      url: text("url"),
      // relative URL path, e.g., "/emergency-symptoms#cat-panting"
      isPublished: boolean("is_published").notNull().default(true),
      publishedAt: timestamp("published_at"),
      lastUpdatedAt: timestamp("last_updated_at").notNull().defaultNow(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => [
      index("idx_verified_content_type").on(table.contentType),
      index("idx_verified_content_slug").on(table.contentSlug),
      index("idx_verified_content_published").on(table.isPublished)
    ]);
    insertVerifiedContentItemSchema = createInsertSchema(verifiedContentItems).omit({
      id: true,
      createdAt: true
    });
    contentVerifications = pgTable("content_verifications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      consultantId: varchar("consultant_id").notNull().references(() => vetConsultants.id, { onDelete: "cascade" }),
      contentId: varchar("content_id").notNull().references(() => verifiedContentItems.id, { onDelete: "cascade" }),
      // Verification scope per spec: what aspect was verified
      verificationScope: text("verification_scope").notNull().default("clarity"),
      // clarity, safety, triage_language
      verifiedAt: timestamp("verified_at").notNull().defaultNow(),
      verificationNotes: text("verification_notes"),
      adminNote: text("admin_note"),
      // Admin-only note about this verification
      isVisible: boolean("is_visible").notNull().default(true),
      // show this verification publicly
      contentVersion: text("content_version"),
      // track which version was verified
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => [
      index("idx_content_verifications_consultant").on(table.consultantId),
      index("idx_content_verifications_content").on(table.contentId),
      uniqueIndex("idx_content_verifications_unique").on(table.consultantId, table.contentId)
    ]);
    insertContentVerificationSchema = createInsertSchema(contentVerifications).omit({
      id: true,
      createdAt: true
    });
    vetApplications = pgTable("vet_applications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      // SECTION A - Professional Snapshot (per spec)
      fullName: text("full_name").notNull(),
      // Required
      role: text("role").notNull(),
      // vet, nurse, practice_manager, other
      vetType: text("vet_type"),
      // GP, Specialist, GP_with_interest (only if role=vet)
      clinicName: text("clinic_name").notNull(),
      // Primary Clinic / Organisation
      phoneWhatsapp: text("phone_whatsapp").notNull(),
      // Private - admin only
      email: text("email"),
      // Optional email
      // SECTION B - Background
      educationBackground: text("education_background"),
      // Free text: BVSc / DVM / VN Diploma
      // SECTION C - Verification Scope (stored as JSON array)
      verificationScope: text("verification_scope").array(),
      // clarity, emergency_discovery, safety_messaging
      // SECTION D - Future Involvement (stored as JSON array)
      futureContactInterest: text("future_contact_interest").array(),
      // reviewing_guides, cpd_sessions, workshops, videos, community_education
      // SECTION E - Additional
      additionalComments: text("additional_comments"),
      // Optional free text
      // Consent tracking (per spec)
      consentAcknowledged: boolean("consent_acknowledged").notNull().default(false),
      consentVersion: text("consent_version").notNull().default("v1"),
      // Legacy fields (kept for backward compatibility)
      nameEn: text("name_en"),
      // Legacy
      nameZh: text("name_zh"),
      // Legacy
      phone: text("phone"),
      // Legacy
      licenseNumber: text("license_number"),
      // Legacy
      titleEn: text("title_en"),
      // Legacy
      titleZh: text("title_zh"),
      // Legacy
      specialtyEn: text("specialty_en"),
      // Legacy
      specialtyZh: text("specialty_zh"),
      // Legacy
      hospitalAffiliationEn: text("hospital_affiliation_en"),
      // Legacy
      hospitalAffiliationZh: text("hospital_affiliation_zh"),
      // Legacy
      yearsExperience: integer("years_experience"),
      // Legacy
      motivationEn: text("motivation_en"),
      // Legacy
      motivationZh: text("motivation_zh"),
      // Legacy
      cvUrl: text("cv_url"),
      // Legacy
      // Status tracking
      status: text("status").notNull().default("pending"),
      // pending, approved, rejected
      reviewedBy: varchar("reviewed_by").references(() => users.id, { onDelete: "set null" }),
      reviewedAt: timestamp("reviewed_at"),
      reviewNotes: text("review_notes"),
      createdConsultantId: varchar("created_consultant_id").references(() => vetConsultants.id, { onDelete: "set null" }),
      submittedAt: timestamp("submitted_at").notNull().defaultNow(),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => [
      index("idx_vet_applications_status").on(table.status),
      index("idx_vet_applications_role").on(table.role)
    ]);
    insertVetApplicationSchema = createInsertSchema(vetApplications).omit({
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
      cvUrl: true
    });
    hospitalPingState = pgTable("hospital_ping_state", {
      hospitalId: varchar("hospital_id").primaryKey().references(() => hospitals.id, { onDelete: "cascade" }),
      pingEnabled: boolean("ping_enabled").notNull().default(true),
      pingStatus: text("ping_status").notNull().default("active"),
      // active, no_reply, paused
      lastPingSentAt: timestamp("last_ping_sent_at"),
      lastPingMessageId: text("last_ping_message_id"),
      lastInboundReplyAt: timestamp("last_inbound_reply_at"),
      lastReplyLatencySeconds: integer("last_reply_latency_seconds"),
      noReplySince: timestamp("no_reply_since"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    insertHospitalPingStateSchema = createInsertSchema(hospitalPingState).omit({
      createdAt: true,
      updatedAt: true
    });
    hospitalPingLogs = pgTable("hospital_ping_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      hospitalId: varchar("hospital_id").notNull().references(() => hospitals.id, { onDelete: "cascade" }),
      direction: text("direction").notNull(),
      // outbound, inbound
      providerMessageId: text("provider_message_id"),
      eventType: text("event_type").notNull(),
      // ping_sent, reply_received, no_reply_marked
      sentAt: timestamp("sent_at"),
      receivedAt: timestamp("received_at"),
      payload: jsonb("payload"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => [
      index("idx_ping_logs_hospital").on(table.hospitalId),
      index("idx_ping_logs_created").on(table.createdAt)
    ]);
    insertHospitalPingLogSchema = createInsertSchema(hospitalPingLogs).omit({
      id: true,
      createdAt: true
    });
    hospitalEmergencyResponses = pgTable("hospital_emergency_responses", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      emergencyRequestId: varchar("emergency_request_id").notNull().references(() => emergencyRequests.id, { onDelete: "cascade" }),
      hospitalId: varchar("hospital_id").notNull().references(() => hospitals.id, { onDelete: "cascade" }),
      message: text("message").notNull(),
      responseType: varchar("response_type", { length: 32 }).default("other"),
      // 'can_accept' | 'full' | 'call_requested' | 'other'
      respondedAt: timestamp("responded_at").notNull().defaultNow(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => [
      index("idx_emergency_responses_request").on(table.emergencyRequestId),
      index("idx_emergency_responses_hospital").on(table.hospitalId)
    ]);
    insertHospitalEmergencyResponseSchema = createInsertSchema(hospitalEmergencyResponses).omit({
      id: true,
      createdAt: true
    });
  }
});

// server/db.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set");
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// server/gmail-client.ts
var gmail_client_exports = {};
__export(gmail_client_exports, {
  getUncachableGmailClient: () => getUncachableGmailClient,
  sendGmailEmail: () => sendGmailEmail
});
import { google } from "googleapis";
async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }
  connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=google-mail",
    {
      headers: {
        "Accept": "application/json",
        "X_REPLIT_TOKEN": xReplitToken
      }
    }
  ).then((res) => res.json()).then((data) => data.items?.[0]);
  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
  if (!connectionSettings || !accessToken) {
    throw new Error("Gmail not connected");
  }
  return accessToken;
}
async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });
  return google.gmail({ version: "v1", auth: oauth2Client });
}
async function sendGmailEmail(to, subject, content, from) {
  try {
    const gmail = await getUncachableGmailClient();
    const emailContent = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "",
      content
    ].join("\n");
    const encodedMessage = Buffer.from(emailContent).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage
      }
    });
    console.log("[GMAIL] Email sent successfully to:", to);
    return true;
  } catch (error) {
    console.error("[GMAIL] Error sending email:", error);
    return false;
  }
}
var connectionSettings;
var init_gmail_client = __esm({
  "server/gmail-client.ts"() {
    "use strict";
  }
});

// server/services/daily-report.ts
var daily_report_exports = {};
__export(daily_report_exports, {
  sendDailyReport: () => sendDailyReport,
  startDailyReportScheduler: () => startDailyReportScheduler,
  stopDailyReportScheduler: () => stopDailyReportScheduler
});
import { sql as sql3, and as and2, gte as gte2, lt, eq as eq2, count as count2 } from "drizzle-orm";
function getHKTBounds() {
  const now = Date.now();
  const hktNow = now + HKT_OFFSET_MS;
  const hktMidnightToday = Math.floor(hktNow / 864e5) * 864e5;
  const hktMidnightYesterday = hktMidnightToday - 864e5;
  const h8 = 8 * 36e5;
  const utcStart = hktMidnightYesterday - HKT_OFFSET_MS;
  const utcEnd = hktMidnightToday - HKT_OFFSET_MS;
  const dateStr = new Date(utcStart + HKT_OFFSET_MS).toISOString().slice(0, 10);
  return {
    date: dateStr,
    start: new Date(utcStart),
    end: new Date(utcEnd),
    sections: [
      { label: "00:00\u201308:00", icon: "\u{1F319}", desc: "Overnight", from: new Date(utcStart), to: new Date(utcStart + h8) },
      { label: "08:00\u201316:00", icon: "\u2600\uFE0F", desc: "Daytime", from: new Date(utcStart + h8), to: new Date(utcStart + 2 * h8) },
      { label: "16:00\u201324:00", icon: "\u{1F306}", desc: "Evening", from: new Date(utcStart + 2 * h8), to: new Date(utcEnd) }
    ]
  };
}
function formatHKT(date) {
  return new Intl.DateTimeFormat("en-HK", {
    timeZone: "Asia/Hong_Kong",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}
async function fetchCasesInRange(from, to) {
  return db.select({
    id: emergencyRequests.id,
    createdAt: emergencyRequests.createdAt,
    symptom: emergencyRequests.symptom,
    aiAnalyzedSymptoms: emergencyRequests.aiAnalyzedSymptoms,
    manualLocation: emergencyRequests.manualLocation,
    locationLatitude: emergencyRequests.locationLatitude,
    locationLongitude: emergencyRequests.locationLongitude,
    regionId: emergencyRequests.regionId,
    contactName: emergencyRequests.contactName,
    contactPhone: emergencyRequests.contactPhone,
    petSpecies: emergencyRequests.petSpecies,
    petBreed: emergencyRequests.petBreed,
    status: emergencyRequests.status
  }).from(emergencyRequests).where(and2(gte2(emergencyRequests.createdAt, from), lt(emergencyRequests.createdAt, to))).orderBy(emergencyRequests.createdAt);
}
function resolveLocation(c, regionMap) {
  if (c.manualLocation) return c.manualLocation;
  if (c.regionId && regionMap[c.regionId]) return regionMap[c.regionId];
  if (c.locationLatitude && c.locationLongitude)
    return `${parseFloat(c.locationLatitude).toFixed(4)}, ${parseFloat(c.locationLongitude).toFixed(4)}`;
  return "Location not provided";
}
async function gatherStats() {
  const bounds = getHKTBounds();
  const { date, start, end, sections } = bounds;
  const [broadcastTotal] = await db.select({ total: count2() }).from(messages).where(and2(gte2(messages.createdAt, start), lt(messages.createdAt, end)));
  const [broadcastSent] = await db.select({ total: count2() }).from(messages).where(and2(gte2(messages.createdAt, start), lt(messages.createdAt, end), eq2(messages.status, "sent")));
  const [broadcastFailed] = await db.select({ total: count2() }).from(messages).where(and2(gte2(messages.createdAt, start), lt(messages.createdAt, end), eq2(messages.status, "failed")));
  const [replyTotal] = await db.select({ total: count2() }).from(hospitalEmergencyResponses).where(and2(gte2(hospitalEmergencyResponses.createdAt, start), lt(hospitalEmergencyResponses.createdAt, end)));
  const [canAccept] = await db.select({ total: count2() }).from(hospitalEmergencyResponses).where(and2(gte2(hospitalEmergencyResponses.createdAt, start), lt(hospitalEmergencyResponses.createdAt, end), eq2(hospitalEmergencyResponses.responseType, "can_accept")));
  const [full] = await db.select({ total: count2() }).from(hospitalEmergencyResponses).where(and2(gte2(hospitalEmergencyResponses.createdAt, start), lt(hospitalEmergencyResponses.createdAt, end), eq2(hospitalEmergencyResponses.responseType, "full")));
  const [callRequested] = await db.select({ total: count2() }).from(hospitalEmergencyResponses).where(and2(gte2(hospitalEmergencyResponses.createdAt, start), lt(hospitalEmergencyResponses.createdAt, end), eq2(hospitalEmergencyResponses.responseType, "call_requested")));
  const topHospitals = await db.select({ hospitalId: hospitalEmergencyResponses.hospitalId, replies: count2() }).from(hospitalEmergencyResponses).where(and2(gte2(hospitalEmergencyResponses.createdAt, start), lt(hospitalEmergencyResponses.createdAt, end))).groupBy(hospitalEmergencyResponses.hospitalId).orderBy(sql3`count(*) desc`).limit(5);
  const hospitalIds = topHospitals.map((r) => r.hospitalId);
  const hospitalNames = {};
  if (hospitalIds.length > 0) {
    const rows = await db.select({ id: hospitals.id, nameEn: hospitals.nameEn }).from(hospitals).where(sql3`${hospitals.id} = ANY(${hospitalIds})`);
    rows.forEach((r) => {
      hospitalNames[r.id] = r.nameEn;
    });
  }
  const allRegions = await db.select({ id: regions.id, nameEn: regions.nameEn }).from(regions);
  const regionMap = {};
  allRegions.forEach((r) => {
    regionMap[r.id] = r.nameEn;
  });
  const sectionData = await Promise.all(sections.map(async (s) => {
    const cases = await fetchCasesInRange(s.from, s.to);
    return {
      ...s,
      count: cases.length,
      cases: cases.map((c) => ({
        time: formatHKT(c.createdAt),
        pet: [c.petSpecies, c.petBreed].filter(Boolean).join(" \xB7 ") || "Unknown pet",
        symptom: c.aiAnalyzedSymptoms || c.symptom,
        location: resolveLocation(c, regionMap),
        contact: `${c.contactName} ${c.contactPhone}`,
        status: c.status,
        id: c.id
      }))
    };
  }));
  const totalCases = sectionData.reduce((sum, s) => sum + s.count, 0);
  const totalSent = Number(broadcastSent.total);
  const totalReplies = Number(replyTotal.total);
  return {
    date,
    totalCases,
    broadcastsSent: totalSent,
    broadcastsFailed: Number(broadcastFailed.total),
    deliveryRate: Number(broadcastTotal.total) > 0 ? Math.round(totalSent / Number(broadcastTotal.total) * 100) : 0,
    totalReplies,
    canAccept: Number(canAccept.total),
    full: Number(full.total),
    callRequested: Number(callRequested.total),
    responseRate: totalSent > 0 ? Math.round(totalReplies / totalSent * 100) : 0,
    topHospitals: topHospitals.map((r) => ({ name: hospitalNames[r.hospitalId] || r.hospitalId, replies: Number(r.replies) })),
    sections: sectionData
  };
}
function pill(color, text2) {
  return `<span style="display:inline-block;padding:2px 8px;border-radius:12px;background:${color};font-size:11px;font-weight:600;color:#fff">${text2}</span>`;
}
function statusPill(status) {
  const map = {
    pending: ["#f9a825", "Pending"],
    in_progress: ["#1e88e5", "In Progress"],
    completed: ["#43a047", "Completed"],
    cancelled: ["#999", "Cancelled"]
  };
  const [color, label] = map[status] || ["#999", status];
  return pill(color, label);
}
function buildCasesTable(cases) {
  if (cases.length === 0) {
    return `<p style="color:#999;font-size:13px;text-align:center;margin:8px 0">No emergencies in this period</p>`;
  }
  const rows = cases.map((c) => `
    <tr style="border-bottom:1px solid #f0f0f0">
      <td style="padding:8px 10px;font-size:12px;color:#555;white-space:nowrap">${c.time} HKT</td>
      <td style="padding:8px 10px;font-size:12px;color:#333">${c.pet}</td>
      <td style="padding:8px 10px;font-size:12px;color:#333;max-width:160px">${c.symptom.slice(0, 80)}${c.symptom.length > 80 ? "\u2026" : ""}</td>
      <td style="padding:8px 10px;font-size:12px;color:#555">${c.location}</td>
      <td style="padding:8px 10px;font-size:12px;color:#555">${c.contact}</td>
      <td style="padding:8px 10px">${statusPill(c.status)}</td>
    </tr>`).join("");
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:6px;overflow:hidden;font-size:12px">
      <tr style="background:#fafafa">
        <th style="padding:6px 10px;text-align:left;color:#888;font-weight:600">Time</th>
        <th style="padding:6px 10px;text-align:left;color:#888;font-weight:600">Pet</th>
        <th style="padding:6px 10px;text-align:left;color:#888;font-weight:600">Symptoms</th>
        <th style="padding:6px 10px;text-align:left;color:#888;font-weight:600">Location</th>
        <th style="padding:6px 10px;text-align:left;color:#888;font-weight:600">Contact</th>
        <th style="padding:6px 10px;text-align:left;color:#888;font-weight:600">Status</th>
      </tr>
      ${rows}
    </table>`;
}
function buildEmailHtml(stats) {
  const sectionBgColors = ["#f0f4ff", "#fff8e1", "#fce4ec"];
  const sectionBorderColors = ["#3f51b5", "#f9a825", "#e53935"];
  const sectionBlocks = stats.sections.map((s, i) => `
    <tr><td style="padding:20px 32px 0">
      <div style="border-left:4px solid ${sectionBorderColors[i]};padding-left:12px;margin-bottom:12px">
        <h3 style="margin:0;font-size:14px;color:#333">${s.icon} ${s.label} HKT &nbsp;<span style="font-weight:normal;color:#888">${s.desc}</span>
          &nbsp;
          <span style="font-size:20px;font-weight:bold;color:${sectionBorderColors[i]}">${s.count}</span>
          <span style="font-size:12px;color:#999"> case${s.count !== 1 ? "s" : ""}</span>
        </h3>
      </div>
      ${buildCasesTable(s.cases)}
    </td></tr>`).join("");
  const topHospitalsRows = stats.topHospitals.length > 0 ? stats.topHospitals.map((h) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0">${h.name}</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${h.replies}</td></tr>`).join("") : `<tr><td colspan="2" style="padding:8px 12px;color:#999;text-align:center">No replies yesterday</td></tr>`;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>PetSOS Daily Report</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 0">
<tr><td align="center">
<table width="680" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">

  <!-- Header -->
  <tr><td style="background:#e53935;padding:24px 32px">
    <h1 style="margin:0;color:#fff;font-size:22px">\u{1F43E} PetSOS Daily Report</h1>
    <p style="margin:4px 0 0;color:#ffcdd2;font-size:14px">${stats.date} (Hong Kong Time)</p>
  </td></tr>

  <!-- Top stats -->
  <tr><td style="padding:28px 32px 0">
    <h2 style="margin:0 0 14px;font-size:15px;color:#333;border-bottom:2px solid #e53935;padding-bottom:8px">Day Summary</h2>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="text-align:center;padding:14px;background:#fff8f8;border-radius:6px;width:20%">
          <div style="font-size:34px;font-weight:bold;color:#e53935">${stats.totalCases}</div>
          <div style="font-size:11px;color:#666;margin-top:4px">Emergencies</div>
        </td>
        <td style="width:10px"></td>
        <td style="text-align:center;padding:14px;background:#f8fff8;border-radius:6px;width:20%">
          <div style="font-size:34px;font-weight:bold;color:#43a047">${stats.broadcastsSent}</div>
          <div style="font-size:11px;color:#666;margin-top:4px">Broadcasts Sent</div>
        </td>
        <td style="width:10px"></td>
        <td style="text-align:center;padding:14px;background:#f8f8ff;border-radius:6px;width:20%">
          <div style="font-size:34px;font-weight:bold;color:#1e88e5">${stats.deliveryRate}%</div>
          <div style="font-size:11px;color:#666;margin-top:4px">Delivery Rate</div>
        </td>
        <td style="width:10px"></td>
        <td style="text-align:center;padding:14px;background:#f8fff8;border-radius:6px;width:20%">
          <div style="font-size:34px;font-weight:bold;color:#43a047">${stats.canAccept}</div>
          <div style="font-size:11px;color:#666;margin-top:4px">\u2705 Accepted</div>
        </td>
        <td style="width:10px"></td>
        <td style="text-align:center;padding:14px;background:#f5f5f5;border-radius:6px;width:20%">
          <div style="font-size:34px;font-weight:bold;color:#888">${stats.responseRate}%</div>
          <div style="font-size:11px;color:#666;margin-top:4px">Response Rate</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- 8-hour time sections -->
  <tr><td style="padding:24px 32px 0">
    <h2 style="margin:0 0 4px;font-size:15px;color:#333;border-bottom:2px solid #e53935;padding-bottom:8px">Emergencies by Time Period (HKT)</h2>
  </td></tr>
  ${sectionBlocks}

  <!-- Hospital response breakdown -->
  <tr><td style="padding:24px 32px 0">
    <h2 style="margin:0 0 14px;font-size:15px;color:#333;border-bottom:2px solid #e53935;padding-bottom:8px">Hospital Response Breakdown</h2>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="text-align:center;padding:12px;background:#f8fff8;border-radius:6px;width:25%">
          <div style="font-size:26px;font-weight:bold;color:#43a047">${stats.canAccept}</div>
          <div style="font-size:11px;color:#666;margin-top:4px">\u2705 Can Accept</div>
        </td>
        <td style="width:8px"></td>
        <td style="text-align:center;padding:12px;background:#fff8f8;border-radius:6px;width:25%">
          <div style="font-size:26px;font-weight:bold;color:#e53935">${stats.full}</div>
          <div style="font-size:11px;color:#666;margin-top:4px">\u274C Full</div>
        </td>
        <td style="width:8px"></td>
        <td style="text-align:center;padding:12px;background:#fffde7;border-radius:6px;width:25%">
          <div style="font-size:26px;font-weight:bold;color:#f9a825">${stats.callRequested}</div>
          <div style="font-size:11px;color:#666;margin-top:4px">\u{1F4DE} Call First</div>
        </td>
        <td style="width:8px"></td>
        <td style="text-align:center;padding:12px;background:#f5f5f5;border-radius:6px;width:25%">
          <div style="font-size:26px;font-weight:bold;color:#888">${stats.totalReplies}</div>
          <div style="font-size:11px;color:#666;margin-top:4px">Total Replies</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Top responding hospitals -->
  <tr><td style="padding:24px 32px">
    <h2 style="margin:0 0 12px;font-size:15px;color:#333;border-bottom:2px solid #e53935;padding-bottom:8px">Top Responding Hospitals</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:6px;overflow:hidden">
      <tr style="background:#fafafa">
        <th style="padding:8px 12px;text-align:left;font-size:12px;color:#666;font-weight:600">Hospital</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:#666;font-weight:600">Replies</th>
      </tr>
      ${topHospitalsRows}
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#fafafa;padding:18px 32px;border-top:1px solid #eee">
    <p style="margin:0;font-size:12px;color:#999;text-align:center">
      Auto-generated by PetSOS at 08:00 HKT &middot;
      <a href="https://petsos.site/admin" style="color:#e53935;text-decoration:none">Open Admin Dashboard</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
async function sendDailyReport() {
  const recipientEnv = process.env.DAILY_REPORT_EMAIL;
  if (!recipientEnv) {
    console.log("[DailyReport] DAILY_REPORT_EMAIL not set \u2014 skipping report");
    return { success: false, error: "DAILY_REPORT_EMAIL not configured" };
  }
  const recipients = recipientEnv.split(",").map((e) => e.trim()).filter(Boolean);
  try {
    console.log("[DailyReport] Gathering stats...");
    const stats = await gatherStats();
    const subject = `PetSOS Daily Report \u2014 ${stats.date} | ${stats.totalCases} emergencies \xB7 ${stats.responseRate}% response rate`;
    const html = buildEmailHtml(stats);
    let allSent = true;
    for (const recipient of recipients) {
      const ok = await sendGmailEmail(recipient, subject, html, process.env.EMAIL_FROM || "noreply@petsos.site");
      if (!ok) allSent = false;
    }
    console.log(`[DailyReport] Report for ${stats.date} sent to: ${recipients.join(", ")} | ${stats.totalCases} emergencies across 3 periods`);
    return { success: allSent };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[DailyReport] Failed to send report:", msg);
    return { success: false, error: msg };
  }
}
async function checkAndSendReport() {
  const now = /* @__PURE__ */ new Date();
  if (now.getUTCHours() !== REPORT_HOUR_UTC || now.getUTCMinutes() !== 0) return;
  const todayKey = now.toISOString().slice(0, 10);
  if (lastReportDate === todayKey) return;
  lastReportDate = todayKey;
  await sendDailyReport();
}
function startDailyReportScheduler() {
  if (schedulerInterval2) {
    console.log("[DailyReport] Scheduler already running");
    return;
  }
  console.log("[DailyReport] Starting daily report scheduler (fires at 08:00 HKT / 00:00 UTC)");
  schedulerInterval2 = setInterval(async () => {
    try {
      await checkAndSendReport();
    } catch (e) {
      console.error("[DailyReport] Scheduler error:", e);
    }
  }, CHECK_INTERVAL_MS);
}
function stopDailyReportScheduler() {
  if (schedulerInterval2) {
    clearInterval(schedulerInterval2);
    schedulerInterval2 = null;
    console.log("[DailyReport] Scheduler stopped");
  }
}
var REPORT_HOUR_UTC, CHECK_INTERVAL_MS, HKT_OFFSET_MS, schedulerInterval2, lastReportDate;
var init_daily_report = __esm({
  "server/services/daily-report.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_gmail_client();
    REPORT_HOUR_UTC = 0;
    CHECK_INTERVAL_MS = 60 * 1e3;
    HKT_OFFSET_MS = 8 * 60 * 60 * 1e3;
    schedulerInterval2 = null;
    lastReportDate = null;
  }
});

// server/index.ts
import express2 from "express";
import compression from "compression";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
init_schema();
init_db();
import { randomUUID } from "crypto";
import { eq, and, or, inArray, sql as sql2, desc, lte, gte, isNotNull } from "drizzle-orm";
var DatabaseStorage = class {
  async getAllClinics() {
    return await db.select().from(clinics).where(eq(clinics.status, "active"));
  }
  async getClinic(id) {
    const result = await db.select().from(clinics).where(eq(clinics.id, id));
    return result[0];
  }
  async getClinicsByRegion(regionId) {
    return await db.select().from(clinics).where(
      and(eq(clinics.regionId, regionId), eq(clinics.status, "active"))
    );
  }
  async get24HourClinicsByRegion(regionId) {
    return await db.select().from(clinics).where(
      and(
        eq(clinics.regionId, regionId),
        eq(clinics.is24Hour, true),
        eq(clinics.status, "active")
      )
    );
  }
  async getNearbyClinics(latitude, longitude, radiusMeters) {
    const result = await db.execute(
      sql2`
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
  async createClinic(insertClinic) {
    const result = await db.insert(clinics).values(insertClinic).returning();
    return result[0];
  }
  async updateClinic(id, updateData) {
    const result = await db.update(clinics).set({ ...updateData }).where(eq(clinics.id, id)).returning();
    return result[0];
  }
  async deleteClinic(id) {
    const result = await db.update(clinics).set({ status: "inactive" }).where(eq(clinics.id, id)).returning();
    return result.length > 0;
  }
  async getAllRegions() {
    try {
      return await db.select().from(regions);
    } catch (error) {
      console.warn("getAllRegions query failed:", error instanceof Error ? error.message : error);
      return [];
    }
  }
  async getRegion(id) {
    const result = await db.select().from(regions).where(eq(regions.id, id));
    return result[0];
  }
  async getRegionByCode(code) {
    const result = await db.select().from(regions).where(eq(regions.code, code));
    return result[0];
  }
  async createRegion(insertRegion) {
    const result = await db.insert(regions).values(insertRegion).returning();
    return result[0];
  }
  async updateRegion(id, updateData) {
    const result = await db.update(regions).set(updateData).where(eq(regions.id, id)).returning();
    return result[0];
  }
  async getRegionsByCountry(countryCode) {
    try {
      return await db.select().from(regions).where(eq(regions.countryCode, countryCode));
    } catch (error) {
      console.warn("getRegionsByCountry query failed (countryCode column may not exist):", error instanceof Error ? error.message : error);
      return [];
    }
  }
  async getCountry(id) {
    try {
      const result = await db.select().from(countries).where(eq(countries.id, id));
      return result[0];
    } catch (error) {
      console.warn("getCountry query failed:", error instanceof Error ? error.message : error);
      return void 0;
    }
  }
  async getCountryByCode(code) {
    try {
      const result = await db.select().from(countries).where(eq(countries.code, code));
      return result[0];
    } catch (error) {
      console.warn("getCountryByCode query failed:", error instanceof Error ? error.message : error);
      return void 0;
    }
  }
  async getAllCountries() {
    try {
      return await db.select().from(countries);
    } catch (error) {
      console.warn("getAllCountries query failed:", error instanceof Error ? error.message : error);
      return [];
    }
  }
  async getActiveCountries() {
    try {
      return await db.select().from(countries).where(eq(countries.active, true));
    } catch (error) {
      console.warn("getActiveCountries query failed:", error instanceof Error ? error.message : error);
      return [];
    }
  }
  async createCountry(insertCountry) {
    const result = await db.insert(countries).values(insertCountry).returning();
    return result[0];
  }
  async updateCountry(id, updateData) {
    const result = await db.update(countries).set(updateData).where(eq(countries.id, id)).returning();
    return result[0];
  }
  async deleteCountry(id) {
    const result = await db.update(countries).set({ active: false }).where(eq(countries.id, id)).returning();
    return result.length > 0;
  }
  async getPetBreed(id) {
    const result = await db.select().from(petBreeds).where(eq(petBreeds.id, id));
    return result[0];
  }
  async getPetBreedsBySpecies(species) {
    try {
      return await db.select().from(petBreeds).where(
        and(eq(petBreeds.species, species), eq(petBreeds.active, true))
      );
    } catch (error) {
      console.warn("getPetBreedsBySpecies query failed:", error instanceof Error ? error.message : error);
      return [];
    }
  }
  async getPetBreedsByCountry(countryCode) {
    try {
      return await db.select().from(petBreeds).where(
        and(eq(petBreeds.countryCode, countryCode), eq(petBreeds.active, true))
      );
    } catch (error) {
      console.warn("getPetBreedsByCountry query failed (countryCode column may not exist):", error instanceof Error ? error.message : error);
      try {
        return await db.select().from(petBreeds).where(eq(petBreeds.active, true));
      } catch {
        return [];
      }
    }
  }
  async getCommonPetBreeds(species) {
    try {
      const conditions = [eq(petBreeds.isCommon, true), eq(petBreeds.active, true)];
      if (species) {
        conditions.push(eq(petBreeds.species, species));
      }
      return await db.select().from(petBreeds).where(and(...conditions));
    } catch (error) {
      console.warn("getCommonPetBreeds query failed:", error instanceof Error ? error.message : error);
      return [];
    }
  }
  async getAllPetBreeds() {
    try {
      return await db.select().from(petBreeds).where(eq(petBreeds.active, true));
    } catch (error) {
      console.warn("getAllPetBreeds query failed:", error instanceof Error ? error.message : error);
      return [];
    }
  }
  async createPetBreed(insertBreed) {
    const result = await db.insert(petBreeds).values(insertBreed).returning();
    return result[0];
  }
  async updatePetBreed(id, updateData) {
    const result = await db.update(petBreeds).set(updateData).where(eq(petBreeds.id, id)).returning();
    return result[0];
  }
  async deletePetBreed(id) {
    const result = await db.update(petBreeds).set({ active: false }).where(eq(petBreeds.id, id)).returning();
    return result.length > 0;
  }
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  async getUserByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }
  async getUserByPhone(phone) {
    const result = await db.select().from(users).where(eq(users.phone, phone));
    return result[0];
  }
  async getAllUsers() {
    const result = await db.select().from(users);
    return result;
  }
  async createUser(insertUser) {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  async updateUser(id, updateData) {
    const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return result[0];
  }
  async deleteUser(id) {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
  async upsertUser(userData) {
    if (userData.openidSub) {
      const existing = await db.select().from(users).where(eq(users.openidSub, userData.openidSub));
      if (existing.length > 0) {
        const [user2] = await db.update(users).set({
          ...userData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.openidSub, userData.openidSub)).returning();
        return user2;
      }
    } else if (userData.email) {
      const existing = await db.select().from(users).where(eq(users.email, userData.email));
      if (existing.length > 0) {
        const [user2] = await db.update(users).set({
          ...userData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.email, userData.email)).returning();
        return user2;
      }
    }
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  async updateUserTwoFactor(userId, secret, backupCodes, enabled) {
    const result = await db.update(users).set({
      twoFactorSecret: secret,
      twoFactorBackupCodes: backupCodes,
      twoFactorEnabled: enabled,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return result[0];
  }
  async validateBackupCode(userId, code) {
    const user = await this.getUser(userId);
    if (!user || !user.twoFactorBackupCodes) {
      return false;
    }
    const bcrypt3 = await import("bcrypt");
    const backupCodes = user.twoFactorBackupCodes;
    for (let i = 0; i < backupCodes.length; i++) {
      const isMatch = await bcrypt3.compare(code, backupCodes[i]);
      if (isMatch) {
        const newBackupCodes = [...backupCodes];
        newBackupCodes.splice(i, 1);
        await this.updateUserTwoFactor(userId, user.twoFactorSecret, newBackupCodes, user.twoFactorEnabled);
        return true;
      }
    }
    return false;
  }
  async getPet(id) {
    const result = await db.select().from(pets).where(eq(pets.id, id));
    return result[0];
  }
  async getPetsByUserId(userId) {
    return await db.select().from(pets).where(eq(pets.userId, userId));
  }
  async getAllPets() {
    return await db.select().from(pets);
  }
  async createPet(insertPet) {
    const result = await db.insert(pets).values(insertPet).returning();
    return result[0];
  }
  async updatePet(id, updateData) {
    const result = await db.update(pets).set(updateData).where(eq(pets.id, id)).returning();
    return result[0];
  }
  async deletePet(id) {
    const result = await db.delete(pets).where(eq(pets.id, id)).returning();
    return result.length > 0;
  }
  async getEmergencyRequest(id) {
    const results = await db.select({
      request: emergencyRequests,
      pet: pets
    }).from(emergencyRequests).leftJoin(pets, eq(pets.id, emergencyRequests.petId)).where(eq(emergencyRequests.id, id));
    if (results.length === 0) return void 0;
    const { request, pet } = results[0];
    return {
      ...request,
      pet
    };
  }
  async getEmergencyRequestsByUserId(userId) {
    return await db.select().from(emergencyRequests).where(eq(emergencyRequests.userId, userId));
  }
  async getEmergencyRequestsByClinicId(clinicId) {
    const results = await db.selectDistinct({
      request: emergencyRequests,
      pet: pets,
      user: users
    }).from(emergencyRequests).innerJoin(messages, eq(messages.emergencyRequestId, emergencyRequests.id)).leftJoin(pets, eq(pets.id, emergencyRequests.petId)).leftJoin(users, eq(users.id, emergencyRequests.userId)).where(eq(messages.hospitalId, clinicId)).orderBy(emergencyRequests.createdAt);
    return results.map(({ request, pet, user }) => ({
      ...request,
      pet,
      user
    }));
  }
  async getAllEmergencyRequests() {
    return await db.select().from(emergencyRequests);
  }
  async createEmergencyRequest(insertRequest) {
    const result = await db.insert(emergencyRequests).values(insertRequest).returning();
    return result[0];
  }
  async updateEmergencyRequest(id, updateData) {
    const result = await db.update(emergencyRequests).set(updateData).where(eq(emergencyRequests.id, id)).returning();
    return result[0];
  }
  async getMessage(id) {
    const result = await db.select().from(messages).where(eq(messages.id, id));
    return result[0];
  }
  async getMessageByWhatsAppId(whatsappMessageId) {
    const result = await db.select().from(messages).where(eq(messages.whatsappMessageId, whatsappMessageId));
    return result[0];
  }
  async getMessagesByEmergencyRequest(emergencyRequestId) {
    return await db.select().from(messages).where(eq(messages.emergencyRequestId, emergencyRequestId));
  }
  async getAllMessages(limit = 100) {
    return await db.select().from(messages).orderBy(sql2`${messages.createdAt} DESC`).limit(limit);
  }
  async createMessage(insertMessage) {
    const result = await db.insert(messages).values(insertMessage).returning();
    return result[0];
  }
  async updateMessage(id, updateData) {
    const result = await db.update(messages).set(updateData).where(eq(messages.id, id)).returning();
    return result[0];
  }
  async updateMessageByWhatsAppId(whatsappMessageId, updateData) {
    const result = await db.update(messages).set(updateData).where(eq(messages.whatsappMessageId, whatsappMessageId)).returning();
    return result[0];
  }
  async getQueuedMessages() {
    return await db.select().from(messages).where(eq(messages.status, "pending"));
  }
  async getFeatureFlag(key) {
    const result = await db.select().from(featureFlags).where(eq(featureFlags.key, key));
    return result[0];
  }
  async getAllFeatureFlags() {
    return await db.select().from(featureFlags);
  }
  async createFeatureFlag(insertFlag) {
    const result = await db.insert(featureFlags).values(insertFlag).returning();
    return result[0];
  }
  async updateFeatureFlag(id, updateData) {
    const result = await db.update(featureFlags).set(updateData).where(eq(featureFlags.id, id)).returning();
    return result[0];
  }
  async createAuditLog(insertLog) {
    const result = await db.insert(auditLogs).values(insertLog).returning();
    return result[0];
  }
  async getAuditLogsByEntity(entityType, entityId) {
    return await db.select().from(auditLogs).where(
      and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId))
    );
  }
  async getPrivacyConsents(userId) {
    return await db.select().from(privacyConsents).where(eq(privacyConsents.userId, userId));
  }
  async createPrivacyConsent(insertConsent) {
    const result = await db.insert(privacyConsents).values(insertConsent).returning();
    return result[0];
  }
  async getTranslationsByLanguage(language) {
    try {
      const result = await db.execute(
        sql2`SELECT id, key, language, value, namespace, updated_at as "updatedAt" FROM translations WHERE language = ${language}`
      );
      return result.rows;
    } catch (error) {
      console.error("Translation table error:", error instanceof Error ? error.stack : error);
      return [];
    }
  }
  async getTranslation(key, language) {
    try {
      const result = await db.select().from(translations).where(
        and(eq(translations.key, key), eq(translations.language, language))
      );
      return result[0];
    } catch (error) {
      console.warn("Translation query failed:", error instanceof Error ? error.message : error);
      return void 0;
    }
  }
  async createTranslation(insertTranslation) {
    const result = await db.insert(translations).values(insertTranslation).returning();
    return result[0];
  }
  async updateTranslation(id, updateData) {
    const result = await db.update(translations).set(updateData).where(eq(translations.id, id)).returning();
    return result[0];
  }
  // Hospitals
  async getHospital(id) {
    try {
      const result = await db.select().from(hospitals).where(eq(hospitals.id, id));
      return result[0];
    } catch (error) {
      console.warn("getHospital query failed:", error instanceof Error ? error.message : error);
      return void 0;
    }
  }
  async getHospitalBySlug(slug) {
    try {
      const result = await db.select().from(hospitals).where(eq(hospitals.slug, slug));
      return result[0];
    } catch (error) {
      console.warn("getHospitalBySlug query failed:", error instanceof Error ? error.message : error);
      return void 0;
    }
  }
  async getHospitalByAccessCode(accessCode) {
    try {
      const result = await db.select().from(hospitals).where(eq(hospitals.accessCode, accessCode));
      return result[0];
    } catch (error) {
      console.warn("getHospitalByAccessCode query failed:", error instanceof Error ? error.message : error);
      return void 0;
    }
  }
  async generateAccessCodesForAllHospitals() {
    const allHospitals = await this.getAllHospitals();
    let updated = 0;
    const errors = [];
    for (const hospital of allHospitals) {
      if (!hospital.accessCode) {
        try {
          const code = this.generateUniqueAccessCode();
          await this.updateHospital(hospital.id, { accessCode: code });
          updated++;
        } catch (err) {
          errors.push(`Failed to update ${hospital.nameEn}: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
      }
    }
    return { updated, errors };
  }
  generateUniqueAccessCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  async getHospitalsByRegion(regionId) {
    try {
      return await db.select().from(hospitals).where(eq(hospitals.regionId, regionId));
    } catch (error) {
      console.warn("getHospitalsByRegion query failed:", error instanceof Error ? error.message : error);
      return [];
    }
  }
  async getAllHospitals() {
    try {
      return await db.select().from(hospitals);
    } catch (error) {
      console.warn("getAllHospitals query failed:", error instanceof Error ? error.message : error);
      return [];
    }
  }
  async getNearbyHospitals(latitude, longitude, radiusMeters) {
    try {
      const results = await db.select({
        hospital: hospitals,
        distance: sql2`ST_Distance(
            ${hospitals.location}::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
          )`.as("distance")
      }).from(hospitals).where(
        and(
          eq(hospitals.isAvailable, true),
          sql2`${hospitals.location} IS NOT NULL`,
          sql2`ST_DWithin(
              ${hospitals.location}::geography,
              ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
              ${radiusMeters}
            )`
        )
      ).orderBy(sql2`distance`);
      return results.map((r) => ({
        ...r.hospital,
        distance: r.distance
      }));
    } catch (error) {
      console.warn("getNearbyHospitals query failed:", error instanceof Error ? error.message : error);
      return [];
    }
  }
  async createHospital(insertHospital) {
    const result = await db.insert(hospitals).values({
      ...insertHospital,
      ownerVerificationCode: insertHospital.ownerVerificationCode ?? null,
      ownerVerificationCodeExpiresAt: insertHospital.ownerVerificationCodeExpiresAt ?? null
    }).returning();
    return result[0];
  }
  async updateHospital(id, updateData) {
    const result = await db.update(hospitals).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(hospitals.id, id)).returning();
    return result[0];
  }
  async deleteHospital(id) {
    const result = await db.delete(hospitals).where(eq(hospitals.id, id)).returning();
    return result.length > 0;
  }
  // Hospital Consult Fees
  async getConsultFeesByHospitalId(hospitalId) {
    return await db.select().from(hospitalConsultFees).where(eq(hospitalConsultFees.hospitalId, hospitalId));
  }
  async createConsultFee(insertFee) {
    const result = await db.insert(hospitalConsultFees).values(insertFee).returning();
    return result[0];
  }
  async updateConsultFee(id, updateData) {
    const result = await db.update(hospitalConsultFees).set({ ...updateData, lastUpdated: /* @__PURE__ */ new Date() }).where(eq(hospitalConsultFees.id, id)).returning();
    return result[0];
  }
  async deleteConsultFee(id) {
    const result = await db.delete(hospitalConsultFees).where(eq(hospitalConsultFees.id, id)).returning();
    return result.length > 0;
  }
  // Hospital Updates
  async getHospitalUpdatesByHospitalId(hospitalId) {
    return await db.select().from(hospitalUpdates).where(eq(hospitalUpdates.hospitalId, hospitalId));
  }
  async createHospitalUpdate(insertUpdate) {
    const result = await db.insert(hospitalUpdates).values(insertUpdate).returning();
    return result[0];
  }
  async updateHospitalUpdate(id, updateData) {
    const result = await db.update(hospitalUpdates).set(updateData).where(eq(hospitalUpdates.id, id)).returning();
    return result[0];
  }
  async exportUserData(userId) {
    const user = await this.getUser(userId);
    const userPets = await db.select().from(pets).where(eq(pets.userId, userId));
    const requests = await db.select().from(emergencyRequests).where(eq(emergencyRequests.userId, userId));
    const consents = await db.select().from(privacyConsents).where(eq(privacyConsents.userId, userId));
    const logs = await db.select().from(auditLogs).where(
      and(
        eq(auditLogs.entityType, "user"),
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
  async deleteUserDataGDPR(userId) {
    const userRequests = await db.select().from(emergencyRequests).where(eq(emergencyRequests.userId, userId));
    const requestIds = userRequests.map((r) => r.id);
    let deletedMessages = 0;
    if (requestIds.length > 0) {
      const msgResults = await db.delete(messages).where(
        inArray(messages.emergencyRequestId, requestIds)
      ).returning();
      deletedMessages = msgResults.length;
    }
    const deletedPets = await db.delete(pets).where(eq(pets.userId, userId)).returning();
    const deletedRequests = await db.delete(emergencyRequests).where(eq(emergencyRequests.userId, userId)).returning();
    const deletedConsents = await db.delete(privacyConsents).where(eq(privacyConsents.userId, userId)).returning();
    await db.delete(auditLogs).where(
      eq(auditLogs.userId, userId)
    );
    await db.delete(auditLogs).where(
      and(
        eq(auditLogs.entityType, "user"),
        eq(auditLogs.entityId, userId)
      )
    );
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
  async getMedicalRecordsByPetId(petId) {
    return await db.select().from(petMedicalRecords).where(eq(petMedicalRecords.petId, petId));
  }
  async getMedicalRecord(id) {
    const result = await db.select().from(petMedicalRecords).where(eq(petMedicalRecords.id, id));
    return result[0];
  }
  async createMedicalRecord(record) {
    const result = await db.insert(petMedicalRecords).values(record).returning();
    return result[0];
  }
  async updateMedicalRecord(id, record) {
    const result = await db.update(petMedicalRecords).set(record).where(eq(petMedicalRecords.id, id)).returning();
    return result[0];
  }
  async deleteMedicalRecord(id) {
    const result = await db.delete(petMedicalRecords).where(eq(petMedicalRecords.id, id)).returning();
    return result.length > 0;
  }
  async getUserStorageUsage(userId) {
    const result = await db.select({
      usedBytes: sql2`COALESCE(SUM(${petMedicalRecords.fileSize}), 0)`,
      recordCount: sql2`COUNT(*)`
    }).from(petMedicalRecords).where(eq(petMedicalRecords.userId, userId));
    return {
      usedBytes: Number(result[0]?.usedBytes) || 0,
      recordCount: Number(result[0]?.recordCount) || 0
    };
  }
  // Pet Medical Sharing Consents
  async getMedicalSharingConsent(petId, userId, consentType) {
    const result = await db.select().from(petMedicalSharingConsents).where(and(
      eq(petMedicalSharingConsents.petId, petId),
      eq(petMedicalSharingConsents.userId, userId),
      eq(petMedicalSharingConsents.consentType, consentType)
    ));
    return result[0];
  }
  async getMedicalSharingConsentsByPetId(petId) {
    return await db.select().from(petMedicalSharingConsents).where(eq(petMedicalSharingConsents.petId, petId));
  }
  async getMedicalSharingConsentsByUserId(userId) {
    return await db.select().from(petMedicalSharingConsents).where(eq(petMedicalSharingConsents.userId, userId));
  }
  async upsertMedicalSharingConsent(consent) {
    const existing = await this.getMedicalSharingConsent(consent.petId, consent.userId, consent.consentType);
    if (existing) {
      const result2 = await db.update(petMedicalSharingConsents).set({ enabled: consent.enabled, updatedAt: /* @__PURE__ */ new Date() }).where(eq(petMedicalSharingConsents.id, existing.id)).returning();
      return result2[0];
    }
    const result = await db.insert(petMedicalSharingConsents).values(consent).returning();
    return result[0];
  }
  // Push Subscriptions
  async createPushSubscription(subscription) {
    const existing = await this.getPushSubscriptionByToken(subscription.token);
    if (existing) {
      const result2 = await db.update(pushSubscriptions).set({
        ...subscription,
        isActive: true,
        lastActiveAt: /* @__PURE__ */ new Date()
      }).where(eq(pushSubscriptions.id, existing.id)).returning();
      return result2[0];
    }
    const result = await db.insert(pushSubscriptions).values(subscription).returning();
    return result[0];
  }
  async getPushSubscriptionByToken(token) {
    const result = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.token, token));
    return result[0];
  }
  async updatePushSubscription(id, data) {
    const result = await db.update(pushSubscriptions).set({ ...data, lastActiveAt: /* @__PURE__ */ new Date() }).where(eq(pushSubscriptions.id, id)).returning();
    return result[0];
  }
  async deactivatePushSubscription(token) {
    const result = await db.update(pushSubscriptions).set({ isActive: false }).where(eq(pushSubscriptions.token, token)).returning();
    return result.length > 0;
  }
  async deactivatePushSubscriptions(tokens) {
    if (tokens.length === 0) return 0;
    const result = await db.update(pushSubscriptions).set({ isActive: false }).where(inArray(pushSubscriptions.token, tokens)).returning();
    return result.length;
  }
  async getAllActivePushSubscriptions(language, role) {
    const conditions = [eq(pushSubscriptions.isActive, true)];
    if (language) {
      conditions.push(eq(pushSubscriptions.language, language));
    }
    if (role) {
      if (role === "pet_owner") {
        const result = await db.select({ subscription: pushSubscriptions }).from(pushSubscriptions).innerJoin(users, eq(pushSubscriptions.userId, users.id)).where(and(
          ...conditions,
          eq(users.role, "user")
        ));
        return result.map((r) => r.subscription);
      } else if (role === "hospital_clinic") {
        const result = await db.select({ subscription: pushSubscriptions }).from(pushSubscriptions).innerJoin(users, eq(pushSubscriptions.userId, users.id)).where(and(
          ...conditions,
          or(
            eq(users.role, "hospital_staff"),
            eq(users.role, "clinic_staff")
          )
        ));
        return result.map((r) => r.subscription);
      }
    }
    if (conditions.length === 1) {
      return await db.select().from(pushSubscriptions).where(conditions[0]);
    }
    return await db.select().from(pushSubscriptions).where(and(...conditions));
  }
  async getActiveTokens(language, role) {
    const subscriptions = await this.getAllActivePushSubscriptions(language, role);
    return subscriptions.map((s) => s.token);
  }
  async getPetOwnerEmails() {
    const result = await db.select({
      id: users.id,
      email: users.email
    }).from(users).where(and(
      eq(users.role, "user"),
      isNotNull(users.email)
    ));
    return result.filter((u) => u.email !== null);
  }
  async getPetOwnerPushTokens() {
    const result = await db.select({ token: pushSubscriptions.token }).from(pushSubscriptions).innerJoin(users, eq(pushSubscriptions.userId, users.id)).where(and(
      eq(pushSubscriptions.isActive, true),
      eq(users.role, "user")
    ));
    return result.map((r) => r.token);
  }
  // Notification Broadcasts
  async createNotificationBroadcast(broadcast) {
    const result = await db.insert(notificationBroadcasts).values(broadcast).returning();
    return result[0];
  }
  async getNotificationBroadcast(id) {
    const result = await db.select().from(notificationBroadcasts).where(eq(notificationBroadcasts.id, id));
    return result[0];
  }
  async getRecentNotificationBroadcasts(limit = 50) {
    return await db.select().from(notificationBroadcasts).orderBy(desc(notificationBroadcasts.createdAt)).limit(limit);
  }
  async getAllNotificationBroadcasts(limit = 50, offset = 0) {
    const broadcasts = await db.select().from(notificationBroadcasts).orderBy(desc(notificationBroadcasts.createdAt)).limit(limit).offset(offset);
    const countResult = await db.select({ count: sql2`count(*)` }).from(notificationBroadcasts);
    const total = Number(countResult[0]?.count) || 0;
    return { broadcasts, total };
  }
  async getScheduledNotifications() {
    return await db.select().from(notificationBroadcasts).where(and(
      eq(notificationBroadcasts.status, "scheduled"),
      lte(notificationBroadcasts.scheduledFor, /* @__PURE__ */ new Date())
    )).orderBy(notificationBroadcasts.scheduledFor);
  }
  async updateNotificationBroadcast(id, data) {
    const result = await db.update(notificationBroadcasts).set(data).where(eq(notificationBroadcasts.id, id)).returning();
    return result[0];
  }
  async updateNotificationBroadcastStatus(id, status) {
    const result = await db.update(notificationBroadcasts).set({ status }).where(eq(notificationBroadcasts.id, id)).returning();
    return result[0];
  }
  // Clinic Reviews
  async createClinicReview(review) {
    const result = await db.insert(clinicReviews).values(review).returning();
    return result[0];
  }
  async getClinicReviews(clinicId) {
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
        displayName: sql2`COALESCE(${users.name}, ${users.username})`
      }
    }).from(clinicReviews).innerJoin(users, eq(clinicReviews.userId, users.id)).where(and(
      eq(clinicReviews.clinicId, clinicId),
      eq(clinicReviews.status, "approved")
    )).orderBy(desc(clinicReviews.createdAt));
    return result;
  }
  async getClinicReview(id) {
    const result = await db.select().from(clinicReviews).where(eq(clinicReviews.id, id));
    return result[0];
  }
  async getUserReviewForClinic(userId, clinicId) {
    const result = await db.select().from(clinicReviews).where(
      and(eq(clinicReviews.userId, userId), eq(clinicReviews.clinicId, clinicId))
    );
    return result[0];
  }
  async updateClinicReview(id, data) {
    const result = await db.update(clinicReviews).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(clinicReviews.id, id)).returning();
    return result[0];
  }
  async deleteClinicReview(id) {
    const result = await db.delete(clinicReviews).where(eq(clinicReviews.id, id)).returning();
    return result.length > 0;
  }
  async updateClinicRatingStats(clinicId) {
    const stats = await db.select({
      avgRating: sql2`AVG(${clinicReviews.rating})::decimal(3,2)`,
      count: sql2`COUNT(*)::int`
    }).from(clinicReviews).where(and(
      eq(clinicReviews.clinicId, clinicId),
      eq(clinicReviews.status, "approved")
    ));
    const avgRating = stats[0]?.avgRating || null;
    const reviewCount = stats[0]?.count || 0;
    await db.update(clinics).set({
      averageRating: avgRating,
      reviewCount
    }).where(eq(clinics.id, clinicId));
  }
  // Analytics Methods
  async getAnalyticsOverview() {
    const now = /* @__PURE__ */ new Date();
    const h24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
    const d7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
    const d30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
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
      db.select({ count: sql2`count(*)::int` }).from(users),
      db.select({ count: sql2`count(*)::int` }).from(users).where(gte(users.createdAt, h24Ago)),
      db.select({ count: sql2`count(*)::int` }).from(users).where(gte(users.createdAt, d7Ago)),
      db.select({ count: sql2`count(*)::int` }).from(users).where(gte(users.createdAt, d30Ago)),
      db.select({ count: sql2`count(*)::int` }).from(pets),
      db.select({ count: sql2`count(*)::int` }).from(emergencyRequests),
      db.select({
        status: emergencyRequests.status,
        count: sql2`count(*)::int`
      }).from(emergencyRequests).groupBy(emergencyRequests.status),
      db.select({ count: sql2`count(*)::int` }).from(clinics),
      db.select({ count: sql2`count(*)::int` }).from(clinics).where(eq(clinics.isAvailable, true)),
      db.select({ count: sql2`count(*)::int` }).from(hospitals)
    ]);
    return {
      totalUsers: Number(totalUsersResult[0]?.count || 0),
      newUsers24h: Number(newUsers24hResult[0]?.count || 0),
      newUsers7d: Number(newUsers7dResult[0]?.count || 0),
      newUsers30d: Number(newUsers30dResult[0]?.count || 0),
      totalPets: Number(totalPetsResult[0]?.count || 0),
      totalEmergencyRequests: Number(totalEmergencyResult[0]?.count || 0),
      emergencyByStatus: emergencyByStatusResult.map((r) => ({ status: r.status, count: Number(r.count || 0) })),
      totalClinics: Number(totalClinicsResult[0]?.count || 0),
      activeClinics: Number(activeClinicsResult[0]?.count || 0),
      totalHospitals: Number(totalHospitalsResult[0]?.count || 0)
    };
  }
  async getEmergencyTrends(days) {
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    const [dailyTrendsResult, byRegionResult, byStatusResult] = await Promise.all([
      db.select({
        date: sql2`DATE(${emergencyRequests.createdAt})::text`,
        count: sql2`count(*)::int`
      }).from(emergencyRequests).where(gte(emergencyRequests.createdAt, startDate)).groupBy(sql2`DATE(${emergencyRequests.createdAt})`).orderBy(sql2`DATE(${emergencyRequests.createdAt})`),
      db.select({
        regionId: emergencyRequests.regionId,
        regionName: sql2`COALESCE(${regions.nameEn}, 'Unknown Region')`,
        count: sql2`count(*)::int`
      }).from(emergencyRequests).leftJoin(regions, eq(emergencyRequests.regionId, regions.id)).where(gte(emergencyRequests.createdAt, startDate)).groupBy(emergencyRequests.regionId, regions.nameEn).orderBy(sql2`count(*) DESC`).limit(10),
      db.select({
        status: emergencyRequests.status,
        count: sql2`count(*)::int`
      }).from(emergencyRequests).where(gte(emergencyRequests.createdAt, startDate)).groupBy(emergencyRequests.status)
    ]);
    return {
      dailyTrends: dailyTrendsResult.map((r) => ({ date: r.date, count: Number(r.count || 0) })),
      byRegion: byRegionResult.map((r) => ({
        regionId: r.regionId || "unknown",
        regionName: r.regionName || "Unknown Region",
        count: Number(r.count || 0)
      })),
      byStatus: byStatusResult.map((r) => ({ status: r.status, count: Number(r.count || 0) }))
    };
  }
  async getUserActivityTrends(days) {
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    const [registrationTrendsResult, activeUsersResult] = await Promise.all([
      db.select({
        date: sql2`DATE(${users.createdAt})::text`,
        count: sql2`count(*)::int`
      }).from(users).where(gte(users.createdAt, startDate)).groupBy(sql2`DATE(${users.createdAt})`).orderBy(sql2`DATE(${users.createdAt})`),
      db.select({ count: sql2`count(DISTINCT ${emergencyRequests.userId})::int` }).from(emergencyRequests).where(gte(emergencyRequests.createdAt, startDate))
    ]);
    return {
      registrationTrends: registrationTrendsResult.map((r) => ({ date: r.date, count: Number(r.count || 0) })),
      totalActiveUsers: Number(activeUsersResult[0]?.count || 0)
    };
  }
  // WhatsApp Conversations
  async getConversation(id) {
    const result = await db.select().from(whatsappConversations).where(eq(whatsappConversations.id, id));
    return result[0];
  }
  async getConversationByPhone(phoneNumber) {
    const sanitizedPhone = phoneNumber.replace(/\D/g, "");
    const result = await db.select().from(whatsappConversations).where(eq(whatsappConversations.phoneNumber, sanitizedPhone));
    return result[0];
  }
  async getAllConversations(includeArchived = false) {
    if (includeArchived) {
      return await db.select().from(whatsappConversations).orderBy(desc(whatsappConversations.lastMessageAt));
    }
    return await db.select().from(whatsappConversations).where(eq(whatsappConversations.isArchived, false)).orderBy(desc(whatsappConversations.lastMessageAt));
  }
  async createConversation(data) {
    const sanitizedData = {
      ...data,
      phoneNumber: data.phoneNumber.replace(/\D/g, "")
    };
    const result = await db.insert(whatsappConversations).values(sanitizedData).returning();
    return result[0];
  }
  async updateConversation(id, data) {
    const updateData = { ...data, updatedAt: /* @__PURE__ */ new Date() };
    if (data.phoneNumber) {
      updateData.phoneNumber = data.phoneNumber.replace(/\D/g, "");
    }
    const result = await db.update(whatsappConversations).set(updateData).where(eq(whatsappConversations.id, id)).returning();
    return result[0];
  }
  async archiveConversation(id) {
    const result = await db.update(whatsappConversations).set({ isArchived: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq(whatsappConversations.id, id)).returning();
    return result.length > 0;
  }
  // WhatsApp Chat Messages
  async getChatMessage(id) {
    const result = await db.select().from(whatsappChatMessages).where(eq(whatsappChatMessages.id, id));
    return result[0];
  }
  async getChatMessageByWhatsAppId(whatsappMessageId) {
    const result = await db.select().from(whatsappChatMessages).where(eq(whatsappChatMessages.whatsappMessageId, whatsappMessageId));
    return result[0];
  }
  async getChatMessagesByConversation(conversationId, limit = 100, offset = 0) {
    return await db.select().from(whatsappChatMessages).where(eq(whatsappChatMessages.conversationId, conversationId)).orderBy(whatsappChatMessages.createdAt).limit(limit).offset(offset);
  }
  async createChatMessage(data) {
    const result = await db.insert(whatsappChatMessages).values(data).returning();
    return result[0];
  }
  async updateChatMessage(id, data) {
    const result = await db.update(whatsappChatMessages).set(data).where(eq(whatsappChatMessages.id, id)).returning();
    return result[0];
  }
  async updateChatMessageByWhatsAppId(whatsappMessageId, data) {
    const result = await db.update(whatsappChatMessages).set(data).where(eq(whatsappChatMessages.whatsappMessageId, whatsappMessageId)).returning();
    return result[0];
  }
  async markConversationAsRead(conversationId) {
    const now = /* @__PURE__ */ new Date();
    await Promise.all([
      db.update(whatsappChatMessages).set({ status: "read", readAt: now }).where(
        and(
          eq(whatsappChatMessages.conversationId, conversationId),
          eq(whatsappChatMessages.direction, "inbound"),
          sql2`${whatsappChatMessages.readAt} IS NULL`
        )
      ),
      db.update(whatsappConversations).set({ unreadCount: 0, updatedAt: now }).where(eq(whatsappConversations.id, conversationId))
    ]);
  }
  // Helper for WhatsApp
  async findHospitalByPhone(phoneNumber) {
    const sanitizedPhone = phoneNumber.replace(/\D/g, "");
    const result = await db.select().from(hospitals).where(
      or(
        eq(hospitals.phone, sanitizedPhone),
        eq(hospitals.whatsapp, sanitizedPhone)
      )
    );
    return result[0];
  }
  // Typhoon & Holiday Protocol
  async getActiveTyphoonAlert() {
    const result = await db.select().from(typhoonAlerts).where(eq(typhoonAlerts.isActive, true)).orderBy(desc(typhoonAlerts.issuedAt)).limit(1);
    return result[0] || null;
  }
  async getUpcomingHoliday(days) {
    const now = /* @__PURE__ */ new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1e3);
    const result = await db.select().from(hkHolidays).where(and(
      gte(hkHolidays.date, now),
      lte(hkHolidays.date, futureDate)
    )).orderBy(hkHolidays.date).limit(1);
    return result[0] || null;
  }
  async getHospitalEmergencyStatuses(referenceId) {
    const now = /* @__PURE__ */ new Date();
    return await db.select().from(hospitalEmergencyStatus).where(and(
      eq(hospitalEmergencyStatus.referenceId, referenceId),
      or(
        sql2`${hospitalEmergencyStatus.expiresAt} IS NULL`,
        gte(hospitalEmergencyStatus.expiresAt, now)
      )
    ));
  }
  async updateHospitalEmergencyStatus(data) {
    const existing = await db.select().from(hospitalEmergencyStatus).where(and(
      eq(hospitalEmergencyStatus.hospitalId, data.hospitalId),
      eq(hospitalEmergencyStatus.referenceId, data.referenceId || "")
    )).limit(1);
    if (existing[0]) {
      const result2 = await db.update(hospitalEmergencyStatus).set({ ...data, confirmedAt: /* @__PURE__ */ new Date() }).where(eq(hospitalEmergencyStatus.id, existing[0].id)).returning();
      return result2[0];
    }
    const result = await db.insert(hospitalEmergencyStatus).values({
      id: randomUUID(),
      ...data,
      confirmedAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  async createEmergencySubscription(data) {
    const result = await db.insert(userEmergencySubscriptions).values({
      id: randomUUID(),
      ...data
    }).returning();
    return result[0];
  }
  async getHolidaysByYear(year) {
    return await db.select().from(hkHolidays).where(eq(hkHolidays.year, year)).orderBy(hkHolidays.date);
  }
  async createTyphoonAlert(data) {
    const result = await db.insert(typhoonAlerts).values({
      id: randomUUID(),
      ...data
    }).returning();
    return result[0];
  }
  async liftTyphoonAlert(alertId) {
    const result = await db.update(typhoonAlerts).set({ isActive: false, liftedAt: /* @__PURE__ */ new Date() }).where(eq(typhoonAlerts.id, alertId)).returning();
    return result[0] || null;
  }
  async getPendingTyphoonNotifications() {
    const now = /* @__PURE__ */ new Date();
    return await db.select().from(typhoonNotificationQueue).where(and(
      eq(typhoonNotificationQueue.status, "pending"),
      or(
        sql2`${typhoonNotificationQueue.scheduledFor} IS NULL`,
        lte(typhoonNotificationQueue.scheduledFor, now)
      )
    )).orderBy(typhoonNotificationQueue.createdAt);
  }
  async createTyphoonNotification(data) {
    const result = await db.insert(typhoonNotificationQueue).values({
      id: randomUUID(),
      ...data
    }).returning();
    return result[0];
  }
  async updateTyphoonNotification(id, data) {
    const result = await db.update(typhoonNotificationQueue).set(data).where(eq(typhoonNotificationQueue.id, id)).returning();
    return result[0];
  }
  async getActiveEmergencySubscriptions(subscriptionType) {
    if (subscriptionType) {
      return await db.select().from(userEmergencySubscriptions).where(and(
        eq(userEmergencySubscriptions.isActive, true),
        or(
          eq(userEmergencySubscriptions.subscriptionType, subscriptionType),
          eq(userEmergencySubscriptions.subscriptionType, "all")
        )
      ));
    }
    return await db.select().from(userEmergencySubscriptions).where(eq(userEmergencySubscriptions.isActive, true));
  }
  // Vet Consultants & Content Verification
  async getVetConsultants() {
    return await db.select().from(vetConsultants).where(and(
      eq(vetConsultants.isActive, true),
      eq(vetConsultants.isPublic, true)
    )).orderBy(vetConsultants.nameEn);
  }
  async getVetConsultantById(id) {
    const result = await db.select().from(vetConsultants).where(eq(vetConsultants.id, id)).limit(1);
    return result[0];
  }
  async getVetConsultantWithContent(id) {
    const consultant = await this.getVetConsultantById(id);
    if (!consultant) return void 0;
    const verifications = await db.select({
      content: verifiedContentItems,
      verifiedAt: contentVerifications.verifiedAt
    }).from(contentVerifications).innerJoin(verifiedContentItems, eq(contentVerifications.contentId, verifiedContentItems.id)).where(and(
      eq(contentVerifications.consultantId, id),
      eq(contentVerifications.isVisible, true),
      eq(verifiedContentItems.isPublished, true)
    )).orderBy(desc(contentVerifications.verifiedAt));
    const verifiedContent = verifications.map((v) => ({
      ...v.content,
      verifiedAt: v.verifiedAt
    }));
    return {
      ...consultant,
      verifiedContent
    };
  }
  async getContentVerification(contentSlug) {
    const result = await db.select({
      content: verifiedContentItems,
      verifier: vetConsultants,
      verifiedAt: contentVerifications.verifiedAt
    }).from(verifiedContentItems).leftJoin(contentVerifications, and(
      eq(contentVerifications.contentId, verifiedContentItems.id),
      eq(contentVerifications.isVisible, true)
    )).leftJoin(vetConsultants, and(
      eq(vetConsultants.id, contentVerifications.consultantId),
      eq(vetConsultants.isActive, true),
      eq(vetConsultants.isPublic, true)
    )).where(eq(verifiedContentItems.contentSlug, contentSlug)).limit(1);
    if (result.length === 0) return void 0;
    const { content, verifier, verifiedAt } = result[0];
    return {
      ...content,
      verifier: verifier || null,
      verifiedAt: verifiedAt || null
    };
  }
  // Vet Applications
  async getVetApplications(status) {
    if (status) {
      return await db.select().from(vetApplications).where(eq(vetApplications.status, status)).orderBy(desc(vetApplications.createdAt));
    }
    return await db.select().from(vetApplications).orderBy(desc(vetApplications.createdAt));
  }
  async getVetApplicationById(id) {
    const result = await db.select().from(vetApplications).where(eq(vetApplications.id, id)).limit(1);
    return result[0];
  }
  async createVetApplication(data) {
    const result = await db.insert(vetApplications).values(data).returning();
    return result[0];
  }
  async updateVetApplicationStatus(id, status, reviewedBy, reviewNotes) {
    const result = await db.update(vetApplications).set({
      status,
      reviewedBy,
      reviewedAt: /* @__PURE__ */ new Date(),
      reviewNotes: reviewNotes || null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(vetApplications.id, id)).returning();
    return result[0];
  }
  async approveVetApplication(id, reviewedBy, reviewNotes) {
    return await db.transaction(async (tx) => {
      const appResult = await tx.select().from(vetApplications).where(eq(vetApplications.id, id)).limit(1);
      if (!appResult[0]) {
        throw new Error("Vet application not found");
      }
      const application = appResult[0];
      if (!application.fullName && !application.nameEn) {
        throw new Error("Full name is required to approve application");
      }
      const consultantResult = await tx.insert(vetConsultants).values({
        // New schema fields
        fullName: application.fullName || application.nameEn || "Unknown",
        role: application.role || "vet",
        vetType: application.vetType,
        clinicName: application.clinicName || application.hospitalAffiliationEn,
        educationBackground: application.educationBackground,
        // Legacy fields for backward compatibility
        nameEn: application.nameEn || application.fullName,
        nameZh: application.nameZh,
        titleEn: application.titleEn || application.educationBackground || "Veterinary Professional",
        titleZh: application.titleZh,
        specialtyEn: application.specialtyEn,
        specialtyZh: application.specialtyZh,
        licenseNumber: application.licenseNumber,
        hospitalAffiliationEn: application.hospitalAffiliationEn || application.clinicName,
        hospitalAffiliationZh: application.hospitalAffiliationZh,
        yearsExperience: application.yearsExperience,
        // Privacy & visibility defaults
        visibilityPreference: "name_role",
        // Phone/Email is private - admin can view in application record if needed
        // Do not expose to public consultant profile
        isActive: true,
        isPublic: true,
        joinedAt: /* @__PURE__ */ new Date()
      }).returning();
      const consultant = consultantResult[0];
      const updatedAppResult = await tx.update(vetApplications).set({
        status: "approved",
        reviewedBy,
        reviewedAt: /* @__PURE__ */ new Date(),
        reviewNotes: reviewNotes || null,
        createdConsultantId: consultant.id,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(vetApplications.id, id)).returning();
      return {
        application: updatedAppResult[0],
        consultant
      };
    });
  }
  // Admin Vet Consultant Management
  async createVetConsultant(data) {
    const result = await db.insert(vetConsultants).values(data).returning();
    return result[0];
  }
  async updateVetConsultant(id, data) {
    const result = await db.update(vetConsultants).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(vetConsultants.id, id)).returning();
    return result[0];
  }
  async deleteVetConsultant(id) {
    const result = await db.delete(vetConsultants).where(eq(vetConsultants.id, id)).returning();
    return result.length > 0;
  }
  // Content Verification Management
  async createContentVerification(data) {
    const result = await db.insert(contentVerifications).values(data).returning();
    return result[0];
  }
  async deleteContentVerification(consultantId, contentId) {
    const result = await db.delete(contentVerifications).where(and(
      eq(contentVerifications.consultantId, consultantId),
      eq(contentVerifications.contentId, contentId)
    )).returning();
    return result.length > 0;
  }
  async getVerifiedContentItems() {
    return await db.select().from(verifiedContentItems).orderBy(verifiedContentItems.titleEn);
  }
  // Hospital Ping State
  async getHospitalPingState(hospitalId) {
    const result = await db.select().from(hospitalPingState).where(eq(hospitalPingState.hospitalId, hospitalId));
    return result[0];
  }
  async getAllHospitalPingStates() {
    return await db.select().from(hospitalPingState);
  }
  async getActiveHospitalPingStates() {
    return await db.select().from(hospitalPingState).where(and(
      eq(hospitalPingState.pingEnabled, true),
      eq(hospitalPingState.pingStatus, "active")
    ));
  }
  async upsertHospitalPingState(data) {
    const result = await db.insert(hospitalPingState).values(data).onConflictDoUpdate({
      target: hospitalPingState.hospitalId,
      set: { ...data, updatedAt: /* @__PURE__ */ new Date() }
    }).returning();
    return result[0];
  }
  async updateHospitalPingState(hospitalId, data) {
    const result = await db.update(hospitalPingState).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(hospitalPingState.hospitalId, hospitalId)).returning();
    return result[0];
  }
  async getHospitalsNeedingNoReplyMarking() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
    return await db.select().from(hospitalPingState).where(and(
      eq(hospitalPingState.pingStatus, "active"),
      isNotNull(hospitalPingState.lastPingSentAt),
      lte(hospitalPingState.lastPingSentAt, oneDayAgo),
      or(
        sql2`${hospitalPingState.lastInboundReplyAt} IS NULL`,
        sql2`${hospitalPingState.lastInboundReplyAt} < ${hospitalPingState.lastPingSentAt}`
      )
    ));
  }
  // Hospital Ping Logs
  async createHospitalPingLog(data) {
    const result = await db.insert(hospitalPingLogs).values(data).returning();
    return result[0];
  }
  async getHospitalPingLogs(hospitalId, limit = 50) {
    return await db.select().from(hospitalPingLogs).where(eq(hospitalPingLogs.hospitalId, hospitalId)).orderBy(desc(hospitalPingLogs.createdAt)).limit(limit);
  }
  // Hospital Change Logs (Audit Trail)
  async createHospitalChangeLog(data) {
    const result = await db.insert(hospitalChangeLogs).values(data).returning();
    return result[0];
  }
  async createHospitalChangeLogs(data) {
    if (data.length === 0) return [];
    const result = await db.insert(hospitalChangeLogs).values(data).returning();
    return result;
  }
  async getHospitalChangeLogs(hospitalId, limit = 50) {
    return await db.select().from(hospitalChangeLogs).where(eq(hospitalChangeLogs.hospitalId, hospitalId)).orderBy(desc(hospitalChangeLogs.createdAt)).limit(limit);
  }
  async getRecentHospitalChangeLogs(limit = 100) {
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
      hospitalName: hospitals.nameEn
    }).from(hospitalChangeLogs).leftJoin(hospitals, eq(hospitalChangeLogs.hospitalId, hospitals.id)).orderBy(desc(hospitalChangeLogs.createdAt)).limit(limit);
    return results;
  }
  // Hospital Emergency Responses
  async createHospitalEmergencyResponse(data) {
    const result = await db.insert(hospitalEmergencyResponses).values(data).returning();
    return result[0];
  }
  async getHospitalEmergencyResponsesByEmergencyId(emergencyRequestId) {
    return await db.select().from(hospitalEmergencyResponses).where(eq(hospitalEmergencyResponses.emergencyRequestId, emergencyRequestId)).orderBy(desc(hospitalEmergencyResponses.respondedAt));
  }
  async getActiveEmergencyForHospital(hospitalId, withinHours = 24) {
    const cutoff = new Date(Date.now() - withinHours * 60 * 60 * 1e3);
    const recentMessages = await db.select().from(messages).where(
      and(
        eq(messages.hospitalId, hospitalId),
        gte(messages.createdAt, cutoff)
      )
    ).orderBy(desc(messages.createdAt)).limit(1);
    if (recentMessages.length === 0) return void 0;
    const request = await db.select().from(emergencyRequests).where(eq(emergencyRequests.id, recentMessages[0].emergencyRequestId)).limit(1);
    return request[0];
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z as z2 } from "zod";

// server/services/messaging.ts
init_gmail_client();
import { Client as LineClient } from "@line/bot-sdk";
var WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v21.0";
var WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
var WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
var LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
var LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
var EMAIL_FROM = process.env.EMAIL_FROM || "noreply@petemergency.com";
var MAX_RETRIES = 3;
var RETRY_DELAY_MS = 5e3;
function getBaseUrl() {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  if (process.env.REPLIT_DOMAINS) {
    return `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`;
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return "https://petsos.site";
}
async function reverseGeocodeServer(lat, lng, language = "en") {
  try {
    const langHeader = language === "zh-HK" ? "zh-HK,zh;q=0.9,en;q=0.5" : "en-US,en;q=0.9";
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1&accept-language=${encodeURIComponent(langHeader)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "PetSOS/1.0 (petsos.site)" },
      signal: AbortSignal.timeout(5e3)
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.address) return null;
    const a = data.address;
    const parts = [];
    const building = a.building || a.amenity || a.shop || "";
    const road = a.road || a.pedestrian || "";
    const houseNo = a.house_number || "";
    const district = a.city_district || a.suburb || a.quarter || a.neighbourhood || "";
    const city = a.city || a.town || "";
    if (building) parts.push(building);
    if (road) parts.push(houseNo ? `${houseNo} ${road}` : road);
    if (district) parts.push(district);
    if (city && city !== district) parts.push(city);
    return parts.length > 0 ? parts.join(", ") : data.display_name || null;
  } catch {
    return null;
  }
}
var TESTING_MODE = false;
var TEST_PHONE_NUMBERS = ["85265727136", "85255375152"];
var testNumberIndex = 0;
var MessagingService = class {
  /**
   * Send a WhatsApp template message using approved Meta templates
   */
  async sendWhatsAppTemplateMessage(phoneNumber, templateName, templateVariables) {
    console.log("[WhatsApp Template] Attempting to send template message...");
    console.log("[WhatsApp Template] Template:", templateName);
    console.log("[WhatsApp Template] Variables count:", templateVariables.length);
    console.log("[WhatsApp Template] Has Access Token:", !!WHATSAPP_ACCESS_TOKEN);
    console.log("[WhatsApp Template] Has Phone Number ID:", !!WHATSAPP_PHONE_NUMBER_ID);
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.error("[WhatsApp Template] Credentials not configured - missing token or phone number ID");
      return { success: false, error: "WhatsApp credentials not configured" };
    }
    let cleanedNumber = phoneNumber.replace(/[^0-9]/g, "");
    if (!cleanedNumber || cleanedNumber.length < 8) {
      console.error("[WhatsApp Template] Invalid phone number:", phoneNumber);
      return { success: false, error: "Invalid phone number" };
    }
    if (TESTING_MODE) {
      const originalNumber = cleanedNumber;
      cleanedNumber = TEST_PHONE_NUMBERS[testNumberIndex % TEST_PHONE_NUMBERS.length];
      testNumberIndex++;
      console.log(`[TESTING MODE] Redirecting WhatsApp template from ${originalNumber} to test number: ${cleanedNumber}`);
    }
    try {
      const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
      const parameters = templateVariables.map((value) => ({
        type: "text",
        text: value
      }));
      const payload = {
        messaging_product: "whatsapp",
        to: cleanedNumber,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: templateName.endsWith("_zh_hk") ? "zh_HK" : "en"
          },
          components: [
            {
              type: "body",
              parameters
            }
          ]
        }
      };
      console.log("[WhatsApp Template] Request payload:", JSON.stringify(payload, null, 2));
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      console.log("[WhatsApp Template] Response status:", response.status);
      if (!response.ok) {
        const error = await response.text();
        console.error("[WhatsApp Template] API error response:", error);
        let errorMessage = error;
        try {
          const errorJson = JSON.parse(error);
          console.error("[WhatsApp Template] Parsed error:", JSON.stringify(errorJson, null, 2));
          errorMessage = errorJson?.error?.message || error;
        } catch (e) {
        }
        return { success: false, error: errorMessage };
      }
      const result = await response.json();
      const messageId = result.messages?.[0]?.id;
      console.log("[WhatsApp Template] Message sent successfully!");
      console.log("[WhatsApp Template] API Response:", JSON.stringify(result, null, 2));
      console.log("[WhatsApp Template] Message ID:", messageId);
      return { success: true, messageId };
    } catch (error) {
      console.error("[WhatsApp Template] Error sending message:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
  /**
   * Send a message via WhatsApp Business API (legacy plain text - for fallback only)
   */
  async sendWhatsAppMessage(phoneNumber, content) {
    console.log("[WhatsApp] Attempting to send message...");
    console.log("[WhatsApp] Has Access Token:", !!WHATSAPP_ACCESS_TOKEN);
    console.log("[WhatsApp] Has Phone Number ID:", !!WHATSAPP_PHONE_NUMBER_ID);
    console.log("[WhatsApp] API URL:", WHATSAPP_API_URL);
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.error("[WhatsApp] Credentials not configured - missing token or phone number ID");
      return { success: false, error: "WhatsApp credentials not configured" };
    }
    let actualRecipient = phoneNumber;
    if (TESTING_MODE) {
      actualRecipient = TEST_PHONE_NUMBERS[testNumberIndex % TEST_PHONE_NUMBERS.length];
      testNumberIndex++;
      console.log(`[TESTING MODE] Redirecting WhatsApp from ${phoneNumber} to test number: ${actualRecipient}`);
      content = `[TEST MESSAGE]
Original recipient: ${phoneNumber}

${content}`;
    }
    const cleanedNumber = actualRecipient.replace(/[^0-9]/g, "");
    if (!cleanedNumber || cleanedNumber.length < 8) {
      console.error("[WhatsApp] Invalid phone number:", actualRecipient);
      return { success: false, error: "Invalid phone number" };
    }
    try {
      const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
      console.log("[WhatsApp] Sending to URL:", url);
      console.log("[WhatsApp] Recipient (original):", phoneNumber);
      console.log("[WhatsApp] Recipient (cleaned):", cleanedNumber);
      console.log("[WhatsApp] Actual recipient:", actualRecipient);
      const payload = {
        messaging_product: "whatsapp",
        to: cleanedNumber,
        // Use cleaned number without dashes
        type: "text",
        text: { body: content }
      };
      console.log("[WhatsApp] Request payload:", JSON.stringify(payload, null, 2));
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      console.log("[WhatsApp] Response status:", response.status);
      if (!response.ok) {
        const error = await response.text();
        console.error("[WhatsApp] API error response:", error);
        let errorMessage = error;
        try {
          const errorJson = JSON.parse(error);
          console.error("[WhatsApp] Parsed error:", JSON.stringify(errorJson, null, 2));
          errorMessage = errorJson?.error?.message || error;
        } catch (e) {
        }
        return { success: false, error: errorMessage };
      }
      const result = await response.json();
      const messageId = result.messages?.[0]?.id;
      console.log("[WhatsApp] Message sent successfully!");
      console.log("[WhatsApp] API Response:", JSON.stringify(result, null, 2));
      console.log("[WhatsApp] Message ID:", messageId);
      console.log("[WhatsApp] WhatsApp ID:", result.contacts?.[0]?.wa_id);
      return { success: true, messageId };
    } catch (error) {
      console.error("[WhatsApp] Error sending message:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
  /**
   * Send an email (fallback method) using Gmail
   */
  async sendEmail(to, subject, content) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      console.error("Invalid email address:", to);
      return false;
    }
    try {
      return await sendGmailEmail(to, subject, content, EMAIL_FROM);
    } catch (error) {
      console.error("[EMAIL] Gmail send error:", error);
      return false;
    }
  }
  /**
   * Send a LINE message using LINE Messaging API
   */
  async sendLineMessage(lineUserId, content) {
    console.log("[LINE] Attempting to send message...");
    console.log("[LINE] Has Access Token:", !!LINE_CHANNEL_ACCESS_TOKEN);
    console.log("[LINE] Has Channel Secret:", !!LINE_CHANNEL_SECRET);
    if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_CHANNEL_SECRET) {
      console.error("[LINE] Credentials not configured - missing token or secret");
      return false;
    }
    if (!lineUserId || lineUserId.trim().length === 0) {
      console.error("[LINE] Invalid LINE user ID:", lineUserId);
      return false;
    }
    try {
      const lineClient = new LineClient({
        channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
        channelSecret: LINE_CHANNEL_SECRET
      });
      await lineClient.pushMessage(lineUserId, {
        type: "text",
        text: content
      });
      console.log("[LINE] Message sent successfully!");
      console.log("[LINE] Recipient User ID:", lineUserId);
      return true;
    } catch (error) {
      console.error("[LINE] Error sending message:", error);
      return false;
    }
  }
  /**
   * Send a message with automatic fallback
   */
  async sendMessage(options) {
    const { emergencyRequestId, hospitalId, recipient, messageType, content } = options;
    const message = await storage.createMessage({
      emergencyRequestId,
      hospitalId,
      recipient,
      messageType,
      content,
      status: "queued"
    });
    await this.processMessage(message.id);
    return message;
  }
  /**
   * Process a queued message
   * Uses atomic state transitions to prevent duplicate sends
   */
  async processMessage(messageId) {
    const message = await storage.getMessage(messageId);
    if (!message) {
      console.error("Message not found:", messageId);
      return;
    }
    if (message.status === "in_progress") {
      console.log("[Process Message] Message already in progress, skipping:", messageId);
      return;
    }
    if (message.status === "sent" || message.status === "delivered" || message.status === "read") {
      console.log("[Process Message] Message already sent/delivered, skipping:", messageId);
      return;
    }
    if (message.status === "failed" && message.retryCount >= MAX_RETRIES) {
      console.log("[Process Message] Max retries exceeded, skipping:", messageId);
      return;
    }
    if (message.status !== "queued" && message.status !== "failed") {
      console.log("[Process Message] Invalid status for processing:", message.status);
      return;
    }
    await storage.updateMessage(messageId, { status: "in_progress" });
    try {
      let success = false;
      let whatsappMessageId;
      let errorMessage;
      if (message.messageType === "whatsapp") {
        if (message.templateName && message.templateVariables) {
          console.log("[Process Message] Using persisted template data:", message.templateName);
          const result = await this.sendWhatsAppTemplateMessage(
            message.recipient,
            message.templateName,
            message.templateVariables
          );
          success = result.success;
          whatsappMessageId = result.messageId;
          errorMessage = result.error;
        } else if (message.content.startsWith("[Template: ")) {
          const templateMatch = message.content.match(/\[Template: ([^\]]+)\]/);
          if (templateMatch) {
            const templateName = templateMatch[1];
            console.log("[Process Message] Legacy mode - rebuilding template:", templateName);
            const templateData = await this.buildTemplateMessage(message.emergencyRequestId);
            if (templateData && templateData.templateName === templateName) {
              const result = await this.sendWhatsAppTemplateMessage(
                message.recipient,
                templateData.templateName,
                templateData.variables
              );
              success = result.success;
              whatsappMessageId = result.messageId;
              errorMessage = result.error;
            } else {
              console.error("[Process Message] Failed to rebuild template data");
              success = false;
              errorMessage = "Failed to rebuild template data";
            }
          }
        } else {
          const result = await this.sendWhatsAppMessage(message.recipient, message.content);
          success = result.success;
          whatsappMessageId = result.messageId;
          errorMessage = result.error;
        }
        if (!success) {
          console.log("WhatsApp failed, trying email fallback...");
          const hospital = await storage.getHospital(message.hospitalId);
          if (hospital?.email) {
            const emailSuccess = await this.sendEmail(
              hospital.email,
              "Emergency Pet Request",
              message.content.replace(/\[Template: [^\]]+\]\s*/, "")
            );
            if (emailSuccess) {
              await storage.updateMessage(messageId, {
                messageType: "email",
                recipient: hospital.email,
                status: "sent",
                sentAt: /* @__PURE__ */ new Date()
              });
              return;
            }
          }
        }
      } else if (message.messageType === "email") {
        success = await this.sendEmail(message.recipient, "Emergency Pet Request", message.content);
      } else if (message.messageType === "line") {
        const cleanContent = message.content.replace(/\[Template: [^\]]+\]\s*/, "");
        success = await this.sendLineMessage(message.recipient, cleanContent);
      }
      if (success) {
        await storage.updateMessage(messageId, {
          status: "sent",
          sentAt: /* @__PURE__ */ new Date(),
          whatsappMessageId: whatsappMessageId || null
        });
      } else {
        const newRetryCount = message.retryCount + 1;
        if (newRetryCount >= MAX_RETRIES) {
          await storage.updateMessage(messageId, {
            status: "failed",
            failedAt: /* @__PURE__ */ new Date(),
            errorMessage: errorMessage || "Max retries exceeded",
            retryCount: newRetryCount
          });
        } else {
          await storage.updateMessage(messageId, {
            status: "queued",
            retryCount: newRetryCount,
            errorMessage: errorMessage || null
          });
          console.log(`[Process Message] Scheduling retry ${newRetryCount}/${MAX_RETRIES} for message ${messageId} in ${RETRY_DELAY_MS * newRetryCount}ms`);
          setTimeout(() => {
            console.log(`[Process Message] Executing retry ${newRetryCount} for message ${messageId}`);
            this.processMessage(messageId);
          }, RETRY_DELAY_MS * newRetryCount);
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const currentMessage = await storage.getMessage(messageId);
      const currentRetryCount = currentMessage?.retryCount ?? message.retryCount;
      const newRetryCount = currentRetryCount + 1;
      await storage.updateMessage(messageId, {
        status: newRetryCount >= MAX_RETRIES ? "failed" : "queued",
        failedAt: newRetryCount >= MAX_RETRIES ? /* @__PURE__ */ new Date() : null,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        retryCount: newRetryCount
      });
      if (newRetryCount < MAX_RETRIES) {
        console.log(`[Process Message] Scheduling retry ${newRetryCount}/${MAX_RETRIES} for message ${messageId} after error`);
        setTimeout(() => {
          console.log(`[Process Message] Executing retry ${newRetryCount} for message ${messageId} after error`);
          this.processMessage(messageId);
        }, RETRY_DELAY_MS * newRetryCount);
      }
    }
  }
  /**
   * Process all queued messages (for background job)
   */
  async processQueue() {
    const queuedMessages = await storage.getQueuedMessages();
    for (const message of queuedMessages) {
      await this.processMessage(message.id);
    }
  }
  /**
   * Build WhatsApp template message based on emergency request data
   */
  async buildTemplateMessage(emergencyRequestId, language = "en") {
    const emergencyRequest = await storage.getEmergencyRequest(emergencyRequestId);
    if (!emergencyRequest) {
      console.error("[Template Builder] Emergency request not found:", emergencyRequestId);
      return null;
    }
    if (!emergencyRequest.manualLocation && emergencyRequest.locationLatitude && emergencyRequest.locationLongitude) {
      try {
        const geocoded = await reverseGeocodeServer(
          emergencyRequest.locationLatitude,
          emergencyRequest.locationLongitude,
          language
        );
        if (geocoded) {
          emergencyRequest.manualLocation = geocoded;
          console.log("[Template Builder] Reverse geocoded location:", geocoded);
        }
      } catch (geoErr) {
        console.warn("[Template Builder] Reverse geocode failed, using raw coords:", geoErr);
        emergencyRequest.manualLocation = `${Number(emergencyRequest.locationLatitude).toFixed(4)}, ${Number(emergencyRequest.locationLongitude).toFixed(4)}`;
      }
    }
    let pet = null;
    if (emergencyRequest.petId) {
      pet = await storage.getPet(emergencyRequest.petId);
    }
    let user = null;
    if (emergencyRequest.userId) {
      user = await storage.getUser(emergencyRequest.userId);
    }
    let medicalRecordsSummary = "";
    if (emergencyRequest.petId && emergencyRequest.userId) {
      const consents = await storage.getMedicalSharingConsentsByPetId(emergencyRequest.petId);
      const emergencyConsent = consents.find((c) => c.consentType === "emergency_broadcast" && c.enabled);
      if (emergencyConsent) {
        const records = await storage.getMedicalRecordsByPetId(emergencyRequest.petId);
        if (records && records.length > 0) {
          const isZh = user?.languagePreference === "zh-HK";
          const recordTypes = records.map((r) => {
            const typeLabels = {
              "blood_test": { en: "Blood Test", zh: "\u8840\u6DB2\u6AA2\u67E5" },
              "xray": { en: "X-Ray", zh: "X\u5149" },
              "vaccination": { en: "Vaccination", zh: "\u75AB\u82D7\u8A18\u9304" },
              "surgery_report": { en: "Surgery Report", zh: "\u624B\u8853\u5831\u544A" },
              "prescription": { en: "Prescription", zh: "\u8655\u65B9" },
              "other": { en: "Document", zh: "\u6587\u4EF6" }
            };
            const label = typeLabels[r.documentType] || typeLabels["other"];
            return isZh ? label.zh : label.en;
          });
          const uniqueTypes = Array.from(new Set(recordTypes));
          medicalRecordsSummary = isZh ? `
\u{1F4CB} \u91AB\u7642\u8A18\u9304: ${uniqueTypes.join(", ")} (${records.length}\u4EFD)` : `
\u{1F4CB} Medical Records: ${uniqueTypes.join(", ")} (${records.length} file${records.length > 1 ? "s" : ""})`;
        }
      }
    }
    const userLanguage = user?.languagePreference || language || "en";
    const isZhHk = userLanguage === "zh-HK";
    const langSuffix = isZhHk ? "_zh_hk" : "_en";
    let templateName;
    let variables = [];
    let fallbackText = "";
    if (pet && pet.lastVisitHospitalId) {
      templateName = `emergency_pet_alert_full${langSuffix}`;
      const lastHospital = await storage.getHospital(pet.lastVisitHospitalId);
      const lastHospitalName = lastHospital ? isZhHk && lastHospital.nameZh ? lastHospital.nameZh : lastHospital.nameEn : isZhHk ? "\u4E0D\u8A73" : "Unknown";
      const profileLink = `${getBaseUrl()}/emergency-profile/${emergencyRequestId}`;
      variables = [
        lastHospitalName,
        // {{1}} Last visited hospital
        pet.name || (isZhHk ? "\u672A\u547D\u540D" : "Unnamed"),
        // {{2}} Pet name
        emergencyRequest.petSpecies || (isZhHk ? "\u4E0D\u8A73" : "Unknown"),
        // {{3}} Species
        emergencyRequest.petBreed || (isZhHk ? "\u4E0D\u8A73" : "Unknown"),
        // {{4}} Breed
        emergencyRequest.petAge ? `${emergencyRequest.petAge} ${isZhHk ? "\u6B72" : "years"}` : isZhHk ? "\u4E0D\u8A73" : "Unknown",
        // {{5}} Age
        pet.weight ? `${pet.weight}${isZhHk ? "\u516C\u65A4" : "kg"}` : isZhHk ? "\u4E0D\u8A73" : "Unknown",
        // {{6}} Weight
        emergencyRequest.symptom || (isZhHk ? "\u7DCA\u6025\u60C5\u6CC1" : "Emergency situation"),
        // {{7}} Critical symptom
        pet.medicalNotes || (isZhHk ? "\u7121" : "None"),
        // {{8}} Medical notes
        emergencyRequest.manualLocation || (isZhHk ? "\u4E0D\u8A73" : "Unknown"),
        // {{9}} Location
        emergencyRequest.contactName || (isZhHk ? "\u5BF5\u7269\u4E3B\u4EBA" : "Pet Owner"),
        // {{10}} Owner name
        emergencyRequest.contactPhone || (isZhHk ? "\u4E0D\u8A73" : "Unknown"),
        // {{11}} Owner phone
        profileLink
        // {{12}} Profile URL
      ];
      fallbackText = `\u{1F6A8} ${isZhHk ? "\u7DCA\u6025\u5BF5\u7269\u6C42\u52A9" : "EMERGENCY PET ALERT"}

${isZhHk ? "\u5DF2\u767B\u8A18\u5BF5\u7269\uFF08\u6709\u91AB\u7642\u8A18\u9304\uFF09" : "REGISTERED PET WITH MEDICAL HISTORY"}
${isZhHk ? "\u540D\u7A31" : "Name"}: ${variables[1]}
${isZhHk ? "\u7269\u7A2E" : "Species"}: ${variables[2]}
${isZhHk ? "\u7DCA\u6025\u75C7\u72C0" : "Emergency"}: ${variables[6]}
${isZhHk ? "\u806F\u7D61" : "Contact"}: ${variables[9]} (${variables[10]})` + medicalRecordsSummary + `

\u{1F517} ${isZhHk ? "\u8A73\u7D30\u8CC7\u6599" : "Full Profile"}: ${profileLink}

${isZhHk ? "\u26A1 \u5FEB\u901F\u56DE\u8986\uFF1A\n\u56DE\u8986 1 = \u53EF\u4EE5\u63A5\u6536 \u2705\n\u56DE\u8986 2 = \u4ECA\u665A\u7206\u6EFF \u274C\n\u56DE\u8986 3 = \u8ACB\u4E3B\u4EBA\u81F4\u96FB\u6211\u5011 \u{1F4DE}" : "\u26A1 Quick Reply:\nReply 1 = We can accept \u2705\nReply 2 = Full tonight \u274C\nReply 3 = Please call us \u{1F4DE}"}`;
    } else if (pet) {
      templateName = `emergency_pet_alert_new${langSuffix}`;
      const profileLink = `${getBaseUrl()}/emergency-profile/${emergencyRequestId}`;
      variables = [
        pet.name || (isZhHk ? "\u672A\u547D\u540D" : "Unnamed"),
        // {{1}} Pet name
        emergencyRequest.petSpecies || (isZhHk ? "\u4E0D\u8A73" : "Unknown"),
        // {{2}} Species
        emergencyRequest.petBreed || (isZhHk ? "\u4E0D\u8A73" : "Unknown"),
        // {{3}} Breed
        emergencyRequest.petAge ? `${emergencyRequest.petAge} ${isZhHk ? "\u6B72" : "years"}` : isZhHk ? "\u4E0D\u8A73" : "Unknown",
        // {{4}} Age
        pet.weight ? `${pet.weight}${isZhHk ? "\u516C\u65A4" : "kg"}` : isZhHk ? "\u4E0D\u8A73" : "Unknown",
        // {{5}} Weight
        emergencyRequest.symptom || (isZhHk ? "\u7DCA\u6025\u60C5\u6CC1" : "Emergency situation"),
        // {{6}} Critical symptom
        pet.medicalNotes || (isZhHk ? "\u7121" : "None"),
        // {{7}} Medical notes
        emergencyRequest.manualLocation || (isZhHk ? "\u4E0D\u8A73" : "Unknown"),
        // {{8}} Location
        emergencyRequest.contactName || (isZhHk ? "\u5BF5\u7269\u4E3B\u4EBA" : "Pet Owner"),
        // {{9}} Owner name
        emergencyRequest.contactPhone || (isZhHk ? "\u4E0D\u8A73" : "Unknown"),
        // {{10}} Owner phone
        profileLink
        // {{11}} Profile URL
      ];
      fallbackText = `\u{1F6A8} ${isZhHk ? "\u7DCA\u6025\u5BF5\u7269\u6C42\u52A9" : "EMERGENCY PET ALERT"}

${isZhHk ? "\u540D\u7A31" : "Name"}: ${variables[0]}
${isZhHk ? "\u7269\u7A2E" : "Species"}: ${variables[1]}
${isZhHk ? "\u7DCA\u6025\u75C7\u72C0" : "Emergency"}: ${variables[5]}
${isZhHk ? "\u806F\u7D61" : "Contact"}: ${variables[8]} (${variables[9]})` + medicalRecordsSummary + `

\u{1F517} ${isZhHk ? "\u8A73\u7D30\u8CC7\u6599" : "Full Profile"}: ${profileLink}

${isZhHk ? "\u26A1 \u5FEB\u901F\u56DE\u8986\uFF1A\n\u56DE\u8986 1 = \u53EF\u4EE5\u63A5\u6536 \u2705\n\u56DE\u8986 2 = \u4ECA\u665A\u7206\u6EFF \u274C\n\u56DE\u8986 3 = \u8ACB\u4E3B\u4EBA\u81F4\u96FB\u6211\u5011 \u{1F4DE}" : "\u26A1 Quick Reply:\nReply 1 = We can accept \u2705\nReply 2 = Full tonight \u274C\nReply 3 = Please call us \u{1F4DE}"}`;
    } else {
      templateName = `emergency_pet_alert_basic${langSuffix}`;
      variables = [
        emergencyRequest.petSpecies || (isZhHk ? "\u4E0D\u8A73" : "Unknown"),
        // {{1}} Species
        emergencyRequest.petBreed || (isZhHk ? "\u4E0D\u8A73" : "Unknown"),
        // {{2}} Breed
        emergencyRequest.petAge ? `${emergencyRequest.petAge} ${isZhHk ? "\u6B72" : "years"}` : isZhHk ? "\u4E0D\u8A73" : "Unknown",
        // {{3}} Age
        emergencyRequest.symptom || (isZhHk ? "\u7DCA\u6025\u60C5\u6CC1" : "Emergency situation"),
        // {{4}} Critical symptom
        emergencyRequest.manualLocation || (isZhHk ? "\u4E0D\u8A73" : "Unknown"),
        // {{5}} Location
        emergencyRequest.contactName || (isZhHk ? "\u5BF5\u7269\u4E3B\u4EBA" : "Pet Owner"),
        // {{6}} Owner name
        emergencyRequest.contactPhone || (isZhHk ? "\u4E0D\u8A73" : "Unknown")
        // {{7}} Owner phone
      ];
      const profileLink = `${getBaseUrl()}/emergency-profile/${emergencyRequestId}`;
      fallbackText = `\u{1F6A8} ${isZhHk ? "\u7DCA\u6025\u5BF5\u7269\u6C42\u52A9" : "EMERGENCY PET ALERT"}

${isZhHk ? "\u7269\u7A2E" : "Species"}: ${variables[0]}
${isZhHk ? "\u7DCA\u6025\u75C7\u72C0" : "Emergency"}: ${variables[3]}
${isZhHk ? "\u806F\u7D61" : "Contact"}: ${variables[5]} (${variables[6]})

\u{1F517} ${isZhHk ? "\u8A73\u7D30\u8CC7\u6599" : "Full Profile"}: ${profileLink}

${isZhHk ? "\u26A1 \u5FEB\u901F\u56DE\u8986\uFF1A\n\u56DE\u8986 1 = \u53EF\u4EE5\u63A5\u6536 \u2705\n\u56DE\u8986 2 = \u4ECA\u665A\u7206\u6EFF \u274C\n\u56DE\u8986 3 = \u8ACB\u4E3B\u4EBA\u81F4\u96FB\u6211\u5011 \u{1F4DE}" : "\u26A1 Quick Reply:\nReply 1 = We can accept \u2705\nReply 2 = Full tonight \u274C\nReply 3 = Please call us \u{1F4DE}"}`;
    }
    console.log("[Template Builder] Selected template:", templateName);
    console.log("[Template Builder] Variables count:", variables.length);
    return { templateName, variables, fallbackText };
  }
  /**
   * Broadcast emergency to multiple hospitals
   * Sends BOTH English and Traditional Chinese messages to each hospital
   */
  async broadcastEmergency(emergencyRequestId, hospitalIds, message) {
    const messages2 = [];
    const templateDataEn = await this.buildTemplateMessage(emergencyRequestId, "en");
    const templateDataZh = await this.buildTemplateMessage(emergencyRequestId, "zh-HK");
    if (!templateDataEn || !templateDataZh) {
      console.error("[Broadcast] Failed to build template messages");
      throw new Error("Failed to build emergency message templates");
    }
    console.log("[Broadcast] Sending bilingual messages (EN + ZH-HK) to each hospital");
    const sendLanguageMessage = async (hospitalId, hospital, templateData, langLabel) => {
      const { templateName, variables, fallbackText } = templateData;
      let messageType;
      let recipient;
      let contentToStore;
      const templateLanguage = templateName.endsWith("_zh_hk") ? "zh_HK" : "en";
      if (hospital.whatsapp) {
        messageType = "whatsapp";
        recipient = hospital.whatsapp;
        contentToStore = `[Template: ${templateName}] ${fallbackText}`;
      } else if (hospital.email) {
        messageType = "email";
        recipient = hospital.email;
        contentToStore = fallbackText;
      } else {
        return null;
      }
      const msg = await storage.createMessage({
        emergencyRequestId,
        hospitalId,
        recipient,
        messageType,
        content: contentToStore,
        status: "queued",
        templateName: messageType === "whatsapp" ? templateName : null,
        templateVariables: messageType === "whatsapp" ? variables : null,
        templateLanguage: messageType === "whatsapp" ? templateLanguage : null
      });
      await this.processMessage(msg.id);
      const updatedMsg = await storage.getMessage(msg.id);
      console.log(`[Broadcast] ${langLabel} message sent to ${hospital.nameEn || hospital.nameZh}: ${updatedMsg?.status}`);
      return updatedMsg;
    };
    for (const hospitalId of hospitalIds) {
      const hospital = await storage.getHospital(hospitalId);
      if (!hospital) {
        console.warn(`Hospital not found: ${hospitalId}`);
        continue;
      }
      if (!hospital.whatsapp && !hospital.email) {
        console.warn(`No valid contact method (WhatsApp or Email) for hospital ${hospitalId}`);
        await storage.createMessage({
          emergencyRequestId,
          hospitalId,
          recipient: hospital.phone || "unknown",
          messageType: "whatsapp",
          content: templateDataEn.fallbackText,
          status: "failed",
          errorMessage: "No valid WhatsApp or Email contact available",
          failedAt: /* @__PURE__ */ new Date()
        });
        continue;
      }
      const msgEn = await sendLanguageMessage(hospitalId, hospital, templateDataEn, "EN");
      if (msgEn) {
        messages2.push(msgEn);
      }
      const msgZh = await sendLanguageMessage(hospitalId, hospital, templateDataZh, "ZH-HK");
      if (msgZh) {
        messages2.push(msgZh);
      }
    }
    return messages2;
  }
  /**
   * Send a direct WhatsApp message (not tied to an emergency request)
   * Used for admin outreach, notifications, etc.
   */
  async sendDirectWhatsAppMessage(phoneNumber, content) {
    return this.sendWhatsAppMessage(phoneNumber, content);
  }
  /**
   * Send a Thank You message to a vet consultant applicant
   * Uses the consultant_thank_you WhatsApp template
   */
  async sendThankYouMessage(phoneNumber, applicantName) {
    console.log("[Thank You Message] Sending to:", phoneNumber, "Name:", applicantName);
    const templateName = "consultant_thank_you";
    const templateVariables = [applicantName];
    try {
      const result = await this.sendWhatsAppTemplateMessage(phoneNumber, templateName, templateVariables);
      return result;
    } catch (error) {
      console.error("[Thank You Message] Template failed, trying direct message:", error.message);
      const fallbackMessage = `Dear ${applicantName},

Thank you for your interest in joining PetSOS as a veterinary consultant. We appreciate your commitment to helping pet owners during emergencies.

We will review your application and get back to you soon.

Best regards,
The PetSOS Team`;
      return this.sendWhatsAppMessage(phoneNumber, fallbackMessage);
    }
  }
};
var messagingService = new MessagingService();
setInterval(() => {
  messagingService.processQueue().catch(console.error);
}, 3e4);

// server/auth.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcrypt";
import connectPg from "connect-pg-simple";

// server/config.ts
function getEnvironment() {
  const env = process.env.NODE_ENV?.toLowerCase() || "development";
  if (env === "production" || env === "prod") return "production";
  if (env === "staging" || env === "stage") return "staging";
  return "development";
}
function validateEnvironmentVariables(env) {
  if (env === "development") {
    return;
  }
  const required = [];
  const missing = [];
  if (env === "production" || env === "staging") {
    required.push("DATABASE_URL", "SESSION_SECRET");
  }
  required.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });
  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(", ")}`;
    console.error(`[Config Error] ${message}`);
    throw new Error(message);
  }
  console.log("[Config] All required environment variables are set");
}
function loadConfig() {
  const env = getEnvironment();
  const isDevelopment = env === "development";
  const isStaging = env === "staging";
  const isProduction = env === "production";
  validateEnvironmentVariables(env);
  if (isDevelopment) {
    if (!process.env.DATABASE_URL) {
      console.warn("[Config] DATABASE_URL not set - database features will not work");
    }
    if (!process.env.REPLIT_DOMAINS && !process.env.PRODUCTION_URL) {
      console.warn("[Config] Neither REPLIT_DOMAINS nor PRODUCTION_URL set - authentication may not work correctly");
    }
    if (!process.env.SESSION_SECRET) {
      console.warn("[Config] SESSION_SECRET not set - using default (insecure for production)");
    }
  } else {
    const requiredVars = ["DATABASE_URL", "SESSION_SECRET"];
    const missing = requiredVars.filter((v) => !process.env[v]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables for ${env}: ${missing.join(", ")}`);
    }
    if (!process.env.REPLIT_DOMAINS && !process.env.PRODUCTION_URL) {
      console.warn("[Config] Neither REPLIT_DOMAINS nor PRODUCTION_URL set - Google OAuth may not work");
    }
  }
  const config2 = {
    env,
    port: parseInt(process.env.PORT || "5000", 10),
    isDevelopment,
    isStaging,
    isProduction,
    database: {
      // Use empty string in development if not set, otherwise it's guaranteed to exist
      url: process.env.DATABASE_URL || (isDevelopment ? "" : process.env.DATABASE_URL)
    },
    session: {
      secret: process.env.SESSION_SECRET || (isDevelopment ? "dev-secret-change-in-production" : process.env.SESSION_SECRET),
      secure: isProduction || isStaging,
      // HTTPS only in staging/production
      maxAge: isProduction ? 7 * 24 * 60 * 60 * 1e3 : 30 * 24 * 60 * 60 * 1e3
      // 7 days prod, 30 days dev
    },
    auth: {
      // REPLIT_DOMAINS is now optional - if not set, app uses PRODUCTION_URL for Google OAuth
      replitDomains: process.env.REPLIT_DOMAINS || ""
    },
    rateLimit: {
      enabled: !isDevelopment,
      // Disable in development for easier testing
      windowMs: 15 * 60 * 1e3,
      // 15 minutes
      maxRequests: isProduction ? 100 : 1e3
      // Stricter in production
    },
    monitoring: {
      sentryDsn: process.env.SENTRY_DSN,
      sentryTracesSampleRate: isProduction ? 0.1 : 1,
      sentryEnv: env
    },
    logging: {
      level: isDevelopment ? "debug" : isProduction ? "warn" : "info"
    },
    regional: {
      defaultCountry: process.env.DEFAULT_COUNTRY || "HK",
      defaultCountryCode: process.env.DEFAULT_COUNTRY_CODE || "+852",
      defaultLanguage: process.env.DEFAULT_LANGUAGE || "zh-HK"
    }
  };
  console.log(`[Config] Environment: ${env}`);
  console.log(`[Config] Port: ${config2.port}`);
  console.log(`[Config] Rate limiting: ${config2.rateLimit.enabled ? "enabled" : "disabled"}`);
  console.log(`[Config] Session secure cookies: ${config2.session.secure}`);
  console.log(`[Config] Sentry monitoring: ${config2.monitoring.sentryDsn ? "enabled" : "disabled"}`);
  console.log(`[Config] Regional defaults: ${config2.regional.defaultCountry} (${config2.regional.defaultCountryCode}), Language: ${config2.regional.defaultLanguage}`);
  return config2;
}
var config = loadConfig();

// server/auth.ts
function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, password, twoFactorSecret, twoFactorBackupCodes, ...sanitized } = user;
  return sanitized;
}
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var BASE_URL = process.env.PRODUCTION_URL || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "http://localhost:5000");
function getSession() {
  let sessionStore;
  if (config.database.url) {
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: config.database.url,
      createTableIfMissing: false,
      ttl: config.session.maxAge,
      tableName: "sessions"
    });
  } else if (config.isDevelopment) {
    console.warn("[Session] Using in-memory session store - sessions will not persist across restarts");
  }
  return session({
    secret: config.session.secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.session.secure,
      maxAge: config.session.maxAge
    }
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: `${BASE_URL}/api/auth/google/callback`
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email found in Google profile"));
            }
            let user = await storage.getUserByEmail(email);
            if (!user) {
              user = await storage.createUser({
                email,
                name: profile.displayName || profile.name?.givenName || "",
                profileImageUrl: profile.photos?.[0]?.value,
                role: "user"
              });
            }
            done(null, user);
          } catch (error) {
            done(error);
          }
        }
      )
    );
    app2.get(
      "/api/auth/google",
      (req, res, next) => {
        if (!req.session) {
          console.error("[Auth] Session not available at Google OAuth start");
          return res.redirect("/login?error=session_failed");
        }
        const returnTo = req.query.returnTo;
        if (returnTo && returnTo.startsWith("/")) {
          req.session.returnTo = returnTo;
        }
        next();
      },
      passport.authenticate("google", { scope: ["profile", "email"] })
    );
    app2.get(
      "/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/login" }),
      (req, res) => {
        if (!req.session) {
          console.error("[Auth] Session not available after Google OAuth");
          return res.redirect("/login?error=session_failed");
        }
        const returnTo = req.session.returnTo || "/profile";
        delete req.session.returnTo;
        req.session.save((err) => {
          if (err) {
            console.error("[Auth] Session save error:", err);
            return res.redirect("/login?error=session_save_failed");
          }
          res.redirect(returnTo);
        });
      }
    );
  } else {
    console.warn("[Auth] Google OAuth not configured - set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
  }
  passport.use(
    new LocalStrategy(
      { usernameField: "identifier", passwordField: "password", passReqToCallback: true },
      async (req, identifier, password, done) => {
        try {
          let user;
          const isPhone = identifier?.startsWith("+");
          if (isPhone) {
            user = await storage.getUserByPhone(identifier);
          } else {
            user = await storage.getUserByEmail(identifier);
          }
          if (!user || !user.passwordHash) {
            return done(null, false, { message: "Invalid credentials" });
          }
          const isValidPassword = await bcrypt.compare(password, user.passwordHash);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid credentials" });
          }
          if (user.role === "admin" && user.twoFactorEnabled) {
            return done(null, false, { message: "requiresTwoFactor", requiresTwoFactor: true, userId: user.id });
          }
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
  app2.post("/api/auth/login", (req, res, next) => {
    const { email, phone, countryCode } = req.body;
    const identifier = phone && countryCode ? `${countryCode}${phone}` : email;
    req.body.identifier = identifier;
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user && info?.requiresTwoFactor && info?.userId) {
        req.session.pendingTwoFactorUserId = info.userId;
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("[Auth] Session save error during 2FA:", saveErr);
            return res.status(500).json({ message: "Session error" });
          }
          return res.json({
            success: true,
            requiresTwoFactor: true,
            userId: info.userId
          });
        });
        return;
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.logIn(user, (err2) => {
        if (err2) {
          return res.status(500).json({ message: "Login failed" });
        }
        return res.json({ success: true, user: sanitizeUser(user) });
      });
    })(req, res, next);
  });
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, phone, countryCode, password, name } = req.body;
      if (!email && !phone || !password) {
        return res.status(400).json({ message: "Email or phone number, and password are required" });
      }
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }
      const fullPhone = phone && countryCode ? `${countryCode}${phone}` : phone;
      if (email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({ message: "Email already registered" });
        }
      }
      if (fullPhone) {
        const existingUser = await storage.getUserByPhone(fullPhone);
        if (existingUser) {
          return res.status(400).json({ message: "Phone number already registered" });
        }
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email: email || null,
        phone: fullPhone || null,
        passwordHash,
        name: name || "",
        role: "user"
      });
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        return res.json({ success: true, user: sanitizeUser(user) });
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });
  app2.get("/api/auth/user", (req, res) => {
    if (req.session?.pendingTwoFactorUserId) {
      return res.json({ requiresTwoFactor: true });
    }
    if (req.isAuthenticated()) {
      res.json(sanitizeUser(req.user));
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
}
var isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
var isAdmin = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = req.user;
  if (user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  next();
};

// server/testUtils.ts
function setupTestUtils(app2) {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  app2.post("/api/test/auth/session", async (req, res) => {
    try {
      const { sub, email, name, role } = req.body;
      const user = await storage.upsertUser({
        openidSub: sub,
        email: email || `test-${sub}@test.com`,
        name: name || "Test User",
        profileImageUrl: null
      });
      if (role === "admin") {
        await storage.updateUser(user.id, { role: "admin" });
      }
      req.session.passport = {
        user: user.id
        // Use the actual database ID, not the openidSub
      };
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve(void 0);
        });
      });
      res.json({ success: true, userId: user.id });
    } catch (error) {
      console.error("Test auth error:", error);
      res.status(500).json({ error: "Failed to create test session" });
    }
  });
  app2.post("/api/test/clinics", async (req, res) => {
    try {
      const clinic = await storage.createClinic(req.body);
      res.status(201).json(clinic);
    } catch (error) {
      console.error("Test clinic creation error:", error);
      res.status(500).json({ error: "Failed to create test clinic" });
    }
  });
  app2.post("/api/test/assign-staff", async (req, res) => {
    try {
      const { userId, clinicId } = req.body;
      await storage.updateUser(userId, { clinicId });
      res.json({ success: true });
    } catch (error) {
      console.error("Test staff assignment error:", error);
      res.status(500).json({ error: "Failed to assign staff" });
    }
  });
  app2.post("/api/test/make-admin", async (req, res) => {
    try {
      const { userId } = req.body;
      await storage.updateUser(userId, { role: "admin" });
      res.json({ success: true });
    } catch (error) {
      console.error("Test admin assignment error:", error);
      res.status(500).json({ error: "Failed to make user admin" });
    }
  });
}

// server/routes.ts
init_db();
init_schema();
import { eq as eq3 } from "drizzle-orm";
import rateLimit2 from "express-rate-limit";
import * as OTPAuth from "otpauth";
import * as QRCode from "qrcode";
import bcrypt2 from "bcrypt";
import crypto2 from "crypto";

// server/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
var generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: Math.floor(config.rateLimit.windowMs / 1e3)
  },
  standardHeaders: true,
  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  // Disable the `X-RateLimit-*` headers
  skip: () => !config.rateLimit.enabled,
  // Skip rate limiting if disabled
  skipSuccessfulRequests: false
  // Count all requests
});
var strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // Limit each IP to 5 requests per windowMs
  message: {
    error: "Too many attempts. Please try again later.",
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !config.rateLimit.enabled,
  // Skip rate limiting if disabled
  skipSuccessfulRequests: false
});
var broadcastLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 10,
  // Limit each IP to 10 broadcasts per hour
  message: {
    error: "Too many emergency broadcasts. Please wait before sending another alert.",
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !config.rateLimit.enabled,
  // Skip rate limiting if disabled
  skipSuccessfulRequests: false
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 10,
  // Limit each IP to 10 login attempts per windowMs
  message: {
    error: "Too many login attempts. Please try again later.",
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !config.rateLimit.enabled,
  // Skip rate limiting if disabled
  skipSuccessfulRequests: false
});
var exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 3,
  // Limit each IP to 3 exports per hour
  message: {
    error: "Too many data export requests. Please try again later.",
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !config.rateLimit.enabled,
  // Skip rate limiting if disabled
  skipSuccessfulRequests: false
});
var deletionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1e3,
  // 24 hours
  max: 1,
  // Limit each IP to 1 deletion per day
  message: {
    error: "Account deletion limit reached. Please contact support if you need assistance.",
    retryAfter: 86400
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !config.rateLimit.enabled,
  // Skip rate limiting if disabled
  skipSuccessfulRequests: false
});

// server/services/deepseek.ts
var DeepSeekService = class {
  apiKey;
  apiUrl = "https://api.deepseek.com/v1/chat/completions";
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || "";
    if (!this.apiKey) {
      console.warn("\u26A0\uFE0F DEEPSEEK_API_KEY not set - AI analysis will use fallback keyword detection");
    }
  }
  /**
   * Check if DeepSeek API is configured
   */
  isAvailable() {
    return !!this.apiKey;
  }
  /**
   * Analyze voice transcript using DeepSeek AI
   */
  async analyzeVoiceTranscript(transcript, language = "en") {
    if (!this.isAvailable()) {
      throw new Error("DeepSeek API key not configured");
    }
    try {
      const systemPrompt = this.buildSystemPrompt(language);
      const userPrompt = this.buildUserPrompt(transcript, language);
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          // Lower temperature for more consistent medical analysis
          max_tokens: 500,
          response_format: { type: "json_object" }
        })
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
      }
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from DeepSeek API");
      }
      const analysis = JSON.parse(content);
      return {
        severity: analysis.severity || "general",
        confidence: analysis.confidence || 0.5,
        primarySymptoms: analysis.primarySymptoms || [],
        summary: analysis.summary || "Emergency situation detected",
        detectedKeywords: analysis.detectedKeywords || [],
        language: analysis.language || language,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("DeepSeek analysis error:", error);
      throw error;
    }
  }
  /**
   * Build system prompt for DeepSeek
   */
  buildSystemPrompt(language) {
    return `You are a veterinary triage assistant analyzing pet emergency descriptions.

Your task:
1. Analyze the pet owner's description of their emergency
2. Identify symptoms and their severity
3. Categorize the emergency level
4. Extract key information for veterinary clinics

Categories of symptoms:
- Critical: Life-threatening (unconscious, not breathing, severe bleeding, poisoning, trauma)
- Urgent: Serious but stable (difficulty breathing, seizures, severe pain, acute injury)
- Moderate: Concerning but not immediately life-threatening (vomiting, diarrhea, limping)
- General: Non-specific emergency

Return ONLY a JSON object with this exact structure:
{
  "severity": "critical" | "urgent" | "moderate" | "general",
  "confidence": 0.0-1.0,
  "primarySymptoms": [
    {
      "symptom": "difficulty breathing",
      "category": "breathing",
      "bodyPart": "respiratory system"
    }
  ],
  "summary": "Brief description (max 50 words) suitable for emergency broadcast",
  "detectedKeywords": ["keyword1", "keyword2"],
  "language": "${language}"
}

Be concise, accurate, and prioritize life-threatening conditions.`;
  }
  /**
   * Build user prompt for DeepSeek
   */
  buildUserPrompt(transcript, language) {
    const langNote = language === "zh-HK" || language === "zh" ? " (Note: This may be in Cantonese or mixed Cantonese/English)" : language === "zh-CN" ? " (Note: This may be in Mandarin Chinese)" : "";
    return `Analyze this pet emergency description${langNote}:

"${transcript}"

Provide JSON analysis with severity, symptoms, and a brief summary for veterinary clinics.`;
  }
  /**
   * Generate broadcast-ready message from analysis
   */
  formatForBroadcast(analysis, transcript) {
    const severityEmoji = {
      critical: "\u{1F534}",
      urgent: "\u26A0\uFE0F",
      moderate: "\u{1F7E1}",
      general: "\u2139\uFE0F"
    };
    const emoji = severityEmoji[analysis.severity];
    const confidencePercent = Math.round(analysis.confidence * 100);
    let message = `${emoji} AI EMERGENCY ANALYSIS
`;
    message += `\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
`;
    message += `Severity: ${analysis.severity.toUpperCase()}
`;
    message += `Confidence: ${confidencePercent}%

`;
    if (analysis.primarySymptoms.length > 0) {
      message += `Primary Concerns:
`;
      analysis.primarySymptoms.forEach((symptom) => {
        message += `  \u2022 ${symptom.symptom}`;
        if (symptom.bodyPart) {
          message += ` (${symptom.bodyPart})`;
        }
        message += `
`;
      });
      message += `
`;
    }
    message += `Summary:
${analysis.summary}

`;
    message += `\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
`;
    message += `\u{1F3A4} OWNER'S DESCRIPTION
`;
    message += `\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
`;
    message += `"${transcript}"

`;
    message += `Analyzed: ${new Date(analysis.timestamp).toLocaleString()}
`;
    return message;
  }
};
var deepseekService = new DeepSeekService();

// server/services/hko-api.ts
var HKO_API_URL = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en";
var SIGNAL_NAMES = {
  "TC1": { en: "Standby Signal No. 1", zh: "\u4E00\u865F\u6212\u5099\u4FE1\u865F", severity: 1 },
  "TC3": { en: "Strong Wind Signal No. 3", zh: "\u4E09\u865F\u5F37\u98A8\u4FE1\u865F", severity: 3 },
  "TC8NE": { en: "Gale or Storm Signal No. 8 NE", zh: "\u516B\u865F\u6771\u5317\u70C8\u98A8\u6216\u66B4\u98A8\u4FE1\u865F", severity: 8 },
  "TC8NW": { en: "Gale or Storm Signal No. 8 NW", zh: "\u516B\u865F\u897F\u5317\u70C8\u98A8\u6216\u66B4\u98A8\u4FE1\u865F", severity: 8 },
  "TC8SE": { en: "Gale or Storm Signal No. 8 SE", zh: "\u516B\u865F\u6771\u5357\u70C8\u98A8\u6216\u66B4\u98A8\u4FE1\u865F", severity: 8 },
  "TC8SW": { en: "Gale or Storm Signal No. 8 SW", zh: "\u516B\u865F\u897F\u5357\u70C8\u98A8\u6216\u66B4\u98A8\u4FE1\u865F", severity: 8 },
  "TC9": { en: "Increasing Gale or Storm Signal No. 9", zh: "\u4E5D\u865F\u70C8\u98A8\u6216\u66B4\u98A8\u98A8\u529B\u589E\u5F37\u4FE1\u865F", severity: 9 },
  "TC10": { en: "Hurricane Signal No. 10", zh: "\u5341\u865F\u98B6\u98A8\u4FE1\u865F", severity: 10 }
};
async function fetchWithRetry(url, retries = 3, delay = 1e3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1e4);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "User-Agent": "PetSOS/1.0"
        }
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (error) {
      console.error(`[HKO API] Attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt === retries) {
        throw new Error(`Failed to fetch HKO data after ${retries} attempts: ${error.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error("Unexpected error in fetchWithRetry");
}
async function fetchTyphoonWarning() {
  try {
    console.log("[HKO API] Fetching typhoon warning data...");
    const response = await fetchWithRetry(HKO_API_URL);
    const data = await response.json();
    console.log("[HKO API] Response received:", JSON.stringify(data).substring(0, 500));
    if (!data || typeof data !== "object") {
      console.log("[HKO API] Invalid response format");
      return null;
    }
    const wtcsgnl = data.WTCSGNL;
    if (!wtcsgnl) {
      console.log("[HKO API] No WTCSGNL field - no typhoon signal active");
      return null;
    }
    const signalCode = wtcsgnl.code;
    if (!signalCode) {
      console.log("[HKO API] WTCSGNL present but no code field");
      return null;
    }
    const normalizedCode = signalCode.toUpperCase();
    const signalInfo = SIGNAL_NAMES[normalizedCode];
    if (!signalInfo) {
      console.warn(`[HKO API] Unknown signal code: ${signalCode}`);
      const severity = normalizedCode.includes("10") ? 10 : normalizedCode.includes("9") ? 9 : normalizedCode.includes("8") ? 8 : normalizedCode.includes("3") ? 3 : 1;
      return {
        signalCode: normalizedCode,
        signalName: `Typhoon Signal ${normalizedCode}`,
        signalNameZh: `\u98B1\u98A8\u4FE1\u865F ${normalizedCode}`,
        issuedAt: wtcsgnl.issueTime ? new Date(wtcsgnl.issueTime) : /* @__PURE__ */ new Date(),
        severity,
        rawData: wtcsgnl
      };
    }
    const issuedAt = wtcsgnl.issueTime ? new Date(wtcsgnl.issueTime) : wtcsgnl.updateTime ? new Date(wtcsgnl.updateTime) : /* @__PURE__ */ new Date();
    console.log(`[HKO API] Active typhoon signal: ${normalizedCode} (${signalInfo.en}), issued at ${issuedAt.toISOString()}`);
    return {
      signalCode: normalizedCode,
      signalName: signalInfo.en,
      signalNameZh: signalInfo.zh,
      issuedAt,
      severity: signalInfo.severity,
      rawData: wtcsgnl
    };
  } catch (error) {
    console.error("[HKO API] Error fetching typhoon warning:", error.message);
    throw error;
  }
}

// server/services/fcm.ts
import admin from "firebase-admin";
var FCMService = class {
  initialized = false;
  constructor() {
    this.initialize();
  }
  initialize() {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      console.warn("\u26A0\uFE0F FIREBASE_SERVICE_ACCOUNT_JSON not set - push notifications will be simulated");
      return;
    }
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }
      this.initialized = true;
      console.log("\u2705 Firebase Admin SDK initialized successfully");
    } catch (error) {
      console.error("\u274C Failed to initialize Firebase Admin SDK:", error);
    }
  }
  isAvailable() {
    return this.initialized;
  }
  async sendToTokens(tokens, payload) {
    if (!this.isAvailable()) {
      console.log("\u{1F4F1} [FCM Simulation] Would send notification to", tokens.length, "devices:", {
        title: payload.title,
        message: payload.message,
        url: payload.url
      });
      return {
        success: true,
        successCount: tokens.length,
        failureCount: 0,
        failedTokens: []
      };
    }
    if (tokens.length === 0) {
      return {
        success: false,
        error: "No tokens provided",
        successCount: 0,
        failureCount: 0
      };
    }
    try {
      const message = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.message
        },
        webpush: {
          notification: {
            title: payload.title,
            body: payload.message,
            icon: payload.icon || "/icons/icon-192x192.png",
            badge: "/icons/icon-72x72.png",
            ...payload.image && { image: payload.image }
          },
          fcmOptions: {
            link: payload.url || "/"
          }
        },
        data: {
          url: payload.url || "/",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
      const response = await admin.messaging().sendEachForMulticast(message);
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          console.error(`FCM send failed for token ${tokens[idx]}:`, resp.error.message);
          if (resp.error.code === "messaging/invalid-registration-token" || resp.error.code === "messaging/registration-token-not-registered") {
            failedTokens.push(tokens[idx]);
          }
        }
      });
      console.log(`\u{1F4F1} FCM sent: ${response.successCount} success, ${response.failureCount} failed`);
      return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("FCM send error:", errorMessage);
      return {
        success: false,
        error: errorMessage,
        successCount: 0,
        failureCount: tokens.length
      };
    }
  }
  async sendBroadcast(tokens, payload) {
    return this.sendToTokens(tokens, payload);
  }
};
var fcmService = new FCMService();
var sendPushNotification = async (tokens, payload) => {
  return fcmService.sendToTokens(tokens, payload);
};
var sendBroadcastNotification = async (tokens, payload) => {
  return fcmService.sendBroadcast(tokens, payload);
};

// server/services/notification-scheduler.ts
init_gmail_client();
var SCHEDULER_INTERVAL_MS = 60 * 1e3;
var TYPHOON_QUEUE_INTERVAL_MS = 30 * 1e3;
var MAX_RETRIES2 = 3;
var schedulerInterval = null;
var typhoonQueueInterval = null;
var isProcessing = false;
var isTyphoonQueueProcessing = false;
var WHATSAPP_API_URL2 = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v21.0";
var WHATSAPP_PHONE_NUMBER_ID2 = process.env.WHATSAPP_PHONE_NUMBER_ID;
var WHATSAPP_ACCESS_TOKEN2 = process.env.WHATSAPP_ACCESS_TOKEN;
async function processScheduledNotifications() {
  if (isProcessing) {
    console.log("[NotificationScheduler] Previous run still in progress, skipping...");
    return;
  }
  isProcessing = true;
  try {
    const dueNotifications = await storage.getScheduledNotifications();
    if (dueNotifications.length === 0) {
      return;
    }
    console.log(`[NotificationScheduler] Found ${dueNotifications.length} scheduled notifications to send`);
    for (const notification of dueNotifications) {
      try {
        console.log(`[NotificationScheduler] Processing notification ${notification.id}: "${notification.title}"`);
        await storage.updateNotificationBroadcastStatus(notification.id, "pending");
        const tokens = await storage.getActiveTokens(
          notification.targetLanguage || void 0,
          notification.targetRole || void 0
        );
        if (tokens.length === 0) {
          await storage.updateNotificationBroadcast(notification.id, {
            status: "sent",
            recipientCount: 0,
            providerResponse: {
              message: "No active subscriptions found",
              url: notification.url || null
            },
            sentAt: /* @__PURE__ */ new Date()
          });
          console.log(`[NotificationScheduler] Notification ${notification.id} sent to 0 recipients (no active subscriptions)`);
          continue;
        }
        const result = await sendBroadcastNotification(tokens, {
          title: notification.title,
          message: notification.message,
          url: notification.url || void 0
        });
        if (result.failedTokens && result.failedTokens.length > 0) {
          await storage.deactivatePushSubscriptions(result.failedTokens);
        }
        await storage.updateNotificationBroadcast(notification.id, {
          status: result.success ? "sent" : "failed",
          recipientCount: result.successCount || 0,
          providerResponse: {
            successCount: result.successCount || 0,
            failureCount: result.failureCount || 0,
            url: notification.url || null,
            error: result.error || null
          },
          sentAt: result.success ? /* @__PURE__ */ new Date() : null
        });
        await storage.createAuditLog({
          entityType: "notification_broadcast",
          entityId: notification.id,
          action: "send_scheduled",
          userId: notification.adminId,
          changes: {
            title: notification.title,
            scheduledFor: notification.scheduledFor,
            recipientCount: result.successCount || 0,
            success: result.success
          }
        });
        console.log(`[NotificationScheduler] Notification ${notification.id} sent: ${result.successCount} success, ${result.failureCount} failed`);
      } catch (error) {
        console.error(`[NotificationScheduler] Error processing notification ${notification.id}:`, error);
        await storage.updateNotificationBroadcast(notification.id, {
          status: "failed",
          providerResponse: {
            error: error instanceof Error ? error.message : "Unknown error"
          }
        });
      }
    }
  } catch (error) {
    console.error("[NotificationScheduler] Error in scheduler run:", error);
  } finally {
    isProcessing = false;
  }
}
function startNotificationScheduler() {
  if (schedulerInterval) {
    console.log("[NotificationScheduler] Scheduler already running");
    return;
  }
  console.log("[NotificationScheduler] Starting notification scheduler (checking every minute)");
  processScheduledNotifications();
  schedulerInterval = setInterval(processScheduledNotifications, SCHEDULER_INTERVAL_MS);
}
async function sendWhatsAppTextMessage(phoneNumber, message) {
  if (!WHATSAPP_ACCESS_TOKEN2 || !WHATSAPP_PHONE_NUMBER_ID2) {
    console.log("[WhatsApp] Not configured - skipping message");
    return { success: false, error: "WhatsApp not configured" };
  }
  let cleanedNumber = phoneNumber.replace(/[^0-9]/g, "");
  if (!cleanedNumber || cleanedNumber.length < 8) {
    return { success: false, error: "Invalid phone number" };
  }
  try {
    const url = `${WHATSAPP_API_URL2}/${WHATSAPP_PHONE_NUMBER_ID2}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      to: cleanedNumber,
      type: "text",
      text: { body: message }
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN2}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[WhatsApp] Send failed:", errorData);
      return { success: false, error: JSON.stringify(errorData) };
    }
    console.log("[WhatsApp] Message sent successfully to:", cleanedNumber);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[WhatsApp] Error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
async function sendNotificationByChannel(notification, subscription) {
  const channel = notification.channel;
  const language = subscription?.preferredLanguage || "en";
  const title = language === "zh" ? notification.titleZh : notification.titleEn;
  const body = language === "zh" ? notification.bodyZh : notification.bodyEn;
  console.log(`[TyphoonQueue] Sending ${channel} notification: "${title}"`);
  try {
    switch (channel) {
      case "push": {
        const token = subscription?.pushToken;
        if (!token) {
          return { success: false, error: "No push token available" };
        }
        const result = await sendPushNotification([token], { title, message: body });
        return { success: result.success, error: result.error };
      }
      case "email": {
        const email = subscription?.email;
        if (!email) {
          return { success: false, error: "No email address available" };
        }
        try {
          const success = await sendGmailEmail(
            email,
            title,
            body,
            process.env.EMAIL_FROM || "noreply@petsos.site"
          );
          return { success, error: success ? void 0 : "Email send failed" };
        } catch (error) {
          console.log("[TyphoonQueue] Email service not configured, skipping");
          return { success: false, error: "Email service not configured" };
        }
      }
      case "whatsapp": {
        const phone = subscription?.phone;
        if (!phone) {
          return { success: false, error: "No phone number available" };
        }
        const message = `${title}

${body}`;
        return await sendWhatsAppTextMessage(phone, message);
      }
      default:
        return { success: false, error: `Unknown channel: ${channel}` };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}
async function processTyphoonNotificationQueue() {
  if (isTyphoonQueueProcessing) {
    console.log("[TyphoonQueue] Previous run still in progress, skipping...");
    return { processed: 0, sent: 0, failed: 0 };
  }
  isTyphoonQueueProcessing = true;
  let processed = 0, sent = 0, failed = 0;
  try {
    const pendingNotifications = await storage.getPendingTyphoonNotifications();
    if (pendingNotifications.length === 0) {
      return { processed: 0, sent: 0, failed: 0 };
    }
    console.log(`[TyphoonQueue] Processing ${pendingNotifications.length} pending notifications`);
    for (const notification of pendingNotifications) {
      processed++;
      try {
        await storage.updateTyphoonNotification(notification.id, { status: "sending" });
        let subscription = null;
        if (notification.targetAudience === "subscribed") {
          const subscriptions = await storage.getActiveEmergencySubscriptions("typhoon");
          subscription = subscriptions[0] || null;
        }
        const result = await sendNotificationByChannel(notification, subscription);
        if (result.success) {
          await storage.updateTyphoonNotification(notification.id, {
            status: "sent",
            sentAt: /* @__PURE__ */ new Date(),
            recipientCount: 1
          });
          sent++;
          console.log(`[TyphoonQueue] Notification ${notification.id} sent successfully`);
        } else {
          const retryCount = (notification.retryCount || 0) + 1;
          if (retryCount >= MAX_RETRIES2) {
            await storage.updateTyphoonNotification(notification.id, {
              status: "failed",
              retryCount,
              errorMessage: result.error || "Max retries exceeded"
            });
            failed++;
            console.error(`[TyphoonQueue] Notification ${notification.id} failed after ${retryCount} retries: ${result.error}`);
          } else {
            await storage.updateTyphoonNotification(notification.id, {
              status: "pending",
              retryCount,
              errorMessage: result.error
            });
            console.log(`[TyphoonQueue] Notification ${notification.id} will retry (attempt ${retryCount}/${MAX_RETRIES2})`);
          }
        }
      } catch (error) {
        console.error(`[TyphoonQueue] Error processing notification ${notification.id}:`, error);
        await storage.updateTyphoonNotification(notification.id, {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error"
        });
        failed++;
      }
    }
    console.log(`[TyphoonQueue] Batch complete: ${processed} processed, ${sent} sent, ${failed} failed`);
    return { processed, sent, failed };
  } catch (error) {
    console.error("[TyphoonQueue] Error in queue processing:", error);
    return { processed, sent, failed };
  } finally {
    isTyphoonQueueProcessing = false;
  }
}
async function queueTyphoonNotifications(alertId) {
  console.log(`[TyphoonQueue] Queueing notifications for typhoon alert: ${alertId}`);
  try {
    const subscriptions = await storage.getActiveEmergencySubscriptions("typhoon");
    if (subscriptions.length === 0) {
      console.log("[TyphoonQueue] No active subscriptions found");
      return 0;
    }
    console.log(`[TyphoonQueue] Found ${subscriptions.length} active subscriptions`);
    let queuedCount = 0;
    for (const subscription of subscriptions) {
      const channels = subscription.notifyChannels || ["push"];
      const language = subscription.preferredLanguage || "en";
      for (const channel of channels) {
        if (channel !== "push" && channel !== "email" && channel !== "whatsapp") {
          continue;
        }
        try {
          await storage.createTyphoonNotification({
            typhoonAlertId: alertId,
            notificationType: "typhoon_warning",
            targetAudience: "subscribed",
            channel,
            titleEn: "\u26A0\uFE0F Typhoon Warning",
            titleZh: "\u26A0\uFE0F \u98B1\u98A8\u8B66\u544A",
            bodyEn: "A typhoon signal has been raised in Hong Kong. Please keep your pets safe and check emergency veterinary services.",
            bodyZh: "\u9999\u6E2F\u5DF2\u767C\u51FA\u98B1\u98A8\u4FE1\u865F\u3002\u8ACB\u78BA\u4FDD\u5BF5\u7269\u5B89\u5168\u4E26\u67E5\u95B1\u7DCA\u6025\u7378\u91AB\u670D\u52D9\u3002",
            status: "pending",
            retryCount: 0
          });
          queuedCount++;
        } catch (error) {
          console.error(`[TyphoonQueue] Failed to queue notification for subscription ${subscription.id}:`, error);
        }
      }
    }
    console.log(`[TyphoonQueue] Queued ${queuedCount} notifications for ${subscriptions.length} subscribers`);
    return queuedCount;
  } catch (error) {
    console.error("[TyphoonQueue] Error queueing notifications:", error);
    return 0;
  }
}
function startTyphoonNotificationScheduler() {
  if (typhoonQueueInterval) {
    console.log("[TyphoonQueue] Scheduler already running");
    return;
  }
  console.log(`[TyphoonQueue] Starting typhoon notification scheduler (every ${TYPHOON_QUEUE_INTERVAL_MS / 1e3}s)`);
  processTyphoonNotificationQueue();
  typhoonQueueInterval = setInterval(async () => {
    try {
      await processTyphoonNotificationQueue();
    } catch (error) {
      console.error("[TyphoonQueue] Scheduler error:", error);
    }
  }, TYPHOON_QUEUE_INTERVAL_MS);
}

// server/services/typhoon-monitor.ts
var pollingInterval = null;
var POLLING_INTERVAL_MS = 5 * 60 * 1e3;
function isT8OrAbove(signalCode) {
  const code = signalCode.toUpperCase();
  return code.includes("8") || code.includes("9") || code.includes("10") || code === "T8" || code === "T9" || code === "T10" || code === "SIGNAL_8" || code === "SIGNAL_9" || code === "SIGNAL_10";
}
async function checkAndUpdateTyphoonStatus() {
  try {
    console.log("[Typhoon Monitor] Checking typhoon status...");
    const [hkoData, activeAlert] = await Promise.all([
      fetchTyphoonWarning().catch((err) => {
        console.error("[Typhoon Monitor] Failed to fetch HKO data:", err.message);
        return null;
      }),
      storage.getActiveTyphoonAlert()
    ]);
    if (hkoData === null && activeAlert === null) {
      console.log("[Typhoon Monitor] No typhoon signal active, no alert in DB");
      return { changed: false, action: "none" };
    }
    if (hkoData !== null && activeAlert === null) {
      console.log(`[Typhoon Monitor] New typhoon signal detected: ${hkoData.signalCode}`);
      const newAlert = await storage.createTyphoonAlert({
        signalCode: hkoData.signalCode,
        signalNameEn: hkoData.signalName,
        signalNameZh: hkoData.signalNameZh,
        issuedAt: hkoData.issuedAt,
        isActive: true,
        severityLevel: hkoData.severity,
        notes: hkoData.rawData ? JSON.stringify(hkoData.rawData) : null
      });
      console.log(`[Typhoon Monitor] Created new typhoon alert: ${newAlert.id}`);
      if (isT8OrAbove(hkoData.signalCode)) {
        console.log(`[Typhoon Monitor] T8+ signal detected, queueing notifications...`);
        await queueTyphoonNotifications(newAlert.id);
      }
      return {
        changed: true,
        action: "created",
        currentSignal: hkoData.signalCode,
        alert: newAlert
      };
    }
    if (hkoData === null && activeAlert !== null) {
      console.log(`[Typhoon Monitor] Typhoon signal lifted (was: ${activeAlert.signalCode})`);
      const liftedAlert = await storage.liftTyphoonAlert(activeAlert.id);
      return {
        changed: true,
        action: "lifted",
        previousSignal: activeAlert.signalCode,
        alert: liftedAlert
      };
    }
    if (hkoData !== null && activeAlert !== null) {
      if (hkoData.signalCode !== activeAlert.signalCode) {
        console.log(`[Typhoon Monitor] Typhoon signal changed: ${activeAlert.signalCode} -> ${hkoData.signalCode}`);
        await storage.liftTyphoonAlert(activeAlert.id);
        const newAlert = await storage.createTyphoonAlert({
          signalCode: hkoData.signalCode,
          signalNameEn: hkoData.signalName,
          signalNameZh: hkoData.signalNameZh,
          issuedAt: hkoData.issuedAt,
          isActive: true,
          severityLevel: hkoData.severity,
          notes: hkoData.rawData ? JSON.stringify(hkoData.rawData) : null
        });
        return {
          changed: true,
          action: "updated",
          previousSignal: activeAlert.signalCode,
          currentSignal: hkoData.signalCode,
          alert: newAlert
        };
      }
      console.log(`[Typhoon Monitor] No change - signal still ${hkoData.signalCode}`);
      return {
        changed: false,
        action: "none",
        currentSignal: hkoData.signalCode,
        alert: activeAlert
      };
    }
    return { changed: false, action: "none" };
  } catch (error) {
    console.error("[Typhoon Monitor] Error checking typhoon status:", error.message);
    return {
      changed: false,
      action: "none",
      error: error.message
    };
  }
}
function startTyphoonPolling() {
  if (pollingInterval) {
    console.log("[Typhoon Monitor] Polling already running");
    return;
  }
  console.log(`[Typhoon Monitor] Starting background polling (every ${POLLING_INTERVAL_MS / 1e3}s)`);
  checkAndUpdateTyphoonStatus().then((result) => {
    if (result.changed) {
      console.log(`[Typhoon Monitor] Initial check - ${result.action}: ${result.currentSignal || result.previousSignal}`);
    }
  }).catch((err) => console.error("[Typhoon Monitor] Initial check failed:", err.message));
  pollingInterval = setInterval(async () => {
    try {
      const result = await checkAndUpdateTyphoonStatus();
      if (result.changed) {
        console.log(`[Typhoon Monitor] Status changed - ${result.action}: ${result.currentSignal || result.previousSignal}`);
      }
    } catch (error) {
      console.error("[Typhoon Monitor] Polling error:", error.message);
    }
  }, POLLING_INTERVAL_MS);
}

// server/routes.ts
init_schema();

// server/objectStorage.ts
import { Storage } from "@google-cloud/storage";
import { randomUUID as randomUUID2 } from "crypto";

// server/objectAcl.ts
var ACL_POLICY_METADATA_KEY = "custom:aclPolicy";
function isPermissionAllowed(requested, granted) {
  if (requested === "read" /* READ */) {
    return ["read" /* READ */, "write" /* WRITE */].includes(granted);
  }
  return granted === "write" /* WRITE */;
}
var BaseObjectAccessGroup = class {
  constructor(type, id) {
    this.type = type;
    this.id = id;
  }
};
var HospitalStaffAccessGroup = class extends BaseObjectAccessGroup {
  constructor(id) {
    super("hospital_staff" /* HOSPITAL_STAFF */, id);
  }
  async hasMember(userId) {
    return true;
  }
};
function createObjectAccessGroup(group) {
  switch (group.type) {
    case "hospital_staff" /* HOSPITAL_STAFF */:
      return new HospitalStaffAccessGroup(group.id);
    default:
      throw new Error(`Unknown access group type: ${group.type}`);
  }
}
async function setObjectAclPolicy(objectFile, aclPolicy) {
  const [exists] = await objectFile.exists();
  if (!exists) {
    throw new Error(`Object not found: ${objectFile.name}`);
  }
  await objectFile.setMetadata({
    metadata: {
      [ACL_POLICY_METADATA_KEY]: JSON.stringify(aclPolicy)
    }
  });
}
async function getObjectAclPolicy(objectFile) {
  const [metadata] = await objectFile.getMetadata();
  const aclPolicy = metadata?.metadata?.[ACL_POLICY_METADATA_KEY];
  if (!aclPolicy) {
    return null;
  }
  return JSON.parse(aclPolicy);
}
async function canAccessObject({
  userId,
  objectFile,
  requestedPermission
}) {
  const aclPolicy = await getObjectAclPolicy(objectFile);
  if (!aclPolicy) {
    return false;
  }
  if (aclPolicy.visibility === "public" && requestedPermission === "read" /* READ */) {
    return true;
  }
  if (!userId) {
    return false;
  }
  if (aclPolicy.owner === userId) {
    return true;
  }
  for (const rule of aclPolicy.aclRules || []) {
    const accessGroup = createObjectAccessGroup(rule.group);
    if (await accessGroup.hasMember(userId) && isPermissionAllowed(requestedPermission, rule.permission)) {
      return true;
    }
  }
  return false;
}

// server/objectStorage.ts
var REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
var ReplitStorageProvider = class {
  type = "replit";
  bucketName;
  storage;
  privateObjectDir;
  constructor() {
    this.privateObjectDir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!this.privateObjectDir) {
      throw new Error("PRIVATE_OBJECT_DIR not set for Replit storage provider");
    }
    const { bucketName } = this.parseObjectPath(this.privateObjectDir);
    this.bucketName = bucketName;
    this.storage = new Storage({
      credentials: {
        audience: "replit",
        subject_token_type: "access_token",
        token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
        type: "external_account",
        credential_source: {
          url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
          format: {
            type: "json",
            subject_token_field_name: "access_token"
          }
        },
        universe_domain: "googleapis.com"
      },
      projectId: ""
    });
  }
  parseObjectPath(path5) {
    if (!path5.startsWith("/")) {
      path5 = `/${path5}`;
    }
    const pathParts = path5.split("/");
    if (pathParts.length < 3) {
      throw new Error("Invalid path: must contain at least a bucket name");
    }
    return {
      bucketName: pathParts[1],
      objectName: pathParts.slice(2).join("/")
    };
  }
  getStorageClient() {
    return this.storage;
  }
  getBucket() {
    return this.storage.bucket(this.bucketName);
  }
  async signUploadUrl(objectName, ttlSec, contentType) {
    const request = {
      bucket_name: this.bucketName,
      object_name: objectName,
      method: "PUT",
      expires_at: new Date(Date.now() + ttlSec * 1e3).toISOString()
    };
    if (contentType) {
      request.content_type = contentType;
    }
    const response = await fetch(
      `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      }
    );
    if (!response.ok) {
      throw new Error(
        `Failed to sign object URL, errorcode: ${response.status}, make sure you're running on Replit`
      );
    }
    const { signed_url: signedURL } = await response.json();
    return signedURL;
  }
  getPublicUrl(objectName) {
    return `https://storage.googleapis.com/${this.bucketName}/${objectName}`;
  }
  getUploadsPrefix() {
    const { objectName } = this.parseObjectPath(this.privateObjectDir);
    return objectName ? `${objectName}/uploads` : "uploads";
  }
  getPrivateObjectDir() {
    return this.privateObjectDir;
  }
};
var GCSStorageProvider = class {
  type = "gcs";
  bucketName;
  storage;
  uploadsPrefix = "uploads";
  constructor() {
    const serviceAccountJson = process.env.GCS_SERVICE_ACCOUNT_JSON;
    const bucketName = process.env.GCS_BUCKET_NAME;
    if (!serviceAccountJson) {
      throw new Error("GCS_SERVICE_ACCOUNT_JSON not set for GCS storage provider");
    }
    if (!bucketName) {
      throw new Error("GCS_BUCKET_NAME not set for GCS storage provider");
    }
    this.bucketName = bucketName;
    try {
      const credentials = JSON.parse(serviceAccountJson);
      this.storage = new Storage({
        credentials,
        projectId: credentials.project_id
      });
    } catch (error) {
      throw new Error(`Failed to parse GCS_SERVICE_ACCOUNT_JSON: ${error}`);
    }
  }
  getStorageClient() {
    return this.storage;
  }
  getBucket() {
    return this.storage.bucket(this.bucketName);
  }
  async signUploadUrl(objectName, ttlSec, contentType) {
    const file = this.getBucket().file(objectName);
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + ttlSec * 1e3,
      contentType: contentType || "application/octet-stream"
    });
    return url;
  }
  getPublicUrl(objectName) {
    return `https://storage.googleapis.com/${this.bucketName}/${objectName}`;
  }
  getUploadsPrefix() {
    return this.uploadsPrefix;
  }
};
var UnavailableStorageProvider = class {
  type = "unavailable";
  bucketName = "";
  getStorageClient() {
    throw new Error("Storage is not available");
  }
  getBucket() {
    throw new Error("Storage is not available");
  }
  async signUploadUrl(_objectName, _ttlSec, _contentType) {
    throw new Error("Storage is not available");
  }
  getPublicUrl(_objectName) {
    throw new Error("Storage is not available");
  }
  getUploadsPrefix() {
    throw new Error("Storage is not available");
  }
};
function detectStorageProvider() {
  if (process.env.PRIVATE_OBJECT_DIR) {
    try {
      return new ReplitStorageProvider();
    } catch (error) {
      console.warn("Failed to initialize Replit storage provider:", error);
    }
  }
  if (process.env.GCS_SERVICE_ACCOUNT_JSON && process.env.GCS_BUCKET_NAME) {
    try {
      return new GCSStorageProvider();
    } catch (error) {
      console.warn("Failed to initialize GCS storage provider:", error);
    }
  }
  return new UnavailableStorageProvider();
}
var storageProvider = null;
function getStorageProvider() {
  if (!storageProvider) {
    storageProvider = detectStorageProvider();
  }
  return storageProvider;
}
function getStorageStatus() {
  const provider = getStorageProvider();
  if (provider.type === "unavailable") {
    return {
      available: false,
      provider: "unavailable",
      message: "Object storage not available. Set PRIVATE_OBJECT_DIR (Replit) or GCS_SERVICE_ACCOUNT_JSON + GCS_BUCKET_NAME (GCS)."
    };
  }
  return {
    available: true,
    provider: provider.type,
    message: `Object storage is configured using ${provider.type === "replit" ? "Replit" : "Google Cloud Storage"} provider.`
  };
}
var ObjectNotFoundError = class _ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, _ObjectNotFoundError.prototype);
  }
};
var ObjectStorageService = class {
  provider;
  constructor() {
    this.provider = getStorageProvider();
  }
  getPublicObjectSearchPaths() {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr.split(",").map((path5) => path5.trim()).filter((path5) => path5.length > 0)
      )
    );
    if (paths.length === 0) {
      if (this.provider.type === "gcs") {
        return [`/${this.provider.bucketName}/public`];
      }
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }
  getPrivateObjectDir() {
    if (this.provider.type === "replit") {
      const dir = process.env.PRIVATE_OBJECT_DIR || "";
      if (!dir) {
        throw new Error(
          "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
        );
      }
      return dir;
    } else if (this.provider.type === "gcs") {
      return `/${this.provider.bucketName}/.private`;
    }
    throw new Error("Storage provider not available");
  }
  async searchPublicObject(filePath) {
    if (this.provider.type === "unavailable") {
      return null;
    }
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = this.provider.getStorageClient().bucket(bucketName);
      const file = bucket.file(objectName);
      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }
    return null;
  }
  async downloadObject(file, res, cacheTtlSec = 3600) {
    try {
      const [metadata] = await file.getMetadata();
      const aclPolicy = await getObjectAclPolicy(file);
      const isPublic = aclPolicy?.visibility === "public";
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size,
        "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`
      });
      const stream = file.createReadStream();
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });
      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }
  async getObjectEntityUploadURL(contentType) {
    if (this.provider.type === "unavailable") {
      throw new Error("Storage provider not available");
    }
    const objectId = randomUUID2();
    const uploadsPrefix = this.provider.getUploadsPrefix();
    const objectName = `${uploadsPrefix}/${objectId}`;
    return this.provider.signUploadUrl(objectName, 900, contentType);
  }
  async getObjectEntityFile(objectPath) {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }
    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }
    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = this.provider.getStorageClient().bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }
  normalizeObjectEntityPath(rawPath) {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }
    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;
    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }
    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }
    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }
  async trySetObjectEntityAclPolicy(rawPath, aclPolicy) {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }
    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }
  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission
  }) {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? "read" /* READ */
    });
  }
  extractObjectEntityPath(rawPath) {
    return this.normalizeObjectEntityPath(rawPath);
  }
  getObjectEntityPublicUrl(objectPath) {
    if (!objectPath.startsWith("/objects/")) {
      return objectPath;
    }
    const entityId = objectPath.slice("/objects/".length);
    if (this.provider.type === "gcs") {
      const objectName2 = `${this.provider.getUploadsPrefix()}/${entityId}`.replace(/^uploads\//, "");
      return this.provider.getPublicUrl(objectName2);
    }
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const fullPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    return `https://storage.googleapis.com/${bucketName}/${objectName}`;
  }
  getProviderType() {
    return this.provider.type;
  }
};
function parseObjectPath(path5) {
  if (!path5.startsWith("/")) {
    path5 = `/${path5}`;
  }
  const pathParts = path5.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }
  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");
  return {
    bucketName,
    objectName
  };
}

// server/routes.ts
import path from "path";

// server/encryption.ts
import crypto from "crypto";
var ALGORITHM = "aes-256-gcm";
var IV_LENGTH = 12;
var AUTH_TAG_LENGTH = 16;
function getEncryptionKey() {
  const keySource = process.env.TWO_FACTOR_ENCRYPTION_KEY || config.session.secret;
  if (!keySource || keySource.length < 32) {
    throw new Error("Encryption key must be at least 32 characters. Set TWO_FACTOR_ENCRYPTION_KEY or ensure SESSION_SECRET is long enough.");
  }
  return crypto.scryptSync(keySource, "petsos-2fa-salt", 32);
}
function encryptTotpSecret(plaintext) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString("base64");
}
function decryptTotpSecret(encryptedData) {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedData, "base64");
  if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted data: too short");
  }
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}
function isEncryptedSecret(secret) {
  try {
    const decoded = Buffer.from(secret, "base64");
    return decoded.length > IV_LENGTH + AUTH_TAG_LENGTH;
  } catch {
    return false;
  }
}

// server/services/hospital-ping-scheduler.ts
var DAILY_PING_INTERVAL_MS = 60 * 60 * 1e3;
var NO_REPLY_CHECK_INTERVAL_MS = 60 * 60 * 1e3;
var WHATSAPP_API_URL3 = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v21.0";
var WHATSAPP_PHONE_NUMBER_ID3 = process.env.WHATSAPP_PHONE_NUMBER_ID;
var WHATSAPP_ACCESS_TOKEN3 = process.env.WHATSAPP_ACCESS_TOKEN;
var dailyPingInterval = null;
var noReplyCheckInterval = null;
var isDailyPingProcessing = false;
var isNoReplyProcessing = false;
async function sendWhatsAppPingMessage(phoneNumber) {
  if (!WHATSAPP_ACCESS_TOKEN3 || !WHATSAPP_PHONE_NUMBER_ID3) {
    console.log("[HospitalPing] WhatsApp not configured - skipping ping");
    return { success: false, error: "WhatsApp not configured" };
  }
  let cleanedNumber = phoneNumber.replace(/[^0-9]/g, "");
  if (!cleanedNumber || cleanedNumber.length < 8) {
    return { success: false, error: "Invalid phone number" };
  }
  try {
    const url = `${WHATSAPP_API_URL3}/${WHATSAPP_PHONE_NUMBER_ID3}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      to: cleanedNumber,
      type: "template",
      template: {
        name: "hello_world",
        language: { code: "en_US" }
      }
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN3}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[HospitalPing] Send failed:", errorData);
      return { success: false, error: JSON.stringify(errorData) };
    }
    const data = await response.json();
    const messageId = data?.messages?.[0]?.id;
    console.log("[HospitalPing] Ping sent successfully to:", cleanedNumber, "messageId:", messageId);
    return { success: true, messageId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[HospitalPing] Error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
async function isEligibleForPing(hospital, pingState) {
  if (!hospital.whatsapp) {
    return false;
  }
  if (!pingState) {
    return true;
  }
  if (!pingState.pingEnabled) {
    return false;
  }
  if (pingState.pingStatus === "no_reply" || pingState.pingStatus === "paused") {
    return false;
  }
  if (pingState.lastPingSentAt) {
    const hoursSinceLastPing = (Date.now() - pingState.lastPingSentAt.getTime()) / (1e3 * 60 * 60);
    if (hoursSinceLastPing < 23) {
      return false;
    }
  }
  return true;
}
async function processDailyPings() {
  if (isDailyPingProcessing) {
    console.log("[HospitalPing] Daily ping still in progress, skipping...");
    return { processed: 0, sent: 0, failed: 0 };
  }
  isDailyPingProcessing = true;
  let processed = 0, sent = 0, failed = 0;
  try {
    const hospitals2 = await storage.getAllHospitals();
    const hospitalsWithWhatsApp = hospitals2.filter((h) => h.whatsapp && h.status === "active");
    if (hospitalsWithWhatsApp.length === 0) {
      console.log("[HospitalPing] No hospitals with WhatsApp numbers found");
      return { processed: 0, sent: 0, failed: 0 };
    }
    console.log(`[HospitalPing] Checking ${hospitalsWithWhatsApp.length} hospitals for daily ping`);
    for (const hospital of hospitalsWithWhatsApp) {
      processed++;
      try {
        const pingState = await storage.getHospitalPingState(hospital.id);
        if (!await isEligibleForPing(hospital, pingState)) {
          continue;
        }
        const result = await sendWhatsAppPingMessage(hospital.whatsapp);
        if (result.success) {
          await storage.upsertHospitalPingState({
            hospitalId: hospital.id,
            pingEnabled: pingState?.pingEnabled ?? true,
            pingStatus: "active",
            lastPingSentAt: /* @__PURE__ */ new Date(),
            lastPingMessageId: result.messageId || null,
            lastInboundReplyAt: pingState?.lastInboundReplyAt || null,
            lastReplyLatencySeconds: pingState?.lastReplyLatencySeconds || null,
            noReplySince: null
          });
          await storage.createHospitalPingLog({
            hospitalId: hospital.id,
            direction: "outbound",
            providerMessageId: result.messageId || null,
            eventType: "ping_sent",
            sentAt: /* @__PURE__ */ new Date(),
            receivedAt: null,
            payload: { phoneNumber: hospital.whatsapp }
          });
          sent++;
          console.log(`[HospitalPing] Ping sent to hospital ${hospital.id} (${hospital.nameEn})`);
        } else {
          failed++;
          console.error(`[HospitalPing] Failed to ping hospital ${hospital.id}: ${result.error}`);
        }
      } catch (error) {
        failed++;
        console.error(`[HospitalPing] Error processing hospital ${hospital.id}:`, error);
      }
    }
    console.log(`[HospitalPing] Daily ping complete: ${processed} processed, ${sent} sent, ${failed} failed`);
    return { processed, sent, failed };
  } catch (error) {
    console.error("[HospitalPing] Error in daily ping processing:", error);
    return { processed, sent, failed };
  } finally {
    isDailyPingProcessing = false;
  }
}
async function processNoReplyMarking() {
  if (isNoReplyProcessing) {
    console.log("[HospitalPing] No-reply check still in progress, skipping...");
    return { marked: 0 };
  }
  isNoReplyProcessing = true;
  let marked = 0;
  try {
    const hospitalsNeedingMarking = await storage.getHospitalsNeedingNoReplyMarking();
    if (hospitalsNeedingMarking.length === 0) {
      return { marked: 0 };
    }
    console.log(`[HospitalPing] Found ${hospitalsNeedingMarking.length} hospitals needing no-reply marking`);
    for (const pingState of hospitalsNeedingMarking) {
      try {
        await storage.updateHospitalPingState(pingState.hospitalId, {
          pingStatus: "no_reply",
          noReplySince: /* @__PURE__ */ new Date()
        });
        await storage.createHospitalPingLog({
          hospitalId: pingState.hospitalId,
          direction: "outbound",
          providerMessageId: null,
          eventType: "no_reply_marked",
          sentAt: null,
          receivedAt: null,
          payload: {
            lastPingSentAt: pingState.lastPingSentAt,
            reason: "No reply within 24 hours"
          }
        });
        marked++;
        console.log(`[HospitalPing] Hospital ${pingState.hospitalId} marked as no_reply`);
      } catch (error) {
        console.error(`[HospitalPing] Error marking hospital ${pingState.hospitalId}:`, error);
      }
    }
    console.log(`[HospitalPing] No-reply marking complete: ${marked} hospitals marked`);
    return { marked };
  } catch (error) {
    console.error("[HospitalPing] Error in no-reply marking:", error);
    return { marked };
  } finally {
    isNoReplyProcessing = false;
  }
}
async function handleHospitalReply(hospitalId, phoneNumber, providerMessageId) {
  try {
    const pingState = await storage.getHospitalPingState(hospitalId);
    const now = /* @__PURE__ */ new Date();
    let latencySeconds = null;
    if (pingState?.lastPingSentAt) {
      latencySeconds = Math.floor((now.getTime() - pingState.lastPingSentAt.getTime()) / 1e3);
    }
    await storage.upsertHospitalPingState({
      hospitalId,
      pingEnabled: pingState?.pingEnabled ?? true,
      pingStatus: "active",
      lastPingSentAt: pingState?.lastPingSentAt || null,
      lastPingMessageId: pingState?.lastPingMessageId || null,
      lastInboundReplyAt: now,
      lastReplyLatencySeconds: latencySeconds,
      noReplySince: null
    });
    await storage.createHospitalPingLog({
      hospitalId,
      direction: "inbound",
      providerMessageId: providerMessageId || null,
      eventType: "reply_received",
      sentAt: null,
      receivedAt: now,
      payload: { phoneNumber }
    });
    console.log(`[HospitalPing] Hospital ${hospitalId} reply recorded, latency: ${latencySeconds}s`);
  } catch (error) {
    console.error(`[HospitalPing] Error handling hospital reply for ${hospitalId}:`, error);
  }
}
function startHospitalPingScheduler() {
  if (dailyPingInterval) {
    console.log("[HospitalPing] Scheduler already running");
    return;
  }
  console.log(`[HospitalPing] Starting hospital ping scheduler (daily ping every ${DAILY_PING_INTERVAL_MS / 1e3 / 60} min, no-reply check every ${NO_REPLY_CHECK_INTERVAL_MS / 1e3 / 60} min)`);
  dailyPingInterval = setInterval(async () => {
    try {
      await processDailyPings();
    } catch (error) {
      console.error("[HospitalPing] Daily ping scheduler error:", error);
    }
  }, DAILY_PING_INTERVAL_MS);
  noReplyCheckInterval = setInterval(async () => {
    try {
      await processNoReplyMarking();
    } catch (error) {
      console.error("[HospitalPing] No-reply check error:", error);
    }
  }, NO_REPLY_CHECK_INTERVAL_MS);
}

// server/routes.ts
async function logHospitalChanges(hospitalId, oldData, newData, changedBy, changeSource, changeType, ipAddress, userAgent) {
  const changeLogs = [];
  for (const [key, newValue] of Object.entries(newData)) {
    const oldValue = oldData[key];
    if (oldValue === newValue) continue;
    if (oldValue === null && newValue === "") continue;
    if (oldValue === "" && newValue === null) continue;
    const oldValueStr = oldValue === null || oldValue === void 0 ? null : String(oldValue);
    const newValueStr = newValue === null || newValue === void 0 ? null : String(newValue);
    if (oldValueStr === newValueStr) continue;
    changeLogs.push({
      hospitalId,
      fieldName: key,
      oldValue: oldValueStr,
      newValue: newValueStr,
      changedBy,
      changeSource,
      changeType,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null
    });
  }
  if (changeLogs.length > 0) {
    await storage.createHospitalChangeLogs(changeLogs);
    console.log(`[Audit] Logged ${changeLogs.length} changes for hospital ${hospitalId} by ${changedBy} via ${changeSource}`);
  }
}
function verifyWhatsAppSignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    if (config.isDevelopment) {
      console.warn("[WhatsApp Webhook] WHATSAPP_APP_SECRET not configured - skipping signature verification in development");
      return true;
    }
    console.error("[WhatsApp Webhook] WHATSAPP_APP_SECRET not configured - rejecting request in production");
    return false;
  }
  if (!signature) {
    console.error("[WhatsApp Webhook] Missing X-Hub-Signature-256 header");
    return false;
  }
  const rawBody = req.rawBody;
  if (!rawBody) {
    console.error("[WhatsApp Webhook] Raw body not available for signature verification");
    return false;
  }
  const expectedSignature = "sha256=" + crypto2.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  try {
    const signatureBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    if (signatureBuffer.length !== expectedBuffer.length) {
      console.error("[WhatsApp Webhook] Signature length mismatch");
      return false;
    }
    const isValid = crypto2.timingSafeEqual(signatureBuffer, expectedBuffer);
    if (!isValid) {
      console.error("[WhatsApp Webhook] Invalid signature");
    }
    return isValid;
  } catch (error) {
    console.error("[WhatsApp Webhook] Signature verification error:", error);
    return false;
  }
}
async function registerRoutes(app2) {
  await setupAuth(app2);
  setupTestUtils(app2);
  app2.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime()
    });
  });
  app2.get("/api/webhooks/whatsapp", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "petsos-webhook-2026";
    if (mode === "subscribe" && token === verifyToken) {
      console.log("[WhatsApp Webhook] Verification successful");
      res.status(200).send(challenge);
    } else {
      console.error("[WhatsApp Webhook] Verification failed - mode:", mode, "token match:", token === verifyToken);
      res.sendStatus(403);
    }
  });
  app2.post("/api/webhooks/whatsapp", async (req, res) => {
    if (!verifyWhatsAppSignature(req)) {
      console.error("[WhatsApp Webhook] Signature verification failed - rejecting request");
      return res.sendStatus(401);
    }
    try {
      console.log("[WhatsApp Webhook] Event received (signature verified)");
      const body = req.body;
      if (body?.object === "whatsapp_business_account") {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === "messages") {
              const value = change.value;
              if (value?.statuses) {
                for (const status of value.statuses) {
                  const whatsappMessageId = status.id;
                  const statusType = status.status;
                  const timestamp2 = status.timestamp ? new Date(parseInt(status.timestamp) * 1e3) : /* @__PURE__ */ new Date();
                  console.log(`[WhatsApp Webhook] Status update: ${whatsappMessageId} -> ${statusType}`);
                  try {
                    const updateData = {};
                    switch (statusType) {
                      case "sent":
                        updateData.status = "sent";
                        updateData.sentAt = timestamp2;
                        break;
                      case "delivered":
                        updateData.status = "delivered";
                        updateData.deliveredAt = timestamp2;
                        break;
                      case "read":
                        updateData.readAt = timestamp2;
                        break;
                      case "failed":
                        updateData.status = "failed";
                        updateData.failedAt = timestamp2;
                        if (status.errors && status.errors.length > 0) {
                          updateData.errorMessage = status.errors[0].message || status.errors[0].title || "Unknown error";
                        }
                        break;
                    }
                    if (Object.keys(updateData).length > 0) {
                      const updated = await storage.updateMessageByWhatsAppId(whatsappMessageId, updateData);
                      if (updated) {
                        console.log(`[WhatsApp Webhook] Updated message ${updated.id} with status ${statusType}`);
                      } else {
                        console.log(`[WhatsApp Webhook] No message found for WhatsApp ID: ${whatsappMessageId}`);
                      }
                    }
                  } catch (updateError) {
                    console.error("[WhatsApp Webhook] Error updating message status:", updateError);
                  }
                }
              }
              if (value?.messages) {
                for (const message of value.messages) {
                  const senderPhone = message.from;
                  const messageType = message.type;
                  const timestamp2 = message.timestamp ? new Date(parseInt(message.timestamp) * 1e3) : /* @__PURE__ */ new Date();
                  const whatsappMsgId = message.id;
                  console.log(`[WhatsApp Webhook] Incoming message from ${senderPhone}: ${messageType}`);
                  try {
                    const sanitizedPhone = senderPhone.replace(/[^0-9]/g, "");
                    let content = "";
                    let mediaUrl;
                    switch (messageType) {
                      case "text":
                        content = message.text?.body || "";
                        break;
                      case "image":
                        content = message.image?.caption || "[Image]";
                        mediaUrl = message.image?.id;
                        break;
                      case "document":
                        content = message.document?.filename || "[Document]";
                        mediaUrl = message.document?.id;
                        break;
                      case "audio":
                        content = "[Audio message]";
                        mediaUrl = message.audio?.id;
                        break;
                      case "video":
                        content = message.video?.caption || "[Video]";
                        mediaUrl = message.video?.id;
                        break;
                      case "sticker":
                        content = "[Sticker]";
                        break;
                      case "location":
                        content = `[Location: ${message.location?.latitude}, ${message.location?.longitude}]`;
                        break;
                      case "contacts":
                        content = "[Contact shared]";
                        break;
                      default:
                        content = `[${messageType} message]`;
                    }
                    let conversation = await storage.getConversationByPhone(sanitizedPhone);
                    if (!conversation) {
                      const hospital = await storage.findHospitalByPhone(sanitizedPhone);
                      const senderName = value.contacts?.[0]?.profile?.name || (hospital ? hospital.nameEn || hospital.nameZh : void 0);
                      conversation = await storage.createConversation({
                        phoneNumber: sanitizedPhone,
                        hospitalId: hospital?.id || null,
                        displayName: senderName || `+${sanitizedPhone}`,
                        lastMessageAt: timestamp2,
                        lastMessagePreview: content.substring(0, 100),
                        unreadCount: 1,
                        isArchived: false
                      });
                      console.log(`[WhatsApp Webhook] Created new conversation ${conversation.id} for ${sanitizedPhone}`);
                    } else {
                      await storage.updateConversation(conversation.id, {
                        lastMessageAt: timestamp2,
                        lastMessagePreview: content.substring(0, 100),
                        unreadCount: (conversation.unreadCount || 0) + 1
                      });
                    }
                    const chatMessage = await storage.createChatMessage({
                      conversationId: conversation.id,
                      direction: "inbound",
                      content,
                      messageType,
                      mediaUrl,
                      whatsappMessageId: whatsappMsgId,
                      status: "received",
                      sentAt: timestamp2
                    });
                    console.log(`[WhatsApp Webhook] Stored incoming message ${chatMessage.id} in conversation ${conversation.id}`);
                    if (conversation.hospitalId) {
                      try {
                        await handleHospitalReply(conversation.hospitalId, sanitizedPhone, whatsappMsgId);
                        console.log(`[WhatsApp Webhook] Tracked hospital reply for ${conversation.hospitalId}`);
                      } catch (pingError) {
                        console.error("[WhatsApp Webhook] Error tracking hospital reply:", pingError);
                      }
                      try {
                        const activeEmergency = await storage.getActiveEmergencyForHospital(conversation.hospitalId, 0.5);
                        if (activeEmergency && content) {
                          const normalised = content.trim().toLowerCase();
                          let responseType = "other";
                          if (/^(1|yes|ok|accept|可以|接受|得|有位|可|ready|available|we can|we are able)/.test(normalised)) {
                            responseType = "can_accept";
                          } else if (/^(2|no|full|sorry|抱歉|滿|爆滿|冇位|唔得|tonight|tonight|fully booked)/.test(normalised)) {
                            responseType = "full";
                          } else if (/^(3|call|please call|致電|打電話|ring|contact|聯絡)/.test(normalised)) {
                            responseType = "call_requested";
                          }
                          await storage.createHospitalEmergencyResponse({
                            emergencyRequestId: activeEmergency.id,
                            hospitalId: conversation.hospitalId,
                            message: content,
                            responseType,
                            respondedAt: timestamp2
                          });
                          console.log(`[WhatsApp Webhook] Linked reply (type=${responseType}) from hospital ${conversation.hospitalId} to emergency ${activeEmergency.id}`);
                        }
                      } catch (linkError) {
                        console.error("[WhatsApp Webhook] Error linking reply to emergency:", linkError);
                      }
                    }
                  } catch (msgError) {
                    console.error("[WhatsApp Webhook] Error processing incoming message:", msgError);
                  }
                }
              }
              if (value?.statuses) {
                for (const status of value.statuses) {
                  const whatsappMessageId = status.id;
                  const statusType = status.status;
                  const timestamp2 = status.timestamp ? new Date(parseInt(status.timestamp) * 1e3) : /* @__PURE__ */ new Date();
                  try {
                    const chatUpdateData = {};
                    switch (statusType) {
                      case "sent":
                        chatUpdateData.status = "sent";
                        chatUpdateData.sentAt = timestamp2;
                        break;
                      case "delivered":
                        chatUpdateData.status = "delivered";
                        chatUpdateData.deliveredAt = timestamp2;
                        break;
                      case "read":
                        chatUpdateData.status = "read";
                        chatUpdateData.readAt = timestamp2;
                        break;
                      case "failed":
                        chatUpdateData.status = "failed";
                        if (status.errors?.[0]) {
                          chatUpdateData.errorMessage = status.errors[0].message || status.errors[0].title;
                        }
                        break;
                    }
                    if (Object.keys(chatUpdateData).length > 0) {
                      const updatedChat = await storage.updateChatMessageByWhatsAppId(whatsappMessageId, chatUpdateData);
                      if (updatedChat) {
                        console.log(`[WhatsApp Webhook] Updated chat message ${updatedChat.id} status to ${statusType}`);
                      }
                    }
                  } catch (chatError) {
                  }
                }
              }
            }
          }
        }
      }
      res.sendStatus(200);
    } catch (error) {
      console.error("[WhatsApp Webhook] Error processing event:", error);
      res.sendStatus(200);
    }
  });
  const publicDir = config.isDevelopment ? path.resolve(import.meta.dirname, "../client/public") : path.resolve(import.meta.dirname, "public");
  app2.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = "https://petsos.site";
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const regions2 = await storage.getRegions();
      const activeRegions = regions2.filter((r) => r.active);
      const allHospitals = await storage.getAllHospitals();
      const indexableHospitals = allHospitals.filter(
        (h) => h.slug && h.isAvailable && (h.verified || h.open247)
      );
      const staticPages = [
        { path: "/", priority: "1.0", changefreq: "daily" },
        { path: "/emergency", priority: "1.0", changefreq: "weekly" },
        { path: "/emergency-symptoms", priority: "0.9", changefreq: "monthly" },
        { path: "/hospitals", priority: "0.9", changefreq: "daily" },
        { path: "/clinics", priority: "0.9", changefreq: "daily" },
        { path: "/districts", priority: "0.8", changefreq: "weekly" },
        { path: "/resources", priority: "0.7", changefreq: "weekly" },
        { path: "/faq", priority: "0.7", changefreq: "monthly" },
        { path: "/about", priority: "0.7", changefreq: "monthly" },
        { path: "/medical-advisory", priority: "0.6", changefreq: "monthly" },
        { path: "/verification-process", priority: "0.6", changefreq: "monthly" },
        { path: "/consultants", priority: "0.6", changefreq: "monthly" },
        { path: "/typhoon-status", priority: "0.7", changefreq: "daily" },
        { path: "/privacy", priority: "0.4", changefreq: "monthly" },
        { path: "/terms", priority: "0.4", changefreq: "monthly" }
      ];
      const blogPages = [
        { path: "/blog/midnight-fees", priority: "0.8", changefreq: "weekly" },
        { path: "/blog/blood-bank", priority: "0.8", changefreq: "weekly" },
        { path: "/blog/typhoon-guide", priority: "0.8", changefreq: "weekly" },
        { path: "/blog/imaging-diagnostics", priority: "0.8", changefreq: "weekly" },
        { path: "/blog/exotic-emergency", priority: "0.8", changefreq: "weekly" }
      ];
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      for (const page of staticPages) {
        xml += `  <url>
`;
        xml += `    <loc>${baseUrl}${page.path}</loc>
`;
        xml += `    <changefreq>${page.changefreq}</changefreq>
`;
        xml += `    <priority>${page.priority}</priority>
`;
        xml += `    <lastmod>${today}</lastmod>
`;
        xml += `  </url>
`;
      }
      for (const page of blogPages) {
        xml += `  <url>
`;
        xml += `    <loc>${baseUrl}${page.path}</loc>
`;
        xml += `    <changefreq>${page.changefreq}</changefreq>
`;
        xml += `    <priority>${page.priority}</priority>
`;
        xml += `    <lastmod>${today}</lastmod>
`;
        xml += `  </url>
`;
      }
      for (const region of activeRegions) {
        xml += `  <url>
`;
        xml += `    <loc>${baseUrl}/district/${region.code}</loc>
`;
        xml += `    <changefreq>weekly</changefreq>
`;
        xml += `    <priority>0.8</priority>
`;
        xml += `    <lastmod>${today}</lastmod>
`;
        xml += `  </url>
`;
      }
      for (const hospital of indexableHospitals) {
        const lastmod = hospital.lastVerifiedAt ? new Date(hospital.lastVerifiedAt).toISOString().split("T")[0] : hospital.updatedAt ? new Date(hospital.updatedAt).toISOString().split("T")[0] : today;
        xml += `  <url>
`;
        xml += `    <loc>${baseUrl}/hospitals/${hospital.slug}</loc>
`;
        xml += `    <changefreq>weekly</changefreq>
`;
        xml += `    <priority>0.8</priority>
`;
        xml += `    <lastmod>${lastmod}</lastmod>
`;
        xml += `  </url>
`;
      }
      xml += "</urlset>";
      res.set({
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "public, max-age=3600"
        // Cache for 1 hour
      });
      res.send(xml);
    } catch (error) {
      console.error("[Sitemap] Error generating sitemap:", error);
      res.set({
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0"
      });
      res.sendFile("sitemap.xml", {
        root: publicDir,
        etag: false,
        lastModified: false
      });
    }
  });
  app2.get("/sitemap-2025.xml", (req, res) => {
    res.set({
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0"
    });
    res.removeHeader("ETag");
    res.sendFile("sitemap-2025.xml", {
      root: publicDir,
      etag: false,
      lastModified: false
    });
  });
  app2.get("/sitemap-oct29.xml", (req, res) => {
    res.set({
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
      "X-Robots-Tag": "noindex"
    });
    res.removeHeader("ETag");
    res.sendFile("sitemap-oct29.xml", {
      root: publicDir,
      etag: false,
      lastModified: false
    });
  });
  app2.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.sendFile("robots.txt", { root: publicDir });
  });
  app2.get("/api/test", (req, res) => {
    res.json({ message: "API is working!" });
  });
  app2.get("/api/storage/status", (req, res) => {
    const status = getStorageStatus();
    res.json(status);
  });
  app2.use("/api/", generalLimiter);
  app2.get("/api/users/export", exportLimiter, isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const exportData = await storage.exportUserData(userId);
      const sanitizedExportData = {
        ...exportData,
        user: sanitizeUser(exportData.user)
      };
      await storage.createAuditLog({
        entityType: "user",
        entityId: userId,
        action: "export_data",
        userId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      const filename = `petsos-data-export-${userId}-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
      res.status(200).set({
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }).send(JSON.stringify(sanitizedExportData, null, 2));
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ message: "Failed to export user data" });
    }
  });
  app2.delete("/api/users/gdpr-delete", deletionLimiter, isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      await storage.createAuditLog({
        entityType: "user",
        entityId: userId,
        action: "gdpr_delete_request",
        userId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      const result = await storage.deleteUserDataGDPR(userId);
      if (!result.success) {
        return res.status(404).json({ message: "User not found" });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session after GDPR delete:", err);
        }
      });
      res.json({
        success: true,
        message: "Your account and all associated data have been permanently deleted",
        deletedRecords: result.deletedRecords
      });
    } catch (error) {
      console.error("Error deleting user data:", error);
      res.status(500).json({ message: "Failed to delete user data" });
    }
  });
  app2.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const requestingUserId = req.user.id;
      const targetUserId = req.params.id;
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (requestingUserId !== targetUserId && requestingUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - You can only view your own profile" });
      }
      const user = await storage.getUser(targetUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(sanitizeUser(user));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const requestingUserId = req.user.id;
      const targetUserId = req.params.id;
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (requestingUserId !== targetUserId && requestingUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - You can only update your own profile" });
      }
      let updateData;
      if (requestingUser.role === "admin") {
        updateData = insertUserSchema.partial().parse(req.body);
      } else {
        const safeUpdateSchema = insertUserSchema.omit({ role: true, clinicId: true }).partial();
        updateData = safeUpdateSchema.parse(req.body);
      }
      const user = await storage.updateUser(targetUserId, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.createAuditLog({
        entityType: "user",
        entityId: user.id,
        action: "update",
        userId: requestingUserId,
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(sanitizeUser(user));
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.delete("/api/users/:id", strictLimiter, isAuthenticated, async (req, res) => {
    try {
      const requestingUserId = req.user.id;
      const targetUserId = req.params.id;
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (requestingUserId !== targetUserId && requestingUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - You can only delete your own account" });
      }
      const success = await storage.deleteUser(targetUserId);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.createAuditLog({
        entityType: "user",
        entityId: targetUserId,
        action: "delete",
        userId: requestingUserId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/users/:id/notification-preferences", isAuthenticated, async (req, res) => {
    try {
      const requestingUserId = req.user.id;
      const targetUserId = req.params.id;
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (requestingUserId !== targetUserId && requestingUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - You can only view your own preferences" });
      }
      const user = await storage.getUser(targetUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const preferences = user.notificationPreferences || {
        emergencyAlerts: true,
        generalUpdates: true,
        promotions: false,
        systemAlerts: true,
        vetTips: true
      };
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/users/:id/notification-preferences", isAuthenticated, async (req, res) => {
    try {
      const requestingUserId = req.user.id;
      const targetUserId = req.params.id;
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (requestingUserId !== targetUserId && requestingUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - You can only update your own preferences" });
      }
      const notificationPreferencesUpdateSchema = z2.object({
        emergencyAlerts: z2.boolean().optional(),
        generalUpdates: z2.boolean().optional(),
        promotions: z2.boolean().optional(),
        systemAlerts: z2.boolean().optional(),
        vetTips: z2.boolean().optional()
      });
      const updates = notificationPreferencesUpdateSchema.parse(req.body);
      const user = await storage.getUser(targetUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const currentPreferences = user.notificationPreferences || {
        emergencyAlerts: true,
        generalUpdates: true,
        promotions: false,
        systemAlerts: true,
        vetTips: true
      };
      const newPreferences = { ...currentPreferences, ...updates };
      const updatedUser = await storage.updateUser(targetUserId, {
        notificationPreferences: newPreferences
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.createAuditLog({
        entityType: "user",
        entityId: targetUserId,
        action: "update_notification_preferences",
        userId: requestingUserId,
        changes: updates,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(updatedUser.notificationPreferences);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/2fa/setup", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA is already enabled" });
      }
      const secret = new OTPAuth.Secret({ size: 20 });
      const rawSecret = secret.base32;
      const totp = new OTPAuth.TOTP({
        issuer: "PetSOS",
        label: user.email || user.name || "Admin",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret
      });
      const otpauthUrl = totp.toString();
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
      const encryptedSecret = encryptTotpSecret(rawSecret);
      await storage.updateUserTwoFactor(userId, encryptedSecret, null, false);
      res.json({
        secret: rawSecret,
        qrCode: qrCodeDataUrl,
        otpauthUrl
      });
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      res.status(500).json({ message: "Failed to setup 2FA" });
    }
  });
  app2.post("/api/auth/2fa/verify", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.user.id;
      const { code } = req.body;
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Verification code is required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA setup not initiated. Please start setup first." });
      }
      if (user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA is already enabled" });
      }
      let decryptedSecret;
      try {
        if (isEncryptedSecret(user.twoFactorSecret)) {
          decryptedSecret = decryptTotpSecret(user.twoFactorSecret);
        } else {
          decryptedSecret = user.twoFactorSecret;
        }
      } catch (decryptError) {
        console.error("Error decrypting 2FA secret:", decryptError);
        return res.status(500).json({ message: "Failed to process 2FA secret" });
      }
      const totp = new OTPAuth.TOTP({
        issuer: "PetSOS",
        label: user.email || user.name || "Admin",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(decryptedSecret)
      });
      const delta = totp.validate({ token: code, window: 1 });
      if (delta === null) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      const backupCodes = [];
      const hashedBackupCodes = [];
      for (let i = 0; i < 10; i++) {
        const code2 = crypto2.randomBytes(4).toString("hex").toUpperCase();
        backupCodes.push(code2);
        const hashed = await bcrypt2.hash(code2, 10);
        hashedBackupCodes.push(hashed);
      }
      await storage.updateUserTwoFactor(userId, user.twoFactorSecret, hashedBackupCodes, true);
      await storage.createAuditLog({
        entityType: "user",
        entityId: userId,
        action: "2fa_enabled",
        userId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({
        success: true,
        message: "2FA has been enabled",
        backupCodes
        // Return plain backup codes only once
      });
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      res.status(500).json({ message: "Failed to verify 2FA" });
    }
  });
  app2.post("/api/auth/2fa/disable", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.user.id;
      const { code } = req.body;
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Verification code is required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA is not enabled" });
      }
      let decryptedSecret;
      try {
        if (isEncryptedSecret(user.twoFactorSecret)) {
          decryptedSecret = decryptTotpSecret(user.twoFactorSecret);
        } else {
          decryptedSecret = user.twoFactorSecret;
        }
      } catch (decryptError) {
        console.error("Error decrypting 2FA secret:", decryptError);
        return res.status(500).json({ message: "Failed to process 2FA secret" });
      }
      const totp = new OTPAuth.TOTP({
        issuer: "PetSOS",
        label: user.email || user.name || "Admin",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(decryptedSecret)
      });
      const delta = totp.validate({ token: code, window: 1 });
      if (delta === null) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      await storage.updateUserTwoFactor(userId, null, null, false);
      await storage.createAuditLog({
        entityType: "user",
        entityId: userId,
        action: "2fa_disabled",
        userId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({
        success: true,
        message: "2FA has been disabled"
      });
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      res.status(500).json({ message: "Failed to disable 2FA" });
    }
  });
  app2.post("/api/auth/2fa/backup-codes", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.user.id;
      const { code } = req.body;
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Verification code is required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA is not enabled" });
      }
      let decryptedSecret;
      try {
        if (isEncryptedSecret(user.twoFactorSecret)) {
          decryptedSecret = decryptTotpSecret(user.twoFactorSecret);
        } else {
          decryptedSecret = user.twoFactorSecret;
        }
      } catch (decryptError) {
        console.error("Error decrypting 2FA secret:", decryptError);
        return res.status(500).json({ message: "Failed to process 2FA secret" });
      }
      const totp = new OTPAuth.TOTP({
        issuer: "PetSOS",
        label: user.email || user.name || "Admin",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(decryptedSecret)
      });
      const delta = totp.validate({ token: code, window: 1 });
      if (delta === null) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      const backupCodes = [];
      const hashedBackupCodes = [];
      for (let i = 0; i < 10; i++) {
        const newCode = crypto2.randomBytes(4).toString("hex").toUpperCase();
        backupCodes.push(newCode);
        const hashed = await bcrypt2.hash(newCode, 10);
        hashedBackupCodes.push(hashed);
      }
      await storage.updateUserTwoFactor(userId, user.twoFactorSecret, hashedBackupCodes, true);
      await storage.createAuditLog({
        entityType: "user",
        entityId: userId,
        action: "2fa_backup_codes_regenerated",
        userId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({
        success: true,
        backupCodes
      });
    } catch (error) {
      console.error("Error generating backup codes:", error);
      res.status(500).json({ message: "Failed to generate backup codes" });
    }
  });
  app2.post("/api/auth/2fa/validate", async (req, res) => {
    try {
      const { code, useBackupCode } = req.body;
      const pendingUserId = req.session?.pendingTwoFactorUserId;
      if (!pendingUserId) {
        return res.status(400).json({ message: "No pending 2FA validation" });
      }
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Verification code is required" });
      }
      const user = await storage.getUser(pendingUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA is not enabled for this user" });
      }
      let isValid = false;
      if (useBackupCode) {
        isValid = await storage.validateBackupCode(pendingUserId, code);
      } else {
        let decryptedSecret;
        try {
          if (isEncryptedSecret(user.twoFactorSecret)) {
            decryptedSecret = decryptTotpSecret(user.twoFactorSecret);
          } else {
            decryptedSecret = user.twoFactorSecret;
          }
        } catch (decryptError) {
          console.error("Error decrypting 2FA secret:", decryptError);
          return res.status(500).json({ message: "Failed to process 2FA secret" });
        }
        const totp = new OTPAuth.TOTP({
          issuer: "PetSOS",
          label: user.email || user.name || "Admin",
          algorithm: "SHA1",
          digits: 6,
          period: 30,
          secret: OTPAuth.Secret.fromBase32(decryptedSecret)
        });
        const delta = totp.validate({ token: code, window: 1 });
        isValid = delta !== null;
      }
      if (!isValid) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      delete req.session.pendingTwoFactorUserId;
      req.logIn(user, (err) => {
        if (err) {
          console.error("Error logging in after 2FA:", err);
          return res.status(500).json({ message: "Login failed after 2FA validation" });
        }
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Error saving session after 2FA:", saveErr);
            return res.status(500).json({ message: "Session save failed" });
          }
          res.json({
            success: true,
            user: sanitizeUser(user)
          });
        });
      });
    } catch (error) {
      console.error("Error validating 2FA:", error);
      res.status(500).json({ message: "Failed to validate 2FA" });
    }
  });
  app2.get("/api/auth/2fa/status", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        enabled: user.twoFactorEnabled,
        hasBackupCodes: !!(user.twoFactorBackupCodes && user.twoFactorBackupCodes.length > 0),
        backupCodesCount: user.twoFactorBackupCodes?.length || 0
      });
    } catch (error) {
      console.error("Error getting 2FA status:", error);
      res.status(500).json({ message: "Failed to get 2FA status" });
    }
  });
  app2.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const sanitizedUsers = users2.map(sanitizeUser);
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/pets", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const pets2 = await storage.getAllPets();
      res.json(pets2);
    } catch (error) {
      console.error("Error fetching all pets:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/users/:userId/pets", isAuthenticated, async (req, res) => {
    try {
      const requestingUserId = req.user.id;
      const targetUserId = req.params.userId;
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (requestingUserId !== targetUserId && requestingUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - You can only view your own pets" });
      }
      const pets2 = await storage.getPetsByUserId(targetUserId);
      res.json(pets2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/pets", isAuthenticated, async (req, res) => {
    try {
      const requestingUserId = req.user.id;
      const petData = insertPetSchema.parse(req.body);
      if (petData.userId !== requestingUserId) {
        return res.status(403).json({ message: "Forbidden - You can only create pets for yourself" });
      }
      const pet = await storage.createPet(petData);
      await storage.createAuditLog({
        entityType: "pet",
        entityId: pet.id,
        action: "create",
        userId: requestingUserId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(pet);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/pets/:id", isAuthenticated, async (req, res) => {
    try {
      const requestingUserId = req.user.id;
      const pet = await storage.getPet(req.params.id);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (pet.userId !== requestingUserId && requestingUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - You can only view your own pets" });
      }
      res.json(pet);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/pets/:id", isAuthenticated, async (req, res) => {
    try {
      const requestingUserId = req.user.id;
      const pet = await storage.getPet(req.params.id);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (pet.userId !== requestingUserId && requestingUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - You can only update your own pets" });
      }
      const updateData = insertPetSchema.partial().parse(req.body);
      const updatedPet = await storage.updatePet(req.params.id, updateData);
      await storage.createAuditLog({
        entityType: "pet",
        entityId: pet.id,
        action: "update",
        userId: requestingUserId,
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(updatedPet);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Pet update error:", error);
      res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.delete("/api/pets/:id", strictLimiter, isAuthenticated, async (req, res) => {
    try {
      const requestingUserId = req.user.id;
      const pet = await storage.getPet(req.params.id);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (pet.userId !== requestingUserId && requestingUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - You can only delete your own pets" });
      }
      const success = await storage.deletePet(req.params.id);
      await storage.createAuditLog({
        entityType: "pet",
        entityId: req.params.id,
        action: "delete",
        userId: requestingUserId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/pets/:id/photo-upload-url", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const petId = req.params.id;
      const pet = await storage.getPet(petId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      if (pet.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const { contentType } = req.body || {};
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL(contentType);
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting pet photo upload URL:", error);
      res.status(500).json({ error: error.message || "Failed to get upload URL" });
    }
  });
  app2.post("/api/pets/:id/photo", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const petId = req.params.id;
      const photoUpdateSchema = z2.object({
        filePath: z2.string().min(1, "File path is required")
      });
      const validationResult = photoUpdateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validationResult.error.errors
        });
      }
      const { filePath: rawFilePath } = validationResult.data;
      const pet = await storage.getPet(petId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      if (pet.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const objectStorageService = new ObjectStorageService();
      const filePath = objectStorageService.normalizeObjectEntityPath(rawFilePath);
      if (!filePath.startsWith("/objects/")) {
        return res.status(400).json({
          error: "Invalid file path",
          message: "The uploaded file path is not a valid object storage path."
        });
      }
      try {
        await objectStorageService.trySetObjectEntityAclPolicy(filePath, {
          owner: userId,
          visibility: "public"
        });
      } catch (aclError) {
        console.warn("Failed to set ACL policy for pet photo:", aclError);
      }
      const photoUrl = objectStorageService.getObjectEntityPublicUrl(filePath);
      if (!photoUrl || typeof photoUrl !== "string") {
        return res.status(500).json({
          error: "Failed to generate photo URL",
          message: "Could not generate a valid URL for the uploaded photo."
        });
      }
      const updatedPet = await storage.updatePet(petId, { photoUrl });
      await storage.createAuditLog({
        entityType: "pet",
        entityId: petId,
        action: "update",
        userId,
        changes: { photoUrl },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(updatedPet);
    } catch (error) {
      console.error("Error updating pet photo:", error);
      res.status(500).json({ error: error.message || "Failed to update pet photo" });
    }
  });
  app2.delete("/api/pets/:id/photo", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const petId = req.params.id;
      const pet = await storage.getPet(petId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      if (pet.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const updatedPet = await storage.updatePet(petId, { photoUrl: null });
      await storage.createAuditLog({
        entityType: "pet",
        entityId: petId,
        action: "update",
        userId,
        changes: { photoUrl: null },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(updatedPet);
    } catch (error) {
      console.error("Error deleting pet photo:", error);
      res.status(500).json({ error: error.message || "Failed to delete pet photo" });
    }
  });
  app2.get("/api/regions", async (req, res) => {
    const regions2 = await storage.getAllRegions();
    res.json(regions2);
  });
  app2.get("/api/regions/code/:code", async (req, res) => {
    const region = await storage.getRegionByCode(req.params.code);
    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }
    res.json(region);
  });
  app2.post("/api/regions", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const regionData = insertRegionSchema.parse(req.body);
      const region = await storage.createRegion(regionData);
      await storage.createAuditLog({
        entityType: "region",
        entityId: region.id,
        action: "create",
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(region);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/regions/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const regionData = insertRegionSchema.partial().parse(req.body);
      const region = await storage.updateRegion(req.params.id, regionData);
      if (!region) {
        return res.status(404).json({ message: "Region not found" });
      }
      await storage.createAuditLog({
        entityType: "region",
        entityId: region.id,
        action: "update",
        changes: regionData,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(region);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/countries", async (req, res) => {
    const countries2 = await storage.getAllCountries();
    res.json(countries2);
  });
  app2.get("/api/countries/active", async (req, res) => {
    const countries2 = await storage.getActiveCountries();
    res.json(countries2);
  });
  app2.get("/api/countries/code/:code", async (req, res) => {
    const country = await storage.getCountryByCode(req.params.code);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.json(country);
  });
  app2.get("/api/countries/:code/regions", async (req, res) => {
    const regions2 = await storage.getRegionsByCountry(req.params.code);
    res.json(regions2);
  });
  app2.post("/api/countries", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const countryData = insertCountrySchema.parse(req.body);
      const country = await storage.createCountry(countryData);
      await storage.createAuditLog({
        entityType: "country",
        entityId: country.id,
        action: "create",
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(country);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/countries/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const countryData = insertCountrySchema.partial().parse(req.body);
      const country = await storage.updateCountry(req.params.id, countryData);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      await storage.createAuditLog({
        entityType: "country",
        entityId: country.id,
        action: "update",
        changes: countryData,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(country);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/countries/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCountry(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Country not found" });
      }
      await storage.createAuditLog({
        entityType: "country",
        entityId: req.params.id,
        action: "delete",
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/pet-breeds", async (req, res) => {
    const breeds = await storage.getAllPetBreeds();
    res.json(breeds);
  });
  app2.get("/api/pet-breeds/species/:species", async (req, res) => {
    const breeds = await storage.getPetBreedsBySpecies(req.params.species);
    res.json(breeds);
  });
  app2.get("/api/pet-breeds/common", async (req, res) => {
    const species = req.query.species;
    const breeds = await storage.getCommonPetBreeds(species);
    res.json(breeds);
  });
  app2.get("/api/pet-breeds/country/:countryCode", async (req, res) => {
    const breeds = await storage.getPetBreedsByCountry(req.params.countryCode);
    res.json(breeds);
  });
  app2.post("/api/pet-breeds", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const breedData = insertPetBreedSchema.parse(req.body);
      const breed = await storage.createPetBreed(breedData);
      await storage.createAuditLog({
        entityType: "pet_breed",
        entityId: breed.id,
        action: "create",
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(breed);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/pet-breeds/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const breedData = insertPetBreedSchema.partial().parse(req.body);
      const breed = await storage.updatePetBreed(req.params.id, breedData);
      if (!breed) {
        return res.status(404).json({ message: "Pet breed not found" });
      }
      await storage.createAuditLog({
        entityType: "pet_breed",
        entityId: breed.id,
        action: "update",
        changes: breedData,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(breed);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/pet-breeds/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await storage.deletePetBreed(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Pet breed not found" });
      }
      await storage.createAuditLog({
        entityType: "pet_breed",
        entityId: req.params.id,
        action: "delete",
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  const hospitalToClinicFormat = (h) => ({
    // Core identification
    id: h.id,
    slug: h.slug,
    // Names and addresses
    name: h.nameEn,
    nameZh: h.nameZh,
    address: h.addressEn,
    addressZh: h.addressZh,
    // Contact information
    phone: h.phone || "",
    whatsapp: h.whatsapp,
    email: h.email || null,
    websiteUrl: h.websiteUrl,
    // Location
    regionId: h.regionId,
    latitude: h.latitude ? parseFloat(h.latitude) : null,
    longitude: h.longitude ? parseFloat(h.longitude) : null,
    distance: h.distance,
    // Present only in nearby queries
    // Status and availability
    is24Hour: h.open247,
    status: h.isAvailable ? "active" : "inactive",
    isAvailable: h.isAvailable,
    liveStatus: h.liveStatus,
    // Partner and support flags
    isSupportHospital: h.isPartner,
    // Legacy field for backward compatibility
    services: [],
    // Hospitals use detailed service flags instead
    // Hospital indicator flags (for frontend migration period)
    isHospital: true,
    // Mark as hospital to distinguish from legacy clinics
    hospitalSlug: h.slug,
    // Frontend uses this to build /hospitals/:slug links
    // Media
    photos: h.photos || [],
    // Hospital-specific features
    onSiteVet247: h.onSiteVet247,
    triagePolicy: h.triagePolicy,
    icuLevel: h.icuLevel,
    whatsappTriage: h.whatsappTriage,
    // Amenities
    languages: h.languages,
    parking: h.parking,
    wheelchairAccess: h.wheelchairAccess
  });
  app2.get("/api/clinics", async (req, res) => {
    try {
      const clinics2 = await storage.getAllClinics();
      res.json(clinics2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/clinics/region/:regionId", async (req, res) => {
    console.warn("[DEPRECATED] /api/clinics/region called - use /api/hospitals/region instead");
    const hospitals2 = await storage.getHospitalsByRegion(req.params.regionId);
    res.json(hospitals2.map(hospitalToClinicFormat));
  });
  app2.get("/api/clinics/24hour/:regionId", async (req, res) => {
    console.warn("[DEPRECATED] /api/clinics/24hour called - use /api/hospitals/region instead");
    const hospitals2 = await storage.getHospitalsByRegion(req.params.regionId);
    res.json(hospitals2.filter((h) => h.open247).map(hospitalToClinicFormat));
  });
  app2.get("/api/clinics/nearby", async (req, res) => {
    console.warn("[DEPRECATED] /api/clinics/nearby called - use /api/hospitals/nearby instead");
    try {
      const { latitude, longitude, radius } = z2.object({
        latitude: z2.string().transform(Number),
        longitude: z2.string().transform(Number),
        radius: z2.string().transform(Number).default("10000")
      }).parse(req.query);
      const hospitals2 = await storage.getNearbyHospitals(latitude, longitude, radius);
      res.json(hospitals2.map(hospitalToClinicFormat));
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/clinics/:id", async (req, res) => {
    const clinic = await storage.getClinic(req.params.id);
    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }
    res.json(clinic);
  });
  app2.post("/api/clinics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const clinicData = insertClinicSchema.parse(req.body);
      const clinic = await storage.createClinic(clinicData);
      await storage.createAuditLog({
        entityType: "clinic",
        entityId: clinic.id,
        action: "create",
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(clinic);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/clinics/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const clinic = await storage.getClinic(req.params.id);
      if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
      }
      const updateData = insertClinicSchema.partial().parse(req.body);
      const updatedClinic = await storage.updateClinic(req.params.id, updateData);
      await storage.createAuditLog({
        entityType: "clinic",
        entityId: clinic.id,
        action: "update",
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(updatedClinic);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/clinics/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteClinic(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Clinic not found" });
      }
      await storage.createAuditLog({
        entityType: "clinic",
        entityId: req.params.id,
        action: "delete",
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/clinics/:id/reviews", async (req, res) => {
    try {
      const clinicId = req.params.id;
      const clinic = await storage.getClinic(clinicId);
      if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
      }
      const reviews = await storage.getClinicReviews(clinicId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching clinic reviews:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/clinics/:id/reviews", isAuthenticated, async (req, res) => {
    try {
      const clinicId = req.params.id;
      const userId = req.user.id;
      const clinic = await storage.getClinic(clinicId);
      if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
      }
      const existingReview = await storage.getUserReviewForClinic(userId, clinicId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this clinic" });
      }
      const reviewSchema = z2.object({
        rating: z2.number().min(1).max(5),
        reviewText: z2.string().optional()
      });
      const { rating, reviewText } = reviewSchema.parse(req.body);
      const review = await storage.createClinicReview({
        clinicId,
        userId,
        rating,
        reviewText: reviewText || null,
        status: "approved"
        // Auto-approve for now, can add moderation later
      });
      await storage.updateClinicRatingStats(clinicId);
      await storage.createAuditLog({
        entityType: "clinic_review",
        entityId: review.id,
        action: "create",
        userId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating clinic review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/reviews/:id", isAuthenticated, async (req, res) => {
    try {
      const reviewId = req.params.id;
      const userId = req.user.id;
      const review = await storage.getClinicReview(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      if (review.userId !== userId) {
        return res.status(403).json({ message: "You can only update your own reviews" });
      }
      const updateSchema = z2.object({
        rating: z2.number().min(1).max(5).optional(),
        reviewText: z2.string().optional().nullable()
      });
      const updateData = updateSchema.parse(req.body);
      const updatedReview = await storage.updateClinicReview(reviewId, updateData);
      await storage.updateClinicRatingStats(review.clinicId);
      await storage.createAuditLog({
        entityType: "clinic_review",
        entityId: reviewId,
        action: "update",
        userId,
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(updatedReview);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating clinic review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/reviews/:id", isAuthenticated, async (req, res) => {
    try {
      const reviewId = req.params.id;
      const userId = req.user.id;
      const review = await storage.getClinicReview(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      const user = await storage.getUser(userId);
      if (review.userId !== userId && user?.role !== "admin") {
        return res.status(403).json({ message: "You can only delete your own reviews" });
      }
      const clinicId = review.clinicId;
      await storage.deleteClinicReview(reviewId);
      await storage.updateClinicRatingStats(clinicId);
      await storage.createAuditLog({
        entityType: "clinic_review",
        entityId: reviewId,
        action: "delete",
        userId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting clinic review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/clinics/:id/my-review", isAuthenticated, async (req, res) => {
    try {
      const clinicId = req.params.id;
      const userId = req.user.id;
      const review = await storage.getUserReviewForClinic(userId, clinicId);
      if (!review) {
        return res.status(404).json({ message: "No review found" });
      }
      res.json(review);
    } catch (error) {
      console.error("Error fetching user review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/clinics/import", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { csvData } = z2.object({
        csvData: z2.string()
      }).parse(req.body);
      const lines = csvData.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        return res.status(400).json({ message: "CSV must contain headers and at least one row" });
      }
      const headers = lines[0].split(",").map((h) => h.trim());
      const regions2 = await storage.getAllRegions();
      const imported = [];
      const errors = [];
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(",").map((v) => v.trim());
          const row = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx] || "";
          });
          const districtEn = row["District"] || row["District (English)"] || "";
          const regionId = regions2.find(
            (r) => r.nameEn?.toLowerCase().includes(districtEn.toLowerCase()) || r.nameZh?.includes(row["District"] || "")
          )?.id;
          if (!regionId) {
            errors.push(`Row ${i}: No matching region found for "${districtEn}"`);
            continue;
          }
          const clinicData = {
            name: row["Name of Vet Clinic (English)"] || row["Clinic Name (English)"] || "Unnamed",
            nameZh: row["\u7378\u91AB\u8A3A\u6240\u540D\u7A31 (Chinese)"] || row["Clinic Name (Chinese)"] || "\u672A\u547D\u540D",
            address: row["Address"] || row["Address (English)"] || "",
            addressZh: row["\u71DF\u696D\u5730\u5740"] || row["Address (Chinese)"] || "",
            phone: row["Call Phone Number"] || row["Phone"] || "",
            whatsapp: (row["WhatsApp Number"] || row["WhatsApp"] || "").replace(/[^\d+]/g, "") || void 0,
            email: row["Email"] || void 0,
            regionId,
            is24Hour: (row["24 hours"] || "").toLowerCase() === "y" || (row["24 hours"] || "").toLowerCase() === "yes",
            websiteUrl: row["Website"] || row["Website URL"] || void 0
          };
          const existing = (await storage.getAllClinics()).find(
            (c) => c.name?.toLowerCase() === clinicData.name.toLowerCase() && c.regionId === regionId
          );
          if (existing) {
            await storage.updateClinic(existing.id, clinicData);
            imported.push({ action: "updated", name: clinicData.name, id: existing.id });
          } else {
            const created = await storage.createClinic(clinicData);
            imported.push({ action: "created", name: clinicData.name, id: created.id });
          }
        } catch (error) {
          errors.push(`Row ${i}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      await storage.createAuditLog({
        entityType: "clinic",
        entityId: "bulk-import",
        action: "import",
        changes: { imported: imported.length, errors: errors.length },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({ imported, errors, summary: { createdOrUpdated: imported.length, errors: errors.length } });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/clinics/:id/staff", isAuthenticated, isAdmin, async (req, res) => {
    console.warn("[DEPRECATED] GET /api/clinics/:id/staff called - update to use hospital staff management");
    res.status(410).json({
      message: "This endpoint is deprecated. Clinic staff management should be updated to use hospitals.",
      deprecated: true
    });
  });
  app2.post("/api/clinics/:id/staff", isAuthenticated, isAdmin, async (req, res) => {
    console.warn("[DEPRECATED] POST /api/clinics/:id/staff called");
    res.status(410).json({
      message: "This endpoint is deprecated. Clinic staff management should be updated to use hospitals.",
      deprecated: true
    });
  });
  app2.delete("/api/clinics/:id/staff/:userId", isAuthenticated, isAdmin, async (req, res) => {
    console.warn("[DEPRECATED] DELETE /api/clinics/:id/staff/:userId called");
    res.status(410).json({
      message: "This endpoint is deprecated. Clinic staff management should be updated to use hospitals.",
      deprecated: true
    });
  });
  app2.post("/api/geocode", async (req, res) => {
    try {
      const { address } = z2.object({
        address: z2.string().min(1, "Address is required")
      }).parse(req.body);
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Google Maps API key not configured" });
      }
      const encodedAddress = encodeURIComponent(address);
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();
      if (data.status === "OK" && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        res.json({
          latitude: location.lat.toString(),
          longitude: location.lng.toString(),
          formattedAddress: data.results[0].formatted_address
        });
      } else if (data.status === "ZERO_RESULTS") {
        res.status(404).json({ message: "Address not found. Please check the address and try again." });
      } else if (data.status === "OVER_QUERY_LIMIT") {
        res.status(429).json({ message: "Geocoding API quota exceeded. Please try again later." });
      } else {
        res.status(400).json({ message: `Geocoding failed: ${data.status}` });
      }
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Geocoding error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/hospitals", async (req, res) => {
    try {
      const hospitals2 = await storage.getAllHospitals();
      const pingStates = await storage.getAllHospitalPingStates();
      const pingStateMap = new Map(pingStates.map((ps) => [ps.hospitalId, ps]));
      const hospitalsWithPingState = hospitals2.map((h) => {
        const pingState = pingStateMap.get(h.id);
        return {
          ...h,
          // Only expose last reply time for recency display - no internal admin details
          lastInboundReplyAt: pingState?.lastInboundReplyAt || null,
          replyStatus: pingState?.pingStatus === "no_reply" ? "unresponsive" : "active"
        };
      });
      res.json(hospitalsWithPingState);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/hospitals/region/:regionId", async (req, res) => {
    try {
      const hospitals2 = await storage.getHospitalsByRegion(req.params.regionId);
      res.json(hospitals2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/hospitals/slug/:slug", async (req, res) => {
    try {
      const hospital = await storage.getHospitalBySlug(req.params.slug);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      res.json(hospital);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/hospitals/nearby", async (req, res) => {
    try {
      const { latitude, longitude, radius, last_reply_window } = z2.object({
        latitude: z2.string().transform(Number),
        longitude: z2.string().transform(Number),
        radius: z2.string().transform(Number).default("10000"),
        last_reply_window: z2.enum(["1h", "24h", "7d", "none", "all"]).optional()
      }).parse(req.query);
      let hospitals2 = await storage.getNearbyHospitals(latitude, longitude, radius);
      const pingStates = await storage.getAllHospitalPingStates();
      const pingStateMap = new Map(pingStates.map((ps) => [ps.hospitalId, ps]));
      const hospitalsWithPingState = hospitals2.map((h) => {
        const pingState = pingStateMap.get(h.id);
        return {
          ...h,
          lastInboundReplyAt: pingState?.lastInboundReplyAt || null,
          replyStatus: pingState?.pingStatus === "no_reply" ? "unresponsive" : "active"
        };
      });
      if (last_reply_window && last_reply_window !== "all") {
        const now = Date.now();
        const filterHospitals = hospitalsWithPingState.filter((h) => {
          const lastReply = h.lastInboundReplyAt;
          if (last_reply_window === "none") {
            return !lastReply;
          }
          if (!lastReply) return false;
          const replyTime = new Date(lastReply).getTime();
          const ageMs = now - replyTime;
          switch (last_reply_window) {
            case "1h":
              return ageMs <= 60 * 60 * 1e3;
            case "24h":
              return ageMs <= 24 * 60 * 60 * 1e3;
            case "7d":
              return ageMs <= 7 * 24 * 60 * 60 * 1e3;
            default:
              return true;
          }
        });
        res.json(filterHospitals);
      } else {
        res.json(hospitalsWithPingState);
      }
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/hospitals/:id", async (req, res) => {
    try {
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      res.json(hospital);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/hospitals/:id/change-logs", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const logs = await storage.getHospitalChangeLogs(req.params.id, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching hospital change logs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/hospital-change-logs", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const logs = await storage.getRecentHospitalChangeLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching recent hospital change logs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/hospitals", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { insertHospitalSchema: insertHospitalSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const hospitalData = insertHospitalSchema2.parse(req.body);
      const hospital = await storage.createHospital(hospitalData);
      await storage.createAuditLog({
        entityType: "hospital",
        entityId: hospital.id,
        action: "create",
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(hospital);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/hospitals/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { insertHospitalSchema: insertHospitalSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      const updateData = insertHospitalSchema2.partial().parse(req.body);
      const updatedHospital = await storage.updateHospital(req.params.id, updateData);
      await storage.createAuditLog({
        entityType: "hospital",
        entityId: hospital.id,
        action: "update",
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(updatedHospital);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/hospitals/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteHospital(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      await storage.createAuditLog({
        entityType: "hospital",
        entityId: req.params.id,
        action: "delete",
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/hospitals/:hospitalId/fees", async (req, res) => {
    try {
      const fees = await storage.getConsultFeesByHospitalId(req.params.hospitalId);
      res.json(fees);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/hospitals/:hospitalId/fees", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { insertHospitalConsultFeeSchema: insertHospitalConsultFeeSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const feeData = insertHospitalConsultFeeSchema2.parse({
        ...req.body,
        hospitalId: req.params.hospitalId
      });
      const fee = await storage.createConsultFee(feeData);
      res.json(fee);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/hospitals/fees/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { insertHospitalConsultFeeSchema: insertHospitalConsultFeeSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const updateData = insertHospitalConsultFeeSchema2.partial().parse(req.body);
      const updatedFee = await storage.updateConsultFee(req.params.id, updateData);
      if (!updatedFee) {
        return res.status(404).json({ message: "Consult fee not found" });
      }
      res.json(updatedFee);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/hospitals/fees/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteConsultFee(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Consult fee not found" });
      }
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/hospitals/:hospitalId/updates", isAuthenticated, async (req, res) => {
    try {
      const updates = await storage.getHospitalUpdatesByHospitalId(req.params.hospitalId);
      res.json(updates);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/hospitals/:hospitalId/report", isAuthenticated, async (req, res) => {
    try {
      const sessionUser = req.user;
      const userId = sessionUser.id;
      const { insertHospitalUpdateSchema: insertHospitalUpdateSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const updateData = insertHospitalUpdateSchema2.parse({
        ...req.body,
        hospitalId: req.params.hospitalId,
        submittedById: userId
      });
      const update = await storage.createHospitalUpdate(updateData);
      res.json(update);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/hospitals/updates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const sessionUser = req.user;
      const userId = sessionUser.id;
      const { insertHospitalUpdateSchema: insertHospitalUpdateSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const updateData = insertHospitalUpdateSchema2.partial().extend({
        reviewedById: z2.string().optional(),
        reviewedAt: z2.date().optional()
      }).parse({
        ...req.body,
        reviewedById: userId,
        reviewedAt: /* @__PURE__ */ new Date()
      });
      const updatedUpdate = await storage.updateHospitalUpdate(req.params.id, updateData);
      if (!updatedUpdate) {
        return res.status(404).json({ message: "Hospital update not found" });
      }
      res.json(updatedUpdate);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/hospitals/:hospitalId/emergency-requests", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const hospitalId = req.params.hospitalId;
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized - Admin only" });
      }
      const requests = await storage.getEmergencyRequestsByClinicId(hospitalId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/hospitals/:hospitalId/ping-state", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const pingState = await storage.getHospitalPingState(req.params.hospitalId);
      res.json(pingState || { hospitalId: req.params.hospitalId, pingEnabled: true, pingStatus: "active" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/hospital-ping-states", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const pingStates = await storage.getAllHospitalPingStates();
      res.json(pingStates);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/hospitals/:hospitalId/ping-settings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { pingEnabled } = z2.object({
        pingEnabled: z2.boolean()
      }).parse(req.body);
      const hospitalId = req.params.hospitalId;
      const hospital = await storage.getHospital(hospitalId);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      const existingState = await storage.getHospitalPingState(hospitalId);
      const updatedState = await storage.upsertHospitalPingState({
        hospitalId,
        pingEnabled,
        pingStatus: existingState?.pingStatus || "active",
        lastPingSentAt: existingState?.lastPingSentAt || null,
        lastPingMessageId: existingState?.lastPingMessageId || null,
        lastInboundReplyAt: existingState?.lastInboundReplyAt || null,
        lastReplyLatencySeconds: existingState?.lastReplyLatencySeconds || null,
        noReplySince: existingState?.noReplySince || null
      });
      await storage.createAuditLog({
        entityType: "hospital_ping_state",
        entityId: hospitalId,
        action: "update_ping_settings",
        userId: req.user.id,
        changes: { pingEnabled },
        ipAddress: req.ip
      });
      res.json(updatedState);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/hospitals/:hospitalId/reset-ping-status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const hospitalId = req.params.hospitalId;
      const hospital = await storage.getHospital(hospitalId);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      const existingState = await storage.getHospitalPingState(hospitalId);
      if (!existingState) {
        return res.status(404).json({ message: "No ping state found for hospital" });
      }
      const updatedState = await storage.updateHospitalPingState(hospitalId, {
        pingStatus: "active",
        noReplySince: null
      });
      await storage.createHospitalPingLog({
        hospitalId,
        direction: "outbound",
        providerMessageId: null,
        eventType: "ping_sent",
        sentAt: null,
        receivedAt: null,
        payload: { action: "manual_reset", resetBy: req.user.id }
      });
      await storage.createAuditLog({
        entityType: "hospital_ping_state",
        entityId: hospitalId,
        action: "reset_ping_status",
        userId: req.user.id,
        changes: { previousStatus: existingState.pingStatus, newStatus: "active" },
        ipAddress: req.ip
      });
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/hospitals/:hospitalId/ping-logs", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const logs = await storage.getHospitalPingLogs(req.params.hospitalId, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/emergency-requests", async (req, res) => {
    try {
      const emergencyRequestSchemaWithCoercion = insertEmergencyRequestSchema.extend({
        petAge: z2.union([z2.number(), z2.null()]).optional()
      });
      let loggedInUserId = null;
      if (req.user) {
        loggedInUserId = req.user.id;
      } else if (req.session?.passport?.user) {
        loggedInUserId = req.session.passport.user;
      }
      console.log("[Emergency Request] req.user:", req.user ? "exists" : "null");
      console.log("[Emergency Request] session.passport.user:", req.session?.passport?.user);
      console.log("[Emergency Request] loggedInUserId:", loggedInUserId);
      let parsedPetAge = null;
      if (req.body.petAge != null) {
        const age = parseInt(req.body.petAge, 10);
        parsedPetAge = isNaN(age) ? null : age;
      }
      const validatedData = emergencyRequestSchemaWithCoercion.parse({
        userId: req.body.userId ?? loggedInUserId ?? null,
        petId: req.body.petId ?? null,
        symptom: req.body.symptom,
        petSpecies: req.body.petSpecies ?? null,
        petBreed: req.body.petBreed ?? null,
        petAge: parsedPetAge,
        locationLatitude: req.body.locationLatitude ? String(req.body.locationLatitude) : null,
        locationLongitude: req.body.locationLongitude ? String(req.body.locationLongitude) : null,
        manualLocation: req.body.manualLocation ?? null,
        contactName: req.body.contactName,
        contactPhone: req.body.contactPhone,
        status: req.body.status ?? "pending",
        regionId: req.body.regionId ?? null,
        voiceTranscript: req.body.voiceTranscript ?? null,
        aiAnalyzedSymptoms: req.body.aiAnalyzedSymptoms ?? null,
        isVoiceRecording: req.body.isVoiceRecording ?? false
      });
      const emergencyRequest = await storage.createEmergencyRequest(validatedData);
      await storage.createAuditLog({
        entityType: "emergency_request",
        entityId: emergencyRequest.id,
        action: "create",
        userId: emergencyRequest.userId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.status(201).json(emergencyRequest);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating emergency request:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/emergency-requests", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllEmergencyRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching emergency requests:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/emergency-requests/:id", async (req, res) => {
    const request = await storage.getEmergencyRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Emergency request not found" });
    }
    res.json(request);
  });
  app2.get("/api/emergency-requests/:id/hospital-responses", async (req, res) => {
    try {
      const responses = await storage.getHospitalEmergencyResponsesByEmergencyId(req.params.id);
      const enriched = await Promise.all(responses.map(async (r) => {
        const hospital = await storage.getHospital(r.hospitalId);
        return {
          ...r,
          hospitalNameEn: hospital?.nameEn || "Unknown Hospital",
          hospitalNameZh: hospital?.nameZh || "",
          hospitalPhone: hospital?.phone || "",
          hospitalWhatsapp: hospital?.whatsapp || ""
        };
      }));
      res.json(enriched);
    } catch (error) {
      console.error("Error fetching hospital responses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/emergency-requests/:id/profile", async (req, res) => {
    try {
      const request = await storage.getEmergencyRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Emergency request not found" });
      }
      const profileData = {
        id: request.id,
        symptom: request.symptom,
        manualLocation: request.manualLocation,
        contactName: request.contactName,
        contactPhone: request.contactPhone,
        petSpecies: request.petSpecies,
        petBreed: request.petBreed,
        petAge: request.petAge,
        status: request.status,
        createdAt: request.createdAt,
        medicalSharingEnabled: false
      };
      if (request.petId) {
        const pet = await storage.getPet(request.petId);
        if (pet) {
          profileData.pet = {
            id: pet.id,
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            age: pet.age,
            weight: pet.weight,
            medicalNotes: pet.medicalNotes,
            medicalHistory: pet.medicalHistory,
            color: pet.color,
            microchipId: pet.microchipId
          };
          const consents = await storage.getMedicalSharingConsentsByPetId(request.petId);
          const emergencyConsent = consents.find((c) => c.consentType === "emergency_broadcast" && c.enabled);
          if (emergencyConsent) {
            profileData.medicalSharingEnabled = true;
            const records = await storage.getMedicalRecordsByPetId(request.petId);
            if (records && records.length > 0) {
              profileData.medicalRecords = records.map((r) => ({
                id: r.id,
                title: r.title,
                documentType: r.documentType,
                description: r.description,
                fileUrl: r.filePath,
                // filePath contains the object storage URL
                uploadedAt: r.uploadedAt
              }));
            }
          }
        }
      }
      res.json(profileData);
    } catch (error) {
      console.error("Error fetching emergency profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/users/:userId/emergency-requests", isAuthenticated, async (req, res) => {
    try {
      const requestingUserId = req.user.id;
      const targetUserId = req.params.userId;
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (requestingUserId !== targetUserId && requestingUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - You can only view your own emergency requests" });
      }
      const requests = await storage.getEmergencyRequestsByUserId(targetUserId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/clinics/:clinicId/emergency-requests", isAuthenticated, async (req, res) => {
    console.warn("[DEPRECATED] GET /api/clinics/:clinicId/emergency-requests called - use /api/hospitals/:hospitalId/emergency-requests instead");
    res.status(410).json({
      message: "This endpoint is deprecated. Please use /api/hospitals/:hospitalId/emergency-requests instead.",
      deprecated: true
    });
  });
  app2.patch("/api/emergency-requests/:id", async (req, res) => {
    try {
      const request = await storage.getEmergencyRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Emergency request not found" });
      }
      if (req.user) {
        const requestingUserId = req.user.id;
        const requestingUser = await storage.getUser(requestingUserId);
        if (!requestingUser) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const isOwner = request.userId === requestingUserId;
        const isAdmin2 = requestingUser.role === "admin";
        const isAnonymousRequest = !request.userId;
        if (!isOwner && !isAdmin2 && !isAnonymousRequest) {
          return res.status(403).json({ message: "Forbidden - You can only update your own emergency requests" });
        }
      } else {
        if (request.userId) {
          return res.status(403).json({ message: "Forbidden - This emergency belongs to a registered user" });
        }
      }
      const updateData = insertEmergencyRequestSchema.partial().parse(req.body);
      const updatedRequest = await storage.updateEmergencyRequest(req.params.id, updateData);
      await storage.createAuditLog({
        entityType: "emergency_request",
        entityId: request.id,
        action: "update",
        userId: req.user ? req.user.id : null,
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(updatedRequest);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/emergency-requests/:id/broadcast", broadcastLimiter, async (req, res) => {
    try {
      const { clinicIds, message } = z2.object({
        clinicIds: z2.array(z2.string()),
        message: z2.string()
      }).parse(req.body);
      const emergencyRequest = await storage.getEmergencyRequest(req.params.id);
      if (!emergencyRequest) {
        return res.status(404).json({ message: "Emergency request not found" });
      }
      if (emergencyRequest.userId) {
        if (req.user) {
          const requestingUserId = req.user.id;
          const requestingUser = await storage.getUser(requestingUserId);
          if (!requestingUser) {
            return res.status(401).json({ message: "Unauthorized" });
          }
          if (emergencyRequest.userId !== requestingUserId && requestingUser.role !== "admin") {
            return res.status(403).json({ message: "Forbidden - You can only broadcast your own emergency requests" });
          }
        } else {
          return res.status(403).json({ message: "Forbidden - This emergency belongs to a registered user" });
        }
      }
      const messages2 = await messagingService.broadcastEmergency(
        req.params.id,
        clinicIds,
        message
      );
      res.status(201).json({ messages: messages2, count: messages2.length });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  const aiAnalysisLimiter = rateLimit2({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 20,
    // Stricter limit for AI analysis
    message: JSON.stringify({
      message: "Too many AI analysis requests. Please try again later.",
      fallbackAvailable: true
    }),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        message: "Too many AI analysis requests. Please try again later.",
        fallbackAvailable: true
      });
    }
  });
  app2.post("/api/voice/analyze", aiAnalysisLimiter, async (req, res) => {
    try {
      const { transcript, language } = z2.object({
        transcript: z2.string().min(1, "Transcript cannot be empty").max(1e4, "Transcript too long"),
        language: z2.enum(["en", "zh", "zh-HK", "zh-CN"]).optional().default("en")
      }).parse(req.body);
      if (!deepseekService.isAvailable()) {
        return res.status(503).json({
          message: "DeepSeek AI service not configured. Please set DEEPSEEK_API_KEY environment variable.",
          fallbackAvailable: true
        });
      }
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Analysis timeout")), 1e4)
      );
      const analysis = await Promise.race([
        deepseekService.analyzeVoiceTranscript(transcript, language),
        timeoutPromise
      ]);
      res.json({
        success: true,
        analysis,
        formattedMessage: deepseekService.formatForBroadcast(analysis, transcript)
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
          fallbackAvailable: true
        });
      }
      if (error instanceof Error && error.message === "Analysis timeout") {
        console.error("DeepSeek analysis timeout");
        return res.status(504).json({
          message: "AI analysis timeout. Please try again.",
          error: "Timeout",
          fallbackAvailable: true
        });
      }
      console.error("DeepSeek analysis error:", error);
      res.status(500).json({
        message: "AI analysis failed",
        error: error instanceof Error ? error.message : "Unknown error",
        fallbackAvailable: true
      });
    }
  });
  app2.post("/api/messages", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/emergency-requests/:id/messages", async (req, res) => {
    const messages2 = await storage.getMessagesByEmergencyRequest(req.params.id);
    res.json(messages2);
  });
  app2.patch("/api/messages/:id", async (req, res) => {
    try {
      const updateData = insertMessageSchema.partial().parse(req.body);
      const message = await storage.updateMessage(req.params.id, updateData);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/messages/queued", async (req, res) => {
    const messages2 = await storage.getQueuedMessages();
    res.json(messages2);
  });
  app2.get("/api/admin/messages", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 100, 500);
      const allMessages = await storage.getAllMessages(limit);
      const messagesWithDetails = await Promise.all(
        allMessages.map(async (msg) => {
          const hospital = msg.hospitalId ? await storage.getHospital(msg.hospitalId) : null;
          const emergencyRequest = msg.emergencyRequestId ? await storage.getEmergencyRequest(msg.emergencyRequestId) : null;
          return {
            ...msg,
            hospitalName: hospital?.nameEn || hospital?.nameZh || "Unknown Hospital",
            emergencyRequestStatus: emergencyRequest?.status || "unknown",
            petInfo: emergencyRequest?.pet ? {
              name: emergencyRequest.pet.name,
              species: emergencyRequest.pet.species,
              breed: emergencyRequest.pet.breed
            } : null
          };
        })
      );
      res.json(messagesWithDetails);
    } catch (error) {
      console.error("Error fetching all messages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/messages/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allMessages = await storage.getAllMessages(1e3);
      const stats = {
        total: allMessages.length,
        queued: allMessages.filter((m) => m.status === "queued").length,
        sent: allMessages.filter((m) => m.status === "sent").length,
        delivered: allMessages.filter((m) => m.status === "delivered").length,
        read: allMessages.filter((m) => m.readAt !== null).length,
        failed: allMessages.filter((m) => m.status === "failed").length,
        byType: {
          whatsapp: allMessages.filter((m) => m.messageType === "whatsapp").length,
          email: allMessages.filter((m) => m.messageType === "email").length,
          line: allMessages.filter((m) => m.messageType === "line").length
        }
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching message stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/messages/:id/retry", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const messageId = req.params.id;
      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      await storage.updateMessage(messageId, {
        status: "queued",
        retryCount: 0,
        failedAt: null,
        errorMessage: null
      });
      await messagingService.processMessage(messageId);
      const updatedMessage = await storage.getMessage(messageId);
      await storage.createAuditLog({
        entityType: "message",
        entityId: messageId,
        action: "retry",
        userId: req.user.id,
        changes: { previousStatus: message.status },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(updatedMessage);
    } catch (error) {
      console.error("Error retrying message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/messages/resend", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { emergencyRequestId, hospitalId } = req.body;
      if (!emergencyRequestId || !hospitalId) {
        return res.status(400).json({ message: "emergencyRequestId and hospitalId are required" });
      }
      const hospital = await storage.getHospital(hospitalId);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      const emergencyRequest = await storage.getEmergencyRequest(emergencyRequestId);
      if (!emergencyRequest) {
        return res.status(404).json({ message: "Emergency request not found" });
      }
      const hospitalName = hospital.nameEn || hospital.nameZh || "Unknown Hospital";
      const resendMessage = `[RESEND] Emergency alert for ${emergencyRequest.petSpecies || "pet"} - ${emergencyRequest.symptom || "Emergency"}`;
      const result = await messagingService.broadcastEmergency(emergencyRequestId, [hospitalId], resendMessage);
      await storage.createAuditLog({
        entityType: "message",
        entityId: emergencyRequestId,
        action: "resend",
        userId: req.user.id,
        changes: { hospitalId, hospitalName },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({
        success: true,
        message: `Message resent to ${hospitalName}`,
        result
      });
    } catch (error) {
      console.error("Error resending message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/feature-flags", isAuthenticated, isAdmin, async (req, res) => {
    const flags = await storage.getAllFeatureFlags();
    res.json(flags);
  });
  app2.get("/api/feature-flags/:key", isAuthenticated, isAdmin, async (req, res) => {
    const flag = await storage.getFeatureFlag(req.params.key);
    if (!flag) {
      return res.status(404).json({ message: "Feature flag not found" });
    }
    res.json(flag);
  });
  app2.post("/api/feature-flags", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const flagData = insertFeatureFlagSchema.parse(req.body);
      const flag = await storage.createFeatureFlag(flagData);
      await storage.createAuditLog({
        entityType: "feature_flag",
        entityId: flag.id,
        action: "create",
        userId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(flag);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/feature-flags/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const updateData = insertFeatureFlagSchema.partial().parse(req.body);
      const flag = await storage.updateFeatureFlag(req.params.id, updateData);
      if (!flag) {
        return res.status(404).json({ message: "Feature flag not found" });
      }
      await storage.createAuditLog({
        entityType: "feature_flag",
        entityId: flag.id,
        action: "update",
        userId: req.user.id,
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(flag);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/translations/:language", async (req, res) => {
    try {
      const translations2 = await storage.getTranslationsByLanguage(req.params.language);
      res.json(translations2);
    } catch (error) {
      res.status(500).json({ message: "Translation service unavailable", translations: [] });
    }
  });
  app2.post("/api/translations", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const translationData2 = insertTranslationSchema.parse(req.body);
      const existing = await storage.getTranslation(translationData2.key, "en");
      let translation;
      if (existing) {
        translation = await storage.updateTranslation(existing.id, translationData2);
      } else {
        translation = await storage.createTranslation(translationData2);
      }
      res.json(translation);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/users/:userId/consents", isAuthenticated, async (req, res) => {
    try {
      const requestingUserId = req.user.id;
      const targetUserId = req.params.userId;
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (requestingUserId !== targetUserId && requestingUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - You can only view your own consents" });
      }
      const consents = await storage.getPrivacyConsents(targetUserId);
      res.json(consents);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/privacy-consents", isAuthenticated, async (req, res) => {
    try {
      const requestingUserId = req.user.id;
      const consentData = insertPrivacyConsentSchema.parse(req.body);
      if (consentData.userId !== requestingUserId) {
        return res.status(403).json({ message: "Forbidden - You can only create consents for yourself" });
      }
      const consent = await storage.createPrivacyConsent(consentData);
      await storage.createAuditLog({
        entityType: "privacy_consent",
        entityId: consent.id,
        action: "create",
        userId: requestingUserId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(consent);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/audit-logs/:entityType/:entityId", isAuthenticated, isAdmin, async (req, res) => {
    const logs = await storage.getAuditLogsByEntity(req.params.entityType, req.params.entityId);
    res.json(logs);
  });
  app2.post("/api/admin/test-whatsapp", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { phoneNumber, message } = z2.object({
        phoneNumber: z2.string().min(8, "Phone number required"),
        message: z2.string().optional().default("Test message from PetSOS")
      }).parse(req.body);
      const WHATSAPP_ACCESS_TOKEN4 = process.env.WHATSAPP_ACCESS_TOKEN;
      const WHATSAPP_PHONE_NUMBER_ID4 = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const WHATSAPP_API_URL4 = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v21.0";
      console.log("[WhatsApp Test] DEBUG - Checking credentials...");
      console.log("[WhatsApp Test] Has Access Token:", !!WHATSAPP_ACCESS_TOKEN4);
      console.log("[WhatsApp Test] Has Phone Number ID:", !!WHATSAPP_PHONE_NUMBER_ID4);
      console.log("[WhatsApp Test] Token length:", WHATSAPP_ACCESS_TOKEN4?.length || 0);
      console.log("[WhatsApp Test] Phone ID:", WHATSAPP_PHONE_NUMBER_ID4 || "NOT SET");
      console.log("[WhatsApp Test] All env keys with WHATSAPP:", Object.keys(process.env).filter((k) => k.includes("WHATSAPP")));
      if (!WHATSAPP_ACCESS_TOKEN4 || !WHATSAPP_PHONE_NUMBER_ID4) {
        console.error("[WhatsApp Test] ERROR - Credentials missing!");
        return res.status(400).json({
          success: false,
          error: "WhatsApp credentials not configured",
          details: {
            hasAccessToken: !!WHATSAPP_ACCESS_TOKEN4,
            hasPhoneNumberId: !!WHATSAPP_PHONE_NUMBER_ID4,
            apiUrl: WHATSAPP_API_URL4,
            tokenLength: WHATSAPP_ACCESS_TOKEN4?.length || 0,
            phoneNumberId: WHATSAPP_PHONE_NUMBER_ID4 || null
          }
        });
      }
      const cleanedNumber = phoneNumber.replace(/[^0-9]/g, "");
      const url = `${WHATSAPP_API_URL4}/${WHATSAPP_PHONE_NUMBER_ID4}/messages`;
      const payload = {
        messaging_product: "whatsapp",
        to: cleanedNumber,
        type: "text",
        text: { body: message }
      };
      console.log("[WhatsApp Test] Sending to:", url);
      console.log("[WhatsApp Test] Payload:", JSON.stringify(payload, null, 2));
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN4}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const responseData = await response.json();
      console.log("[WhatsApp Test] Response status:", response.status);
      console.log("[WhatsApp Test] Response data:", JSON.stringify(responseData, null, 2));
      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: "WhatsApp API returned an error",
          statusCode: response.status,
          details: responseData,
          debugInfo: {
            url,
            phoneNumber: cleanedNumber,
            hasToken: !!WHATSAPP_ACCESS_TOKEN4,
            phoneNumberId: WHATSAPP_PHONE_NUMBER_ID4
          }
        });
      }
      res.json({
        success: true,
        message: "WhatsApp test message sent successfully!",
        response: responseData,
        debugInfo: {
          phoneNumber: cleanedNumber,
          messageId: responseData.messages?.[0]?.id
        }
      });
    } catch (error) {
      console.error("[WhatsApp Test] Error:", error);
      res.status(500).json({
        success: false,
        error: "Test failed with exception",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.get("/api/admin/whatsapp-status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
      const apiUrl = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v21.0";
      const webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
      const credentialStatus = {
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0,
        hasPhoneNumberId: !!phoneNumberId,
        phoneNumberId: phoneNumberId || null,
        hasBusinessAccountId: !!businessAccountId,
        businessAccountId: businessAccountId || null,
        apiUrl,
        hasWebhookToken: !!webhookVerifyToken
      };
      if (!accessToken || !phoneNumberId) {
        return res.json({ credentialStatus, phoneInfo: null, templates: [], error: "Missing credentials" });
      }
      let phoneInfo = null;
      let tokenError = null;
      try {
        const phoneRes = await fetch(`${apiUrl}/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,platform_type,status`, {
          headers: { "Authorization": `Bearer ${accessToken}` }
        });
        const phoneData = await phoneRes.json();
        if (phoneRes.ok) {
          phoneInfo = phoneData;
        } else {
          tokenError = phoneData?.error?.message || `HTTP ${phoneRes.status}`;
          const isExpired = phoneData?.error?.code === 190;
          if (isExpired) tokenError = `TOKEN_EXPIRED: ${tokenError}`;
        }
      } catch (e) {
      }
      let templates = [];
      let templateError = null;
      if (businessAccountId && !tokenError) {
        try {
          const tplRes = await fetch(`${apiUrl}/${businessAccountId}/message_templates?limit=50&fields=name,status,language,components`, {
            headers: { "Authorization": `Bearer ${accessToken}` }
          });
          if (tplRes.ok) {
            const tplData = await tplRes.json();
            templates = tplData.data || [];
          } else {
            const errData = await tplRes.json();
            templateError = errData?.error?.message || `HTTP ${tplRes.status}`;
          }
        } catch (e) {
        }
      }
      res.json({ credentialStatus, phoneInfo, templates, tokenError, templateError });
    } catch (error) {
      res.status(500).json({ error: "Internal server error", details: String(error) });
    }
  });
  app2.post("/api/admin/test-whatsapp-template", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { phoneNumber, templateName, emergencyRequestId } = z2.object({
        phoneNumber: z2.string().min(8),
        templateName: z2.string().optional(),
        emergencyRequestId: z2.string().optional()
      }).parse(req.body);
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const apiUrl = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v21.0";
      if (!accessToken || !phoneNumberId) {
        return res.status(400).json({ success: false, error: "WhatsApp credentials not configured" });
      }
      const cleanedNumber = phoneNumber.replace(/[^0-9]/g, "");
      const tplName = templateName || "hello_world";
      const isHelloWorld = tplName === "hello_world";
      const payload = {
        messaging_product: "whatsapp",
        to: cleanedNumber,
        type: "template",
        template: {
          name: tplName,
          language: { code: tplName.endsWith("_zh_hk") ? "zh_HK" : "en" },
          ...isHelloWorld ? {} : {
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: "Cat" },
                  { type: "text", text: "Domestic Shorthair" },
                  { type: "text", text: "3 years" },
                  { type: "text", text: "Breathing difficulty" },
                  { type: "text", text: "Mong Kok, Kowloon" },
                  { type: "text", text: "PetSOS Test Owner" },
                  { type: "text", text: "85265000000" }
                ]
              }
            ]
          }
        }
      };
      const response = await fetch(`${apiUrl}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const responseData = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ success: false, error: responseData?.error?.message || "API error", details: responseData });
      }
      res.json({ success: true, messageId: responseData.messages?.[0]?.id, response: responseData });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  app2.get("/api/admin/failed-messages", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const query = await db.select().from(messages).where(eq3(messages.status, "failed")).limit(100);
      res.json({
        total: query.length,
        messages: query.map((m) => ({
          id: m.id,
          emergencyRequestId: m.emergencyRequestId,
          recipient: m.recipient,
          messageType: m.messageType,
          status: m.status,
          error: m.errorMessage,
          retryCount: m.retryCount,
          createdAt: m.createdAt,
          failedAt: m.failedAt,
          content: m.content?.substring(0, 100) + "..." || ""
        }))
      });
    } catch (error) {
      console.error("[Failed Messages] Error:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  app2.get("/api/admin/conversations", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const includeArchived = req.query.includeArchived === "true";
      const conversations = await storage.getAllConversations(includeArchived);
      res.json(conversations);
    } catch (error) {
      console.error("[Conversations] Error fetching:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  app2.get("/api/admin/conversations/unread-count", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const conversations = await storage.getAllConversations(false);
      const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      const unreadConversations = conversations.filter((c) => (c.unreadCount || 0) > 0).length;
      res.json({ unreadCount, unreadConversations });
    } catch (error) {
      console.error("[Conversations] Error getting unread count:", error);
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });
  app2.get("/api/admin/conversations/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("[Conversations] Error fetching:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });
  app2.get("/api/admin/conversations/:id/messages", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const messages2 = await storage.getChatMessagesByConversation(req.params.id, limit, offset);
      res.json(messages2);
    } catch (error) {
      console.error("[Conversations] Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/admin/conversations/new", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { phoneNumber, displayName, content } = z2.object({
        phoneNumber: z2.string().min(8),
        displayName: z2.string().optional(),
        content: z2.string().min(1)
      }).parse(req.body);
      const sanitizedPhone = phoneNumber.replace(/[^0-9]/g, "");
      let conversation = await storage.getConversationByPhone(sanitizedPhone);
      if (!conversation) {
        const hospital = await storage.findHospitalByPhone(sanitizedPhone);
        conversation = await storage.createConversation({
          phoneNumber: sanitizedPhone,
          hospitalId: hospital?.id || null,
          displayName: displayName || (hospital ? hospital.nameEn || hospital.nameZh : `+${sanitizedPhone}`),
          lastMessageAt: /* @__PURE__ */ new Date(),
          lastMessagePreview: content.substring(0, 100),
          unreadCount: 0,
          isArchived: false
        });
      }
      const WHATSAPP_ACCESS_TOKEN4 = process.env.WHATSAPP_ACCESS_TOKEN;
      const WHATSAPP_PHONE_NUMBER_ID4 = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const WHATSAPP_API_URL4 = "https://graph.facebook.com/v21.0";
      if (!WHATSAPP_ACCESS_TOKEN4 || !WHATSAPP_PHONE_NUMBER_ID4) {
        return res.status(500).json({ message: "WhatsApp not configured" });
      }
      const url = `${WHATSAPP_API_URL4}/${WHATSAPP_PHONE_NUMBER_ID4}/messages`;
      const payload = {
        messaging_product: "whatsapp",
        to: sanitizedPhone,
        type: "text",
        text: { body: content }
      };
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN4}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const responseData = await response.json();
      if (!response.ok) {
        console.error("[New Chat] WhatsApp API error:", responseData);
        return res.status(500).json({
          message: "Failed to send message",
          error: responseData.error?.message || "Unknown error"
        });
      }
      const whatsappMessageId = responseData.messages?.[0]?.id;
      const chatMessage = await storage.createChatMessage({
        conversationId: conversation.id,
        direction: "outbound",
        content,
        messageType: "text",
        whatsappMessageId,
        status: "sent",
        sentAt: /* @__PURE__ */ new Date()
      });
      await storage.updateConversation(conversation.id, {
        lastMessageAt: /* @__PURE__ */ new Date(),
        lastMessagePreview: content.substring(0, 100)
      });
      await storage.createAuditLog({
        entityType: "whatsapp_chat",
        entityId: chatMessage.id,
        action: "start_conversation",
        userId: req.user?.id,
        changes: { conversationId: conversation.id, phoneNumber: sanitizedPhone },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      console.log(`[New Chat] Started conversation ${conversation.id} with ${sanitizedPhone}`);
      res.json({ conversation, message: chatMessage });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("[New Chat] Error:", error);
      res.status(500).json({ message: "Failed to start conversation" });
    }
  });
  app2.post("/api/admin/conversations/:id/read", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.markConversationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("[Conversations] Error marking as read:", error);
      res.status(500).json({ message: "Failed to mark as read" });
    }
  });
  app2.post("/api/admin/conversations/:id/archive", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { archive } = z2.object({ archive: z2.boolean() }).parse(req.body);
      if (archive) {
        await storage.archiveConversation(req.params.id);
      } else {
        await storage.updateConversation(req.params.id, { isArchived: false });
      }
      res.json({ success: true, archived: archive });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("[Conversations] Error archiving:", error);
      res.status(500).json({ message: "Failed to archive conversation" });
    }
  });
  app2.post("/api/admin/conversations/:id/reply", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { content } = z2.object({ content: z2.string().min(1) }).parse(req.body);
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      const WHATSAPP_ACCESS_TOKEN4 = process.env.WHATSAPP_ACCESS_TOKEN;
      const WHATSAPP_PHONE_NUMBER_ID4 = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const WHATSAPP_API_URL4 = "https://graph.facebook.com/v21.0";
      if (!WHATSAPP_ACCESS_TOKEN4 || !WHATSAPP_PHONE_NUMBER_ID4) {
        return res.status(500).json({ message: "WhatsApp not configured" });
      }
      const url = `${WHATSAPP_API_URL4}/${WHATSAPP_PHONE_NUMBER_ID4}/messages`;
      const payload = {
        messaging_product: "whatsapp",
        to: conversation.phoneNumber,
        type: "text",
        text: { body: content }
      };
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN4}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const responseData = await response.json();
      if (!response.ok) {
        console.error("[Chat Reply] WhatsApp API error:", responseData);
        return res.status(500).json({
          message: "Failed to send message",
          error: responseData.error?.message || "Unknown error"
        });
      }
      const whatsappMessageId = responseData.messages?.[0]?.id;
      const chatMessage = await storage.createChatMessage({
        conversationId: conversation.id,
        direction: "outbound",
        content,
        messageType: "text",
        whatsappMessageId,
        status: "sent",
        sentAt: /* @__PURE__ */ new Date()
      });
      await storage.updateConversation(conversation.id, {
        lastMessageAt: /* @__PURE__ */ new Date(),
        lastMessagePreview: content.substring(0, 100)
      });
      await storage.createAuditLog({
        entityType: "whatsapp_chat",
        entityId: chatMessage.id,
        action: "send_reply",
        userId: req.user?.id,
        changes: { conversationId: conversation.id, content: content.substring(0, 50) },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      console.log(`[Chat Reply] Sent message ${chatMessage.id} to ${conversation.phoneNumber}`);
      res.json(chatMessage);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("[Chat Reply] Error:", error);
      res.status(500).json({ message: "Failed to send reply" });
    }
  });
  app2.post("/api/clinics/:id/generate-code", isAuthenticated, isAdmin, async (req, res) => {
    try {
      console.log(`[Generate Clinic Code] Starting for clinic ID: ${req.params.id}`);
      const clinic = await storage.getClinic(req.params.id);
      if (!clinic) {
        console.log(`[Generate Clinic Code] Clinic not found: ${req.params.id}`);
        return res.status(404).json({ message: "Clinic not found" });
      }
      console.log(`[Generate Clinic Code] Found clinic: ${clinic.name}`);
      const code = Math.floor(Math.random() * 9e5 + 1e5).toString();
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1e3);
      console.log(`[Generate Clinic Code] Updating clinic with code, expires at: ${expiresAt.toISOString()}`);
      const updatedClinic = await storage.updateClinic(req.params.id, {
        ownerVerificationCode: code,
        ownerVerificationCodeExpiresAt: expiresAt
      });
      if (!updatedClinic) {
        console.error(`[Generate Clinic Code] Update returned undefined for clinic: ${req.params.id}`);
        return res.status(500).json({ message: "Failed to update clinic with verification code" });
      }
      console.log(`[Generate Clinic Code] Clinic updated successfully`);
      try {
        await storage.createAuditLog({
          entityType: "clinic",
          entityId: clinic.id,
          action: "generate_code",
          ipAddress: req.ip,
          userAgent: req.get("user-agent")
        });
      } catch (auditError) {
        console.error(`[Generate Clinic Code] Audit log error (non-fatal):`, auditError);
      }
      console.log(`[Generate Clinic Code] Success - returning code for clinic: ${clinic.id}`);
      res.json({ code, clinicId: clinic.id, expiresAt: expiresAt.toISOString() });
    } catch (error) {
      console.error("[Generate Clinic Code] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to generate code", error: errorMessage });
    }
  });
  app2.post("/api/clinics/:id/verify", async (req, res) => {
    try {
      const { verificationCode } = z2.object({
        verificationCode: z2.string().length(6, "Code must be 6 digits")
      }).parse(req.body);
      const clinic = await storage.getClinic(req.params.id);
      if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
      }
      if (clinic.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }
      if (clinic.ownerVerificationCodeExpiresAt && /* @__PURE__ */ new Date() > new Date(clinic.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }
      res.json({ verified: true, clinicId: clinic.id });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/clinics/:id/update-owner", async (req, res) => {
    try {
      const { verificationCode, ...updateData } = z2.object({
        verificationCode: z2.string().length(6, "Code must be 6 digits"),
        // Basic Information
        name: z2.string().optional(),
        nameZh: z2.string().optional(),
        address: z2.string().optional(),
        addressZh: z2.string().optional(),
        phone: z2.string().optional(),
        whatsapp: z2.string().optional(),
        email: z2.string().optional(),
        regionId: z2.string().optional(),
        // Operations
        is24Hour: z2.boolean().optional(),
        isAvailable: z2.boolean().optional(),
        // Services
        services: z2.array(z2.string()).optional()
      }).parse(req.body);
      const clinic = await storage.getClinic(req.params.id);
      if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
      }
      if (clinic.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }
      if (clinic.ownerVerificationCodeExpiresAt && /* @__PURE__ */ new Date() > new Date(clinic.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }
      const updatedClinic = await storage.updateClinic(req.params.id, updateData);
      await storage.createAuditLog({
        entityType: "clinic",
        entityId: clinic.id,
        action: "update",
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(updatedClinic);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/hospitals/:id/generate-code", isAuthenticated, isAdmin, async (req, res) => {
    try {
      console.log(`[Generate Code] Starting for hospital ID: ${req.params.id}`);
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        console.log(`[Generate Code] Hospital not found: ${req.params.id}`);
        return res.status(404).json({ message: "Hospital not found" });
      }
      console.log(`[Generate Code] Found hospital: ${hospital.nameEn}`);
      const code = Math.floor(Math.random() * 9e5 + 1e5).toString();
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1e3);
      console.log(`[Generate Code] Updating hospital with code, expires at: ${expiresAt.toISOString()}`);
      const updatedHospital = await storage.updateHospital(req.params.id, {
        ownerVerificationCode: code,
        ownerVerificationCodeExpiresAt: expiresAt
      });
      if (!updatedHospital) {
        console.error(`[Generate Code] Update returned undefined for hospital: ${req.params.id}`);
        return res.status(500).json({ message: "Failed to update hospital with verification code" });
      }
      console.log(`[Generate Code] Hospital updated successfully`);
      try {
        await storage.createAuditLog({
          entityType: "hospital",
          entityId: hospital.id,
          action: "generate_code",
          ipAddress: req.ip,
          userAgent: req.get("user-agent")
        });
      } catch (auditError) {
        console.error(`[Generate Code] Audit log error (non-fatal):`, auditError);
      }
      console.log(`[Generate Code] Success - returning code for hospital: ${hospital.id}`);
      res.json({ code, hospitalId: hospital.id, expiresAt: expiresAt.toISOString() });
    } catch (error) {
      console.error("[Generate Code] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to generate code", error: errorMessage });
    }
  });
  app2.post("/api/hospitals/:id/verify", async (req, res) => {
    try {
      const { verificationCode } = z2.object({
        verificationCode: z2.string().length(6, "Code must be 6 digits")
      }).parse(req.body);
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      if (hospital.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }
      if (hospital.ownerVerificationCodeExpiresAt && /* @__PURE__ */ new Date() > new Date(hospital.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }
      res.json({ verified: true, hospitalId: hospital.id });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/hospitals/:id/update-owner", async (req, res) => {
    try {
      const { verificationCode } = z2.object({
        verificationCode: z2.string().length(6, "Code must be 6 digits")
      }).parse(req.body);
      const { insertHospitalSchema: insertHospitalSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { verificationCode: _, ...bodyWithoutCode } = req.body;
      const updateData = insertHospitalSchema2.partial().parse(bodyWithoutCode);
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      if (hospital.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }
      if (hospital.ownerVerificationCodeExpiresAt && /* @__PURE__ */ new Date() > new Date(hospital.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }
      await logHospitalChanges(
        hospital.id,
        hospital,
        updateData,
        "Hospital Owner",
        "verification_code",
        "update",
        req.ip,
        req.get("user-agent")
      );
      const updatedHospital = await storage.updateHospital(req.params.id, updateData);
      await storage.createAuditLog({
        entityType: "hospital",
        entityId: hospital.id,
        action: "update",
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json(updatedHospital);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/hospitals/:id/status", async (req, res) => {
    try {
      const { verificationCode, liveStatus } = z2.object({
        verificationCode: z2.string().length(6, "Code must be 6 digits"),
        liveStatus: z2.enum(["normal", "busy", "critical_only", "full"], {
          errorMap: () => ({ message: "Status must be one of: normal, busy, critical_only, full" })
        })
      }).parse(req.body);
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      if (hospital.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }
      if (hospital.ownerVerificationCodeExpiresAt && /* @__PURE__ */ new Date() > new Date(hospital.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }
      await storage.createHospitalChangeLog({
        hospitalId: hospital.id,
        fieldName: "liveStatus",
        oldValue: hospital.liveStatus || null,
        newValue: liveStatus,
        changedBy: "Hospital Owner",
        changeSource: "verification_code",
        changeType: "status_change",
        ipAddress: req.ip || null,
        userAgent: req.get("user-agent") || null
      });
      const updatedHospital = await storage.updateHospital(req.params.id, { liveStatus });
      await storage.createAuditLog({
        entityType: "hospital",
        entityId: hospital.id,
        action: "status_update",
        changes: { liveStatus, previousStatus: hospital.liveStatus },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({
        success: true,
        liveStatus: updatedHospital?.liveStatus,
        message: `Status updated to ${liveStatus}`
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating hospital status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/hospitals/verify-code", async (req, res) => {
    try {
      const { accessCode } = z2.object({
        accessCode: z2.string().length(8, "Access code must be 8 characters")
      }).parse(req.body);
      const hospital = await storage.getHospitalByAccessCode(accessCode.toUpperCase());
      if (!hospital) {
        return res.status(401).json({ message: "Invalid access code" });
      }
      res.json({
        id: hospital.id,
        slug: hospital.slug,
        nameEn: hospital.nameEn,
        nameZh: hospital.nameZh,
        addressEn: hospital.addressEn,
        addressZh: hospital.addressZh,
        phone: hospital.phone,
        whatsapp: hospital.whatsapp,
        email: hospital.email,
        open247: hospital.open247,
        lastConfirmedAt: hospital.lastConfirmedAt,
        confirmedByName: hospital.confirmedByName
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error verifying access code:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/hospitals/update-by-code", async (req, res) => {
    try {
      const updateSchema = z2.object({
        accessCode: z2.string().length(8, "Access code must be 8 characters"),
        phone: z2.string().optional(),
        whatsapp: z2.string().optional(),
        email: z2.string().email().optional().or(z2.literal("")),
        open247: z2.boolean().optional(),
        confirmedByName: z2.string().min(1, "Name is required")
      });
      const { accessCode, confirmedByName, ...updateData } = updateSchema.parse(req.body);
      const hospital = await storage.getHospitalByAccessCode(accessCode.toUpperCase());
      if (!hospital) {
        return res.status(401).json({ message: "Invalid access code" });
      }
      await logHospitalChanges(
        hospital.id,
        hospital,
        updateData,
        confirmedByName,
        "access_code",
        "update",
        req.ip,
        req.get("user-agent")
      );
      const updatedHospital = await storage.updateHospital(hospital.id, {
        ...updateData,
        confirmedByName,
        lastConfirmedAt: /* @__PURE__ */ new Date()
      });
      await storage.createAuditLog({
        entityType: "hospital",
        entityId: hospital.id,
        action: "self_service_update",
        changes: { ...updateData, confirmedByName },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({
        success: true,
        message: "Hospital information updated successfully",
        hospital: {
          id: updatedHospital?.id,
          nameEn: updatedHospital?.nameEn,
          nameZh: updatedHospital?.nameZh,
          lastConfirmedAt: updatedHospital?.lastConfirmedAt,
          confirmedByName: updatedHospital?.confirmedByName
        }
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating hospital by code:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/hospitals/confirm-info", async (req, res) => {
    try {
      const { accessCode, confirmedByName } = z2.object({
        accessCode: z2.string().length(8, "Access code must be 8 characters"),
        confirmedByName: z2.string().min(1, "Name is required")
      }).parse(req.body);
      const hospital = await storage.getHospitalByAccessCode(accessCode.toUpperCase());
      if (!hospital) {
        return res.status(401).json({ message: "Invalid access code" });
      }
      await storage.createHospitalChangeLog({
        hospitalId: hospital.id,
        fieldName: "confirmation",
        oldValue: hospital.lastConfirmedAt ? hospital.lastConfirmedAt.toISOString() : null,
        newValue: (/* @__PURE__ */ new Date()).toISOString(),
        changedBy: confirmedByName,
        changeSource: "access_code",
        changeType: "confirm",
        ipAddress: req.ip || null,
        userAgent: req.get("user-agent") || null
      });
      const updatedHospital = await storage.updateHospital(hospital.id, {
        confirmedByName,
        lastConfirmedAt: /* @__PURE__ */ new Date()
      });
      await storage.createAuditLog({
        entityType: "hospital",
        entityId: hospital.id,
        action: "self_service_confirm",
        changes: { confirmedByName },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({
        success: true,
        message: "Hospital information confirmed",
        hospital: {
          id: updatedHospital?.id,
          nameEn: updatedHospital?.nameEn,
          nameZh: updatedHospital?.nameZh,
          lastConfirmedAt: updatedHospital?.lastConfirmedAt,
          confirmedByName: updatedHospital?.confirmedByName
        }
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error confirming hospital info:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/hospitals/generate-access-codes", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = await storage.generateAccessCodesForAllHospitals();
      await storage.createAuditLog({
        entityType: "hospital",
        entityId: "all",
        action: "generate_access_codes",
        changes: { updated: result.updated, errors: result.errors.length },
        userId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({
        success: true,
        updated: result.updated,
        errors: result.errors
      });
    } catch (error) {
      console.error("Error generating access codes:", error);
      res.status(500).json({ message: "Failed to generate access codes" });
    }
  });
  app2.post("/api/hospitals/:id/photo-upload-url", async (req, res) => {
    try {
      const { verificationCode, contentType } = z2.object({
        verificationCode: z2.string().length(6, "Code must be 6 digits"),
        contentType: z2.string().optional()
      }).parse(req.body);
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      if (hospital.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }
      if (hospital.ownerVerificationCodeExpiresAt && /* @__PURE__ */ new Date() > new Date(hospital.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL(contentType);
      res.json({ uploadURL });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error getting hospital photo upload URL:", error);
      res.status(500).json({ error: error.message || "Failed to get upload URL" });
    }
  });
  app2.post("/api/hospitals/:id/photo", async (req, res) => {
    try {
      const { verificationCode, filePath: rawFilePath } = z2.object({
        verificationCode: z2.string().length(6, "Code must be 6 digits"),
        filePath: z2.string().min(1, "File path is required")
      }).parse(req.body);
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      if (hospital.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }
      if (hospital.ownerVerificationCodeExpiresAt && /* @__PURE__ */ new Date() > new Date(hospital.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }
      const objectStorageService = new ObjectStorageService();
      const filePath = objectStorageService.extractObjectEntityPath(rawFilePath);
      if (!filePath) {
        return res.status(400).json({
          error: "Invalid file path",
          message: "Could not extract valid file path from the uploaded file URL."
        });
      }
      try {
        await objectStorageService.trySetObjectEntityAclPolicy(filePath, {
          owner: hospital.id,
          visibility: "public"
        });
      } catch (aclError) {
        console.warn("Failed to set ACL policy for hospital photo:", aclError);
      }
      const photoUrl = objectStorageService.getObjectEntityPublicUrl(filePath);
      if (!photoUrl || typeof photoUrl !== "string") {
        return res.status(500).json({
          error: "Failed to generate photo URL",
          message: "Could not generate a valid URL for the uploaded photo."
        });
      }
      const currentPhotos = hospital.photos || [];
      const updatedPhotos = [...currentPhotos, photoUrl];
      const updatedHospital = await storage.updateHospital(req.params.id, { photos: updatedPhotos });
      await storage.createAuditLog({
        entityType: "hospital",
        entityId: hospital.id,
        action: "update",
        changes: { photos: updatedPhotos },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({ photoUrl, hospital: updatedHospital });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error adding hospital photo:", error);
      res.status(500).json({ error: error.message || "Failed to add hospital photo" });
    }
  });
  app2.delete("/api/hospitals/:id/photo", async (req, res) => {
    try {
      const { verificationCode, photoUrl } = z2.object({
        verificationCode: z2.string().length(6, "Code must be 6 digits"),
        photoUrl: z2.string().min(1, "Photo URL is required")
      }).parse(req.body);
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      if (hospital.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }
      if (hospital.ownerVerificationCodeExpiresAt && /* @__PURE__ */ new Date() > new Date(hospital.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }
      const currentPhotos = hospital.photos || [];
      const updatedPhotos = currentPhotos.filter((url) => url !== photoUrl);
      const updatedHospital = await storage.updateHospital(req.params.id, { photos: updatedPhotos });
      await storage.createAuditLog({
        entityType: "hospital",
        entityId: hospital.id,
        action: "update",
        changes: { photos: updatedPhotos },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({ hospital: updatedHospital });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error deleting hospital photo:", error);
      res.status(500).json({ error: error.message || "Failed to delete hospital photo" });
    }
  });
  app2.post("/api/admin/hospitals/:id/photo-upload-url", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      const { contentType } = req.body || {};
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL(contentType);
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting hospital photo upload URL:", error);
      res.status(500).json({ error: error.message || "Failed to get upload URL" });
    }
  });
  app2.post("/api/admin/hospitals/:id/photo", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { filePath: rawFilePath } = z2.object({
        filePath: z2.string().min(1, "File path is required")
      }).parse(req.body);
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      const objectStorageService = new ObjectStorageService();
      const filePath = objectStorageService.extractObjectEntityPath(rawFilePath);
      if (!filePath) {
        return res.status(400).json({
          error: "Invalid file path",
          message: "Could not extract valid file path from the uploaded file URL."
        });
      }
      try {
        await objectStorageService.trySetObjectEntityAclPolicy(filePath, {
          owner: hospital.id,
          visibility: "public"
        });
      } catch (aclError) {
        console.warn("Failed to set ACL policy for hospital photo:", aclError);
      }
      const photoUrl = objectStorageService.getObjectEntityPublicUrl(filePath);
      if (!photoUrl || typeof photoUrl !== "string") {
        return res.status(500).json({
          error: "Failed to generate photo URL",
          message: "Could not generate a valid URL for the uploaded photo."
        });
      }
      const currentPhotos = hospital.photos || [];
      const updatedPhotos = [...currentPhotos, photoUrl];
      const updatedHospital = await storage.updateHospital(req.params.id, { photos: updatedPhotos });
      const userId = req.user.id;
      await storage.createAuditLog({
        entityType: "hospital",
        entityId: hospital.id,
        action: "update",
        userId,
        changes: { photos: updatedPhotos },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({ photoUrl, hospital: updatedHospital });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error adding hospital photo:", error);
      res.status(500).json({ error: error.message || "Failed to add hospital photo" });
    }
  });
  app2.delete("/api/admin/hospitals/:id/photo", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { photoUrl } = z2.object({
        photoUrl: z2.string().min(1, "Photo URL is required")
      }).parse(req.body);
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      const currentPhotos = hospital.photos || [];
      const updatedPhotos = currentPhotos.filter((url) => url !== photoUrl);
      const updatedHospital = await storage.updateHospital(req.params.id, { photos: updatedPhotos });
      const userId = req.user.id;
      await storage.createAuditLog({
        entityType: "hospital",
        entityId: hospital.id,
        action: "update",
        userId,
        changes: { photos: updatedPhotos },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({ hospital: updatedHospital });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error deleting hospital photo:", error);
      res.status(500).json({ error: error.message || "Failed to delete hospital photo" });
    }
  });
  app2.get("/api/admin/hospitals/outreach-status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allHospitals = await storage.getAllHospitals();
      const outreachData = allHospitals.map((hospital) => ({
        id: hospital.id,
        slug: hospital.slug,
        nameEn: hospital.nameEn,
        nameZh: hospital.nameZh,
        phone: hospital.phone,
        whatsapp: hospital.whatsapp,
        email: hospital.email,
        verificationCode: hospital.ownerVerificationCode,
        verificationCodeExpiresAt: hospital.ownerVerificationCodeExpiresAt,
        lastConfirmedAt: hospital.lastConfirmedAt,
        confirmedByName: hospital.confirmedByName,
        inviteSentAt: hospital.inviteSentAt,
        isAvailable: hospital.isAvailable,
        status: hospital.lastConfirmedAt ? "confirmed" : "pending"
      }));
      res.json(outreachData);
    } catch (error) {
      console.error("Error fetching hospital outreach status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/hospitals/send-invite/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      let hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      const targetPhone = hospital.whatsapp || hospital.phone;
      if (!targetPhone) {
        return res.status(400).json({ message: "Hospital has no phone or WhatsApp number" });
      }
      const code = Math.floor(Math.random() * 9e5 + 1e5).toString();
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1e3);
      hospital = await storage.updateHospital(req.params.id, {
        ownerVerificationCode: code,
        ownerVerificationCodeExpiresAt: expiresAt
      }) || hospital;
      const hospitalName = hospital.nameEn || hospital.nameZh || "Hospital";
      const editLink = `https://petsos.site/hospital/edit/${hospital.slug}`;
      const message = `\u{1F3E5} PetSOS Hospital Information Update

Dear ${hospitalName},

We are launching PetSOS, a non-profit pet emergency platform connecting pet owners with 24-hour veterinary clinics in Hong Kong.

Your clinic is listed on our platform. Please verify your information:

\u{1F449} ${editLink}
\u{1F4CB} Verification Code: ${code}

This code expires in 72 hours.

Thank you,
PetSOS Team

---

\u{1F3E5} PetSOS \u91AB\u9662\u8CC7\u6599\u66F4\u65B0

${hospital.nameZh || hospitalName} \u60A8\u597D\uFF0C

\u6211\u5011\u6B63\u63A8\u51FA PetSOS\uFF0C\u4E00\u500B\u9023\u7D50\u5BF5\u7269\u4E3B\u4EBA\u8207\u9999\u6E2F24\u5C0F\u6642\u7378\u91AB\u8A3A\u6240\u7684\u975E\u71DF\u5229\u5BF5\u7269\u6025\u75C7\u5E73\u53F0\u3002

\u60A8\u7684\u8A3A\u6240\u5DF2\u5217\u65BC\u6211\u5011\u5E73\u53F0\u3002\u8ACB\u9A57\u8B49\u60A8\u7684\u8CC7\u6599\uFF1A

\u{1F449} ${editLink}
\u{1F4CB} \u9A57\u8B49\u78BC\uFF1A${code}

\u6B64\u9A57\u8B49\u78BC\u5C07\u65BC72\u5C0F\u6642\u5F8C\u5931\u6548\u3002

\u8B1D\u8B1D\uFF0C
PetSOS \u5718\u968A`;
      const result = await messagingService.sendDirectWhatsAppMessage(targetPhone, message);
      if (result.success) {
        await storage.updateHospital(hospital.id, { inviteSentAt: /* @__PURE__ */ new Date() });
        await storage.createAuditLog({
          entityType: "hospital",
          entityId: hospital.id,
          action: "send_invite",
          userId: req.user.id,
          changes: { inviteSentAt: (/* @__PURE__ */ new Date()).toISOString(), phone: targetPhone, codeGenerated: true },
          ipAddress: req.ip,
          userAgent: req.get("user-agent")
        });
        res.json({
          success: true,
          message: "Invitation sent successfully",
          hospital: hospital.nameEn,
          sentTo: targetPhone
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to send invitation",
          error: result.error
        });
      }
    } catch (error) {
      console.error("Error sending hospital invite:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/hospitals/send-all-invites", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allHospitals = await storage.getAllHospitals();
      const pendingHospitals = allHospitals.filter(
        (h) => !h.lastConfirmedAt && (h.whatsapp || h.phone)
      );
      if (pendingHospitals.length === 0) {
        return res.json({
          success: true,
          message: "No pending hospitals to invite",
          sent: 0,
          failed: 0
        });
      }
      const results = {
        sent: 0,
        failed: 0,
        details: []
      };
      for (let hospital of pendingHospitals) {
        const targetPhone = hospital.whatsapp || hospital.phone;
        const hospitalName = hospital.nameEn || hospital.nameZh || "Hospital";
        try {
          const code = Math.floor(Math.random() * 9e5 + 1e5).toString();
          const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1e3);
          hospital = await storage.updateHospital(hospital.id, {
            ownerVerificationCode: code,
            ownerVerificationCodeExpiresAt: expiresAt
          }) || hospital;
          const editLink = `https://petsos.site/hospital/edit/${hospital.slug}`;
          const message = `\u{1F3E5} PetSOS Hospital Information Update

Dear ${hospitalName},

We are launching PetSOS, a non-profit pet emergency platform connecting pet owners with 24-hour veterinary clinics in Hong Kong.

Your clinic is listed on our platform. Please verify your information:

\u{1F449} ${editLink}
\u{1F4CB} Verification Code: ${code}

This code expires in 72 hours.

Thank you,
PetSOS Team

---

\u{1F3E5} PetSOS \u91AB\u9662\u8CC7\u6599\u66F4\u65B0

${hospital.nameZh || hospitalName} \u60A8\u597D\uFF0C

\u6211\u5011\u6B63\u63A8\u51FA PetSOS\uFF0C\u4E00\u500B\u9023\u7D50\u5BF5\u7269\u4E3B\u4EBA\u8207\u9999\u6E2F24\u5C0F\u6642\u7378\u91AB\u8A3A\u6240\u7684\u975E\u71DF\u5229\u5BF5\u7269\u6025\u75C7\u5E73\u53F0\u3002

\u60A8\u7684\u8A3A\u6240\u5DF2\u5217\u65BC\u6211\u5011\u5E73\u53F0\u3002\u8ACB\u9A57\u8B49\u60A8\u7684\u8CC7\u6599\uFF1A

\u{1F449} ${editLink}
\u{1F4CB} \u9A57\u8B49\u78BC\uFF1A${code}

\u6B64\u9A57\u8B49\u78BC\u5C07\u65BC72\u5C0F\u6642\u5F8C\u5931\u6548\u3002

\u8B1D\u8B1D\uFF0C
PetSOS \u5718\u968A`;
          const result = await messagingService.sendDirectWhatsAppMessage(targetPhone, message);
          if (result.success) {
            await storage.updateHospital(hospital.id, { inviteSentAt: /* @__PURE__ */ new Date() });
            results.sent++;
            results.details.push({ hospital: hospitalName, status: "sent" });
          } else {
            results.failed++;
            results.details.push({ hospital: hospitalName, status: "failed", error: result.error });
          }
        } catch (err) {
          results.failed++;
          results.details.push({
            hospital: hospitalName,
            status: "failed",
            error: err instanceof Error ? err.message : "Unknown error"
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 1e3));
      }
      await storage.createAuditLog({
        entityType: "hospital_outreach",
        entityId: "bulk",
        action: "send_bulk_invites",
        userId: req.user.id,
        changes: { sent: results.sent, failed: results.failed },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({
        success: true,
        message: `Sent ${results.sent} invitations, ${results.failed} failed`,
        sent: results.sent,
        failed: results.failed,
        details: results.details
      });
    } catch (error) {
      console.error("Error sending bulk hospital invites:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/medical-records/storage-usage", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const usage = await storage.getUserStorageUsage(userId);
      res.json({
        usedBytes: usage.usedBytes,
        recordCount: usage.recordCount,
        maxBytes: STORAGE_QUOTA.MAX_STORAGE_PER_USER,
        maxRecords: STORAGE_QUOTA.MAX_RECORDS_PER_USER,
        maxFileSize: STORAGE_QUOTA.MAX_FILE_SIZE,
        percentUsed: Math.round(usage.usedBytes / STORAGE_QUOTA.MAX_STORAGE_PER_USER * 100)
      });
    } catch (error) {
      console.error("Error getting storage usage:", error);
      res.status(500).json({ error: error.message || "Failed to get storage usage" });
    }
  });
  app2.post("/api/medical-records/upload-url", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const usage = await storage.getUserStorageUsage(userId);
      if (usage.recordCount >= STORAGE_QUOTA.MAX_RECORDS_PER_USER) {
        return res.status(403).json({
          error: "Storage quota exceeded",
          message: `Maximum of ${STORAGE_QUOTA.MAX_RECORDS_PER_USER} medical records allowed. Please delete some records to upload more.`,
          quota: {
            usedRecords: usage.recordCount,
            maxRecords: STORAGE_QUOTA.MAX_RECORDS_PER_USER
          }
        });
      }
      if (usage.usedBytes >= STORAGE_QUOTA.MAX_STORAGE_PER_USER) {
        const usedMB = Math.round(usage.usedBytes / (1024 * 1024));
        const maxMB = Math.round(STORAGE_QUOTA.MAX_STORAGE_PER_USER / (1024 * 1024));
        return res.status(403).json({
          error: "Storage quota exceeded",
          message: `Storage limit of ${maxMB}MB reached (${usedMB}MB used). Please delete some records to upload more.`,
          quota: {
            usedBytes: usage.usedBytes,
            maxBytes: STORAGE_QUOTA.MAX_STORAGE_PER_USER
          }
        });
      }
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({
        uploadURL,
        quota: {
          usedBytes: usage.usedBytes,
          usedRecords: usage.recordCount,
          maxBytes: STORAGE_QUOTA.MAX_STORAGE_PER_USER,
          maxRecords: STORAGE_QUOTA.MAX_RECORDS_PER_USER,
          maxFileSize: STORAGE_QUOTA.MAX_FILE_SIZE
        }
      });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: error.message || "Failed to get upload URL" });
    }
  });
  app2.post("/api/medical-records", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const fileSize = req.body.fileSize || 0;
      if (fileSize > STORAGE_QUOTA.MAX_FILE_SIZE) {
        const maxSizeMB = Math.round(STORAGE_QUOTA.MAX_FILE_SIZE / (1024 * 1024));
        return res.status(403).json({
          error: "File too large",
          message: `Maximum file size is ${maxSizeMB}MB.`
        });
      }
      const usage = await storage.getUserStorageUsage(userId);
      if (usage.recordCount >= STORAGE_QUOTA.MAX_RECORDS_PER_USER) {
        return res.status(403).json({
          error: "Storage quota exceeded",
          message: `Maximum of ${STORAGE_QUOTA.MAX_RECORDS_PER_USER} medical records allowed.`
        });
      }
      if (usage.usedBytes + fileSize > STORAGE_QUOTA.MAX_STORAGE_PER_USER) {
        const maxMB = Math.round(STORAGE_QUOTA.MAX_STORAGE_PER_USER / (1024 * 1024));
        return res.status(403).json({
          error: "Storage quota exceeded",
          message: `This upload would exceed your storage limit of ${maxMB}MB.`
        });
      }
      const objectStorageService = new ObjectStorageService();
      const filePath = objectStorageService.normalizeObjectEntityPath(req.body.filePath);
      await objectStorageService.trySetObjectEntityAclPolicy(filePath, {
        owner: userId,
        visibility: "private"
      });
      const recordData = {
        ...req.body,
        filePath,
        userId
      };
      const result = insertPetMedicalRecordSchema.safeParse(recordData);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid record data", details: result.error.errors });
      }
      const record = await storage.createMedicalRecord(result.data);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating medical record:", error);
      res.status(500).json({ error: error.message || "Failed to create medical record" });
    }
  });
  app2.get("/api/pets/:petId/medical-records", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { petId } = req.params;
      const pet = await storage.getPet(petId);
      if (!pet || pet.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const records = await storage.getMedicalRecordsByPetId(petId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching medical records:", error);
      res.status(500).json({ error: error.message || "Failed to fetch medical records" });
    }
  });
  app2.delete("/api/medical-records/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const record = await storage.getMedicalRecord(id);
      if (!record) {
        return res.status(404).json({ error: "Record not found" });
      }
      if (record.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      await storage.deleteMedicalRecord(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting medical record:", error);
      res.status(500).json({ error: error.message || "Failed to delete medical record" });
    }
  });
  app2.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId,
        requestedPermission: "read" /* READ */
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });
  app2.get("/api/pets/:petId/medical-consents", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { petId } = req.params;
      const pet = await storage.getPet(petId);
      if (!pet || pet.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const consents = await storage.getMedicalSharingConsentsByPetId(petId);
      res.json(consents);
    } catch (error) {
      console.error("Error fetching medical consents:", error);
      res.status(500).json({ error: error.message || "Failed to fetch consents" });
    }
  });
  app2.put("/api/pets/:petId/medical-consents", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { petId } = req.params;
      const pet = await storage.getPet(petId);
      if (!pet || pet.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const consentData = {
        petId,
        userId,
        consentType: req.body.consentType,
        enabled: req.body.enabled
      };
      const result = insertPetMedicalSharingConsentSchema.safeParse(consentData);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid consent data", details: result.error.errors });
      }
      const consent = await storage.upsertMedicalSharingConsent(result.data);
      await storage.createAuditLog({
        entityType: "pet_medical_consent",
        entityId: petId,
        action: "update",
        userId,
        changes: { consentType: req.body.consentType, enabled: req.body.enabled }
      });
      res.json(consent);
    } catch (error) {
      console.error("Error updating medical consent:", error);
      res.status(500).json({ error: error.message || "Failed to update consent" });
    }
  });
  app2.post("/api/push/subscribe", generalLimiter, async (req, res) => {
    try {
      const subscriptionData = insertPushSubscriptionSchema.safeParse(req.body);
      if (!subscriptionData.success) {
        return res.status(400).json({
          error: "Invalid subscription data",
          details: subscriptionData.error.errors
        });
      }
      const subscription = await storage.createPushSubscription(subscriptionData.data);
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error creating push subscription:", error);
      res.status(500).json({ error: error.message || "Failed to create subscription" });
    }
  });
  app2.delete("/api/push/unsubscribe", generalLimiter, async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "token is required" });
      }
      const success = await storage.deactivatePushSubscription(token);
      if (success) {
        res.json({ success: true, message: "Subscription deactivated" });
      } else {
        res.status(404).json({ error: "Subscription not found" });
      }
    } catch (error) {
      console.error("Error deactivating push subscription:", error);
      res.status(500).json({ error: error.message || "Failed to deactivate subscription" });
    }
  });
  app2.post("/api/push/register-native", generalLimiter, async (req, res) => {
    try {
      const nativeTokenSchema = z2.object({
        token: z2.string().min(1, "Token is required"),
        platform: z2.enum(["ios", "android", "web"]),
        deviceInfo: z2.object({
          platform: z2.string().optional(),
          isNative: z2.boolean().optional(),
          model: z2.string().optional(),
          osVersion: z2.string().optional(),
          appVersion: z2.string().optional()
        }).passthrough().optional()
      });
      const validationResult = nativeTokenSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.errors
        });
      }
      const { token, platform, deviceInfo } = validationResult.data;
      const userId = req.user?.id || null;
      const provider = platform === "ios" ? "apns" : "fcm";
      const existingSubscription = await storage.getPushSubscriptionByToken(token);
      if (existingSubscription) {
        const updated = await storage.updatePushSubscription(existingSubscription.id, {
          userId: userId || existingSubscription.userId,
          platform,
          provider,
          browserInfo: deviceInfo ? JSON.stringify(deviceInfo) : existingSubscription.browserInfo,
          isActive: true
        });
        console.log(`[Push Native] Updated existing subscription for token: ${token.substring(0, 20)}...`);
        return res.json({
          success: true,
          message: "Push token updated",
          subscriptionId: updated?.id || existingSubscription.id,
          isNew: false
        });
      }
      const subscription = await storage.createPushSubscription({
        userId,
        token,
        provider,
        platform,
        browserInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
        language: req.user?.language || "en",
        isActive: true
      });
      console.log(`[Push Native] Created new subscription for platform: ${platform}, token: ${token.substring(0, 20)}...`);
      res.status(201).json({
        success: true,
        message: "Push token registered",
        subscriptionId: subscription.id,
        isNew: true
      });
    } catch (error) {
      console.error("Error registering native push token:", error);
      res.status(500).json({ error: error.message || "Failed to register push token" });
    }
  });
  app2.post("/api/admin/notifications/broadcast", broadcastLimiter, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const broadcastSchema = z2.object({
        title: z2.string().min(1).max(100),
        message: z2.string().min(1).max(500),
        targetLanguage: z2.enum(["en", "zh-HK"]).nullable().optional(),
        targetRole: z2.enum(["pet_owner", "hospital_clinic"]).nullable().optional(),
        url: z2.string().url().optional().or(z2.literal("")),
        scheduledFor: z2.string().datetime().nullable().optional()
      });
      const validationResult = broadcastSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid broadcast data",
          details: validationResult.error.errors
        });
      }
      const { title, message, targetLanguage, targetRole, url, scheduledFor } = validationResult.data;
      const userId = req.user.id;
      if (scheduledFor) {
        const scheduledDate = new Date(scheduledFor);
        if (scheduledDate <= /* @__PURE__ */ new Date()) {
          return res.status(400).json({
            error: "Scheduled time must be in the future"
          });
        }
        const broadcast2 = await storage.createNotificationBroadcast({
          title,
          message,
          targetLanguage: targetLanguage || null,
          targetRole: targetRole || null,
          url: url || null,
          adminId: userId,
          status: "scheduled",
          scheduledFor: scheduledDate
        });
        await storage.createAuditLog({
          entityType: "notification_broadcast",
          entityId: broadcast2.id,
          action: "schedule",
          userId,
          changes: {
            title,
            message,
            scheduledFor,
            targetLanguage: targetLanguage || "all"
          },
          ipAddress: req.ip,
          userAgent: req.get("user-agent")
        });
        return res.status(201).json({
          success: true,
          broadcastId: broadcast2.id,
          scheduled: true,
          scheduledFor: scheduledDate.toISOString(),
          message: "Notification scheduled successfully"
        });
      }
      const broadcast = await storage.createNotificationBroadcast({
        title,
        message,
        targetLanguage: targetLanguage || null,
        targetRole: targetRole || null,
        url: url || null,
        adminId: userId,
        status: "pending"
      });
      const tokens = await storage.getActiveTokens(targetLanguage || void 0, targetRole || void 0);
      if (tokens.length === 0) {
        await storage.updateNotificationBroadcast(broadcast.id, {
          status: "sent",
          recipientCount: 0,
          providerResponse: {
            message: "No active subscriptions found",
            url: url || null
          },
          sentAt: /* @__PURE__ */ new Date()
        });
        return res.status(200).json({
          success: true,
          broadcastId: broadcast.id,
          recipientCount: 0,
          message: "No active subscriptions to notify"
        });
      }
      const result = await sendBroadcastNotification(tokens, {
        title,
        message,
        url: url || void 0
      });
      if (result.failedTokens && result.failedTokens.length > 0) {
        await storage.deactivatePushSubscriptions(result.failedTokens);
      }
      await storage.updateNotificationBroadcast(broadcast.id, {
        status: result.success ? "sent" : "failed",
        recipientCount: result.successCount || 0,
        providerResponse: {
          successCount: result.successCount || 0,
          failureCount: result.failureCount || 0,
          url: url || null,
          error: result.error || null
        },
        sentAt: result.success ? /* @__PURE__ */ new Date() : null
      });
      await storage.createAuditLog({
        entityType: "notification_broadcast",
        entityId: broadcast.id,
        action: "send",
        userId,
        changes: {
          title,
          message,
          targetLanguage: targetLanguage || "all",
          recipientCount: result.successCount || 0,
          success: result.success
        }
      });
      if (!result.success) {
        return res.status(500).json({
          error: "Failed to send notification",
          broadcastId: broadcast.id,
          details: result.error
        });
      }
      res.status(201).json({
        success: true,
        broadcastId: broadcast.id,
        recipientCount: result.successCount,
        failedCount: result.failureCount
      });
    } catch (error) {
      console.error("Error sending broadcast notification:", error);
      res.status(500).json({ error: error.message || "Failed to send broadcast" });
    }
  });
  app2.get("/api/admin/notifications", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const offset = (page - 1) * limit;
      const { broadcasts, total } = await storage.getAllNotificationBroadcasts(limit, offset);
      res.json({
        broadcasts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: error.message || "Failed to fetch notifications" });
    }
  });
  app2.delete("/api/admin/notifications/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const broadcast = await storage.getNotificationBroadcast(id);
      if (!broadcast) {
        return res.status(404).json({ error: "Notification not found" });
      }
      if (broadcast.status !== "scheduled") {
        return res.status(400).json({
          error: "Only scheduled notifications can be cancelled",
          currentStatus: broadcast.status
        });
      }
      const updated = await storage.updateNotificationBroadcastStatus(id, "cancelled");
      await storage.createAuditLog({
        entityType: "notification_broadcast",
        entityId: id,
        action: "cancel",
        userId,
        changes: {
          previousStatus: "scheduled",
          newStatus: "cancelled"
        },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.json({
        success: true,
        message: "Notification cancelled successfully",
        broadcast: updated
      });
    } catch (error) {
      console.error("Error cancelling notification:", error);
      res.status(500).json({ error: error.message || "Failed to cancel notification" });
    }
  });
  app2.post("/api/admin/send-launch-notification", broadcastLimiter, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.user.id;
      const titleEn = "\u{1F680} PetSOS is Now Live!";
      const titleZh = "\u{1F680} PetSOS \u6B63\u5F0F\u555F\u52D5\uFF01";
      const messageEn = `Dear Pet Owner,

PetSOS is now ready to help you find 24-hour veterinary care for your pet in Hong Kong.

\u2705 Find nearby 24-hour clinics
\u2705 One-tap emergency broadcast
\u2705 Real-time typhoon alerts

Visit https://petsos.site now!`;
      const messageZh = `\u89AA\u611B\u7684\u5BF5\u7269\u4E3B\u4EBA\uFF0C

PetSOS \u73FE\u5DF2\u6E96\u5099\u597D\u5E6B\u52A9\u60A8\u5728\u9999\u6E2F\u5C0B\u627E 24 \u5C0F\u6642\u7378\u91AB\u670D\u52D9\u3002

\u2705 \u641C\u5C0B\u9644\u8FD1 24 \u5C0F\u6642\u8A3A\u6240
\u2705 \u4E00\u9375\u7DCA\u6025\u5EE3\u64AD
\u2705 \u5373\u6642\u98B1\u98A8\u8B66\u5831

\u7ACB\u5373\u700F\u89BD https://petsos.site\uFF01`;
      const combinedMessage = `${messageEn}

---

${messageZh}`;
      const combinedTitle = `${titleEn} / ${titleZh}`;
      const broadcast = await storage.createNotificationBroadcast({
        title: combinedTitle,
        message: combinedMessage,
        targetLanguage: null,
        targetRole: "pet_owner",
        url: "https://petsos.site",
        adminId: userId,
        status: "pending"
      });
      const results = {
        pushSuccessCount: 0,
        pushFailureCount: 0,
        emailSuccessCount: 0,
        emailFailureCount: 0,
        totalPetOwners: 0
      };
      const pushTokens = await storage.getPetOwnerPushTokens();
      console.log(`[Launch Notification] Found ${pushTokens.length} pet owners with push tokens`);
      if (pushTokens.length > 0) {
        const pushResult = await sendBroadcastNotification(pushTokens, {
          title: titleEn,
          message: `${messageEn.substring(0, 150)}...`,
          url: "https://petsos.site"
        });
        results.pushSuccessCount = pushResult.successCount || 0;
        results.pushFailureCount = pushResult.failureCount || 0;
        if (pushResult.failedTokens && pushResult.failedTokens.length > 0) {
          await storage.deactivatePushSubscriptions(pushResult.failedTokens);
        }
        console.log(`[Launch Notification] Push: ${results.pushSuccessCount} success, ${results.pushFailureCount} failed`);
      }
      const petOwnerEmails = await storage.getPetOwnerEmails();
      console.log(`[Launch Notification] Found ${petOwnerEmails.length} pet owners with emails`);
      results.totalPetOwners = petOwnerEmails.length;
      const emailSubject = `${titleEn} - ${titleZh}`;
      const emailContent = combinedMessage;
      for (const owner of petOwnerEmails) {
        try {
          const { sendGmailEmail: sendGmailEmail2 } = await Promise.resolve().then(() => (init_gmail_client(), gmail_client_exports));
          const success = await sendGmailEmail2(
            owner.email,
            emailSubject,
            emailContent,
            process.env.EMAIL_FROM || "noreply@petsos.site"
          );
          if (success) {
            results.emailSuccessCount++;
          } else {
            results.emailFailureCount++;
          }
        } catch (emailError) {
          console.error(`[Launch Notification] Email error for ${owner.email}:`, emailError);
          results.emailFailureCount++;
        }
      }
      console.log(`[Launch Notification] Email: ${results.emailSuccessCount} success, ${results.emailFailureCount} failed`);
      const totalSuccess = results.pushSuccessCount + results.emailSuccessCount;
      const totalFailure = results.pushFailureCount + results.emailFailureCount;
      await storage.updateNotificationBroadcast(broadcast.id, {
        status: totalSuccess > 0 ? "sent" : "failed",
        recipientCount: totalSuccess,
        providerResponse: {
          pushSuccessCount: results.pushSuccessCount,
          pushFailureCount: results.pushFailureCount,
          emailSuccessCount: results.emailSuccessCount,
          emailFailureCount: results.emailFailureCount,
          totalPetOwners: results.totalPetOwners,
          note: "Launch notification - Push + Email only (NO WhatsApp)"
        },
        sentAt: /* @__PURE__ */ new Date()
      });
      await storage.createAuditLog({
        entityType: "notification_broadcast",
        entityId: broadcast.id,
        action: "send_launch_notification",
        userId,
        changes: {
          type: "launch_notification",
          pushSuccessCount: results.pushSuccessCount,
          pushFailureCount: results.pushFailureCount,
          emailSuccessCount: results.emailSuccessCount,
          emailFailureCount: results.emailFailureCount,
          totalPetOwners: results.totalPetOwners
        },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });
      res.status(201).json({
        success: true,
        broadcastId: broadcast.id,
        results: {
          push: {
            success: results.pushSuccessCount,
            failed: results.pushFailureCount,
            total: pushTokens.length
          },
          email: {
            success: results.emailSuccessCount,
            failed: results.emailFailureCount,
            total: petOwnerEmails.length
          },
          totalNotified: totalSuccess
        },
        message: `Launch notification sent to ${totalSuccess} pet owners (${results.pushSuccessCount} push, ${results.emailSuccessCount} email)`
      });
    } catch (error) {
      console.error("[Launch Notification] Error:", error);
      res.status(500).json({ error: error.message || "Failed to send launch notification" });
    }
  });
  app2.get("/api/admin/notifications/history", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      const broadcasts = await storage.getRecentNotificationBroadcasts(limit);
      res.json(broadcasts);
    } catch (error) {
      console.error("Error fetching notification history:", error);
      res.status(500).json({ error: error.message || "Failed to fetch history" });
    }
  });
  app2.get("/api/admin/analytics/overview", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const overview = await storage.getAnalyticsOverview();
      res.json(overview);
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      res.status(500).json({ error: error.message || "Failed to fetch analytics overview" });
    }
  });
  app2.get("/api/admin/analytics/emergency-trends", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
      const trends = await storage.getEmergencyTrends(days);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching emergency trends:", error);
      res.status(500).json({ error: error.message || "Failed to fetch emergency trends" });
    }
  });
  app2.get("/api/admin/analytics/user-activity", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
      const activity = await storage.getUserActivityTrends(days);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ error: error.message || "Failed to fetch user activity" });
    }
  });
  app2.get("/api/config/firebase", (req, res) => {
    res.json({
      apiKey: process.env.VITE_FIREBASE_API_KEY || "",
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.VITE_FIREBASE_APP_ID || ""
    });
  });
  app2.get("/api/typhoon/status", async (req, res) => {
    try {
      const currentAlert = await storage.getActiveTyphoonAlert();
      const upcomingHoliday = await storage.getUpcomingHoliday(7);
      let hospitalStatuses = [];
      if (currentAlert || upcomingHoliday) {
        const referenceId = currentAlert?.id || upcomingHoliday?.id;
        if (referenceId) {
          hospitalStatuses = await storage.getHospitalEmergencyStatuses(referenceId);
        }
      }
      res.json({
        currentAlert,
        upcomingHoliday,
        hospitalStatuses,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error fetching typhoon status:", error);
      res.status(500).json({ error: error.message || "Failed to fetch typhoon status" });
    }
  });
  app2.post("/api/typhoon/hospital-status", isAuthenticated, async (req, res) => {
    try {
      const { hospitalId, isOpen, openingTime, closingTime, notes, statusType, referenceId } = req.body;
      const status = await storage.updateHospitalEmergencyStatus({
        hospitalId,
        statusType: statusType || "typhoon",
        referenceId,
        isOpen,
        openingTime,
        closingTime,
        confirmedBy: req.user.id,
        confirmationMethod: "self_report",
        notes,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3)
        // Expires in 24 hours
      });
      res.json({ success: true, status });
    } catch (error) {
      console.error("Error updating hospital emergency status:", error);
      res.status(500).json({ error: error.message || "Failed to update status" });
    }
  });
  app2.post("/api/typhoon/subscribe", async (req, res) => {
    try {
      const { email, phone, pushToken, subscriptionType, notifyChannels, preferredLanguage, userId } = req.body;
      const subscription = await storage.createEmergencySubscription({
        userId: userId || null,
        email,
        phone,
        pushToken,
        subscriptionType: subscriptionType || "all",
        notifyChannels: notifyChannels || ["push"],
        preferredLanguage: preferredLanguage || "en"
      });
      res.json({ success: true, subscription });
    } catch (error) {
      console.error("Error creating emergency subscription:", error);
      res.status(500).json({ error: error.message || "Failed to create subscription" });
    }
  });
  app2.get("/api/typhoon/sync", async (req, res) => {
    try {
      console.log("[Typhoon Sync] Manual sync triggered");
      const result = await checkAndUpdateTyphoonStatus();
      res.json({
        success: true,
        ...result,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error syncing typhoon status:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to sync typhoon status"
      });
    }
  });
  app2.get("/api/typhoon/hko-raw", async (req, res) => {
    try {
      const data = await fetchTyphoonWarning();
      res.json({
        success: true,
        hasActiveSignal: data !== null,
        data,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error fetching HKO data:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch HKO data"
      });
    }
  });
  app2.get("/api/holidays", async (req, res) => {
    try {
      const year = parseInt(req.query.year) || (/* @__PURE__ */ new Date()).getFullYear();
      const holidays = await storage.getHolidaysByYear(year);
      res.json(holidays);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      res.status(500).json({ error: error.message || "Failed to fetch holidays" });
    }
  });
  app2.post("/api/admin/typhoon/alert", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { signalCode, signalNameEn, signalNameZh, issuedAt, severityLevel, notes, observatoryBulletinId } = req.body;
      const alert = await storage.createTyphoonAlert({
        signalCode,
        signalNameEn,
        signalNameZh,
        issuedAt: new Date(issuedAt),
        severityLevel,
        notes,
        observatoryBulletinId,
        isActive: true
      });
      res.json({ success: true, alert });
    } catch (error) {
      console.error("Error creating typhoon alert:", error);
      res.status(500).json({ error: error.message || "Failed to create alert" });
    }
  });
  app2.post("/api/admin/typhoon/lift/:alertId", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { alertId } = req.params;
      const alert = await storage.liftTyphoonAlert(alertId);
      res.json({ success: true, alert });
    } catch (error) {
      console.error("Error lifting typhoon alert:", error);
      res.status(500).json({ error: error.message || "Failed to lift alert" });
    }
  });
  app2.get("/api/consultants", async (req, res) => {
    try {
      const consultants = await storage.getVetConsultants();
      const consultantsWithContent = await Promise.all(
        consultants.map(async (consultant) => {
          const withContent = await storage.getVetConsultantWithContent(consultant.id);
          return withContent || { ...consultant, verifiedContent: [] };
        })
      );
      res.json(consultantsWithContent);
    } catch (error) {
      console.error("Error fetching consultants:", error);
      res.status(500).json({ error: error.message || "Failed to fetch consultants" });
    }
  });
  app2.get("/api/consultants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const consultant = await storage.getVetConsultantWithContent(id);
      if (!consultant) {
        return res.status(404).json({ error: "Consultant not found" });
      }
      if (!consultant.isActive || !consultant.isPublic) {
        return res.status(404).json({ error: "Consultant not found" });
      }
      res.json(consultant);
    } catch (error) {
      console.error("Error fetching consultant:", error);
      res.status(500).json({ error: error.message || "Failed to fetch consultant" });
    }
  });
  app2.get("/api/content/:slug/verification", async (req, res) => {
    try {
      const { slug } = req.params;
      const verification = await storage.getContentVerification(slug);
      if (!verification) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json({
        contentSlug: verification.contentSlug,
        contentType: verification.contentType,
        titleEn: verification.titleEn,
        titleZh: verification.titleZh,
        isVerified: verification.verifier !== null,
        verifier: verification.verifier ? {
          id: verification.verifier.id,
          nameEn: verification.verifier.nameEn,
          nameZh: verification.verifier.nameZh,
          titleEn: verification.verifier.titleEn,
          titleZh: verification.verifier.titleZh,
          specialtyEn: verification.verifier.specialtyEn,
          specialtyZh: verification.verifier.specialtyZh,
          photoUrl: verification.verifier.photoUrl
        } : null,
        verifiedAt: verification.verifiedAt
      });
    } catch (error) {
      console.error("Error fetching content verification:", error);
      res.status(500).json({ error: error.message || "Failed to fetch verification info" });
    }
  });
  app2.post("/api/vet-applications", async (req, res) => {
    try {
      const validatedData = insertVetApplicationSchema.parse(req.body);
      const application = await storage.createVetApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating vet application:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid application data", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to create application" });
    }
  });
  app2.get("/api/admin/vet-applications", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const applications = await storage.getVetApplications(status);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching vet applications:", error);
      res.status(500).json({ error: error.message || "Failed to fetch applications" });
    }
  });
  app2.get("/api/admin/vet-applications/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const application = await storage.getVetApplicationById(id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error fetching vet application:", error);
      res.status(500).json({ error: error.message || "Failed to fetch application" });
    }
  });
  app2.patch("/api/admin/vet-applications/:id/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reviewNotes } = req.body;
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be one of: pending, approved, rejected" });
      }
      const application = await storage.updateVetApplicationStatus(
        id,
        status,
        req.user.id,
        reviewNotes
      );
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error updating vet application status:", error);
      res.status(500).json({ error: error.message || "Failed to update application status" });
    }
  });
  app2.post("/api/admin/vet-applications/:id/approve", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;
      const result = await storage.approveVetApplication(id, req.user.id, reviewNotes);
      res.json(result);
    } catch (error) {
      console.error("Error approving vet application:", error);
      res.status(500).json({ error: error.message || "Failed to approve application" });
    }
  });
  app2.post("/api/admin/vet-applications/:id/send-thank-you", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const application = await storage.getVetApplicationById(id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      const phoneNumber = application.phoneWhatsapp || application.phone;
      if (!phoneNumber) {
        return res.status(400).json({ error: "No phone number available for this applicant" });
      }
      const result = await messagingService.sendThankYouMessage(phoneNumber, application.fullName || "Valued Professional");
      res.json({
        success: true,
        message: "Thank you message sent successfully",
        messageId: result.messageId
      });
    } catch (error) {
      console.error("Error sending thank you message:", error);
      res.status(500).json({ error: error.message || "Failed to send thank you message" });
    }
  });
  app2.post("/api/admin/consultants", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertVetConsultantSchema.parse(req.body);
      const consultant = await storage.createVetConsultant(validatedData);
      res.status(201).json(consultant);
    } catch (error) {
      console.error("Error creating consultant:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid consultant data", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to create consultant" });
    }
  });
  app2.patch("/api/admin/consultants/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const consultant = await storage.updateVetConsultant(id, req.body);
      if (!consultant) {
        return res.status(404).json({ error: "Consultant not found" });
      }
      res.json(consultant);
    } catch (error) {
      console.error("Error updating consultant:", error);
      res.status(500).json({ error: error.message || "Failed to update consultant" });
    }
  });
  app2.delete("/api/admin/consultants/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteVetConsultant(id);
      if (!deleted) {
        return res.status(404).json({ error: "Consultant not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting consultant:", error);
      res.status(500).json({ error: error.message || "Failed to delete consultant" });
    }
  });
  app2.post("/api/admin/content-verifications", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertContentVerificationSchema.parse(req.body);
      const verification = await storage.createContentVerification(validatedData);
      res.status(201).json(verification);
    } catch (error) {
      console.error("Error creating content verification:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid verification data", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to create verification" });
    }
  });
  app2.delete("/api/admin/content-verifications/:consultantId/:contentId", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { consultantId, contentId } = req.params;
      const deleted = await storage.deleteContentVerification(consultantId, contentId);
      if (!deleted) {
        return res.status(404).json({ error: "Verification link not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting content verification:", error);
      res.status(500).json({ error: error.message || "Failed to delete verification" });
    }
  });
  app2.get("/api/admin/verified-content", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const contentItems = await storage.getVerifiedContentItems();
      res.json(contentItems);
    } catch (error) {
      console.error("Error fetching verified content items:", error);
      res.status(500).json({ error: error.message || "Failed to fetch verified content items" });
    }
  });
  app2.get("/api/blog/midnight-fees", async (req, res) => {
    try {
      const allHospitalsRaw = await storage.getAllHospitals();
      const allHospitals = allHospitalsRaw.filter((h) => h.open247);
      const hospitalsWithFees = allHospitals.filter((h) => h.consultFeeMidnight !== null && h.consultFeeMidnight !== void 0).sort((a, b) => (a.consultFeeMidnight || 0) - (b.consultFeeMidnight || 0));
      const regions2 = await storage.getRegionsByCountry("HK");
      const regionMap = new Map(regions2.map((r) => [r.id, r]));
      const fees = hospitalsWithFees.map((h) => h.consultFeeMidnight);
      const minFee = fees.length > 0 ? Math.min(...fees) : null;
      const maxFee = fees.length > 0 ? Math.max(...fees) : null;
      let medianFee = null;
      if (fees.length > 0) {
        const mid = Math.floor(fees.length / 2);
        if (fees.length % 2 === 0) {
          medianFee = Math.round((fees[mid - 1] + fees[mid]) / 2);
        } else {
          medianFee = fees[mid];
        }
      }
      const cheapestHospital = hospitalsWithFees[0] || null;
      const cheapestRegion = cheapestHospital ? regionMap.get(cheapestHospital.regionId) : null;
      const verifiedHospitals = hospitalsWithFees.filter((h) => h.lastVerifiedAt);
      const verificationDates = hospitalsWithFees.filter((h) => h.lastVerifiedAt).map((h) => new Date(h.lastVerifiedAt).getTime());
      const lastVerified = verificationDates.length > 0 ? new Date(Math.max(...verificationDates)).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
      const hospitalsByRegion = {};
      for (const hospital of hospitalsWithFees) {
        const region = regionMap.get(hospital.regionId);
        const regionName = region?.nameEn || "Other";
        if (!hospitalsByRegion[regionName]) {
          hospitalsByRegion[regionName] = [];
        }
        hospitalsByRegion[regionName].push(hospital);
      }
      let cheapestDistrictName = null;
      let cheapestDistrictAvg = Infinity;
      for (const [regionName, hospitals2] of Object.entries(hospitalsByRegion)) {
        const avgFee = hospitals2.reduce((sum, h) => sum + (h.consultFeeMidnight || 0), 0) / hospitals2.length;
        if (avgFee < cheapestDistrictAvg) {
          cheapestDistrictAvg = avgFee;
          cheapestDistrictName = regionName;
        }
      }
      const stats = {
        minFee,
        maxFee,
        medianFee,
        totalCount: hospitalsWithFees.length,
        verifiedCount: verifiedHospitals.length,
        lastVerified,
        cheapestHospital: cheapestHospital ? {
          nameEn: cheapestHospital.nameEn,
          nameZh: cheapestHospital.nameZh,
          fee: cheapestHospital.consultFeeMidnight,
          region: cheapestRegion?.nameEn || null,
          regionZh: cheapestRegion?.nameZh || null
        } : null,
        cheapestDistrict: cheapestDistrictName,
        depositRange: "$5,000 - $10,000"
      };
      const enrichedHospitals = hospitalsWithFees.map((h) => {
        const region = regionMap.get(h.regionId);
        return {
          id: h.id,
          slug: h.slug,
          nameEn: h.nameEn,
          nameZh: h.nameZh,
          regionId: h.regionId,
          regionNameEn: region?.nameEn || null,
          regionNameZh: region?.nameZh || null,
          consultFeeMidnight: h.consultFeeMidnight,
          consultFeeEvening: h.consultFeeEvening,
          consultFeeDay: h.consultFeeDay,
          midnightSurchargeStart: h.midnightSurchargeStart,
          eveningSurchargeStart: h.eveningSurchargeStart,
          onSiteVet247: h.onSiteVet247,
          open247: h.open247,
          openT8: h.openT8,
          openT10: h.openT10,
          verified: h.verified,
          lastVerifiedAt: h.lastVerifiedAt,
          phone: h.phone,
          whatsapp: h.whatsapp,
          depositBand: h.depositBand,
          admissionDeposit: h.admissionDeposit
        };
      });
      res.json({
        stats,
        hospitals: enrichedHospitals,
        regions: regions2.map((r) => ({ id: r.id, nameEn: r.nameEn, nameZh: r.nameZh }))
      });
    } catch (error) {
      console.error("Error fetching midnight fee blog data:", error);
      res.status(500).json({ error: error.message || "Failed to fetch blog data" });
    }
  });
  app2.get("/api/blog/blood-bank", async (req, res) => {
    try {
      const allHospitalsRaw = await storage.getAllHospitals();
      const hospitalsWithBlood = allHospitalsRaw.filter(
        (h) => h.bloodTransfusion || h.bloodBankCanine || h.bloodBankFeline
      );
      const regions2 = await storage.getRegionsByCountry("HK");
      const regionMap = new Map(regions2.map((r) => [r.id, r]));
      const canineCount = hospitalsWithBlood.filter((h) => h.bloodBankCanine).length;
      const felineCount = hospitalsWithBlood.filter((h) => h.bloodBankFeline).length;
      const transfusionCount = hospitalsWithBlood.filter((h) => h.bloodTransfusion).length;
      const verificationDates = hospitalsWithBlood.filter((h) => h.lastVerifiedAt).map((h) => new Date(h.lastVerifiedAt).getTime());
      const lastVerified = verificationDates.length > 0 ? new Date(Math.max(...verificationDates)).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
      const fullServiceHospitals = hospitalsWithBlood.filter(
        (h) => h.bloodBankCanine && h.bloodBankFeline
      );
      const topHospital = fullServiceHospitals[0] || null;
      const topHospitalRegion = topHospital ? regionMap.get(topHospital.regionId) : null;
      const stats = {
        canineCount,
        felineCount,
        transfusionCount,
        totalCount: hospitalsWithBlood.length,
        lastVerified,
        topHospital: topHospital ? {
          nameEn: topHospital.nameEn,
          nameZh: topHospital.nameZh,
          region: topHospitalRegion?.nameEn || null,
          regionZh: topHospitalRegion?.nameZh || null
        } : null
      };
      const enrichedHospitals = hospitalsWithBlood.map((h) => {
        const region = regionMap.get(h.regionId);
        return {
          id: h.id,
          slug: h.slug,
          nameEn: h.nameEn,
          nameZh: h.nameZh,
          regionId: h.regionId,
          regionNameEn: region?.nameEn || null,
          regionNameZh: region?.nameZh || null,
          bloodTransfusion: h.bloodTransfusion,
          bloodBankCanine: h.bloodBankCanine,
          bloodBankFeline: h.bloodBankFeline,
          open247: h.open247,
          verified: h.verified,
          lastVerifiedAt: h.lastVerifiedAt,
          phone: h.phone,
          whatsapp: h.whatsapp
        };
      });
      res.json({
        stats,
        hospitals: enrichedHospitals,
        regions: regions2.map((r) => ({ id: r.id, nameEn: r.nameEn, nameZh: r.nameZh }))
      });
    } catch (error) {
      console.error("Error fetching blood bank blog data:", error);
      res.status(500).json({ error: error.message || "Failed to fetch blog data" });
    }
  });
  app2.get("/api/blog/typhoon-guide", async (req, res) => {
    try {
      const allHospitalsRaw = await storage.getAllHospitals();
      const hospitalsWithTyphoon = allHospitalsRaw.filter(
        (h) => h.open247 && (h.openT8 || h.openT10 || h.openBlackRainstorm)
      );
      const regions2 = await storage.getRegionsByCountry("HK");
      const regionMap = new Map(regions2.map((r) => [r.id, r]));
      const t8Count = hospitalsWithTyphoon.filter((h) => h.openT8).length;
      const t10Count = hospitalsWithTyphoon.filter((h) => h.openT10).length;
      const blackRainCount = hospitalsWithTyphoon.filter((h) => h.openBlackRainstorm).length;
      const verificationDates = hospitalsWithTyphoon.filter((h) => h.lastVerifiedAt).map((h) => new Date(h.lastVerifiedAt).getTime());
      const lastVerified = verificationDates.length > 0 ? new Date(Math.max(...verificationDates)).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
      const stats = {
        t8Count,
        t10Count,
        blackRainCount,
        totalCount: hospitalsWithTyphoon.length,
        lastVerified
      };
      const enrichedHospitals = hospitalsWithTyphoon.map((h) => {
        const region = regionMap.get(h.regionId);
        return {
          id: h.id,
          slug: h.slug,
          nameEn: h.nameEn,
          nameZh: h.nameZh,
          regionId: h.regionId,
          regionNameEn: region?.nameEn || null,
          regionNameZh: region?.nameZh || null,
          openT8: h.openT8,
          openT10: h.openT10,
          openBlackRainstorm: h.openBlackRainstorm,
          liveStatus: h.liveStatus,
          taxiDropoffEn: h.taxiDropoffEn,
          taxiDropoffZh: h.taxiDropoffZh,
          emergencyEntranceEn: h.emergencyEntranceEn,
          emergencyEntranceZh: h.emergencyEntranceZh,
          phone: h.phone,
          whatsapp: h.whatsapp,
          lastVerifiedAt: h.lastVerifiedAt
        };
      });
      res.json({
        stats,
        hospitals: enrichedHospitals,
        regions: regions2.map((r) => ({ id: r.id, nameEn: r.nameEn, nameZh: r.nameZh }))
      });
    } catch (error) {
      console.error("Error fetching typhoon guide blog data:", error);
      res.status(500).json({ error: error.message || "Failed to fetch blog data" });
    }
  });
  app2.get("/api/blog/imaging-diagnostics", async (req, res) => {
    try {
      const allHospitalsRaw = await storage.getAllHospitals();
      const hospitalsWithImaging = allHospitalsRaw.filter(
        (h) => h.imagingCT || h.imagingMRI || h.imagingXray || h.imagingUS
      );
      const regions2 = await storage.getRegionsByCountry("HK");
      const regionMap = new Map(regions2.map((r) => [r.id, r]));
      const ctCount = hospitalsWithImaging.filter((h) => h.imagingCT).length;
      const mriCount = hospitalsWithImaging.filter((h) => h.imagingMRI).length;
      const xrayCount = hospitalsWithImaging.filter((h) => h.imagingXray).length;
      const usCount = hospitalsWithImaging.filter((h) => h.imagingUS).length;
      const verificationDates = hospitalsWithImaging.filter((h) => h.lastVerifiedAt).map((h) => new Date(h.lastVerifiedAt).getTime());
      const lastVerified = verificationDates.length > 0 ? new Date(Math.max(...verificationDates)).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
      const stats = {
        ctCount,
        mriCount,
        xrayCount,
        usCount,
        totalCount: hospitalsWithImaging.length,
        lastVerified
      };
      const enrichedHospitals = hospitalsWithImaging.map((h) => {
        const region = regionMap.get(h.regionId);
        return {
          id: h.id,
          slug: h.slug,
          nameEn: h.nameEn,
          nameZh: h.nameZh,
          regionId: h.regionId,
          regionNameEn: region?.nameEn || null,
          regionNameZh: region?.nameZh || null,
          imagingCT: h.imagingCT,
          imagingMRI: h.imagingMRI,
          imagingXray: h.imagingXray,
          imagingUS: h.imagingUS,
          sameDayCT: h.sameDayCT,
          open247: h.open247,
          liveStatus: h.liveStatus,
          phone: h.phone,
          whatsapp: h.whatsapp,
          lastVerifiedAt: h.lastVerifiedAt
        };
      });
      res.json({
        stats,
        hospitals: enrichedHospitals,
        regions: regions2.map((r) => ({ id: r.id, nameEn: r.nameEn, nameZh: r.nameZh }))
      });
    } catch (error) {
      console.error("Error fetching imaging diagnostics blog data:", error);
      res.status(500).json({ error: error.message || "Failed to fetch blog data" });
    }
  });
  app2.get("/api/blog/exotic-emergency", async (req, res) => {
    try {
      const allHospitalsRaw = await storage.getAllHospitals();
      const hospitalsWithExotic = allHospitalsRaw.filter(
        (h) => h.open247 && (h.exoticVet247 === true || h.exoticSpecies247 && Array.isArray(h.exoticSpecies247) && h.exoticSpecies247.length > 0)
      );
      const regions2 = await storage.getRegionsByCountry("HK");
      const regionMap = new Map(regions2.map((r) => [r.id, r]));
      const exoticVet247Count = hospitalsWithExotic.filter((h) => h.exoticVet247 === true).length;
      const allSpecies = /* @__PURE__ */ new Set();
      hospitalsWithExotic.forEach((h) => {
        if (h.exoticSpecies247 && Array.isArray(h.exoticSpecies247)) {
          h.exoticSpecies247.forEach((species) => allSpecies.add(species));
        }
      });
      let topHospital = null;
      let maxSpeciesCount = 0;
      hospitalsWithExotic.forEach((h) => {
        const speciesCount = h.exoticSpecies247?.length || 0;
        if (speciesCount > maxSpeciesCount) {
          maxSpeciesCount = speciesCount;
          topHospital = {
            id: h.id,
            nameEn: h.nameEn,
            nameZh: h.nameZh,
            speciesCount
          };
        }
      });
      const verificationDates = hospitalsWithExotic.filter((h) => h.lastVerifiedAt).map((h) => new Date(h.lastVerifiedAt).getTime());
      const lastVerified = verificationDates.length > 0 ? new Date(Math.max(...verificationDates)).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
      const stats = {
        exoticVet247Count,
        totalCount: hospitalsWithExotic.length,
        speciesSupported: Array.from(allSpecies),
        lastVerified,
        topHospital
      };
      const enrichedHospitals = hospitalsWithExotic.map((h) => {
        const region = regionMap.get(h.regionId);
        return {
          id: h.id,
          slug: h.slug,
          nameEn: h.nameEn,
          nameZh: h.nameZh,
          regionId: h.regionId,
          regionNameEn: region?.nameEn || null,
          regionNameZh: region?.nameZh || null,
          exoticVet247: h.exoticVet247,
          exoticSpecies247: h.exoticSpecies247 || [],
          open247: h.open247,
          liveStatus: h.liveStatus,
          phone: h.phone,
          whatsapp: h.whatsapp,
          lastVerifiedAt: h.lastVerifiedAt
        };
      });
      res.json({
        stats,
        hospitals: enrichedHospitals,
        regions: regions2.map((r) => ({ id: r.id, nameEn: r.nameEn, nameZh: r.nameZh }))
      });
    } catch (error) {
      console.error("Error fetching exotic emergency blog data:", error);
      res.status(500).json({ error: error.message || "Failed to fetch blog data" });
    }
  });
  app2.post("/api/admin/daily-report/send", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { sendDailyReport: sendDailyReport2 } = await Promise.resolve().then(() => (init_daily_report(), daily_report_exports));
      const result = await sendDailyReport2();
      if (result.success) {
        res.json({ success: true, message: "Daily report email sent successfully" });
      } else {
        res.status(500).json({ success: false, message: result.error || "Failed to send report" });
      }
    } catch (error) {
      console.error("Error sending daily report email:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/daily-report", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const dateParam = req.query.date;
      const reportDate = dateParam ? new Date(dateParam) : /* @__PURE__ */ new Date();
      const startOfDay = new Date(reportDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(reportDate);
      endOfDay.setHours(23, 59, 59, 999);
      const allRequests = await storage.getAllEmergencyRequests();
      const dayRequests = allRequests.filter((r) => {
        const created = new Date(r.createdAt);
        return created >= startOfDay && created <= endOfDay;
      });
      const allHospitals = await storage.getAllHospitals();
      const hospitalMap = {};
      for (const h of allHospitals) {
        hospitalMap[h.id] = h;
      }
      const hospitalEnquiriesMap = {};
      for (const request of dayRequests) {
        const messages2 = await storage.getMessagesByEmergencyRequest(request.id);
        for (const msg of messages2) {
          const hospitalId = msg.hospitalId;
          if (!hospitalEnquiriesMap[hospitalId]) {
            const hospital = hospitalMap[hospitalId];
            hospitalEnquiriesMap[hospitalId] = {
              hospitalId,
              hospitalNameEn: hospital?.nameEn || "Unknown Hospital",
              hospitalNameZh: hospital?.nameZh || "",
              hospitalAddress: hospital?.addressEn || "",
              hospitalPhone: hospital?.phone || "",
              hospitalWhatsapp: hospital?.whatsapp || "",
              enquiries: []
            };
          }
          const alreadyAdded = hospitalEnquiriesMap[hospitalId].enquiries.find(
            (e) => e.requestId === request.id
          );
          if (!alreadyAdded) {
            hospitalEnquiriesMap[hospitalId].enquiries.push({
              requestId: request.id,
              time: request.createdAt,
              symptom: request.symptom,
              aiAnalyzedSymptoms: request.aiAnalyzedSymptoms,
              location: request.manualLocation || (request.locationLatitude && request.locationLongitude ? `${request.locationLatitude}, ${request.locationLongitude}` : null),
              contactName: request.contactName,
              contactPhone: request.contactPhone,
              petSpecies: request.petSpecies,
              petBreed: request.petBreed,
              petAge: request.petAge,
              requestStatus: request.status,
              messageStatus: msg.status,
              messageType: msg.messageType,
              sentAt: msg.sentAt,
              deliveredAt: msg.deliveredAt,
              readAt: msg.readAt
            });
          }
        }
      }
      const hospitalReports = Object.values(hospitalEnquiriesMap).sort(
        (a, b) => a.hospitalNameEn.localeCompare(b.hospitalNameEn)
      );
      res.json({
        date: startOfDay.toISOString().split("T")[0],
        totalEnquiries: dayRequests.length,
        totalHospitalsContacted: hospitalReports.length,
        hospitalReports
      });
    } catch (error) {
      console.error("Error generating daily report:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/sentry.ts
import * as Sentry from "@sentry/node";
var SENSITIVE_KEYS = ["password", "token", "api_key", "apikey", "secret", "authorization", "cookie", "auth"];
function scrubSensitiveData(data, depth = 0) {
  if (depth > 5 || !data) return data;
  if (typeof data === "string") {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => scrubSensitiveData(item, depth + 1));
  }
  if (typeof data === "object") {
    const scrubbed = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some((k) => lowerKey.includes(k))) {
        scrubbed[key] = "[REDACTED]";
      } else {
        scrubbed[key] = scrubSensitiveData(value, depth + 1);
      }
    }
    return scrubbed;
  }
  return data;
}
function initSentry() {
  const { sentryDsn, sentryTracesSampleRate, sentryEnv } = config.monitoring;
  if (!sentryDsn) {
    console.log("Sentry DSN not provided - error tracking disabled");
    return false;
  }
  Sentry.init({
    dsn: sentryDsn,
    environment: sentryEnv,
    // Performance monitoring
    tracesSampleRate: sentryTracesSampleRate,
    // Filter out sensitive data
    beforeSend(event) {
      if (event.request?.headers) {
        event.request.headers = scrubSensitiveData(event.request.headers);
      }
      if (event.request?.query_string) {
        event.request.query_string = scrubSensitiveData(event.request.query_string);
      }
      if (event.request?.data) {
        event.request.data = scrubSensitiveData(event.request.data);
      }
      if (event.extra) {
        event.extra = scrubSensitiveData(event.extra);
      }
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => ({
          ...breadcrumb,
          data: scrubSensitiveData(breadcrumb.data)
        }));
      }
      return event;
    }
  });
  console.log(`Sentry initialized for ${sentryEnv} environment`);
  return true;
}
function setupSentryMiddleware(app2) {
  if (!config.monitoring.sentryDsn) {
    return;
  }
}
function setupSentryErrorHandler(app2) {
  if (!config.monitoring.sentryDsn) {
    return;
  }
  Sentry.setupExpressErrorHandler(app2);
}

// server/seed-translations.ts
var translationData = [
  // App Title
  { key: "app.title", en: "PetSOS", zh: "PetSOS" },
  { key: "app.disclaimer", en: "\u26A0\uFE0F Disclaimer: PetSOS is a non-profit information tool designed to help pet owners quickly connect with 24-hour animal hospitals in emergencies. The platform does not provide medical advice or guarantee the quality of any clinic's services. Please contact your chosen clinic directly for professional assistance.", zh: "\u26A0\uFE0F \u91CD\u8981\u63D0\u793A\uFF1APetSOS \u70BA\u975E\u725F\u5229\u8CC7\u8A0A\u5E73\u53F0\uFF0C\u65E8\u5728\u5354\u52A9\u5BF5\u7269\u4E3B\u4EBA\u65BC\u7DCA\u6025\u60C5\u6CC1\u4E0B\u5FEB\u901F\u9023\u7E6B 24 \u5C0F\u6642\u52D5\u7269\u91AB\u9662\u3002\u672C\u5E73\u53F0\u4E0D\u63D0\u4F9B\u91AB\u7642\u5EFA\u8B70\uFF0C\u4EA6\u4E0D\u4FDD\u8B49\u8A3A\u6240\u670D\u52D9\u8CEA\u7D20\u3002\u4F7F\u7528\u8005\u61C9\u81EA\u884C\u5224\u65B7\u53CA\u806F\u7D61\u8A3A\u6240\u4EE5\u7372\u53D6\u5C08\u696D\u5354\u52A9\u3002" },
  // Landing Page
  { key: "landing.subtitle", en: "Alert 24-hour animal hospitals with one tap", zh: "\u4E00\u6309\u5373\u6642\u901A\u77E524\u5C0F\u6642\u52D5\u7269\u91AB\u9662" },
  { key: "landing.emergency_button", en: "Emergency Help Now", zh: "\u7DCA\u6025\u6C42\u52A9" },
  { key: "landing.login_button", en: "Log In / Sign Up", zh: "\u767B\u5165 / \u8A3B\u518A" },
  { key: "landing.login_profile_button", en: "Login / Create Pet Profile", zh: "\u767B\u5165 / \u5EFA\u7ACB\u6BDB\u5B69\u6A94\u6848" },
  { key: "landing.find_hospitals_button", en: "Find Nearby 24-Hour Hospitals", zh: "\u5C0B\u627E\u9644\u8FD124\u5C0F\u6642\u91AB\u9662" },
  { key: "landing.quick_access", en: "Emergency access available without login \u2022 Get help in under 60 seconds", zh: "\u7121\u9700\u767B\u5165\u5373\u53EF\u7DCA\u6025\u6C42\u52A9 \u2022 60\u79D2\u5167\u7372\u5F97\u5354\u52A9" },
  { key: "landing.feature1.title", en: "Fast Emergency Flow", zh: "\u5FEB\u901F\u7DCA\u6025\u6C42\u52A9" },
  { key: "landing.feature1.desc", en: "3-step emergency request in under 30 seconds. Every second counts when your pet needs help.", zh: "3\u6B65\u9A5F\u5B8C\u6210\u7DCA\u6025\u6C42\u52A9\uFF0C\u53EA\u970030\u79D2\u3002\u5BF5\u7269\u9700\u8981\u5E6B\u52A9\u6642\uFF0C\u5206\u79D2\u5FC5\u722D\u3002" },
  { key: "landing.feature2.title", en: "24-Hour Clinics", zh: "24\u5C0F\u6642\u8A3A\u6240" },
  { key: "landing.feature2.desc", en: "Find nearest 24-hour veterinary clinics across Hong Kong Island, Kowloon, and New Territories.", zh: "\u641C\u5C0B\u6E2F\u5CF6\u3001\u4E5D\u9F8D\u53CA\u65B0\u754C\u5340\u5167\u6700\u8FD1\u768424\u5C0F\u6642\u7378\u91AB\u8A3A\u6240\u3002" },
  { key: "landing.feature3.title", en: "One-Tap Broadcast", zh: "\u4E00\u9375\u5EE3\u64AD" },
  { key: "landing.feature3.desc", en: "Alert multiple clinics instantly via WhatsApp with one tap. Get help faster.", zh: "\u4E00\u9375\u900F\u904EWhatsApp\u5373\u6642\u901A\u77E5\u591A\u9593\u8A3A\u6240\uFF0C\u66F4\u5FEB\u7372\u5F97\u5354\u52A9\u3002" },
  { key: "landing.disclaimer", en: "\u26A0\uFE0F Disclaimer: PetSOS is a non-profit information tool designed to help pet owners quickly connect with 24-hour animal hospitals in emergencies. The platform does not provide medical advice or guarantee the quality of any clinic's services. Please contact your chosen clinic directly for professional assistance.", zh: "\u26A0\uFE0F \u91CD\u8981\u63D0\u793A\uFF1APetSOS \u70BA\u975E\u725F\u5229\u8CC7\u8A0A\u5E73\u53F0\uFF0C\u65E8\u5728\u5354\u52A9\u5BF5\u7269\u4E3B\u4EBA\u65BC\u7DCA\u6025\u60C5\u6CC1\u4E0B\u5FEB\u901F\u9023\u7E6B 24 \u5C0F\u6642\u52D5\u7269\u91AB\u9662\u3002\u672C\u5E73\u53F0\u4E0D\u63D0\u4F9B\u91AB\u7642\u5EFA\u8B70\uFF0C\u4EA6\u4E0D\u4FDD\u8B49\u8A3A\u6240\u670D\u52D9\u8CEA\u7D20\u3002\u4F7F\u7528\u8005\u61C9\u81EA\u884C\u5224\u65B7\u53CA\u806F\u7D61\u8A3A\u6240\u4EE5\u7372\u53D6\u5C08\u696D\u5354\u52A9\u3002" },
  // Home Page
  { key: "home.emergency.button", en: "Emergency Care Now", zh: "\u7DCA\u6025\u6C42\u52A9" },
  { key: "home.emergency.subtitle", en: "Get help from 24-hour veterinary clinics immediately", zh: "\u7ACB\u5373\u806F\u7D6124\u5C0F\u6642\u7378\u91AB\u8A3A\u6240" },
  { key: "home.find_clinics", en: "Find Clinics", zh: "\u5C0B\u627E\u8A3A\u6240" },
  { key: "home.find_clinics.desc", en: "Browse all veterinary clinics", zh: "\u700F\u89BD\u6240\u6709\u7378\u91AB\u8A3A\u6240" },
  { key: "home.my_pets", en: "My Pets", zh: "\u6211\u7684\u5BF5\u7269" },
  { key: "home.my_pets.desc", en: "Manage your pet profiles", zh: "\u7BA1\u7406\u5BF5\u7269\u8CC7\u6599" },
  { key: "home.how_it_works", en: "How It Works", zh: "\u4F7F\u7528\u65B9\u6CD5" },
  { key: "home.step1.title", en: "Describe Emergency", zh: "\u63CF\u8FF0\u7DCA\u6025\u60C5\u6CC1" },
  { key: "home.step1.desc", en: "Tell us what's happening with your pet", zh: "\u544A\u77E5\u5BF5\u7269\u7684\u72C0\u6CC1" },
  { key: "home.step2.title", en: "Find Nearby Clinics", zh: "\u5C0B\u627E\u9644\u8FD1\u8A3A\u6240" },
  { key: "home.step2.desc", en: "We'll show 24-hour clinics near you", zh: "\u5373\u6642\u986F\u793A\u9644\u8FD1\u768424\u5C0F\u6642\u8A3A\u6240" },
  { key: "home.step3.title", en: "Contact Instantly", zh: "\u5373\u6642\u806F\u7D61" },
  { key: "home.step3.desc", en: "Call or message clinics instantly", zh: "\u5373\u6642\u81F4\u96FB\u6216\u767C\u9001\u8A0A\u606F\u7D66\u8A3A\u6240" },
  // Emergency Flow
  { key: "emergency.title", en: "Emergency Pet Care", zh: "\u7DCA\u6025\u6C42\u52A9" },
  { key: "emergency.step1.title", en: "What's happening?", zh: "\u767C\u751F\u4EC0\u9EBC\u4E8B\uFF1F" },
  { key: "emergency.step2.title", en: "Where are you?", zh: "\u60A8\u5728\u54EA\u88E1\uFF1F" },
  { key: "emergency.step3.title", en: "How can clinics reach you?", zh: "\u8A3A\u6240\u5982\u4F55\u806F\u7D61\u60A8\uFF1F" },
  // Instant Emergency Broadcast
  { key: "emergency.instant_broadcast_title", en: "INSTANT EMERGENCY BROADCAST", zh: "\u5373\u6642\u7DCA\u6025\u5EE3\u64AD" },
  { key: "emergency.instant_broadcast_desc", en: "Send alert to {count} available 24-hour support {plural} NOW", zh: "\u5373\u6642\u901A\u77E5 {count} \u959324\u5C0F\u6642\u652F\u63F4\u91AB\u9662" },
  { key: "emergency.instant_broadcast_tip", en: "Fastest way to get help - One click to reach all partner hospitals", zh: "\u6700\u5FEB\u53D6\u5F97\u5354\u52A9 - \u4E00\u9375\u806F\u7D61\u6240\u6709\u5408\u4F5C\u91AB\u9662" },
  { key: "emergency.instant_broadcast_button", en: "BROADCAST NOW", zh: "\u7ACB\u5373\u5EE3\u64AD" },
  { key: "emergency.step_indicator", en: "Step {step} of 3", zh: "\u7B2C {step} \u6B65\uFF0C\u51713\u6B65" },
  { key: "emergency.time_step1", en: "~30s", zh: "\u7D0430\u79D2" },
  { key: "emergency.time_step2", en: "~15s", zh: "\u7D0415\u79D2" },
  { key: "emergency.time_step3", en: "~10s", zh: "\u7D0410\u79D2" },
  // Emergency Step 1 - Symptoms
  { key: "symptoms.urgent", en: "What's happening to your pet right now?", zh: "\u6BDB\u5B69\u73FE\u6642\u51FA\u73FE\u4EC0\u9EBC\u60C5\u6CC1\uFF1F" },
  { key: "symptoms.select_all", en: "Tap all symptoms that apply", zh: "\u8ACB\u9078\u64C7\u6240\u6709\u9069\u7528\u7684\u75C7\u72C0" },
  { key: "symptoms.describe", en: "Describe the symptoms...", zh: "\u8ACB\u63CF\u8FF0\u60C5\u6CC1..." },
  { key: "emergency.select_pet", en: "Which pet is this for?", zh: "\u662F\u54EA\u4E00\u96BB\u6BDB\u5B69\uFF1F" },
  { key: "emergency.select_pet_desc", en: "Select your pet for faster emergency help", zh: "\u9078\u64C7\u60A8\u7684\u6BDB\u5B69\u4EE5\u52A0\u5FEB\u7DCA\u6025\u6C42\u52A9" },
  { key: "optional", en: "Optional", zh: "\u9078\u586B" },
  { key: "emergency.pet_details", en: "Pet Information", zh: "\u6BDB\u5B69\u8CC7\u6599" },
  { key: "emergency.pet_details_desc", en: "Tell us about your pet so clinics can prepare", zh: "\u8ACB\u63D0\u4F9B\u6BDB\u5B69\u8CC7\u6599\uFF0C\u8B93\u8A3A\u6240\u9810\u5148\u6E96\u5099" },
  { key: "pets.select_species", en: "Select species", zh: "\u9078\u64C7\u7A2E\u985E" },
  { key: "pets.dog", en: "Dog", zh: "\u72D7" },
  { key: "pets.cat", en: "Cat", zh: "\u8C93" },
  { key: "pets.breed_placeholder", en: "Select or type breed...", zh: "\u9078\u64C7\u6216\u8F38\u5165\u54C1\u7A2E..." },
  { key: "pets.age_placeholder", en: "e.g., 3", zh: "\u4F8B\u5982\uFF1A3" },
  // Emergency Step 2 - Location
  { key: "emergency.step2.detecting", en: "Detecting your location...", zh: "\u6B63\u5728\u5075\u6E2C\u60A8\u7684\u4F4D\u7F6E..." },
  { key: "emergency.step2.detected", en: "Location detected", zh: "\u5DF2\u5075\u6E2C\u5230\u4F4D\u7F6E" },
  { key: "emergency.step2.nearest", en: "We'll find the nearest 24-hour clinics", zh: "\u6211\u5011\u6703\u70BA\u60A8\u641C\u5C0B\u6700\u8FD1\u768424\u5C0F\u6642\u8A3A\u6240" },
  { key: "emergency.step2.retry", en: "Retry GPS", zh: "\u91CD\u8A66GPS\u5B9A\u4F4D" },
  { key: "emergency.step2.manual_label", en: "Or enter your location manually", zh: "\u6216\u624B\u52D5\u8F38\u5165\u60A8\u7684\u4F4D\u7F6E" },
  { key: "emergency.step2.placeholder", en: "e.g., Central, Hong Kong Island", zh: "\u4F8B\u5982\uFF1A\u4E2D\u74B0\uFF0C\u9999\u6E2F\u5CF6" },
  { key: "emergency.gps.unavailable", en: "GPS unavailable", zh: "GPS\u5B9A\u4F4D\u7121\u6CD5\u4F7F\u7528" },
  { key: "emergency.gps.manual", en: "Please enter location manually below", zh: "\u8ACB\u5728\u4E0B\u65B9\u624B\u52D5\u8F38\u5165\u4F4D\u7F6E" },
  { key: "emergency.gps.error", en: "Unable to detect location", zh: "\u7121\u6CD5\u5075\u6E2C\u4F4D\u7F6E" },
  { key: "emergency.gps.not_supported", en: "Geolocation is not supported by this browser", zh: "\u60A8\u7684\u700F\u89BD\u5668\u4E0D\u652F\u63F4GPS\u5B9A\u4F4D\u529F\u80FD" },
  // Emergency Step 3 - Contact
  { key: "emergency.step3.name", en: "Your Name", zh: "\u60A8\u7684\u59D3\u540D" },
  { key: "emergency.step3.name_placeholder", en: "Full name", zh: "\u5168\u540D" },
  { key: "emergency.step3.phone", en: "Phone Number", zh: "\u96FB\u8A71\u865F\u78BC" },
  { key: "emergency.step3.phone_placeholder", en: "+852 1234 5678", zh: "+852 1234 5678" },
  { key: "emergency.step3.clinic_contact", en: "Clinics will contact you at this number to confirm availability", zh: "\u8A3A\u6240\u6703\u81F4\u96FB\u6B64\u865F\u78BC\u78BA\u8A8D\u662F\u5426\u53EF\u4EE5\u63A5\u8A3A" },
  // Emergency Buttons & Status
  { key: "button.next", en: "Next", zh: "\u4E0B\u4E00\u6B65" },
  { key: "button.previous", en: "Back", zh: "\u8FD4\u56DE" },
  { key: "button.submit", en: "Find Clinics", zh: "\u5C0B\u627E\u8A3A\u6240" },
  { key: "button.submitting", en: "Submitting...", zh: "\u63D0\u4EA4\u4E2D..." },
  { key: "emergency.submit.success", en: "Emergency request submitted!", zh: "\u7DCA\u6025\u6C42\u52A9\u5DF2\u63D0\u4EA4\uFF01" },
  { key: "emergency.submit.finding", en: "Finding nearby clinics...", zh: "\u6B63\u5728\u641C\u5C0B\u9644\u8FD1\u7684\u8A3A\u6240..." },
  // Validation Messages
  { key: "validation.symptom_required", en: "Please select at least one symptom", zh: "\u8ACB\u81F3\u5C11\u9078\u64C7\u4E00\u500B\u75C7\u72C0" },
  { key: "validation.pet_required", en: "Please select a pet or provide pet details", zh: "\u8ACB\u9078\u64C7\u5BF5\u7269\u6216\u63D0\u4F9B\u5BF5\u7269\u8CC7\u6599" },
  { key: "validation.location_required", en: "Please provide a location (GPS or manual entry)", zh: "\u8ACB\u63D0\u4F9B\u4F4D\u7F6E\uFF08GPS\u5B9A\u4F4D\u6216\u624B\u52D5\u8F38\u5165\uFF09" },
  { key: "validation.name_required", en: "Contact name is required", zh: "\u8ACB\u8F38\u5165\u806F\u7D61\u4EBA\u59D3\u540D" },
  { key: "validation.phone_required", en: "Please enter a valid phone number", zh: "\u8ACB\u8F38\u5165\u6709\u6548\u7684\u96FB\u8A71\u865F\u78BC" },
  // Clinic Results
  { key: "results.title", en: "Nearby 24-Hour Clinics", zh: "\u9644\u8FD1\u768424\u5C0F\u6642\u8A3A\u6240" },
  { key: "results.request_for", en: "Emergency Request", zh: "\u7DCA\u6025\u6C42\u52A9" },
  { key: "results.clinics_found", en: "clinics found", zh: "\u9593\u8A3A\u6240" },
  { key: "results.call", en: "Call", zh: "\u81F4\u96FB" },
  { key: "results.whatsapp", en: "WhatsApp", zh: "WhatsApp" },
  { key: "results.broadcast", en: "Broadcast to All Clinics", zh: "\u4E00\u9375\u901A\u77E5\u6240\u6709\u8A3A\u6240" },
  { key: "results.broadcast.confirm", en: "Confirm Broadcast", zh: "\u78BA\u8A8D\u767C\u9001" },
  { key: "results.broadcast.message", en: "This will send your emergency request to all clinics with WhatsApp or email. They will be able to contact you directly.", zh: "\u7CFB\u7D71\u6703\u5C07\u60A8\u7684\u7DCA\u6025\u6C42\u52A9\u767C\u9001\u81F3\u6240\u6709\u8A2D\u6709WhatsApp\u6216\u96FB\u90F5\u7684\u8A3A\u6240\uFF0C\u4ED6\u5011\u6703\u76F4\u63A5\u806F\u7D61\u60A8\u3002" },
  { key: "results.view_status", en: "View Broadcast Status", zh: "\u67E5\u770B\u767C\u9001\u72C0\u614B" },
  { key: "results.24_hours", en: "24 Hours", zh: "24\u5C0F\u6642" },
  // Clinic Results Page - Comprehensive Translation
  { key: "clinic_results.title", en: "Emergency Clinic Results", zh: "\u7DCA\u6025\u8A3A\u6240\u641C\u5C0B\u7D50\u679C" },
  { key: "clinic_results.clinics_found", en: "clinics found", zh: "\u9593\u8A3A\u6240" },
  { key: "clinic_results.total_clinics", en: "Total Clinics", zh: "\u8A3A\u6240\u7E3D\u6578" },
  { key: "clinic_results.24hour", en: "24-Hour", zh: "24\u5C0F\u6642" },
  { key: "clinic_results.whatsapp", en: "WhatsApp", zh: "WhatsApp" },
  { key: "clinic_results.within_5km", en: "Within 5km", zh: "5\u516C\u91CC\u5167" },
  { key: "clinic_results.km", en: "km", zh: "\u516C\u91CC" },
  { key: "clinic_results.emergency_request", en: "Emergency Request", zh: "\u7DCA\u6025\u6C42\u52A9" },
  { key: "clinic_results.symptoms", en: "Symptoms", zh: "\u75C7\u72C0" },
  { key: "clinic_results.pet", en: "Pet", zh: "\u5BF5\u7269" },
  { key: "clinic_results.location", en: "Location", zh: "\u4F4D\u7F6E" },
  { key: "clinic_results.contact", en: "Contact", zh: "\u806F\u7D61\u65B9\u5F0F" },
  { key: "clinic_results.filters_search", en: "Filters & Search", zh: "\u7BE9\u9078\u8207\u641C\u5C0B" },
  { key: "clinic_results.show_filters", en: "Show Filters", zh: "\u986F\u793A\u7BE9\u9078" },
  { key: "clinic_results.hide_filters", en: "Hide Filters", zh: "\u96B1\u85CF\u7BE9\u9078" },
  { key: "clinic_results.search_placeholder", en: "Search clinics by name or address...", zh: "\u641C\u5C0B\u8A3A\u6240\u540D\u7A31\u6216\u5730\u5740..." },
  { key: "clinic_results.24hour_only", en: "24-Hour Clinics Only", zh: "\u53EA\u986F\u793A24\u5C0F\u6642\u8A3A\u6240" },
  { key: "clinic_results.24hour_only_short", en: "24-Hour Only", zh: "\u53EA\u986F\u793A24\u5C0F\u6642" },
  { key: "clinic_results.whatsapp_only", en: "WhatsApp Only", zh: "\u53EA\u986F\u793AWhatsApp" },
  { key: "clinic_results.region", en: "Region", zh: "\u5730\u5340" },
  { key: "clinic_results.all_regions", en: "All Regions", zh: "\u5168\u6E2F" },
  { key: "clinic_results.distance", en: "Distance", zh: "\u8DDD\u96E2" },
  { key: "clinic_results.all", en: "All", zh: "\u5168\u90E8" },
  { key: "clinic_results.enable_gps", en: "Enable GPS on Step 2 for distance filtering", zh: "\u8ACB\u5728\u7B2C2\u6B65\u555F\u7528GPS\u5B9A\u4F4D\u4EE5\u4F7F\u7528\u8DDD\u96E2\u7BE9\u9078" },
  { key: "clinic_results.no_gps_data", en: "No clinic GPS data available", zh: "\u6C92\u6709\u8A3A\u6240GPS\u8CC7\u6599" },
  { key: "clinic_results.clinics_selected", en: "clinics selected", zh: "\u9593\u8A3A\u6240\u5DF2\u9078" },
  { key: "clinic_results.clear_selection", en: "Clear Selection", zh: "\u6E05\u9664\u9078\u64C7" },
  { key: "clinic_results.view_status", en: "View Status", zh: "\u67E5\u770B\u72C0\u614B" },
  { key: "clinic_results.broadcast", en: "Broadcast", zh: "\u5EE3\u64AD" },
  { key: "clinic_results.to_all", en: "to All", zh: "\u81F3\u5168\u90E8" },
  { key: "clinic_results.call", en: "Call", zh: "\u81F4\u96FB" },
  { key: "clinic_results.no_clinics", en: "No clinics found", zh: "\u627E\u4E0D\u5230\u8A3A\u6240" },
  { key: "clinic_results.adjust_filters", en: "Try adjusting your filters or search criteria", zh: "\u8ACB\u5617\u8A66\u8ABF\u6574\u7BE9\u9078\u6216\u641C\u5C0B\u689D\u4EF6" },
  { key: "clinic_results.priority_clinic", en: "Priority Clinic", zh: "\u512A\u5148\u8A3A\u6240" },
  { key: "clinic_results.available_now", en: "Available Now", zh: "\u73FE\u5728\u53EF\u63A5\u8A3A" },
  { key: "clinic_results.unavailable", en: "Unavailable", zh: "\u672A\u80FD\u63A5\u8A3A" },
  { key: "clinic_results.24_hours", en: "24 Hours", zh: "24\u5C0F\u6642" },
  { key: "clinic_results.broadcast_success", en: "Broadcast sent successfully!", zh: "\u5EE3\u64AD\u5DF2\u6210\u529F\u767C\u9001\uFF01" },
  { key: "clinic_results.broadcast_success_desc", en: "Emergency alert sent to clinics", zh: "\u7DCA\u6025\u901A\u77E5\u5DF2\u767C\u9001\u81F3\u8A3A\u6240" },
  { key: "clinic_results.broadcast_failed", en: "Broadcast failed", zh: "\u5EE3\u64AD\u767C\u9001\u5931\u6557" },
  { key: "clinic_results.broadcast_to_selected", en: "Broadcast to Selected Clinics", zh: "\u5EE3\u64AD\u81F3\u5DF2\u9078\u8A3A\u6240" },
  { key: "clinic_results.broadcast_emergency", en: "Broadcast Emergency Alert", zh: "\u5EE3\u64AD\u7DCA\u6025\u901A\u77E5" },
  { key: "clinic_results.broadcast_desc_selected", en: "This will send your emergency alert to selected clinics via WhatsApp and email.", zh: "\u7CFB\u7D71\u6703\u900F\u904EWhatsApp\u53CA\u96FB\u90F5\u5C07\u60A8\u7684\u7DCA\u6025\u901A\u77E5\u767C\u9001\u81F3\u5DF2\u9078\u8A3A\u6240\u3002" },
  { key: "clinic_results.broadcast_desc_all", en: "This will send your emergency alert to all clinics via WhatsApp and email.", zh: "\u7CFB\u7D71\u6703\u900F\u904EWhatsApp\u53CA\u96FB\u90F5\u5C07\u60A8\u7684\u7DCA\u6025\u901A\u77E5\u767C\u9001\u81F3\u6240\u6709\u8A3A\u6240\u3002" },
  { key: "clinic_results.broadcast_tip", en: "\u{1F4A1} Tip: Select specific clinics using the checkboxes to send a targeted broadcast", zh: "\u{1F4A1} \u63D0\u793A\uFF1A\u4F7F\u7528\u52FE\u9078\u6846\u9078\u64C7\u7279\u5B9A\u8A3A\u6240\uFF0C\u4EE5\u767C\u9001\u91DD\u5C0D\u6027\u5EE3\u64AD" },
  { key: "clinic_results.message_preview", en: "Message Preview", zh: "\u8A0A\u606F\u9810\u89BD" },
  { key: "clinic_results.send_to_clinics", en: "Send to Clinics", zh: "\u767C\u9001\u81F3\u8A3A\u6240" },
  { key: "clinic_results.whatsapp_message_emergency", en: "Emergency", zh: "\u7DCA\u6025" },
  { key: "clinic_results.whatsapp_message_contact", en: "Contact", zh: "\u806F\u7D61" },
  { key: "clinic_results.whatsapp_message_request", en: "I need emergency pet care", zh: "\u6211\u9700\u8981\u7DCA\u6025\u5BF5\u7269\u8B77\u7406" },
  { key: "clinic_results.location_not_provided", en: "Location not provided", zh: "\u672A\u63D0\u4F9B\u4F4D\u7F6E" },
  { key: "clinic_results.map", en: "Map", zh: "\u5730\u5716" },
  { key: "clinic_results.pet_name", en: "Pet Name", zh: "\u5BF5\u7269\u540D\u7A31" },
  { key: "clinic_results.weight_kg", en: "kg", zh: "\u516C\u65A4" },
  { key: "clinic_results.medical_history", en: "\u26A0\uFE0F Medical History", zh: "\u26A0\uFE0F \u75C5\u6B77\u7D00\u9304" },
  { key: "clinic_results.no_medical_notes", en: "No medical notes on file", zh: "\u6C92\u6709\u75C5\u6B77\u7D00\u9304" },
  { key: "clinic_results.gps_prefix", en: "GPS", zh: "GPS" },
  { key: "clinic_results.broadcast_alert_title", en: "PET EMERGENCY ALERT", zh: "\u5BF5\u7269\u7DCA\u6025\u8B66\u5831" },
  { key: "clinic_results.broadcast_alert_footer", en: "Please respond urgently if you can help.", zh: "\u5982\u80FD\u63D0\u4F9B\u5354\u52A9\uFF0C\u8ACB\u5118\u5FEB\u56DE\u8986\u3002" },
  { key: "clinic_results.emergency_care_needed", en: "Emergency pet care needed", zh: "\u9700\u8981\u7DCA\u6025\u5BF5\u7269\u8B77\u7406" },
  // Clinics Page
  { key: "clinics.title", en: "Veterinary Clinics", zh: "\u7378\u91AB\u8A3A\u6240" },
  { key: "clinics.search", en: "Search clinics...", zh: "\u641C\u5C0B\u8A3A\u6240..." },
  { key: "clinics.all_regions", en: "All Regions", zh: "\u5168\u6E2F" },
  { key: "clinics.away", en: "away", zh: "\u8DDD\u96E2" },
  { key: "clinics.location_unavailable", en: "Location unavailable", zh: "\u7121\u6CD5\u53D6\u5F97\u4F4D\u7F6E" },
  { key: "clinics.location_error_msg", en: "Please enable location permissions to see distances and sort by nearest clinics. Clinics are shown in alphabetical order.", zh: "\u8ACB\u555F\u7528\u4F4D\u7F6E\u6B0A\u9650\u4EE5\u67E5\u770B\u8DDD\u96E2\u4E26\u6309\u6700\u8FD1\u8A3A\u6240\u6392\u5E8F\u3002\u76EE\u524D\u6309\u5B57\u6BCD\u9806\u5E8F\u986F\u793A\u8A3A\u6240\u3002" },
  { key: "clinics.location_enabled", en: "\u{1F4CD} Showing distances from your location - clinics sorted by nearest first", zh: "\u{1F4CD} \u986F\u793A\u8DDD\u96E2\u60A8\u7684\u4F4D\u7F6E - \u8A3A\u6240\u6309\u6700\u8FD1\u6392\u5E8F" },
  { key: "clinics.location_loading", en: "Getting your location...", zh: "\u6B63\u5728\u53D6\u5F97\u60A8\u7684\u4F4D\u7F6E..." },
  { key: "clinics.hki", en: "Hong Kong Island", zh: "\u9999\u6E2F\u5CF6" },
  { key: "clinics.kln", en: "Kowloon", zh: "\u4E5D\u9F8D" },
  { key: "clinics.nti", en: "New Territories", zh: "\u65B0\u754C" },
  { key: "clinics.24h_only", en: "24-hour clinics only", zh: "\u53EA\u986F\u793A24\u5C0F\u6642\u8A3A\u6240" },
  { key: "clinics.no_results", en: "No clinics found", zh: "\u627E\u4E0D\u5230\u8A3A\u6240" },
  { key: "clinics.adjust_search", en: "Try adjusting your search or filters", zh: "\u8ACB\u5617\u8A66\u8ABF\u6574\u641C\u5C0B\u6216\u7BE9\u9078\u689D\u4EF6" },
  { key: "clinics.count", en: "clinic", zh: "\u9593" },
  { key: "clinics.count_plural", en: "clinics", zh: "\u9593" },
  { key: "clinics.found", en: "found", zh: "\u5DF2\u627E\u5230" },
  // Profile
  { key: "profile.title", en: "My Profile", zh: "\u6211\u7684\u500B\u4EBA\u8CC7\u6599" },
  { key: "profile.desc", en: "Manage your account information and preferences", zh: "\u7BA1\u7406\u60A8\u7684\u5E33\u6236\u8CC7\u6599\u53CA\u504F\u597D\u8A2D\u5B9A" },
  { key: "profile.username", en: "Username", zh: "\u7528\u6236\u540D\u7A31" },
  { key: "profile.email", en: "Email", zh: "\u96FB\u90F5\u5730\u5740" },
  { key: "profile.phone", en: "Phone Number", zh: "\u96FB\u8A71\u865F\u78BC" },
  { key: "profile.language", en: "Language Preference", zh: "\u8A9E\u8A00\u504F\u597D" },
  { key: "profile.region", en: "Region Preference", zh: "\u5730\u5340\u504F\u597D" },
  { key: "profile.save", en: "Save Changes", zh: "\u5132\u5B58" },
  { key: "profile.saving", en: "Saving...", zh: "\u5132\u5B58\u4E2D..." },
  { key: "profile.manage_pets", en: "Manage My Pets", zh: "\u7BA1\u7406\u6211\u7684\u5BF5\u7269" },
  { key: "profile.privacy.title", en: "Privacy & Data Rights", zh: "\u79C1\u96B1\u53CA\u6578\u64DA\u6B0A\u5229" },
  { key: "profile.privacy.desc", en: "Manage your personal data and privacy settings", zh: "\u7BA1\u7406\u60A8\u7684\u500B\u4EBA\u8CC7\u6599\u53CA\u79C1\u96B1\u8A2D\u5B9A" },
  { key: "profile.privacy.export_title", en: "Export Your Data", zh: "\u532F\u51FA\u60A8\u7684\u8CC7\u6599" },
  { key: "profile.privacy.export_desc", en: "Download a copy of all your personal data in JSON format (GDPR/PDPO compliant)", zh: "\u4E0B\u8F09\u60A8\u7684\u6240\u6709\u500B\u4EBA\u8CC7\u6599\u526F\u672C\uFF08JSON\u683C\u5F0F\uFF0C\u7B26\u5408GDPR/PDPO\u898F\u5B9A\uFF09" },
  { key: "profile.privacy.export_button", en: "Download My Data", zh: "\u4E0B\u8F09\u6211\u7684\u8CC7\u6599" },
  { key: "profile.export.success_title", en: "Data exported successfully", zh: "\u8CC7\u6599\u532F\u51FA\u6210\u529F" },
  { key: "profile.export.success_desc", en: "Your personal data has been downloaded.", zh: "\u60A8\u7684\u500B\u4EBA\u8CC7\u6599\u5DF2\u4E0B\u8F09\u3002" },
  { key: "profile.export.error_title", en: "Export failed", zh: "\u532F\u51FA\u5931\u6557" },
  { key: "profile.export.error_desc", en: "Failed to download your data. Please try again.", zh: "\u4E0B\u8F09\u8CC7\u6599\u5931\u6557\u3002\u8ACB\u91CD\u8A66\u3002" },
  { key: "profile.privacy.delete_title", en: "Delete Your Account", zh: "\u522A\u9664\u60A8\u7684\u5E33\u6236" },
  { key: "profile.privacy.delete_desc", en: "Permanently delete your account and all associated data. This action cannot be undone.", zh: "\u6C38\u4E45\u522A\u9664\u60A8\u7684\u5E33\u6236\u53CA\u6240\u6709\u76F8\u95DC\u8CC7\u6599\u3002\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002" },
  { key: "profile.privacy.delete_button", en: "Delete My Account", zh: "\u522A\u9664\u6211\u7684\u5E33\u6236" },
  { key: "profile.delete.success_title", en: "Account deleted", zh: "\u5E33\u6236\u5DF2\u522A\u9664" },
  { key: "profile.delete.success_desc", en: "Your account and all data have been permanently deleted.", zh: "\u60A8\u7684\u5E33\u6236\u53CA\u6240\u6709\u8CC7\u6599\u5DF2\u6C38\u4E45\u522A\u9664\u3002" },
  { key: "profile.delete.error_title", en: "Deletion failed", zh: "\u522A\u9664\u5931\u6557" },
  { key: "profile.delete.error_desc", en: "Failed to delete your account. Please try again.", zh: "\u522A\u9664\u5E33\u6236\u5931\u6557\u3002\u8ACB\u91CD\u8A66\u3002" },
  { key: "profile.delete.dialog_title", en: "Are you absolutely sure?", zh: "\u60A8\u78BA\u5B9A\u8981\u522A\u9664\u55CE\uFF1F" },
  { key: "profile.delete.dialog_desc", en: "This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:", zh: "\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002\u9019\u5C07\u6C38\u4E45\u522A\u9664\u60A8\u7684\u5E33\u6236\u4E26\u5F9E\u6211\u5011\u7684\u4F3A\u670D\u5668\u79FB\u9664\u6240\u6709\u8CC7\u6599\uFF0C\u5305\u62EC\uFF1A" },
  { key: "profile.delete.dialog_item1", en: "Your profile and contact information", zh: "\u60A8\u7684\u500B\u4EBA\u8CC7\u6599\u53CA\u806F\u7D61\u8CC7\u8A0A" },
  { key: "profile.delete.dialog_item2", en: "All saved pets and their medical history", zh: "\u6240\u6709\u5DF2\u5132\u5B58\u7684\u5BF5\u7269\u53CA\u5176\u75C5\u6B77" },
  { key: "profile.delete.dialog_item3", en: "All emergency request records", zh: "\u6240\u6709\u7DCA\u6025\u6C42\u52A9\u8A18\u9304" },
  { key: "profile.delete.dialog_item4", en: "All privacy consents and preferences", zh: "\u6240\u6709\u79C1\u96B1\u540C\u610F\u53CA\u504F\u597D\u8A2D\u5B9A" },
  { key: "profile.delete.dialog_cancel", en: "Cancel", zh: "\u53D6\u6D88" },
  { key: "profile.delete.dialog_confirm", en: "Yes, delete my account", zh: "\u662F\u7684\uFF0C\u522A\u9664\u6211\u7684\u5E33\u6236" },
  { key: "profile.username_placeholder", en: "Enter username", zh: "\u8F38\u5165\u7528\u6236\u540D\u7A31" },
  { key: "profile.email_placeholder", en: "you@example.com", zh: "\u60A8\u7684\u96FB\u90F5\u5730\u5740" },
  { key: "profile.phone_placeholder", en: "+852 1234 5678", zh: "+852 1234 5678" },
  { key: "profile.language_placeholder", en: "Select language", zh: "\u9078\u64C7\u8A9E\u8A00" },
  { key: "profile.region_placeholder", en: "Select region", zh: "\u9078\u64C7\u5730\u5340" },
  { key: "profile.validation.username", en: "Username must be at least 3 characters", zh: "\u7528\u6236\u540D\u7A31\u9808\u81F3\u5C113\u500B\u5B57\u5143" },
  { key: "profile.validation.email", en: "Please enter a valid email", zh: "\u8ACB\u8F38\u5165\u6709\u6548\u7684\u96FB\u90F5\u5730\u5740" },
  { key: "profile.validation.phone", en: "Please enter a valid phone number", zh: "\u8ACB\u8F38\u5165\u6709\u6548\u7684\u96FB\u8A71\u865F\u78BC" },
  { key: "profile.success.title", en: "Profile updated successfully!", zh: "\u500B\u4EBA\u8CC7\u6599\u5DF2\u66F4\u65B0\uFF01" },
  { key: "profile.success.desc", en: "Your changes have been saved.", zh: "\u60A8\u7684\u8B8A\u66F4\u5DF2\u5132\u5B58\u3002" },
  { key: "profile.error.title", en: "Update failed", zh: "\u66F4\u65B0\u5931\u6557" },
  { key: "profile.name", en: "Name", zh: "\u59D3\u540D" },
  { key: "profile.name_placeholder", en: "Enter your name", zh: "\u8F38\u5165\u60A8\u7684\u59D3\u540D" },
  // Profile Pet CTA Section
  { key: "profile.pets_cta.title", en: "Your Pets", zh: "\u6BDB\u5B69\u8CC7\u6599" },
  { key: "profile.pets_cta.desc", en: "Save your pet profiles for faster emergency help", zh: "\u9810\u5148\u767B\u8A18\u6BDB\u5B69\u8CC7\u6599\uFF0C\u7DCA\u6025\u6642\u7BC0\u7701\u6642\u9593" },
  { key: "profile.pets_cta.benefit", en: "With saved pet profiles, emergency requests only take 10 seconds!", zh: "\u9810\u5148\u767B\u8A18\u5F8C\uFF0C\u7DCA\u6025\u6C42\u52A9\u50C5\u970010\u79D2\uFF01" },
  { key: "profile.pets_cta.button", en: "Add or Manage Pets", zh: "\u65B0\u589E\u6216\u7BA1\u7406\u6BDB\u5B69" },
  // Pets
  { key: "pets.title", en: "My Pets", zh: "\u6211\u7684\u5BF5\u7269" },
  { key: "pets.desc", en: "Manage your pets for faster emergency requests", zh: "\u7BA1\u7406\u60A8\u7684\u5BF5\u7269\u8CC7\u6599\uFF0C\u4EE5\u4FBF\u5FEB\u901F\u63D0\u4EA4\u7DCA\u6025\u6C42\u52A9" },
  { key: "pets.add", en: "Add Pet", zh: "\u65B0\u589E\u5BF5\u7269" },
  { key: "pets.add_new", en: "Add New Pet", zh: "\u65B0\u589E\u5BF5\u7269" },
  { key: "pets.edit", en: "Edit Pet", zh: "\u7DE8\u8F2F" },
  { key: "pets.delete", en: "Delete Pet", zh: "\u522A\u9664" },
  { key: "pets.delete_confirm", en: "Are you sure you want to remove this pet from your profile? This action cannot be undone.", zh: "\u78BA\u5B9A\u8981\u5F9E\u500B\u4EBA\u8CC7\u6599\u4E2D\u79FB\u9664\u6B64\u5BF5\u7269\u55CE\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002" },
  { key: "pets.name", en: "Name", zh: "\u540D\u7A31" },
  { key: "pets.name_placeholder", en: "Fluffy", zh: "\u5C0F\u767D" },
  { key: "pets.species", en: "Species", zh: "\u7A2E\u985E" },
  { key: "pets.species_placeholder", en: "Dog, Cat, etc.", zh: "\u72D7\u3001\u8C93\u7B49" },
  { key: "pets.breed", en: "Breed", zh: "\u54C1\u7A2E" },
  { key: "pets.breed_placeholder", en: "Golden Retriever", zh: "\u91D1\u6BDB\u5C0B\u56DE\u72AC" },
  { key: "pets.age", en: "Age (years)", zh: "\u5E74\u9F61\uFF08\u6B72\uFF09" },
  { key: "pets.age_placeholder", en: "3", zh: "3" },
  { key: "pets.weight", en: "Weight (kg, Optional)", zh: "\u9AD4\u91CD\uFF08\u516C\u65A4\uFF0C\u9078\u586B\uFF09" },
  { key: "pets.weight_placeholder", en: "10.5", zh: "10.5" },
  { key: "pets.medical_notes", en: "Medical Notes (Optional)", zh: "\u91AB\u7642\u8A18\u9304\uFF08\u9078\u586B\uFF09" },
  { key: "pets.medical_notes_placeholder", en: "Allergies, medications, conditions...", zh: "\u904E\u654F\u3001\u7528\u85E5\u3001\u75C5\u53F2..." },
  { key: "pets.medical_label", en: "Medical:", zh: "\u91AB\u7642\u8A18\u9304\uFF1A" },
  { key: "pets.no_pets", en: "No pets added yet", zh: "\u5C1A\u672A\u65B0\u589E\u5BF5\u7269" },
  { key: "pets.add_first", en: "Add Your First Pet", zh: "\u65B0\u589E\u7B2C\u4E00\u96BB\u5BF5\u7269" },
  { key: "pets.back_to_profile", en: "Back to Profile", zh: "\u8FD4\u56DE\u500B\u4EBA\u8CC7\u6599" },
  { key: "pets.update", en: "Update Pet", zh: "\u66F4\u65B0\u5BF5\u7269\u8CC7\u6599" },
  { key: "pets.saving", en: "Saving...", zh: "\u5132\u5B58\u4E2D..." },
  { key: "pets.age_years", en: "Age: {age} years", zh: "{age} \u6B72" },
  { key: "pets.weight_kg", en: "Weight: {weight} kg", zh: "{weight} \u516C\u65A4" },
  { key: "pets.success.add", en: "Pet added successfully!", zh: "\u5BF5\u7269\u5DF2\u65B0\u589E\uFF01" },
  { key: "pets.success.add_desc", en: "Your pet has been added to your profile.", zh: "\u5BF5\u7269\u5DF2\u52A0\u5165\u60A8\u7684\u500B\u4EBA\u8CC7\u6599\u3002" },
  { key: "pets.success.update", en: "Pet updated successfully!", zh: "\u5BF5\u7269\u8CC7\u6599\u5DF2\u66F4\u65B0\uFF01" },
  { key: "pets.success.update_desc", en: "Your pet's information has been saved.", zh: "\u5BF5\u7269\u8CC7\u6599\u5DF2\u5132\u5B58\u3002" },
  { key: "pets.success.delete", en: "Pet removed", zh: "\u5BF5\u7269\u5DF2\u79FB\u9664" },
  { key: "pets.success.delete_desc", en: "Your pet has been removed from your profile.", zh: "\u5BF5\u7269\u5DF2\u5F9E\u60A8\u7684\u500B\u4EBA\u8CC7\u6599\u4E2D\u79FB\u9664\u3002" },
  { key: "pets.error.load", en: "Failed to load pets", zh: "\u7121\u6CD5\u8F09\u5165\u5BF5\u7269\u8CC7\u6599" },
  { key: "pets.error.add", en: "Failed to add pet", zh: "\u65B0\u589E\u5BF5\u7269\u5931\u6557" },
  { key: "pets.error.update", en: "Failed to update pet", zh: "\u66F4\u65B0\u5BF5\u7269\u8CC7\u6599\u5931\u6557" },
  { key: "pets.error.delete", en: "Failed to remove pet", zh: "\u79FB\u9664\u5BF5\u7269\u5931\u6557" },
  { key: "pets.microchip", en: "Microchip", zh: "\u6676\u7247" },
  { key: "pets.gender", en: "Gender", zh: "\u6027\u5225" },
  { key: "pets.gender.male", en: "Male", zh: "\u516C" },
  { key: "pets.gender.female", en: "Female", zh: "\u6BCD" },
  { key: "pets.neutered", en: "Neutered/Spayed", zh: "\u5DF2\u7D55\u80B2" },
  { key: "pets.color", en: "Coat Color", zh: "\u6BDB\u8272" },
  // Medical Records
  { key: "medical_records.title", en: "Medical Records", zh: "\u75C5\u6B77\u7D00\u9304" },
  { key: "medical_records.desc", en: "Manage your pet's medical documents securely", zh: "\u5B89\u5168\u7BA1\u7406\u6BDB\u5B69\u7684\u75C5\u6B77\u6587\u4EF6" },
  { key: "medical_records.upload", en: "Upload Record", zh: "\u4E0A\u8F09\u7D00\u9304" },
  { key: "medical_records.view", en: "View Record", zh: "\u67E5\u770B\u7D00\u9304" },
  { key: "medical_records.delete", en: "Delete Record", zh: "\u522A\u9664\u7D00\u9304" },
  { key: "medical_records.no_records", en: "No medical records uploaded yet", zh: "\u5C1A\u672A\u4E0A\u8F09\u75C5\u6B77\u7D00\u9304" },
  { key: "medical_records.types.blood_test", en: "Blood Test", zh: "\u9A57\u8840\u5831\u544A" },
  { key: "medical_records.types.xray", en: "X-Ray", zh: "X\u5149\u7247" },
  { key: "medical_records.types.vaccination", en: "Vaccination", zh: "\u75AB\u82D7\u7D00\u9304" },
  { key: "medical_records.types.surgery", en: "Surgery Report", zh: "\u624B\u8853\u5831\u544A" },
  { key: "medical_records.types.prescription", en: "Prescription", zh: "\u8655\u65B9" },
  { key: "medical_records.types.other", en: "Other", zh: "\u5176\u4ED6" },
  { key: "medical_records.sharing_consent", en: "Share in emergencies", zh: "\u7DCA\u6025\u6642\u5206\u4EAB" },
  { key: "medical_records.sharing_consent_desc", en: "Allow hospitals to view this record during emergencies", zh: "\u5141\u8A31\u91AB\u9662\u5728\u7DCA\u6025\u60C5\u6CC1\u4E0B\u67E5\u770B\u6B64\u7D00\u9304" },
  // Common UI Elements
  { key: "common.loading", en: "Loading...", zh: "\u8F09\u5165\u4E2D..." },
  { key: "common.error", en: "An error occurred", zh: "\u767C\u751F\u932F\u8AA4" },
  { key: "common.retry", en: "Retry", zh: "\u91CD\u8A66" },
  { key: "common.years", en: "years", zh: "\u6B72" },
  { key: "common.sending", en: "Sending...", zh: "\u767C\u9001\u4E2D..." },
  { key: "button.back", en: "Back", zh: "\u8FD4\u56DE" },
  { key: "button.back_home", en: "Back to Home", zh: "\u8FD4\u56DE\u4E3B\u9801" },
  { key: "button.cancel", en: "Cancel", zh: "\u53D6\u6D88" },
  { key: "button.confirm", en: "Confirm", zh: "\u78BA\u8A8D" },
  { key: "button.save", en: "Save", zh: "\u5132\u5B58" },
  { key: "button.delete", en: "Delete", zh: "\u522A\u9664" },
  { key: "button.edit", en: "Edit", zh: "\u7DE8\u8F2F" },
  { key: "button.close", en: "Close", zh: "\u95DC\u9589" },
  { key: "loading", en: "Loading...", zh: "\u8F09\u5165\u4E2D..." },
  { key: "loading.profile", en: "Loading profile...", zh: "\u8F09\u5165\u4E2D..." },
  { key: "loading.pets", en: "Loading pets...", zh: "\u8F09\u5165\u4E2D..." },
  { key: "error", en: "Error", zh: "\u932F\u8AA4" },
  { key: "success", en: "Success", zh: "\u6210\u529F" },
  // Broadcast Status
  { key: "broadcast.title", en: "Broadcast Status", zh: "\u5EE3\u64AD\u72C0\u614B" },
  { key: "broadcast.total", en: "Total Sent", zh: "\u7E3D\u5171\u767C\u9001" },
  { key: "broadcast.sent", en: "Successfully Sent", zh: "\u6210\u529F\u767C\u9001" },
  { key: "broadcast.queued", en: "Queued", zh: "\u7B49\u5019\u4E2D" },
  { key: "broadcast.failed", en: "Failed", zh: "\u767C\u9001\u5931\u6557" },
  { key: "broadcast.refresh", en: "Refresh", zh: "\u91CD\u65B0\u6574\u7406" },
  { key: "broadcast.details", en: "Message Details", zh: "\u8A0A\u606F\u8A73\u60C5" },
  { key: "broadcast.retry_attempts", en: "Retry attempts", zh: "\u91CD\u8A66\u6B21\u6578" },
  { key: "broadcast.created", en: "Created", zh: "\u5DF2\u5EFA\u7ACB" },
  { key: "broadcast.sent_at", en: "Sent", zh: "\u5DF2\u767C\u9001" },
  { key: "broadcast.failed_at", en: "Failed", zh: "\u5931\u6557" },
  { key: "broadcast.error", en: "Error", zh: "\u932F\u8AA4" },
  { key: "broadcast.view_content", en: "View Message Content", zh: "\u67E5\u770B\u8A0A\u606F\u5167\u5BB9" },
  // Privacy & Legal Pages
  { key: "privacy.title", en: "Privacy Policy", zh: "\u79C1\u96B1\u653F\u7B56" },
  { key: "privacy.last_updated", en: "Last Updated", zh: "\u6700\u5F8C\u66F4\u65B0" },
  { key: "privacy.intro", en: "PetSOS Limited ('we', 'us', or 'PetSOS') is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information in compliance with Hong Kong Personal Data (Privacy) Ordinance (PDPO) and GDPR.", zh: "PetSOS Limited\uFF08\u300C\u6211\u5011\u300D\uFF09\u81F4\u529B\u4FDD\u8B77\u60A8\u7684\u79C1\u96B1\u3002\u672C\u653F\u7B56\u8AAA\u660E\u6211\u5011\u5982\u4F55\u6536\u96C6\u3001\u4F7F\u7528\u53CA\u4FDD\u8B77\u60A8\u7684\u500B\u4EBA\u8CC7\u6599\uFF0C\u4E26\u7B26\u5408\u9999\u6E2F\u500B\u4EBA\u8CC7\u6599\uFF08\u79C1\u96B1\uFF09\u689D\u4F8B\u53CAGDPR\u3002" },
  { key: "privacy.controller_title", en: "Data Controller", zh: "\u8CC7\u6599\u63A7\u5236\u8005" },
  { key: "privacy.controller_desc", en: "PetSOS Limited acts as the data controller for all personal information collected through this platform. For data protection queries, contact: privacy@petsos.hk", zh: "PetSOS Limited\u70BA\u672C\u5E73\u53F0\u6240\u6536\u96C6\u500B\u4EBA\u8CC7\u6599\u7684\u8CC7\u6599\u63A7\u5236\u8005\u3002\u5982\u6709\u8CC7\u6599\u4FDD\u8B77\u67E5\u8A62\uFF0C\u8ACB\u806F\u7D61\uFF1Aprivacy@petsos.hk" },
  { key: "privacy.data_collection_title", en: "Information We Collect", zh: "\u6211\u5011\u6536\u96C6\u7684\u8CC7\u6599" },
  { key: "privacy.data_collection_desc", en: "We collect: (1) Contact information (name, phone, email); (2) Pet information (name, species, breed, age, weight, medical notes); (3) Location data (GPS coordinates, address); (4) Emergency request details (symptoms, urgency); (5) Technical data (IP address, device information).", zh: "\u6211\u5011\u6536\u96C6\uFF1A(1) \u806F\u7D61\u8CC7\u6599\uFF08\u59D3\u540D\u3001\u96FB\u8A71\u3001\u96FB\u90F5\uFF09\uFF1B(2) \u5BF5\u7269\u8CC7\u6599\uFF08\u540D\u7A31\u3001\u54C1\u7A2E\u3001\u5E74\u9F61\u3001\u9AD4\u91CD\u3001\u75C5\u6B77\uFF09\uFF1B(3) \u4F4D\u7F6E\u8CC7\u6599\uFF08GPS\u5EA7\u6A19\u3001\u5730\u5740\uFF09\uFF1B(4) \u7DCA\u6025\u6C42\u52A9\u8A73\u60C5\uFF08\u75C7\u72C0\u3001\u7DCA\u6025\u7A0B\u5EA6\uFF09\uFF1B(5) \u6280\u8853\u8CC7\u6599\uFF08IP\u5730\u5740\u3001\u88DD\u7F6E\u8CC7\u6599\uFF09\u3002" },
  { key: "privacy.lawful_basis_title", en: "Lawful Basis for Processing", zh: "\u8655\u7406\u8CC7\u6599\u7684\u6CD5\u5F8B\u4F9D\u64DA" },
  { key: "privacy.lawful_basis_desc", en: "We process your data based on: (1) Your consent for emergency broadcasts; (2) Legitimate interests in providing emergency coordination services; (3) Legal obligations for audit and compliance.", zh: "\u6211\u5011\u57FA\u65BC\u4EE5\u4E0B\u7406\u7531\u8655\u7406\u60A8\u7684\u8CC7\u6599\uFF1A(1) \u60A8\u540C\u610F\u9032\u884C\u7DCA\u6025\u5EE3\u64AD\uFF1B(2) \u63D0\u4F9B\u7DCA\u6025\u5354\u8ABF\u670D\u52D9\u7684\u5408\u6CD5\u6B0A\u76CA\uFF1B(3) \u5BE9\u8A08\u53CA\u5408\u898F\u7684\u6CD5\u5F8B\u8CAC\u4EFB\u3002" },
  { key: "privacy.data_usage_title", en: "How We Use Your Information", zh: "\u6211\u5011\u5982\u4F55\u4F7F\u7528\u60A8\u7684\u8CC7\u6599" },
  { key: "privacy.data_usage_desc", en: "Your information is used to: (1) Connect you with veterinary clinics during emergencies; (2) Send emergency alerts via WhatsApp and email; (3) Improve service quality; (4) Comply with legal obligations. We do not sell your data.", zh: "\u60A8\u7684\u8CC7\u6599\u7528\u65BC\uFF1A(1) \u5728\u7DCA\u6025\u60C5\u6CC1\u4E0B\u70BA\u60A8\u806F\u7D61\u7378\u91AB\u8A3A\u6240\uFF1B(2) \u900F\u904EWhatsApp\u53CA\u96FB\u90F5\u767C\u9001\u7DCA\u6025\u8B66\u5831\uFF1B(3) \u6539\u5584\u670D\u52D9\u8CEA\u7D20\uFF1B(4) \u5C65\u884C\u6CD5\u5F8B\u8CAC\u4EFB\u3002\u6211\u5011\u4E0D\u6703\u51FA\u552E\u60A8\u7684\u8CC7\u6599\u3002" },
  { key: "privacy.data_sharing_title", en: "Data Recipients", zh: "\u8CC7\u6599\u63A5\u6536\u8005" },
  { key: "privacy.data_sharing_desc", en: "We share your data with: (1) Veterinary clinics you contact; (2) WhatsApp Business API (Meta) for emergency messaging; (3) Email service providers; (4) Database hosting (Neon). All recipients are bound by data protection agreements.", zh: "\u6211\u5011\u6703\u8207\u4EE5\u4E0B\u5404\u65B9\u5206\u4EAB\u60A8\u7684\u8CC7\u6599\uFF1A(1) \u60A8\u806F\u7D61\u7684\u7378\u91AB\u8A3A\u6240\uFF1B(2) WhatsApp Business API\uFF08Meta\uFF09\u7528\u65BC\u7DCA\u6025\u8A0A\u606F\uFF1B(3) \u96FB\u90F5\u670D\u52D9\u4F9B\u61C9\u5546\uFF1B(4) \u8CC7\u6599\u5EAB\u8A17\u7BA1\uFF08Neon\uFF09\u3002\u6240\u6709\u63A5\u6536\u8005\u5747\u53D7\u8CC7\u6599\u4FDD\u8B77\u5354\u8B70\u7D04\u675F\u3002" },
  { key: "privacy.data_retention_title", en: "Data Retention", zh: "\u8CC7\u6599\u4FDD\u7559" },
  { key: "privacy.data_retention_desc", en: "We retain: (1) Emergency requests for 12 months; (2) Pet profiles until deletion requested; (3) Audit logs for 7 years (legal compliance); (4) User accounts until deletion requested. You may request data deletion at any time.", zh: "\u6211\u5011\u4FDD\u7559\uFF1A(1) \u7DCA\u6025\u6C42\u52A9\u7D00\u930412\u500B\u6708\uFF1B(2) \u5BF5\u7269\u6A94\u6848\u76F4\u81F3\u60A8\u8981\u6C42\u522A\u9664\uFF1B(3) \u5BE9\u8A08\u65E5\u8A8C7\u5E74\uFF08\u6CD5\u5F8B\u5408\u898F\uFF09\uFF1B(4) \u7528\u6236\u5E33\u6236\u76F4\u81F3\u60A8\u8981\u6C42\u522A\u9664\u3002\u60A8\u53EF\u96A8\u6642\u8981\u6C42\u522A\u9664\u8CC7\u6599\u3002" },
  { key: "privacy.international_title", en: "International Data Transfers", zh: "\u8DE8\u5883\u8CC7\u6599\u8F49\u79FB" },
  { key: "privacy.international_desc", en: "Your data may be transferred to service providers outside Hong Kong (e.g., Neon - USA, Meta - USA). We ensure adequate safeguards through Standard Contractual Clauses and certified providers.", zh: "\u60A8\u7684\u8CC7\u6599\u53EF\u80FD\u8F49\u79FB\u81F3\u9999\u6E2F\u4EE5\u5916\u7684\u670D\u52D9\u4F9B\u61C9\u5546\uFF08\u5982Neon - \u7F8E\u570B\u3001Meta - \u7F8E\u570B\uFF09\u3002\u6211\u5011\u900F\u904E\u6A19\u6E96\u5408\u7D04\u689D\u6B3E\u53CA\u8A8D\u8B49\u4F9B\u61C9\u5546\u78BA\u4FDD\u8DB3\u5920\u4FDD\u969C\u3002" },
  { key: "privacy.security_title", en: "Security Measures", zh: "\u4FDD\u5B89\u63AA\u65BD" },
  { key: "privacy.security_desc", en: "We implement: (1) Encryption at rest and in transit (TLS/SSL); (2) Access controls and authentication; (3) Regular security audits; (4) Secure credential management.", zh: "\u6211\u5011\u5BE6\u65BD\uFF1A(1) \u975C\u614B\u53CA\u50B3\u8F38\u52A0\u5BC6\uFF08TLS/SSL\uFF09\uFF1B(2) \u5B58\u53D6\u63A7\u5236\u53CA\u8A8D\u8B49\uFF1B(3) \u5B9A\u671F\u4FDD\u5B89\u5BE9\u8A08\uFF1B(4) \u5B89\u5168\u6191\u8B49\u7BA1\u7406\u3002" },
  { key: "privacy.your_rights_title", en: "Your Rights", zh: "\u60A8\u7684\u6B0A\u5229" },
  { key: "privacy.your_rights_desc", en: "Under PDPO and GDPR, you have the right to: (1) Access your personal data; (2) Export your data (data portability); (3) Correct inaccurate data; (4) Delete your data (right to erasure); (5) Withdraw consent; (6) Lodge a complaint with the Privacy Commissioner.", zh: "\u6839\u64DAPDPO\u53CAGDPR\uFF0C\u60A8\u6709\u6B0A\uFF1A(1) \u67E5\u95B1\u60A8\u7684\u500B\u4EBA\u8CC7\u6599\uFF1B(2) \u532F\u51FA\u60A8\u7684\u8CC7\u6599\uFF08\u8CC7\u6599\u53EF\u651C\u6027\uFF09\uFF1B(3) \u66F4\u6B63\u4E0D\u6E96\u78BA\u8CC7\u6599\uFF1B(4) \u522A\u9664\u60A8\u7684\u8CC7\u6599\uFF08\u522A\u9664\u6B0A\uFF09\uFF1B(5) \u64A4\u56DE\u540C\u610F\uFF1B(6) \u5411\u79C1\u96B1\u5C08\u54E1\u516C\u7F72\u6295\u8A34\u3002" },
  { key: "privacy.complaints_title", en: "Complaints", zh: "\u6295\u8A34" },
  { key: "privacy.complaints_desc", en: "To lodge a complaint: (1) Contact us at privacy@petsos.hk; (2) Contact Hong Kong Privacy Commissioner: enquiry@pcpd.org.hk; (3) For EU residents: Contact your local supervisory authority.", zh: "\u5982\u9700\u6295\u8A34\uFF1A(1) \u806F\u7D61\u6211\u5011\uFF1Aprivacy@petsos.hk\uFF1B(2) \u806F\u7D61\u9999\u6E2F\u79C1\u96B1\u5C08\u54E1\u516C\u7F72\uFF1Aenquiry@pcpd.org.hk\uFF1B(3) \u6B50\u76DF\u5C45\u6C11\uFF1A\u806F\u7D61\u7576\u5730\u76E3\u7BA1\u6A5F\u69CB\u3002" },
  { key: "privacy.contact_title", en: "Contact Us", zh: "\u806F\u7D61\u6211\u5011" },
  { key: "privacy.contact_desc", en: "For privacy concerns or to exercise your rights: Email: privacy@petsos.hk | Data Protection Officer: dpo@petsos.hk", zh: "\u5982\u6709\u79C1\u96B1\u7591\u616E\u6216\u884C\u4F7F\u60A8\u7684\u6B0A\u5229\uFF1A\u96FB\u90F5\uFF1Aprivacy@petsos.hk | \u8CC7\u6599\u4FDD\u8B77\u4E3B\u4EFB\uFF1Adpo@petsos.hk" },
  { key: "terms.title", en: "Terms of Service", zh: "\u670D\u52D9\u689D\u6B3E" },
  { key: "terms.last_updated", en: "Last Updated", zh: "\u6700\u5F8C\u66F4\u65B0" },
  { key: "terms.intro", en: "These Terms of Service ('Terms') govern your use of PetSOS. By accessing or using our platform, you agree to be bound by these Terms. If you do not agree, please do not use our services.", zh: "\u672C\u670D\u52D9\u689D\u6B3E\uFF08\u300C\u689D\u6B3E\u300D\uFF09\u898F\u7BA1\u60A8\u4F7F\u7528PetSOS\u3002\u5B58\u53D6\u6216\u4F7F\u7528\u6211\u5011\u7684\u5E73\u53F0\u5373\u8868\u793A\u60A8\u540C\u610F\u53D7\u672C\u689D\u6B3E\u7D04\u675F\u3002\u5982\u60A8\u4E0D\u540C\u610F\uFF0C\u8ACB\u52FF\u4F7F\u7528\u6211\u5011\u7684\u670D\u52D9\u3002" },
  { key: "terms.acceptance_title", en: "Acceptance of Terms", zh: "\u63A5\u53D7\u689D\u6B3E" },
  { key: "terms.acceptance_desc", en: "By creating an account or using PetSOS services, you acknowledge that you have read, understood, and agree to these Terms and our Privacy Policy. Your continued use constitutes ongoing acceptance.", zh: "\u5EFA\u7ACB\u5E33\u6236\u6216\u4F7F\u7528PetSOS\u670D\u52D9\u5373\u8868\u793A\u60A8\u78BA\u8A8D\u5DF2\u95B1\u8B80\u3001\u7406\u89E3\u4E26\u540C\u610F\u672C\u689D\u6B3E\u53CA\u6211\u5011\u7684\u79C1\u96B1\u653F\u7B56\u3002\u7E7C\u7E8C\u4F7F\u7528\u5373\u8868\u793A\u6301\u7E8C\u63A5\u53D7\u3002" },
  { key: "terms.service_description_title", en: "Service Description", zh: "\u670D\u52D9\u63CF\u8FF0" },
  { key: "terms.service_description_desc", en: "PetSOS is an emergency coordination platform that connects pet owners with veterinary clinics. We facilitate communication but do not provide medical services, veterinary advice, or emergency medical care.", zh: "PetSOS\u662F\u4E00\u500B\u9023\u63A5\u5BF5\u7269\u4E3B\u4EBA\u8207\u7378\u91AB\u8A3A\u6240\u7684\u7DCA\u6025\u5354\u8ABF\u5E73\u53F0\u3002\u6211\u5011\u4FC3\u9032\u6E9D\u901A\uFF0C\u4F46\u4E0D\u63D0\u4F9B\u91AB\u7642\u670D\u52D9\u3001\u7378\u91AB\u610F\u898B\u6216\u7DCA\u6025\u91AB\u7642\u8B77\u7406\u3002" },
  { key: "terms.user_responsibilities_title", en: "User Responsibilities", zh: "\u7528\u6236\u8CAC\u4EFB" },
  { key: "terms.user_responsibilities_desc", en: "You agree to: (1) Provide accurate emergency information; (2) Use the service only for genuine pet emergencies; (3) Respect clinic operating hours; (4) Not misuse the broadcast system. Violations may result in account suspension or termination.", zh: "\u60A8\u540C\u610F\uFF1A(1) \u63D0\u4F9B\u6E96\u78BA\u7684\u7DCA\u6025\u8CC7\u6599\uFF1B(2) \u50C5\u5728\u771F\u6B63\u7684\u5BF5\u7269\u7DCA\u6025\u60C5\u6CC1\u4E0B\u4F7F\u7528\u670D\u52D9\uFF1B(3) \u5C0A\u91CD\u8A3A\u6240\u71DF\u696D\u6642\u9593\uFF1B(4) \u4E0D\u6FEB\u7528\u5EE3\u64AD\u7CFB\u7D71\u3002\u9055\u898F\u53EF\u80FD\u5C0E\u81F4\u5E33\u6236\u66AB\u505C\u6216\u7D42\u6B62\u3002" },
  { key: "terms.disclaimer_title", en: "Medical Disclaimer", zh: "\u91AB\u7642\u514D\u8CAC\u8072\u660E" },
  { key: "terms.disclaimer_desc", en: "PetSOS does not provide medical advice. We do not guarantee clinic availability, response times, or treatment outcomes. In life-threatening situations, contact emergency veterinary services immediately.", zh: "PetSOS\u4E0D\u63D0\u4F9B\u91AB\u7642\u610F\u898B\u3002\u6211\u5011\u4E0D\u4FDD\u8B49\u8A3A\u6240\u7684\u63A5\u8A3A\u60C5\u6CC1\u3001\u56DE\u61C9\u6642\u9593\u6216\u6CBB\u7642\u7D50\u679C\u3002\u5728\u5371\u53CA\u751F\u547D\u7684\u60C5\u6CC1\u4E0B\uFF0C\u8ACB\u7ACB\u5373\u806F\u7D61\u7DCA\u6025\u7378\u91AB\u670D\u52D9\u3002" },
  { key: "terms.limitation_title", en: "Limitation of Liability", zh: "\u8CAC\u4EFB\u9650\u5236" },
  { key: "terms.limitation_desc", en: "To the maximum extent permitted by law, PetSOS is not liable for: (1) Direct, indirect, or consequential damages; (2) Loss of data or business; (3) Clinic actions or inactions; (4) Service interruptions. Maximum liability is limited to HKD 100.", zh: "\u5728\u6CD5\u5F8B\u5141\u8A31\u7684\u6700\u5927\u7BC4\u570D\u5167\uFF0CPetSOS\u4E0D\u5C0D\u4EE5\u4E0B\u60C5\u6CC1\u8CA0\u8CAC\uFF1A(1) \u76F4\u63A5\u3001\u9593\u63A5\u6216\u76F8\u61C9\u640D\u5931\uFF1B(2) \u8CC7\u6599\u6216\u696D\u52D9\u640D\u5931\uFF1B(3) \u8A3A\u6240\u7684\u884C\u70BA\u6216\u4E0D\u884C\u70BA\uFF1B(4) \u670D\u52D9\u4E2D\u65B7\u3002\u6700\u9AD8\u8CAC\u4EFB\u9650\u65BC\u6E2F\u5E63100\u5143\u3002" },
  { key: "terms.governing_law_title", en: "Governing Law & Jurisdiction", zh: "\u9069\u7528\u6CD5\u5F8B\u53CA\u53F8\u6CD5\u7BA1\u8F44\u6B0A" },
  { key: "terms.governing_law_desc", en: "These Terms are governed by Hong Kong law. Any disputes shall be resolved exclusively in Hong Kong courts.", zh: "\u672C\u689D\u6B3E\u53D7\u9999\u6E2F\u6CD5\u5F8B\u7BA1\u8F44\u3002\u4EFB\u4F55\u722D\u8B70\u61C9\u5728\u9999\u6E2F\u6CD5\u9662\u5C08\u5C6C\u89E3\u6C7A\u3002" },
  { key: "terms.eu_rights_title", en: "EU Consumer Rights", zh: "\u6B50\u76DF\u6D88\u8CBB\u8005\u6B0A\u5229" },
  { key: "terms.eu_rights_desc", en: "For residents of the European Union, nothing in these Terms affects your statutory consumer rights under EU law, including the right to withdraw from contracts and remedies for defective services.", zh: "\u5C0D\u65BC\u6B50\u76DF\u5C45\u6C11\uFF0C\u672C\u689D\u6B3E\u5167\u5BB9\u4E0D\u5F71\u97FF\u60A8\u5728\u6B50\u76DF\u6CD5\u5F8B\u4E0B\u7684\u6CD5\u5B9A\u6D88\u8CBB\u8005\u6B0A\u5229\uFF0C\u5305\u62EC\u64A4\u56DE\u5408\u7D04\u7684\u6B0A\u5229\u53CA\u5C0D\u6709\u7F3A\u9677\u670D\u52D9\u7684\u88DC\u6551\u63AA\u65BD\u3002" },
  { key: "terms.privacy_policy_title", en: "Privacy Policy", zh: "\u79C1\u96B1\u653F\u7B56" },
  { key: "terms.privacy_policy_desc", en: "Your use of PetSOS is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.", zh: "\u60A8\u4F7F\u7528PetSOS\u4EA6\u53D7\u6211\u5011\u7684\u79C1\u96B1\u653F\u7B56\u7BA1\u8F44\u3002\u8ACB\u67E5\u95B1\u6211\u5011\u7684\u79C1\u96B1\u653F\u7B56\uFF0C\u4E86\u89E3\u6211\u5011\u5982\u4F55\u6536\u96C6\u3001\u4F7F\u7528\u53CA\u4FDD\u8B77\u60A8\u7684\u500B\u4EBA\u8CC7\u6599\u3002" },
  { key: "terms.termination_title", en: "Service Modification & Termination", zh: "\u670D\u52D9\u4FEE\u6539\u53CA\u7D42\u6B62" },
  { key: "terms.termination_desc", en: "We reserve the right to: (1) Modify or discontinue services at any time; (2) Terminate accounts for violations; (3) Update these Terms with notice. We will provide 30 days notice for material changes.", zh: "\u6211\u5011\u4FDD\u7559\u4EE5\u4E0B\u6B0A\u5229\uFF1A(1) \u96A8\u6642\u4FEE\u6539\u6216\u7D42\u6B62\u670D\u52D9\uFF1B(2) \u56E0\u9055\u898F\u7D42\u6B62\u5E33\u6236\uFF1B(3) \u5728\u901A\u77E5\u5F8C\u66F4\u65B0\u672C\u689D\u6B3E\u3002\u91CD\u5927\u8B8A\u66F4\u5C07\u63D0\u524D30\u5929\u901A\u77E5\u3002" },
  { key: "terms.changes_title", en: "Changes to Terms", zh: "\u689D\u6B3E\u8B8A\u66F4" },
  { key: "terms.changes_desc", en: "We may update these Terms periodically. We will notify you of material changes via email or platform notice. Continued use after changes constitutes acceptance. Last updated: October 2025.", zh: "\u6211\u5011\u53EF\u80FD\u5B9A\u671F\u66F4\u65B0\u672C\u689D\u6B3E\u3002\u6211\u5011\u6703\u900F\u904E\u96FB\u90F5\u6216\u5E73\u53F0\u901A\u77E5\u91CD\u5927\u8B8A\u66F4\u3002\u8B8A\u66F4\u5F8C\u7E7C\u7E8C\u4F7F\u7528\u5373\u8868\u793A\u63A5\u53D7\u3002\u6700\u5F8C\u66F4\u65B0\uFF1A2025\u5E7410\u6708\u3002" },
  { key: "footer.privacy", en: "Privacy Policy", zh: "\u79C1\u96B1\u653F\u7B56" },
  { key: "footer.terms", en: "Terms of Service", zh: "\u670D\u52D9\u689D\u6B3E" },
  { key: "footer.contact", en: "Contact", zh: "\u806F\u7D61\u6211\u5011" },
  { key: "footer.rights", en: "\xA9 2025 PetSOS. All rights reserved.", zh: "\xA9 2025 PetSOS. \u7248\u6B0A\u6240\u6709\u3002" },
  // Hospitals/Clinics 24-hour
  { key: "hospitals.title", en: "24-Hour Animal Hospitals", zh: "24\u5C0F\u6642\u52D5\u7269\u91AB\u9662" },
  { key: "hospitals.subtitle", en: "Find emergency veterinary care near you", zh: "\u5C0B\u627E\u9644\u8FD1\u7684\u7DCA\u6025\u7378\u91AB\u670D\u52D9" },
  // FAQ
  { key: "faq.title", en: "Frequently Asked Questions", zh: "\u5E38\u898B\u554F\u984C" },
  { key: "faq.subtitle", en: "Get help with PetSOS", zh: "PetSOS\u4F7F\u7528\u6307\u5357" },
  // Navigation
  { key: "nav.home", en: "Home", zh: "\u4E3B\u9801" },
  { key: "nav.hospitals", en: "Hospitals", zh: "\u91AB\u9662" },
  { key: "nav.emergency", en: "Emergency", zh: "\u7DCA\u6025\u6C42\u52A9" },
  { key: "nav.profile", en: "Profile", zh: "\u500B\u4EBA\u8CC7\u6599" },
  { key: "nav.login", en: "Login", zh: "\u767B\u5165" },
  { key: "nav.logout", en: "Logout", zh: "\u767B\u51FA" },
  // Auth
  { key: "auth.login", en: "Log In", zh: "\u767B\u5165" },
  { key: "auth.signup", en: "Sign Up", zh: "\u8A3B\u518A" },
  { key: "auth.logout", en: "Log Out", zh: "\u767B\u51FA" },
  { key: "auth.google", en: "Continue with Google", zh: "\u4F7F\u7528Google\u767B\u5165" },
  { key: "auth.email", en: "Email", zh: "\u96FB\u90F5" },
  { key: "auth.password", en: "Password", zh: "\u5BC6\u78BC" },
  { key: "auth.name", en: "Name", zh: "\u59D3\u540D" },
  { key: "auth.phone", en: "Phone", zh: "\u96FB\u8A71" },
  { key: "auth.or", en: "or", zh: "\u6216" },
  { key: "auth.no_account", en: "Don't have an account?", zh: "\u9084\u6C92\u6709\u5E33\u6236\uFF1F" },
  { key: "auth.has_account", en: "Already have an account?", zh: "\u5DF2\u6709\u5E33\u6236\uFF1F" }
];
async function seedTranslations() {
  console.log("\u{1F331} Seeding translations...");
  let created = 0;
  let updated = 0;
  let skipped = 0;
  for (const translation of translationData) {
    try {
      const existingEn = await storage.getTranslation(translation.key, "en");
      if (existingEn) {
        if (existingEn.value !== translation.en) {
          await storage.updateTranslation(existingEn.id, {
            key: translation.key,
            language: "en",
            value: translation.en
          });
          updated++;
        } else {
          skipped++;
        }
      } else {
        await storage.createTranslation({
          key: translation.key,
          language: "en",
          value: translation.en
        });
        created++;
      }
      const existingZh = await storage.getTranslation(translation.key, "zh-HK");
      if (existingZh) {
        if (existingZh.value !== translation.zh) {
          await storage.updateTranslation(existingZh.id, {
            key: translation.key,
            language: "zh-HK",
            value: translation.zh
          });
          updated++;
        } else {
          skipped++;
        }
      } else {
        await storage.createTranslation({
          key: translation.key,
          language: "zh-HK",
          value: translation.zh
        });
        created++;
      }
    } catch (error) {
      console.error(`Error seeding translation for key "${translation.key}":`, error);
    }
  }
  console.log(`\u2705 Translation seeding complete!`);
  console.log(`   - Created: ${created} translations`);
  console.log(`   - Updated: ${updated} translations`);
  console.log(`   - Skipped: ${skipped} unchanged`);
  console.log(`   - Total keys: ${translationData.length}`);
  return { created, updated, skipped };
}
async function ensureTranslationsExist() {
  try {
    const existingTranslations = await storage.getTranslationsByLanguage("zh-HK");
    if (existingTranslations.length === 0) {
      console.log("\u{1F4DD} No translations found, seeding...");
      await seedTranslations();
    } else {
      console.log(`\u2705 Found ${existingTranslations.length} translations`);
    }
  } catch (error) {
    console.error("Error checking translations:", error);
  }
}
if (process.env.RUN_TRANSLATION_SEED === "true") {
  console.log("\u{1F4DD} Running translation seed via RUN_TRANSLATION_SEED=true");
  seedTranslations().then(() => process.exit(0)).catch((error) => {
    console.error("\u274C Error seeding translations:", error);
    process.exit(1);
  });
}

// server/seed-countries.ts
var countriesData = [
  { code: "HK", nameEn: "Hong Kong", nameZh: "\u9999\u6E2F", phonePrefix: "+852", flag: "\u{1F1ED}\u{1F1F0}", active: true, sortOrder: 1, region: "asia" },
  { code: "CN", nameEn: "China", nameZh: "\u4E2D\u570B", phonePrefix: "+86", flag: "\u{1F1E8}\u{1F1F3}", active: true, sortOrder: 2, region: "asia" },
  { code: "TW", nameEn: "Taiwan", nameZh: "\u53F0\u7063", phonePrefix: "+886", flag: "\u{1F1F9}\u{1F1FC}", active: true, sortOrder: 3, region: "asia" },
  { code: "SG", nameEn: "Singapore", nameZh: "\u65B0\u52A0\u5761", phonePrefix: "+65", flag: "\u{1F1F8}\u{1F1EC}", active: true, sortOrder: 4, region: "asia" },
  { code: "JP", nameEn: "Japan", nameZh: "\u65E5\u672C", phonePrefix: "+81", flag: "\u{1F1EF}\u{1F1F5}", active: true, sortOrder: 5, region: "asia" },
  { code: "KR", nameEn: "South Korea", nameZh: "\u97D3\u570B", phonePrefix: "+82", flag: "\u{1F1F0}\u{1F1F7}", active: true, sortOrder: 6, region: "asia" },
  { code: "US", nameEn: "United States", nameZh: "\u7F8E\u570B", phonePrefix: "+1", flag: "\u{1F1FA}\u{1F1F8}", active: true, sortOrder: 7, region: "americas" },
  { code: "GB", nameEn: "United Kingdom", nameZh: "\u82F1\u570B", phonePrefix: "+44", flag: "\u{1F1EC}\u{1F1E7}", active: true, sortOrder: 8, region: "europe" },
  { code: "CA", nameEn: "Canada", nameZh: "\u52A0\u62FF\u5927", phonePrefix: "+1", flag: "\u{1F1E8}\u{1F1E6}", active: true, sortOrder: 9, region: "americas" },
  { code: "AU", nameEn: "Australia", nameZh: "\u6FB3\u6D32", phonePrefix: "+61", flag: "\u{1F1E6}\u{1F1FA}", active: true, sortOrder: 10, region: "oceania" }
];
async function seedCountries() {
  console.log("\u{1F30D} Seeding countries...");
  let created = 0;
  let skipped = 0;
  for (const country of countriesData) {
    try {
      const existing = await storage.getCountryByCode(country.code);
      if (existing) {
        skipped++;
      } else {
        await storage.createCountry(country);
        created++;
      }
    } catch (error) {
      console.error(`Error seeding country "${country.code}":`, error);
    }
  }
  console.log(`\u2705 Country seeding complete!`);
  console.log(`   - Created: ${created} countries`);
  console.log(`   - Skipped: ${skipped} existing`);
  return { created, skipped };
}
async function ensureCountriesExist() {
  try {
    const existingCountries = await storage.getAllCountries();
    if (existingCountries.length === 0) {
      console.log("\u{1F30D} No countries found, seeding...");
      await seedCountries();
    } else {
      console.log(`\u2705 Found ${existingCountries.length} countries`);
    }
  } catch (error) {
    console.error("Error checking countries:", error);
  }
}
if (process.env.RUN_COUNTRY_SEED === "true") {
  console.log("\u{1F30D} Running country seed via RUN_COUNTRY_SEED=true");
  seedCountries().then(() => process.exit(0)).catch((error) => {
    console.error("\u274C Error seeding countries:", error);
    process.exit(1);
  });
}

// server/index.ts
init_daily_report();
import fs2 from "fs";
import path4 from "path";
var app = express2();
var isReady = false;
var startTime = Date.now();
app.get("/livez", (_req, res) => {
  res.status(200).json({
    status: "alive",
    uptime: Math.floor((Date.now() - startTime) / 1e3)
  });
});
app.get("/readyz", (_req, res) => {
  if (isReady) {
    res.status(200).json({
      status: "ready",
      uptime: Math.floor((Date.now() - startTime) / 1e3)
    });
  } else {
    res.status(503).json({
      status: "initializing",
      uptime: Math.floor((Date.now() - startTime) / 1e3)
    });
  }
});
initSentry();
setupSentryMiddleware(app);
app.set("trust proxy", true);
app.use(compression({
  level: 6,
  // Balanced compression level (1-9, 6 is default)
  threshold: 1024,
  // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
var BUILD_VERSION = process.env.RENDER_GIT_COMMIT || Date.now().toString();
app.use((req, res, next) => {
  const reqPath = req.path;
  const isHashedAsset = reqPath.startsWith("/assets/") && /[-\.][A-Za-z0-9]{8,}\.(js|css|woff2?|ttf|eot)$/i.test(reqPath);
  const isSpaRoute = !reqPath.startsWith("/api") && !reqPath.startsWith("/assets/") && !reqPath.match(/\.[a-zA-Z0-9]+$/);
  if (isHashedAsset) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else if (reqPath === "/" || reqPath.endsWith(".html") || isSpaRoute) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("X-Build-Version", BUILD_VERSION);
  } else if (reqPath.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
    res.setHeader("Cache-Control", "public, max-age=604800");
  } else if (reqPath.match(/\.(js|css)$/i)) {
    res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
  }
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  ensureTranslationsExist().then(() => log("[Startup] Translations seeded successfully")).catch((err) => log(`[Startup] Translation seeding error (non-critical): ${err.message}`));
  ensureCountriesExist().then(() => log("[Startup] Countries seeded successfully")).catch((err) => log(`[Startup] Country seeding error (non-critical): ${err.message}`));
  const server = await registerRoutes(app);
  setupSentryErrorHandler(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  if (config.isDevelopment) {
    await setupVite(app, server);
  } else {
    app.use((req, res, next) => {
      if (req.path === "/" || req.path.endsWith(".html")) {
        const distPath = path4.resolve(import.meta.dirname, "public");
        const indexPath = path4.resolve(distPath, "index.html");
        fs2.readFile(indexPath, "utf-8", (err, html) => {
          if (err) {
            next();
            return;
          }
          const versionedHtml = html.replace(
            /<script([^>]*)\ssrc="([^"?]+\.js)"/g,
            `<script$1 src="$2?v=${BUILD_VERSION}"`
          ).replace(
            /<link([^>]*)\shref="([^"?]+\.css)"/g,
            `<link$1 href="$2?v=${BUILD_VERSION}"`
          );
          res.setHeader("Content-Type", "text/html");
          res.send(versionedHtml);
        });
      } else {
        next();
      }
    });
    serveStatic(app);
  }
  server.listen({
    port: config.port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${config.port}`);
    isReady = true;
    const startupTime = Date.now() - startTime;
    log(`[Startup] Server ready in ${startupTime}ms`);
    setTimeout(() => {
      startNotificationScheduler();
      log("[Startup] Notification scheduler started (deferred)");
      startTyphoonNotificationScheduler();
      log("[Startup] Typhoon notification queue scheduler started (every 30 seconds)");
      startTyphoonPolling();
      log("[Startup] Typhoon polling started (every 5 minutes)");
      startHospitalPingScheduler();
      log("[Startup] Hospital ping scheduler started (hourly ping + no-reply check)");
      startDailyReportScheduler();
      log("[Startup] Daily report scheduler started (fires at 08:00 HKT)");
    }, 2e3);
  });
})();
