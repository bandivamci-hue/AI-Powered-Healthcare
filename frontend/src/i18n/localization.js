export className LocalizationConfig {
  static languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi (हिंदी)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' },
    { code: 'mr', name: 'Marathi (मराठी)' },
    { code: 'bn', name: 'Bengali (বাংলা)' },
  ];

  static translations = {
    en: {
      appName: 'MediCare AI',
      tagline: 'Your Intelligent Healthcare Companion',
      dashboard: 'Dashboard',
      scanPrescription: 'Scan Prescription',
      myMedicines: 'My Medicines',
      reminders: 'Reminders',
      history: 'History',
      reports: 'Reports',
      profile: 'Profile',
      settings: 'Settings',
      aiAssistant: 'AI Assistant',
      explain: 'Explain Medical',
      translation: 'Translate',
      voiceAssistant: 'Voice Assistant',
      symptoms: 'Symptoms',
      emergency: 'Emergency',
      healthEducation: 'Health Education',
      disclaimer: 'MediCare AI provides informational support and does not replace professional medical advice, diagnosis, or treatment.'
    },
    hi: {
      appName: 'मेडीकेयर AI',
      tagline: 'आपका समझदार स्वास्थ्य साथी',
      dashboard: 'डैशबोर्ड',
      scanPrescription: 'प्रिस्क्रिप्शन स्कैन करें',
      myMedicines: 'मेरी दवाइयां',
      reminders: 'रिमाइंडर',
      history: 'इतिहास',
      reports: 'रिपोर्ट्स',
      profile: 'प्रोफाइल',
      settings: 'सेटिंग्स',
      aiAssistant: 'AI सहायक',
      explain: 'मेडिकल समझें',
      translation: 'अनुवाद',
      voiceAssistant: 'वॉयस सहायक',
      symptoms: 'लक्षण',
      emergency: 'आपातकालीन सहायता',
      healthEducation: 'स्वास्थ्य शिक्षा',
      disclaimer: 'मेडीकेयर AI केवल जानकारी सहायता प्रदान करता है और किसी पेशेवर डॉक्टर की सलाह का विकल्प नहीं है।'
    }
  };

  static getTranslation(langCode, key) {
    const lang = this.translations[langCode] || this.translations['en'];
    return lang[key] || this.translations['en'][key] || key;
  }
}
