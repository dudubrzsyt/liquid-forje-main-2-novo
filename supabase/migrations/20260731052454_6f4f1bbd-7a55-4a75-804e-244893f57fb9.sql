CREATE OR REPLACE FUNCTION public.dev_profile_is_complete(_p public.dev_profiles)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT length(coalesce(_p.bio,'')) >= 40
     AND array_length(_p.stack,1) >= 1
     AND coalesce(_p.github_url,'') <> ''
     AND coalesce(_p.linkedin_url,'') <> ''
$$;