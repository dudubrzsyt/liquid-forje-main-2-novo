-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin','dev','cliente');
CREATE TYPE public.dev_status AS ENUM ('em_analise','aprovado','rejeitado');
CREATE TYPE public.seniority AS ENUM ('estagiario','junior','pleno','senior','especialista');
CREATE TYPE public.diamond_tier AS ENUM ('negro','rosa','perolado','rubi','diamante_negro','elite');
CREATE TYPE public.plan_type AS ENUM ('basico','elite');
CREATE TYPE public.sub_status AS ENUM ('ativa','pendente','cancelada','expirada');

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan public.plan_type NOT NULL DEFAULT 'basico',
  status public.sub_status NOT NULL DEFAULT 'pendente',
  amount_cents integer NOT NULL DEFAULT 4500,
  payment_day integer,
  current_period_start timestamptz,
  current_period_end timestamptz,
  provider text,
  provider_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own subscription" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = _user_id AND status = 'ativa'
      AND (current_period_end IS NULL OR current_period_end > now())
  )
$$;

CREATE TABLE public.subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  amount_cents integer,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_events TO authenticated;
GRANT ALL ON public.subscription_events TO service_role;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own sub events" ON public.subscription_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read sub events" ON public.subscription_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- DEV PROFILES
CREATE TABLE public.dev_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  age integer,
  bio text NOT NULL DEFAULT '',
  stack text[] NOT NULL DEFAULT '{}',
  seniority public.seniority NOT NULL DEFAULT 'junior',
  education text NOT NULL DEFAULT '',
  github_url text NOT NULL,
  github_login text,
  linkedin_url text NOT NULL,
  avatar_url text,
  status public.dev_status NOT NULL DEFAULT 'em_analise',
  score integer NOT NULL DEFAULT 0,
  tier public.diamond_tier NOT NULL DEFAULT 'negro',
  available boolean NOT NULL DEFAULT true,
  github_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dev_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.dev_profiles TO authenticated;
GRANT ALL ON public.dev_profiles TO service_role;
ALTER TABLE public.dev_profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.dev_profile_is_complete(_p public.dev_profiles)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT length(coalesce(_p.bio,'')) >= 40
     AND array_length(_p.stack,1) >= 1
     AND coalesce(_p.github_url,'') <> ''
     AND coalesce(_p.linkedin_url,'') <> ''
$$;

CREATE POLICY "Public sees ranked devs" ON public.dev_profiles FOR SELECT TO anon, authenticated
USING (
  status = 'aprovado' AND available AND github_verified
  AND public.dev_profile_is_complete(dev_profiles)
  AND public.has_active_subscription(user_id)
);
CREATE POLICY "Devs read own profile" ON public.dev_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Devs insert own profile" ON public.dev_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Devs update own profile" ON public.dev_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage dev profiles" ON public.dev_profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- AI ANALYSIS
CREATE TABLE public.dev_ai_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_profile_id uuid NOT NULL REFERENCES public.dev_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  github_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text,
  score integer NOT NULL DEFAULT 0,
  tier public.diamond_tier NOT NULL DEFAULT 'negro',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dev_ai_analysis TO authenticated;
GRANT ALL ON public.dev_ai_analysis TO service_role;
ALTER TABLE public.dev_ai_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Devs read own analysis" ON public.dev_ai_analysis FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage analysis" ON public.dev_ai_analysis FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  target text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- TRIGGERS updated_at
CREATE TRIGGER dev_profiles_updated_at BEFORE UPDATE ON public.dev_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();