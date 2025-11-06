-- Create course_enrollments table to store student registration data
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  profession TEXT,
  stripe_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'paid',
  amount_paid INTEGER NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on email for faster lookups
CREATE INDEX idx_course_enrollments_email ON public.course_enrollments(email);

-- Create index on stripe_session_id for faster lookups
CREATE INDEX idx_course_enrollments_stripe_session_id ON public.course_enrollments(stripe_session_id);

-- Create index on enrolled_at for date filtering
CREATE INDEX idx_course_enrollments_enrolled_at ON public.course_enrollments(enrolled_at DESC);

-- Enable Row Level Security
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can insert (needed for edge function)
CREATE POLICY "Allow insert for edge function" 
ON public.course_enrollments 
FOR INSERT 
WITH CHECK (true);

-- Create policy: Only authenticated users can view all enrollments (for admin)
CREATE POLICY "Allow read for authenticated users" 
ON public.course_enrollments 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Add comment to table
COMMENT ON TABLE public.course_enrollments IS 'Stores course enrollment data from successful payments';