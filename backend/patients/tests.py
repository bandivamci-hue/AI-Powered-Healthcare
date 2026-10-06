import datetime
from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from .models import Patient, Medication, ScheduledDose, MedicalDocument, AppNotification
from .services import (
    generate_scheduled_doses, parse_frequency_and_timing,
    parse_duration_days, mark_dose_as_taken, reset_dose_status,
    reset_all_today_doses, evaluate_dynamic_dose_statuses,
    ensure_doses_for_patient_date, GRACE_PERIOD_MINUTES
)

class MedicationReminderEngineTestCase(TestCase):
    def setUp(self):
        # Create Patient 1
        self.user1 = User.objects.create_user(username='testpatient1', password='Password123!')
        self.patient1 = Patient.objects.create(
            user=self.user1,
            full_name='Test Patient One',
            age=35,
            gender='Male',
            phone_number='9876543210',
            preferred_language='english'
        )

        # Create Patient 2 (Security Isolation check)
        self.user2 = User.objects.create_user(username='testpatient2', password='Password123!')
        self.patient2 = Patient.objects.create(
            user=self.user2,
            full_name='Test Patient Two',
            age=40,
            gender='Female',
            phone_number='9876543211',
            preferred_language='hindi'
        )

        self.client = APIClient()

    def test_dose_instances_are_date_specific(self):
        """Every calendar date has independent dose instances."""
        med = Medication.objects.create(
            patient=self.patient1,
            name='Paracetamol',
            strength='500mg',
            dosage='1 tablet',
            frequency='09:00 AM',
            timing='Morning',
            duration_days=5,
            start_date=timezone.localdate()
        )
        doses = generate_scheduled_doses(med)
        self.assertEqual(len(doses), 5)

        # Day 1 dose
        day1_dose = doses[0]
        day2_dose = doses[1]

        self.assertNotEqual(day1_dose.scheduled_date, day2_dose.scheduled_date)

        # Mark Day 1 as TAKEN
        mark_dose_as_taken(day1_dose.id, self.patient1)
        day1_dose.refresh_from_db()
        day2_dose.refresh_from_db()

        self.assertEqual(day1_dose.status, ScheduledDose.STATUS_TAKEN)
        self.assertEqual(day2_dose.status, ScheduledDose.STATUS_PENDING)

    def test_reset_evaluates_against_clock_time(self):
        """Resetting a dose removes TAKEN and dynamically evaluates against real clock time."""
        med = Medication.objects.create(
            patient=self.patient1,
            name='Augmentin',
            strength='625mg',
            dosage='1 tablet',
            frequency='BID',
            duration_days=2,
            start_date=timezone.localdate()
        )
        doses = generate_scheduled_doses(med)
        
        # Simulate dose 1 in past (e.g. 2 hours ago)
        past_dose = doses[0]
        past_dose.scheduled_datetime = timezone.now() - datetime.timedelta(hours=2)
        past_dose.status = ScheduledDose.STATUS_TAKEN
        past_dose.taken_at = timezone.now() - datetime.timedelta(hours=2)
        past_dose.save()

        # Simulate dose 2 in future (e.g. 4 hours later)
        future_dose = doses[1]
        future_dose.scheduled_datetime = timezone.now() + datetime.timedelta(hours=4)
        future_dose.status = ScheduledDose.STATUS_TAKEN
        future_dose.taken_at = timezone.now() - datetime.timedelta(hours=1)
        future_dose.save()

        # Reset past dose -> should dynamically become MISSED
        reset_dose_status(past_dose.id, self.patient1)
        past_dose.refresh_from_db()
        self.assertEqual(past_dose.status, ScheduledDose.STATUS_MISSED)
        self.assertIsNone(past_dose.taken_at)

        # Reset future dose -> should dynamically become PENDING
        reset_dose_status(future_dose.id, self.patient1)
        future_dose.refresh_from_db()
        self.assertEqual(future_dose.status, ScheduledDose.STATUS_PENDING)
        self.assertIsNone(future_dose.taken_at)

    def test_date_filtered_api_endpoint(self):
        """GET /api/doses/?date=YYYY-MM-DD returns only that date's doses."""
        self.client.force_authenticate(user=self.user1)
        
        today = timezone.localdate()
        tomorrow = today + datetime.timedelta(days=1)

        med = Medication.objects.create(
            patient=self.patient1,
            name='Dolo 650',
            frequency='09:00 AM',
            duration_days=3,
            start_date=today
        )
        generate_scheduled_doses(med)

        # Query today
        resp_today = self.client.get(f'/api/doses/?date={today.isoformat()}')
        self.assertEqual(resp_today.status_code, status.HTTP_200_OK)
        for item in resp_today.data:
            self.assertEqual(item['scheduled_date'], today.isoformat())

        # Query tomorrow
        resp_tomorrow = self.client.get(f'/api/doses/?date={tomorrow.isoformat()}')
        self.assertEqual(resp_tomorrow.status_code, status.HTTP_200_OK)
        for item in resp_tomorrow.data:
            self.assertEqual(item['scheduled_date'], tomorrow.isoformat())

    def test_patient_security_isolation(self):
        """Patient 2 must NOT be able to view or take Patient 1's scheduled doses."""
        med1 = Medication.objects.create(
            patient=self.patient1,
            name='Betaloc',
            strength='100mg',
            frequency='QD',
            duration_days=2,
            start_date=timezone.localdate()
        )
        doses1 = generate_scheduled_doses(med1)

        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f'/api/doses/{doses1[0].id}/take/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_reminder_crud_and_event_notifications(self):
        """Test reminder creation and deletion notifications."""
        self.client.force_authenticate(user=self.user1)

        create_resp = self.client.post('/api/medications/', {
            'name': 'Dolo 650mg',
            'dosage': '1 tablet',
            'frequency': '09:00 AM',
            'timing': 'After Breakfast',
            'duration_days': 5
        })
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        med_id = create_resp.data['id']

        delete_resp = self.client.delete(f'/api/medications/{med_id}/')
        self.assertEqual(delete_resp.status_code, status.HTTP_204_NO_CONTENT)
