import re
import datetime
from django.utils import timezone
from django.db import transaction
from .models import Medication, ScheduledDose, MedicalDocument, AppNotification

# Configurable grace period before a due dose transitions to MISSED
GRACE_PERIOD_MINUTES = 30

def parse_duration_days(duration_str):
    if not duration_str:
        return 30
    d_str = str(duration_str).lower().strip()
    match = re.search(r'(\d+)\s*(day|week|month)', d_str)
    if match:
        val = int(match.group(1))
        unit = match.group(2)
        if 'week' in unit:
            return val * 7
        if 'month' in unit:
            return val * 30
        return val
    return 30

def parse_time_from_string(text):
    if not text:
        return None
    m = re.search(r'(\d{1,2})[:.](\d{1,2})\s*(am|pm)?', text, re.IGNORECASE)
    if m:
        h = int(m.group(1))
        min_str = m.group(2)
        minute = int(min_str) if len(min_str) == 2 else int(min_str) * 10
        meridiem = (m.group(3) or '').lower()
        if meridiem == 'pm' and h < 12:
            h += 12
        elif meridiem == 'am' and h == 12:
            h = 0
        if 0 <= h < 24 and 0 <= minute < 60:
            return datetime.time(h, minute)

    m2 = re.search(r'(\d{1,2})\s*(am|pm)', text, re.IGNORECASE)
    if m2:
        h = int(m2.group(1))
        meridiem = m2.group(2).lower()
        if meridiem == 'pm' and h < 12:
            h += 12
        elif meridiem == 'am' and h == 12:
            h = 0
        if 0 <= h < 24:
            return datetime.time(h, 0)
    return None

def parse_frequency_and_timing(frequency_str, timing_str, med_name=""):
    freq = (frequency_str or '').lower().strip()
    time_s = (timing_str or '').lower().strip()
    name = (med_name or '').lower().strip()
    combined = f"{freq} {time_s} {name}".lower()

    # Check for explicit custom time in frequency or timing (e.g. "10:30 AM")
    custom_time = parse_time_from_string(timing_str) or parse_time_from_string(frequency_str)
    if custom_time:
        return [custom_time]

    # Explicit 4 times daily (QID / 1-1-1-1) -> 9am, 12pm, 4pm, 9pm
    if '1-1-1-1' in combined or 'qid' in combined or 'four times' in combined or '4 time' in combined or '4x' in combined:
        return [datetime.time(9, 0), datetime.time(12, 0), datetime.time(16, 0), datetime.time(21, 0)]

    # Explicit 3 times daily (TDS / TID / 1-1-1) -> 9am, 1pm, 9pm
    if '1-1-1' in combined or 'tid' in combined or 'tds' in combined or 'three times' in combined or '3 time' in combined or '3x' in combined:
        return [datetime.time(9, 0), datetime.time(13, 0), datetime.time(21, 0)]

    # Category checks for natural distribution:
    # 1. Supplements / Multivitamins (Zincovit, Becosules, Calcium, Vitamin D, etc.) -> Best taken at Lunch / Afternoon (12:00 PM) or 12:00 PM & 09:30 PM
    is_supplement = any(k in name for k in ['zincovit', 'vitamin', 'vit', 'calcium', 'iron', 'folic', 'multivitamin', 'becosules', 'supradyn', 'protein', 'd3', 'b12', 'omega'])

    # 2. Topical / Paints / Gargles / Syrups (Hexigel, Ointments, Mouthwashes, Syrups) -> 09:30 AM & 04:00 PM (Evening)
    is_topical_or_oral = any(k in name for k in ['gum paint', 'hexigel', 'paint', 'ointment', 'gel', 'gargle', 'mouthwash', 'drops', 'syrup', 'lotion'])

    # 3. Before Breakfast / Empty Stomach (PPIs, Antacids, Thyroid) -> 08:30 AM
    is_before_breakfast = any(k in combined for k in ['before breakfast', 'empty stomach', 'pantoprazole', 'pan d', 'pand', 'omeprazole', 'rabeprazole', 'thyronorm', 'eltroxin'])

    # 4. Bedtime / Night only (Antihistamines, Sleeping pills, Statins) -> 09:00 PM / 09:30 PM
    is_night_only = any(k in combined for k in ['at night', 'bedtime', 'hs', '0-0-1', 'dinner']) or any(k in name for k in ['levocetirizine', 'cetirizine', 'montelukast', 'glovet', 'atorvastatin', 'rosuvastatin', 'sleeping'])

    # Explicit Afternoon only
    if '0-1-0' in combined or 'afternoon' in combined or 'lunch' in combined or 'midday' in combined:
        return [datetime.time(12, 0)]

    # Explicit Evening only
    if 'evening' in combined or 'snacks' in combined:
        return [datetime.time(16, 0)]

    # Bedtime only
    if is_night_only and ('1-0-1' not in freq and 'twice' not in freq and 'bid' not in freq):
        min_offset = 30 if any(k in name for k in ['glovet', 'atorvastatin', 'zincovit']) else 0
        return [datetime.time(21, min_offset)]

    # Twice daily (1-0-1 / BID / twice daily)
    if '1-0-1' in combined or 'bid' in combined or 'bd' in combined.split() or 'twice' in combined or '2 time' in combined or '2x' in combined:
        if is_supplement:
            # 12:00 PM (Lunch) & 09:30 PM (Night)
            return [datetime.time(12, 0), datetime.time(21, 30)]
        elif is_topical_or_oral:
            # 09:30 AM (Morning) & 04:00 PM (Evening)
            return [datetime.time(9, 30), datetime.time(16, 0)]
        else:
            # Standard twice daily (e.g. Augmentin, Enzoflam): 09:00 AM & 09:00 PM (or 09:15 for pain relief/anti-inflammatory)
            min_offset = 15 if any(x in name for x in ['enzoflam', 'pain', 'paracetamol', 'combiflam']) else 0
            return [datetime.time(9, min_offset), datetime.time(21, min_offset)]

    # Once daily (1-0-0 / OD / QD / once daily)
    if is_before_breakfast:
        return [datetime.time(8, 30)]
    elif is_supplement:
        return [datetime.time(12, 0)]
    elif is_topical_or_oral:
        return [datetime.time(16, 0)]
    elif is_night_only:
        return [datetime.time(21, 0)]
    else:
        return [datetime.time(9, 0)]

