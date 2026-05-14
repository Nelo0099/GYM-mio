-- Migration script to add new tables for workout routines and Face ID system
-- Run this in Neon SQL Editor to apply all schema changes

-- Add restTime and notes columns to Exercise table if they don't exist
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "restTime" INTEGER;
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Create UserProfile table
CREATE TABLE IF NOT EXISTS "UserProfile" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT UNIQUE NOT NULL,
    level TEXT DEFAULT 'beginner',
    goals TEXT[] DEFAULT '{}',
    "availableDays" INTEGER DEFAULT 5,
    "sessionDuration" INTEGER DEFAULT 60,
    equipment TEXT[] DEFAULT '{bodyweight}',
    "restDays" INTEGER[] DEFAULT '{0,6}',
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for UserProfile
ALTER TABLE "UserProfile" DROP CONSTRAINT IF EXISTS "UserProfile_userId_fkey";
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;

-- Create WeeklyRoutine table
CREATE TABLE IF NOT EXISTS "WeeklyRoutine" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    "isActive" BOOLEAN DEFAULT true,
    type TEXT DEFAULT 'custom',
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for WeeklyRoutine
ALTER TABLE "WeeklyRoutine" DROP CONSTRAINT IF EXISTS "WeeklyRoutine_userId_fkey";
ALTER TABLE "WeeklyRoutine" ADD CONSTRAINT "WeeklyRoutine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;

-- Create DailyRoutine table
CREATE TABLE IF NOT EXISTS "DailyRoutine" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "weeklyRoutineId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    name TEXT NOT NULL,
    duration INTEGER,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for DailyRoutine
ALTER TABLE "DailyRoutine" DROP CONSTRAINT IF EXISTS "DailyRoutine_weeklyRoutineId_fkey";
ALTER TABLE "DailyRoutine" ADD CONSTRAINT "DailyRoutine_weeklyRoutineId_fkey" FOREIGN KEY ("weeklyRoutineId") REFERENCES "WeeklyRoutine"(id) ON DELETE CASCADE;

-- Create DailyExercise table
CREATE TABLE IF NOT EXISTS "DailyExercise" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "dailyRoutineId" TEXT NOT NULL,
    name TEXT NOT NULL,
    sets INTEGER,
    reps INTEGER,
    weight REAL,
    "restTime" INTEGER,
    notes TEXT,
    "order" INTEGER DEFAULT 0
);

-- Add foreign key constraint for DailyExercise
ALTER TABLE "DailyExercise" DROP CONSTRAINT IF EXISTS "DailyExercise_dailyRoutineId_fkey";
ALTER TABLE "DailyExercise" ADD CONSTRAINT "DailyExercise_dailyRoutineId_fkey" FOREIGN KEY ("dailyRoutineId") REFERENCES "DailyRoutine"(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "UserProfile_userId_idx" ON "UserProfile"("userId");
CREATE INDEX IF NOT EXISTS "WeeklyRoutine_userId_idx" ON "WeeklyRoutine"("userId");
CREATE INDEX IF NOT EXISTS "DailyRoutine_weeklyRoutineId_idx" ON "DailyRoutine"("weeklyRoutineId");
CREATE INDEX IF NOT EXISTS "DailyExercise_dailyRoutineId_idx" ON "DailyExercise"("dailyRoutineId");

-- Add FaceID related tables (if needed for future ML implementation)
-- These tables are optional and can be created later if needed for advanced face recognition

-- Uncomment these if you want to add FaceID tables for advanced ML processing:
-- CREATE TABLE IF NOT EXISTS "FaceDescriptor" (
--     id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
--     "userId" TEXT NOT NULL,
--     descriptor REAL[],
--     "imagePath" TEXT,
--     "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
-- );
--
-- ALTER TABLE "FaceDescriptor" DROP CONSTRAINT IF EXISTS "FaceDescriptor_userId_fkey";
-- ALTER TABLE "FaceDescriptor" ADD CONSTRAINT "FaceDescriptor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;
--
-- CREATE INDEX IF NOT EXISTS "FaceDescriptor_userId_idx" ON "FaceDescriptor"("userId");

COMMIT;