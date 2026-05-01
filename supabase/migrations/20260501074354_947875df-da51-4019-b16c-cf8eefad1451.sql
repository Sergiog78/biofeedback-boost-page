-- 1. Crea la tabella di archivio con la stessa struttura della tabella principale
CREATE TABLE public.course_enrollments_archive (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email_sent_at timestamp with time zone,
  stripe_payment_intent_id text,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  profession text,
  stripe_session_id text,
  stripe_customer_id text,
  payment_status text NOT NULL DEFAULT 'paid'::text,
  amount_paid integer NOT NULL,
  enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  archived_at timestamp with time zone NOT NULL DEFAULT now(),
  edition_label text NOT NULL DEFAULT '1st-edition-nov-2025'
);

-- 2. Abilita Row Level Security (nessuna policy pubblica = solo service-role)
ALTER TABLE public.course_enrollments_archive ENABLE ROW LEVEL SECURITY;

-- 3. Sposta gli iscritti di novembre 2025 nella tabella di archivio
INSERT INTO public.course_enrollments_archive (
  id, created_at, email_sent_at, stripe_payment_intent_id, email,
  first_name, last_name, phone, profession, stripe_session_id,
  stripe_customer_id, payment_status, amount_paid, enrolled_at
)
SELECT
  id, created_at, email_sent_at, stripe_payment_intent_id, email,
  first_name, last_name, phone, profession, stripe_session_id,
  stripe_customer_id, payment_status, amount_paid, enrolled_at
FROM public.course_enrollments
WHERE enrolled_at >= '2025-11-01'
  AND enrolled_at < '2025-12-01';

-- 4. Rimuovi gli iscritti archiviati dalla tabella principale
DELETE FROM public.course_enrollments
WHERE enrolled_at >= '2025-11-01'
  AND enrolled_at < '2025-12-01';