def generate_scheduled_doses(medication, start_date=None, duration_days=None):
    """
    Generates individual timezone-aware ScheduledDose records for each calendar day.
    Each ScheduledDose represents a concrete dose occurrence for a specific date and time.
    """
    patient = medication.patient
    duration = max(1, duration_days or medication.duration_days or 30)
    daily_times = parse_frequency_and_timing(medication.frequency, medication.timing, med_name=medication.name)
    
    start = start_date or medication.start_date or timezone.localdate()
    now = timezone.now()
    tz = timezone.get_current_timezone()

    created_doses = []

    with transaction.atomic():
        for day_offset in range(duration):
            current_date = start + datetime.timedelta(days=day_offset)
            
            for t_time in daily_times:
                naive_dt = datetime.datetime.combine(current_date, t_time)
                scheduled_dt = timezone.make_aware(naive_dt, tz)

                # Determine dynamic status based on scheduled_dt vs real current clock
                if scheduled_dt + datetime.timedelta(minutes=GRACE_PERIOD_MINUTES) < now:
                    initial_status = ScheduledDose.STATUS_MISSED
                elif scheduled_dt <= now:
                    initial_status = ScheduledDose.STATUS_DUE
                else:
                    initial_status = ScheduledDose.STATUS_PENDING

                dose, created = ScheduledDose.objects.get_or_create(
                    patient=patient,
                    medication=medication,
                    scheduled_datetime=scheduled_dt,
                    defaults={
                        'scheduled_date': current_date,
                        'scheduled_time': t_time,
                        'status': initial_status
                    }
                )
                created_doses.append(dose)

    return created_doses

