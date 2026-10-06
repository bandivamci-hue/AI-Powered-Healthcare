import re
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Patient, MedicalDocument, Medication, ScheduledDose, AppNotification

class PatientRegistrationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True, write_only=True)
    full_name = serializers.CharField(required=False, allow_blank=True, default='')
    age = serializers.IntegerField(required=False, allow_null=True, default=None)
    gender = serializers.CharField(required=False, allow_blank=True, default='')
    phone_number = serializers.CharField(required=False, allow_blank=True, default='')
    preferred_language = serializers.CharField(required=False, default='English')

    class Meta:
        model = Patient
        fields = ['username', 'password', 'email', 'full_name', 'age', 'gender', 'phone_number', 'preferred_language']

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists. Please choose a different username or log in.")
        return value

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        email = validated_data.pop('email', '') or ''

        full_name = validated_data.pop('full_name', '') or ''
        age = validated_data.pop('age', None)
        gender = validated_data.pop('gender', '') or ''
        phone_number = validated_data.pop('phone_number', '') or ''
        preferred_language = validated_data.pop('preferred_language', 'English') or 'English'

        try:
            user = User.objects.create_user(username=username, password=password, email=email)
            patient = Patient.objects.create(
                user=user,
                full_name=full_name,
                age=age,
                gender=gender,
                phone_number=phone_number,
                preferred_language=preferred_language
            )
            return patient
        except Exception as e:
            raise serializers.ValidationError({"detail": str(e)})

class PatientProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', required=False, allow_blank=True)
    completion_percentage = serializers.SerializerMethodField()
    is_profile_completed = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            'username',
            'email',
            'full_name',
            'date_of_birth',
            'age',
            'gender',
            'phone_number',
            'preferred_language',
            'blood_group',
            'emergency_contact_name',
            'emergency_contact_phone',
            'allergies',
            'chronic_conditions',
            'address',
            'city',
            'state',
            'country',
            'completion_percentage',
            'is_profile_completed',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['username', 'created_at', 'updated_at', 'completion_percentage', 'is_profile_completed']

    def get_completion_percentage(self, obj):
        return obj.calculate_completion_percentage()

    def get_is_profile_completed(self, obj):
        return obj.is_profile_completed

    def validate_full_name(self, value):
        if value is not None and not value.strip():
            raise serializers.ValidationError("Full name cannot be empty.")
        return value.strip() if value else ""

    def validate_date_of_birth(self, value):
        if value:
            from django.utils import timezone
            if value > timezone.localdate():
                raise serializers.ValidationError("Date of birth cannot be in the future.")
        return value

    def validate_phone_number(self, value):
        if value:
            cleaned = re.sub(r'[\s\-\(\)\+]', '', value)
            if len(cleaned) < 7:
                raise serializers.ValidationError("Please provide a valid phone number (at least 7 digits).")
        return value

    def validate_emergency_contact_phone(self, value):
        if value:
            cleaned = re.sub(r'[\s\-\(\)\+]', '', value)
            if len(cleaned) < 7:
                raise serializers.ValidationError("Please provide a valid emergency phone number.")
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        if 'email' in user_data:
            instance.user.email = user_data['email']
            instance.user.save(update_fields=['email'])

        dob = validated_data.get('date_of_birth')
        if dob:
            from django.utils import timezone
            today = timezone.localdate()
            calculated_age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            validated_data['age'] = calculated_age

        return super().update(instance, validated_data)

class MedicalDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    extracted_text = serializers.SerializerMethodField()
    medicines = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)

    class Meta:
        model = MedicalDocument
        fields = [
            'id', 'document_name', 'document_type', 'file', 'file_url',
            'uploaded_at', 'ai_summary', 'extracted_text', 'medicines',
            'doctor_name', 'patient_name', 'processing_status'
        ]

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_extracted_text(self, obj):
        if not obj.ai_summary:
            return ""
        if "[RAW_TEXT]" in obj.ai_summary:
            parts = obj.ai_summary.split("[RAW_TEXT]")
            return (parts[1] if len(parts) > 1 else parts[0]).split("[MEDICINES]")[0].strip()
        if "[MEDICINES]" in obj.ai_summary:
            return obj.ai_summary.split("[MEDICINES]")[0].strip()
        return obj.ai_summary.strip()

    def get_medicines(self, obj):
        if not obj.ai_summary or "[MEDICINES]" not in obj.ai_summary:
            linked_meds = obj.medications.all()
            if linked_meds.exists():
                return [
                    {
                        'name': m.name,
                        'form': m.form,
                        'dose': m.dosage,
                        'frequency': m.frequency,
                        'timing': m.timing,
                        'duration': f"{m.duration_days} days"
                    }
                    for m in linked_meds
                ]
            return []

        med_section = obj.ai_summary.split("[MEDICINES]")[1]
        lines = [l.strip() for l in med_section.split("\n") if l.strip()]
        result = []
        for line in lines:
            parts = [p.strip() for p in line.split("|")]
            if parts and parts[0]:
                result.append({
                    'name': parts[0],
                    'form': parts[1] if len(parts) > 1 else 'Tablet',
                    'dose': parts[2] if len(parts) > 2 else '1 tablet',
                    'frequency': parts[3] if len(parts) > 3 else 'Twice daily',
                    'timing': parts[4] if len(parts) > 4 else 'After meals',
                    'duration': parts[5] if len(parts) > 5 else '5 days'
                })
        return result

    def get_doctor_name(self, obj):
        if not obj.ai_summary:
            return "Dr. Prescribing Physician"
        match = re.search(r'Dr\.\s*([A-Za-z\s]+)', obj.ai_summary)
        if match:
            return f"Dr. {match.group(1).strip()}"
        return "Dr. Prescribing Physician"

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ['id', 'name', 'strength', 'form', 'dosage', 'frequency', 'timing', 'duration_days', 'start_date', 'is_active', 'created_at']

class ScheduledDoseSerializer(serializers.ModelSerializer):
    medication_id = serializers.IntegerField(source='medication.id', read_only=True)
    medication_name = serializers.CharField(source='medication.name', read_only=True)
    medication_strength = serializers.CharField(source='medication.strength', read_only=True)
    medication_form = serializers.CharField(source='medication.form', read_only=True)
    medication_dosage = serializers.CharField(source='medication.dosage', read_only=True)
    medication_timing = serializers.CharField(source='medication.timing', read_only=True)

    class Meta:
        model = ScheduledDose
        fields = [
            'id', 'medication', 'medication_id', 'medication_name', 'medication_strength',
            'medication_form', 'medication_dosage', 'medication_timing', 'scheduled_date',
            'scheduled_time', 'scheduled_datetime', 'status', 'taken_at', 'created_at'
        ]

class AppNotificationSerializer(serializers.ModelSerializer):
    scheduled_dose_id = serializers.IntegerField(source='scheduled_dose.id', read_only=True, allow_null=True)
    medication_name = serializers.CharField(source='scheduled_dose.medication.name', read_only=True, default=None)
    medication_strength = serializers.CharField(source='scheduled_dose.medication.strength', read_only=True, default=None)
    medication_dosage = serializers.CharField(source='scheduled_dose.medication.dosage', read_only=True, default=None)
    scheduled_time = serializers.TimeField(source='scheduled_dose.scheduled_time', read_only=True, default=None)
    dose_status = serializers.CharField(source='scheduled_dose.status', read_only=True, default=None)

    class Meta:
        model = AppNotification
        fields = [
            'id', 'scheduled_dose_id', 'medication_name', 'medication_strength',
            'medication_dosage', 'scheduled_time', 'dose_status', 'notification_type',
            'title', 'message', 'link_url', 'is_read', 'read_at', 'created_at'
        ]

# Alias for backward compatibility
MedicationReminderNotificationSerializer = AppNotificationSerializer