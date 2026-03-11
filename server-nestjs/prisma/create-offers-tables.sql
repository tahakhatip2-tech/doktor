-- =============================================
-- نظام العروض - Offers & Likes Tables
-- الصق هذا في Supabase SQL Editor وشغّله
-- =============================================

-- إنشاء جدول العروض
CREATE TABLE IF NOT EXISTS "Offer" (
    "id"          SERIAL PRIMARY KEY,
    "userId"      INTEGER NOT NULL REFERENCES "User"("id"),
    "title"       TEXT NOT NULL,
    "content"     TEXT NOT NULL,
    "image"       TEXT,
    "isPermanent" BOOLEAN NOT NULL DEFAULT true,
    "startDate"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate"     TIMESTAMP(3),
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول الإعجابات
CREATE TABLE IF NOT EXISTS "OfferLike" (
    "id"        SERIAL PRIMARY KEY,
    "offerId"   INTEGER NOT NULL REFERENCES "Offer"("id") ON DELETE CASCADE,
    "patientId" INTEGER REFERENCES "Patient"("id"),
    "userId"    INTEGER REFERENCES "User"("id"),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("offerId", "patientId"),
    UNIQUE ("offerId", "userId")
);

-- رسالة نجاح
SELECT 'تم إنشاء جداول العروض بنجاح ✅' AS status;