def ensure_doses_for_patient_date(patient, target_date=None):
    """
    Ensures that dose instances exist for all active medications on the target date.
    """
    if not target_date:
        target_date = timezone.localdate()

    if not patient:
        return []

    active_meds = Medication.objects.filter(patient=patient, is_active=True)
    generated = []
    for med in active_meds:
        # Check if med is active on target_date
        start = med.start_date or timezone.localdate()
        end = start + datetime.timedelta(days=med.duration_days or 30)
        if start <= target_date <= end:
            daily_times = parse_frequency_and_timing(med.frequency, med.timing, med_name=med.name)
            tz = timezone.get_current_timezone()
            now = timezone.now()
            for t_time in daily_times:
                naive_dt = datetime.datetime.combine(target_date, t_time)
                scheduled_dt = timezone.make_aware(naive_dt, tz)
                
                if scheduled_dt + datetime.timedelta(minutes=GRACE_PERIOD_MINUTES) < now:
                    initial_status = ScheduledDose.STATUS_MISSED
                elif scheduled_dt <= now:
                    initial_status = ScheduledDose.STATUS_DUE
                else:
                    initial_status = ScheduledDose.STATUS_PENDING

                dose, _ = ScheduledDose.objects.get_or_create(
                    patient=patient,
                    medication=med,
                    scheduled_datetime=scheduled_dt,
                    defaults={
                        'scheduled_date': target_date,
                        'scheduled_time': t_time,
                        'status': initial_status
                    }
                )
                generated.append(dose)
    return generated

def evaluate_dynamic_dose_statuses(patient=None):
    """
    Core Date & Time Dynamic Status Engine.
    Uses the real system clock and timezone to evaluate each non-TAKEN dose.
    - If scheduled_datetime + 30 mins < now -> MISSED (and creates missed notification).
    - If scheduled_datetime <= now <= scheduled_datetime + 30 mins -> DUE (and creates due notification).
    - If now < scheduled_datetime -> PENDING / UPCOMING.
    """
    now = timezone.now()
    cutoff_missed = now - datetime.timedelta(minutes=GRACE_PERIOD_MINUTES)

    # 1. Evaluate missed doses
    missed_query = ScheduledDose.objects.filter(
        medication__is_active=True,
        scheduled_datetime__lt=cutoff_missed,
        status__in=[ScheduledDose.STATUS_PENDING, ScheduledDose.STATUS_DUE]
    )
    if patient:
        missed_query = missed_query.filter(patient=patient)

    for dose in missed_query:
        dose.status = ScheduledDose.STATUS_MISSED
        dose.save(update_fields=['status', 'updated_at'])

        # Idempotently create missed alert notification
        notif = AppNotification.objects.filter(
            scheduled_dose=dose,
            notification_type=AppNotification.TYPE_DOSE_MISSED
        ).first()
        if not notif:
            time_str = dose.scheduled_time.strftime('%I:%M %p')
            AppNotification.objects.create(
                patient=dose.patient,
                scheduled_dose=dose,
                notification_type=AppNotification.TYPE_DOSE_MISSED,
                title=f"Missed Medication: {dose.medication.name}",
                message=f"You missed your {dose.medication.name} ({dose.medication.dosage}) scheduled for {time_str}.",
                link_url='/reminders',
                is_read=False
            )

    # 2. Evaluate due doses (within 30m before or right at scheduled time up to grace period)
    due_window = now + datetime.timedelta(minutes=15)
    due_query = ScheduledDose.objects.filter(
        medication__is_active=True,
        scheduled_datetime__lte=due_window,
        scheduled_datetime__gte=cutoff_missed,
        status=ScheduledDose.STATUS_PENDING
    )
    if patient:
        due_query = due_query.filter(patient=patient)

    for dose in due_query:
        if dose.scheduled_datetime <= now:
            dose.status = ScheduledDose.STATUS_DUE
            dose.save(update_fields=['status', 'updated_at'])

        # Idempotently create due notification
        notif = AppNotification.objects.filter(
            scheduled_dose=dose,
            notification_type=AppNotification.TYPE_DOSE_DUE
        ).first()
        if not notif:
            time_str = dose.scheduled_time.strftime('%I:%M %p')
            AppNotification.objects.create(
                patient=dose.patient,
                scheduled_dose=dose,
                notification_type=AppNotification.TYPE_DOSE_DUE,
                title=f"Medication Due: {dose.medication.name}",
                message=f"It's time to take your {dose.medication.name} — {dose.medication.dosage}, {dose.medication.timing} (Scheduled at {time_str}).",
                link_url='/dashboard',
                is_read=False
            )

