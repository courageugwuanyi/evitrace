CREATE OR REPLACE FUNCTION public.process_evidence_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.notifications (user_id, type, title, description)
        VALUES (
            NEW.user_id,
            'auto_capture'::notification_event_type,
            'Evidence logged successfully',
            'New system verification data matching item ' || COALESCE(NEW.title, 'Evidence') || ' has been stored.'
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE' AND OLD.is_archived = false AND NEW.is_archived = true) THEN
        INSERT INTO public.notifications (user_id, type, title, description)
        VALUES (
            NEW.user_id,
            'assessment'::notification_event_type,
            'Evidence item archived',
            'Your tracking artifact "' || COALESCE(NEW.title, 'Evidence') || '" has been moved to Archives.'
        );
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public.notifications (user_id, type, title, description)
        VALUES (
            OLD.user_id,
            'assessment'::notification_event_type,
            'Evidence item deleted',
            'Your tracking artifact "' || COALESCE(OLD.title, 'Evidence') || '" was permanently removed.'
        );
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_evidence_change ON public.evidence;

CREATE TRIGGER on_evidence_change
    AFTER INSERT OR UPDATE OR DELETE ON public.evidence
    FOR EACH ROW EXECUTE FUNCTION public.process_evidence_notification();
