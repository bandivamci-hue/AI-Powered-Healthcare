import api from './api';

export const aiService = {
  /**
   * Generates dynamic, medicine-specific educational guidance via backend Gemini API.
   * Explains what each medicine is generally used for, action mechanism, and precautions
   * in the patient's selected language.
   */
  generateGuidance: async (medicines = [], language = 'English', rawOcrText = '') => {
    if (!medicines || medicines.length === 0) {
      const noMedMap = {
        Hindi: 'प्रिस्क्रिप्शन से कोई दवा नहीं मिली। कृपया स्पष्ट तस्वीर अपलोड करें।',
        Telugu: 'ప్రిస్క్రిప్షన్ నుండి మందులు ఏవీ కనుగొనబడలేదు. దయచేసి స్పష్టమైన చిత్రాన్ని అప్‌లోడ్ చేయండి.',
        Tamil: 'மருந்துச் சீட்டில் மருந்துகள் எதுவும் கண்டறியப்படவில்லை. தெளிவான படத்தை பதிவேற்றவும்.',
        Kannada: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ನಿಂದ ಯಾವುದೇ ಔಷಧಿ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
        Malayalam: 'മരുന്ന് കുറിപ്പിൽ നിന്ന് മരുന്നുകളൊന്നും കണ്ടെത്തിയില്ല. വ്യക്തമായ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക.',
        Marathi: 'प्रिस्क्रिप्शनमधून कोणतीही औषधे आढळली नाहीत. कृपया स्पष्ट प्रतिमा अपलोड करा.',
        Bengali: 'প্রেসক্রিপশন থেকে কোনো ওষুধ পাওয়া যায়নি। পরিষ্কার ছবি আপলোড করুন।',
        Gujarati: 'પ્રિસ્ક્રિપ્શનમાંથી કોઈ દવાઓ મળી નથી. કૃપા કરીને સ્પષ્ટ છબી અપલોડ કરો.',
        Punjabi: 'ਨੁਸਖ਼ੇ ਤੋਂ ਕੋਈ ਦਵਾਈਆਂ ਨਹੀਂ ਮਿਲੀਆਂ। ਕਿਰਪਾ ਕਰਕੇ ਸਪਸ਼ਟ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ।',
        Urdu: 'نسخے سے کوئی دوائیں نہیں ملیں۔ براہ کرم واضح تصویر اپ لوڈ کریں۔',
        English: 'No medicines detected in current prescription. Please upload a clear document image.'
      };
      return noMedMap[language] || noMedMap['English'];
    }

    try {
      const response = await api.post('/api/ai/medicine-guidance/', {
        medicines: medicines,
        raw_ocr_text: rawOcrText,
        language: language
      });

      if (response.data && response.data.formatted_text) {
        return response.data.formatted_text;
      }
      if (response.data && response.data.medicines) {
        return response.data.medicines
          .map((m, i) => `💊 ${i + 1}. ${m.medicine_name}: ${m.description}`)
          .join('\n\n');
      }
    } catch (err) {
      console.warn('[AI Service Warning] Gemini Guidance API fallback:', err);
    }

    // Safe fallback if network error occurs
    return medicines.map((m, i) => {
      const name = m.name || `Medicine ${i + 1}`;
      const dose = m.dose ? `(${m.dose})` : '';
      const timing = m.timing ? `— ${m.timing}` : '';
      return `💊 ${i + 1}. ${name} ${dose}: Prescribed for your clinical care. Please take strictly according to your physician's instructions ${timing}.`;
    }).join('\n\n');
  },

  /**
   * Re-extracts structured medicines and timings when the user manually edits the Raw OCR Text.
   */
  reExtractFromRawText: async (rawText, language = 'English') => {
    try {
      const response = await api.post('/api/ai/re-extract/', {
        raw_text: rawText,
        language: language
      });
      return response.data;
    } catch (err) {
      console.error('[AI Service Error] Re-extract from raw text failed:', err);
      throw err;
    }
  }
};