def mark_dose_as_taken(dose_id, patient=None):
    """
    Marks an individual scheduled dose as TAKEN for its specific calendar occurrence.
    """
    if patient:
        dose = ScheduledDose.objects.get(id=dose_id, patient=patient)
    else:
        dose = ScheduledDose.objects.get(id=dose_id)

    dose.status = ScheduledDose.STATUS_TAKEN
    dose.taken_at = timezone.now()
    dose.save(update_fields=['status', 'taken_at', 'updated_at'])

    # Mark any unread notifications for this dose as read
    AppNotification.objects.filter(scheduled_dose=dose, is_read=False).update(is_read=True, read_at=timezone.now())
    return dose

def reset_dose_status(dose_id, patient=None):
    """
    Resets an individual scheduled dose occurrence:
    1. Removes TAKEN state (clears taken_at).
    2. Dynamically calculates new status based on ACTUAL CLOCK TIME and GRACE PERIOD:
       - Past scheduled time + grace period -> MISSED
       - Scheduled time reached -> DUE
       - Future scheduled time -> PENDING
    """
    if patient:
        dose = ScheduledDose.objects.get(id=dose_id, patient=patient)
    else:
        dose = ScheduledDose.objects.get(id=dose_id)

    now = timezone.now()
    cutoff_missed = now - datetime.timedelta(minutes=GRACE_PERIOD_MINUTES)

    dose.taken_at = None
    if dose.scheduled_datetime < cutoff_missed:
        dose.status = ScheduledDose.STATUS_MISSED
        # Ensure missed notification exists
        if not AppNotification.objects.filter(scheduled_dose=dose, notification_type=AppNotification.TYPE_DOSE_MISSED).exists():
            time_str = dose.scheduled_time.strftime('%I:%M %p')
            AppNotification.objects.create(
                patient=dose.patient,
                scheduled_dose=dose,
                notification_type=AppNotification.TYPE_DOSE_MISSED,
                title=f"Missed Medication: {dose.medication.name}",
                message=f"You missed your {dose.medication.name} ({dose.medication.dosage}) scheduled for {time_str}.",
                link_url='/reminders',
                is_read=False
            )
    elif dose.scheduled_datetime <= now:
        dose.status = ScheduledDose.STATUS_DUE
    else:
        dose.status = ScheduledDose.STATUS_PENDING

    dose.save(update_fields=['status', 'taken_at', 'updated_at'])
    return dose

def reset_all_today_doses(patient=None, target_date=None):
    """
    Resets all scheduled dose instances for a specific date (default today).
    Removes TAKEN states and dynamically re-evaluates each against the real clock.
    """
    if not target_date:
        target_date = timezone.localdate()

    query = ScheduledDose.objects.filter(scheduled_date=target_date)
    if patient:
        query = query.filter(patient=patient)

    now = timezone.now()
    cutoff_missed = now - datetime.timedelta(minutes=GRACE_PERIOD_MINUTES)

    count = 0
    with transaction.atomic():
        for dose in query:
            dose.taken_at = None
            if dose.scheduled_datetime < cutoff_missed:
                dose.status = ScheduledDose.STATUS_MISSED
            elif dose.scheduled_datetime <= now:
                dose.status = ScheduledDose.STATUS_DUE
            else:
                dose.status = ScheduledDose.STATUS_PENDING
            dose.save(update_fields=['status', 'taken_at', 'updated_at'])
            count += 1

    return count

