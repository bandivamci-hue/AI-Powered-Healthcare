from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PatientRegistrationView, PatientProfileView, MedicalDocumentViewSet,
    MedicationViewSet, ScheduledDoseViewSet, MedicationReminderNotificationViewSet,
    AiChatView, AiChatStreamView, MedicineGuidanceView, ReprocessRawTextView,
    ArticleTranslationView, NearbyHospitalsView, tts_proxy
)

router = DefaultRouter()
router.register(r'documents', MedicalDocumentViewSet, basename='medicaldocument')
router.register(r'medications', MedicationViewSet, basename='medication')
router.register(r'doses', ScheduledDoseViewSet, basename='scheduleddose')
router.register(r'notifications', MedicationReminderNotificationViewSet, basename='notification')

urlpatterns = [
    path('register/', PatientRegistrationView.as_view(), name='register'),
    path('profile/', PatientProfileView.as_view(), name='profile'),
    path('hospitals/nearby/', NearbyHospitalsView.as_view(), name='nearby-hospitals'),
    path('ai/chat/', AiChatView.as_view(), name='ai-chat'),
    path('ai/stream/', AiChatStreamView.as_view(), name='ai-stream'),
    path('ai/medicine-guidance/', MedicineGuidanceView.as_view(), name='ai-medicine-guidance'),
    path('ai/re-extract/', ReprocessRawTextView.as_view(), name='ai-re-extract'),
    path('ai/translate-article/', ArticleTranslationView.as_view(), name='ai-translate-article'),
    path('tts/', tts_proxy, name='tts-proxy'),
    path('', include(router.urls)),
]