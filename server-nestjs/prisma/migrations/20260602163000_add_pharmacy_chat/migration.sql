-- Add PHARMACY to InternalSenderType enum so pharmacy users can send messages
ALTER TYPE "InternalSenderType" ADD VALUE IF NOT EXISTS 'PHARMACY';