def create_medications_from_document(medical_document):
    if not medical_document or not medical_document.ai_summary:
        return []

    summary_text = medical_document.ai_summary
    if '[MEDICINES]' not in summary_text:
        return []

    med_section = summary_text.split('[MEDICINES]')[1]
    lines = [l.strip() for l in med_section.split('\n') if l.strip()]

    created_meds = []
    patient = medical_document.patient

    for line in lines:
        parts = [p.strip() for p in line.split('|')]
        if not parts or not parts[0]:
            continue

        raw_name = parts[0]
        
        # Helper to clean out hyphens, None or empty values
        def sanitize_val(val, default):
            if not val or str(val).strip() in ['-', 'None', '.', 'null', 'undefined', '']:
                return default
            return str(val).strip()

        form = sanitize_val(parts[1] if len(parts) > 1 else '', 'Tablet')
        dose = sanitize_val(parts[2] if len(parts) > 2 else '', '1 dose')
        freq = sanitize_val(parts[3] if len(parts) > 3 else '', 'Twice daily')
        timing = sanitize_val(parts[4] if len(parts) > 4 else '', 'After meals')
        duration_raw = sanitize_val(parts[5] if len(parts) > 5 else '', '30 days')
        duration_days = parse_duration_days(duration_raw)

        strength = ""
        match_strength = re.search(r'(\d+\s*(mg|g|ml|mcg|k))', raw_name, re.IGNORECASE)
        if match_strength:
            strength = match_strength.group(1)

        medication, created = Medication.objects.get_or_create(
            patient=patient,
            name=raw_name,
            defaults={
                'document': medical_document,
                'strength': strength,
                'form': form,
                'dosage': dose,
                'frequency': freq,
                'timing': timing,
                'duration_days': duration_days,
                'start_date': timezone.localdate(),
                'is_active': True
            }
        )

        if not created:
            changed = False
            if medication.dosage in ['-', 'None', '', '.']:
                medication.dosage = dose
                changed = True
            if medication.timing in ['-', 'None', '', '.']:
                medication.timing = timing
                changed = True
            if medication.form in ['-', 'None', '', '.']:
                medication.form = form
                changed = True
            if changed:
                medication.save()

        generate_scheduled_doses(medication)
        created_meds.append(medication)

    return created_meds

def create_prescription_uploaded_notification(document, patient):
    time_str = timezone.now().strftime('%b %d at %I:%M %p')
    return AppNotification.objects.create(
        patient=patient,
        notification_type=AppNotification.TYPE_PRESCRIPTION_UPLOADED,
        title="Prescription Uploaded",
        message=f"Your document '{document.document_name}' was uploaded successfully on {time_str}.",
        link_url='/history',
        is_read=False
    )

def create_reminder_created_notification(medication, patient):
    time_display = medication.frequency or medication.timing or "Scheduled Time"
    return AppNotification.objects.create(
        patient=patient,
        notification_type=AppNotification.TYPE_REMINDER_CREATED,
        title="Medication Reminder Created",
        message=f"Your reminder for {medication.name} ({medication.dosage}) at {time_display} has been created.",
        link_url='/reminders',
        is_read=False
    )

def create_reminder_updated_notification(medication, patient):
    time_display = medication.frequency or medication.timing or "Scheduled Time"
    return AppNotification.objects.create(
        patient=patient,
        notification_type=AppNotification.TYPE_REMINDER_UPDATED,
        title="Medication Reminder Updated",
        message=f"Your reminder for {medication.name} was updated to {time_display}.",
        link_url='/reminders',
        is_read=False
    )

def create_reminder_deleted_notification(med_name, timing_str, patient):
    return AppNotification.objects.create(
        patient=patient,
        notification_type=AppNotification.TYPE_REMINDER_DELETED,
        title="Medication Reminder Deleted",
        message=f"Your reminder for {med_name} ({timing_str}) was deleted.",
        link_url='/reminders',
        is_read=False
    )

# Aliases for backward compatibility
detect_due_doses_and_generate_reminders = evaluate_dynamic_dose_statuses
detect_missed_doses_and_generate_alerts = evaluate_dynamic_dose_statuses

def mark_notification_as_read(notification_id, patient=None):
    if patient:
        notification = AppNotification.objects.get(id=notification_id, patient=patient)
    else:
        notification = AppNotification.objects.get(id=notification_id)

    notification.is_read = True
    notification.read_at = timezone.now()
    notification.save(update_fields=['is_read', 'read_at'])
    return notification

def mark_all_notifications_as_read(patient):
    now = timezone.now()
    return AppNotification.objects.filter(patient=patient, is_read=False).update(is_read=True, read_at=now)
