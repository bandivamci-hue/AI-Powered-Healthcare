from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    full_name = models.CharField(max_length=150, blank=True, default='')
    age = models.IntegerField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True, default='')
    phone_number = models.CharField(max_length=20, blank=True, default='')
    preferred_language = models.CharField(max_length=50, default='English')
    blood_group = models.CharField(max_length=10, blank=True, default='')
    emergency_contact_name = models.CharField(max_length=150, blank=True, default='')
    emergency_contact_phone = models.CharField(max_length=20, blank=True, default='')
    allergies = models.TextField(blank=True, default='')
    chronic_conditions = models.TextField(blank=True, default='')
    address = models.TextField(blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    country = models.CharField(max_length=100, blank=True, default='India')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_completion_percentage(self):
        fields_to_check = [
            self.full_name,
            self.age or self.date_of_birth,
            self.gender,
            self.phone_number,
            self.preferred_language,
            self.blood_group,
            self.emergency_contact_name,
            self.emergency_contact_phone,
            self.address or self.city,
        ]
        filled_count = sum(1 for val in fields_to_check if bool(val))
        return int((filled_count / len(fields_to_check)) * 100)

    @property
    def is_profile_completed(self):
        return bool(self.full_name and self.phone_number)

    def __str__(self):
        return f"{self.full_name or self.user.username} - {self.preferred_language}"

class MedicalDocument(models.Model):
    DOCUMENT_TYPES = [
        ('prescription', 'Prescription'),
        ('medical_report', 'Medical Report'),
        ('discharge_summary', 'Discharge Summary'),
        ('lab_test', 'Lab Test Report'),
        ('other', 'Other Medical Document'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('PROCESSED', 'Processed'),
        ('FAILED', 'Failed'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_documents')
    document_name = models.CharField(max_length=255)
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES, default="prescription")
    file = models.ImageField(upload_to='medical_documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    ai_summary = models.TextField(blank=True, null=True)
    processing_status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PROCESSED')

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.document_name} - {self.patient.full_name}"

class Medication(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medications')
    document = models.ForeignKey(MedicalDocument, on_delete=models.SET_NULL, null=True, blank=True, related_name='medications')
    name = models.CharField(max_length=200)
    strength = models.CharField(max_length=50, blank=True, null=True)
    form = models.CharField(max_length=50, default='Tablet')
    dosage = models.CharField(max_length=100, default='1 tablet')
    frequency = models.CharField(max_length=100, default='Twice daily')
    timing = models.CharField(max_length=100, default='After meals')
    duration_days = models.IntegerField(default=5)
    start_date = models.DateField(default=timezone.localdate)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.strength or ''}) - {self.patient.full_name}"

class ScheduledDose(models.Model):
    STATUS_PENDING = 'PENDING'
    STATUS_DUE = 'DUE'
    STATUS_TAKEN = 'TAKEN'
    STATUS_MISSED = 'MISSED'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_DUE, 'Due'),
        (STATUS_TAKEN, 'Taken'),
        (STATUS_MISSED, 'Missed'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='scheduled_doses')
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, related_name='doses')
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    scheduled_datetime = models.DateTimeField(db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    taken_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['scheduled_datetime']
        unique_together = ('patient', 'medication', 'scheduled_datetime')

    def __str__(self):
        return f"{self.medication.name} @ {self.scheduled_datetime.strftime('%Y-%m-%d %H:%M')} [{self.status}]"

class AppNotification(models.Model):
    TYPE_PRESCRIPTION_UPLOADED = 'PRESCRIPTION_UPLOADED'
    TYPE_REMINDER_CREATED = 'MEDICATION_REMINDER_CREATED'
    TYPE_REMINDER_UPDATED = 'MEDICATION_REMINDER_UPDATED'
    TYPE_REMINDER_DELETED = 'MEDICATION_REMINDER_DELETED'
    TYPE_DOSE_DUE = 'MEDICATION_DOSE_DUE'
    TYPE_DOSE_MISSED = 'MEDICATION_DOSE_MISSED'
    TYPE_DOSE_TAKEN = 'MEDICATION_DOSE_TAKEN'

    NOTIFICATION_TYPES = [
        (TYPE_PRESCRIPTION_UPLOADED, 'Prescription Uploaded'),
        (TYPE_REMINDER_CREATED, 'Reminder Created'),
        (TYPE_REMINDER_UPDATED, 'Reminder Updated'),
        (TYPE_REMINDER_DELETED, 'Reminder Deleted'),
        (TYPE_DOSE_DUE, 'Medication Due'),
        (TYPE_DOSE_MISSED, 'Medication Missed'),
        (TYPE_DOSE_TAKEN, 'Medication Taken'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='app_notifications')
    scheduled_dose = models.ForeignKey(ScheduledDose, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, default=TYPE_REMINDER_CREATED)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    link_url = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} [{self.notification_type}] - {self.patient.full_name}"

# Alias for backward compatibility
MedicationReminderNotification = AppNotification