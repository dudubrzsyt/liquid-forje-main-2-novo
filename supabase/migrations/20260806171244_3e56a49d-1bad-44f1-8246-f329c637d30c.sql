CREATE POLICY "Users update own subscription" ON public.subscriptions
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.guard_subscription_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.status := OLD.status;
    NEW.current_period_start := OLD.current_period_start;
    NEW.current_period_end := OLD.current_period_end;
    NEW.provider := OLD.provider;
    NEW.provider_ref := OLD.provider_ref;
    NEW.user_id := OLD.user_id;
  END IF;

  IF NEW.status = 'ativa' AND (OLD.status IS DISTINCT FROM 'ativa') THEN
    NEW.current_period_start := now();
    NEW.current_period_end := now() + interval '30 days';
    NEW.payment_day := COALESCE(NEW.payment_day, EXTRACT(DAY FROM now())::int);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER subscriptions_guard BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.guard_subscription_update();

CREATE OR REPLACE FUNCTION public.log_subscription_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.subscription_events (user_id, kind, amount_cents, detail)
    VALUES (NEW.user_id, 'plano_escolhido', NEW.amount_cents, 'Plano ' || NEW.plan::text || ' — aguardando pagamento');
  ELSE
    IF NEW.plan IS DISTINCT FROM OLD.plan THEN
      INSERT INTO public.subscription_events (user_id, kind, amount_cents, detail)
      VALUES (NEW.user_id, 'plano_alterado', NEW.amount_cents, 'De ' || OLD.plan::text || ' para ' || NEW.plan::text);
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.subscription_events (user_id, kind, amount_cents, detail)
      VALUES (NEW.user_id, 'status_' || NEW.status::text, NEW.amount_cents,
              CASE WHEN NEW.status = 'ativa' THEN 'Assinatura ativada — válida por 30 dias' ELSE 'Status atualizado' END);
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER subscriptions_log AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.log_subscription_event();