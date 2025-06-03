-- 1. Create a sequence
CREATE SEQUENCE public.customer_customer_id_seq;

-- 2. Set the default value for the column to use the sequence
ALTER TABLE public.customer
    ALTER COLUMN customer_id SET DEFAULT nextval('public.customer_customer_id_seq');

-- 3. Associate the sequence with the column (important for cleanup and some tools)
ALTER SEQUENCE public.customer_customer_id_seq OWNED BY public.customer.customer_id;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";