-- Create billing_details table for invoice/P.IVA data
CREATE TABLE public.billing_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  vat_number TEXT NOT NULL,
  fiscal_code TEXT,
  sdi_or_pec TEXT NOT NULL,
  billing_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS - lock down: only service role can read/write (same model as course_enrollments)
ALTER TABLE public.billing_details ENABLE ROW LEVEL SECURITY;

-- No public policies: only service-role (edge functions) may access this PII.
-- Indexes for lookups from edge functions
CREATE INDEX idx_billing_details_enrollment_id ON public.billing_details(enrollment_id);
CREATE INDEX idx_billing_details_payment_intent ON public.billing_details(stripe_payment_intent_id);
CREATE INDEX idx_billing_details_session ON public.billing_details(stripe_session_id);
CREATE INDEX idx_billing_details_email ON public.billing_details(email);