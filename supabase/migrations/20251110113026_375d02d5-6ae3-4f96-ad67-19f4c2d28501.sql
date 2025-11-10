-- Add email_sent_at column to track when confirmation email was sent
ALTER TABLE public.course_enrollments 
ADD COLUMN email_sent_at TIMESTAMP WITH TIME ZONE NULL;

-- Add index for faster queries when checking if email was sent
CREATE INDEX idx_course_enrollments_email_sent 
ON public.course_enrollments(stripe_payment_intent_id, stripe_session_id, email_sent_at) 
WHERE email_sent_at IS NOT NULL;

COMMENT ON COLUMN public.course_enrollments.email_sent_at IS 'Timestamp when the confirmation email was successfully sent to the customer';