// Clean Baseline Translation Service

export const generateFullGuidance = (lang, medicines = []) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!medicines || medicines.length === 0) {
        resolve('No medicines detected in prescription.');
        return;
      }

      const list = medicines.map((m, idx) => `${idx + 1}. ${m.name} (${m.dose || '1 dose'}) - ${m.frequency || 'Take as directed'}`).join('\n');
      resolve(`Medication Guidance (${lang}):\n\n${list}\n\nPlease consult your healthcare provider.`);
    }, 100);
  });
};
