-- Add stripe_payment_intent_id column to course_enrollments table
-- This column will store the PaymentIntent ID for card payments
-- It will be NULL for PayPal payments (which use stripe_session_id)
ALTER TABLE course_enrollments 
ADD COLUMN stripe_payment_intent_id TEXT NULL;