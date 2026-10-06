import React, { useState, useMemo } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { 
  BookOpen, Search, X, Clock, ArrowRight, ShieldCheck, 
  Sparkles, Heart, Activity, Baby, Users, Pill, Stethoscope, 
  AlertCircle, Moon, Apple, ShieldAlert, Droplets, Flame
} from 'lucide-react';
import ArticleReaderModal from '../components/education/ArticleReaderModal';

export const HEALTH_ARTICLES = [
  {
    id: '1',
    title: 'Understanding Antibiotics: Why Finishing Your Prescription Course Matters',
    category: 'Medicine Safety',
    readTime: '4 min read',
    snippet: 'Stopping antibiotics early can lead to bacterial resistance. Learn how to take prescription antibiotics safely.',
    color: '#16A57A',
    keywords: ['antibiotics', 'amoxicillin', 'azithromycin', 'infection', 'bacterial', 'resistance', 'dosage', 'prescription', 'pills'],
    conditions: ['Bacterial infection', 'Fever', 'Throat infection', 'Pneumonia'],
    medicines: ['Amoxicillin', 'Azithromycin', 'Cefixime', 'Augmentin'],
    symptoms: ['Fever', 'Sore throat', 'Cough', 'Infection'],
    intro: 'Antibiotics are powerful medicines that fight bacterial infections. However, taking them incorrectly or stopping early can make bacteria resistant to treatment.',
    keyPoints: [
      'Always complete the exact number of days prescribed by your doctor even if you feel completely better.',
      'Never save left-over antibiotics for future illnesses or share them with family members.',
      'Take doses at regular scheduled intervals (e.g. every 8 or 12 hours) with a full glass of water.'
    ],
    simpleExplanation: 'When you take an antibiotic, it immediately starts killing weak bacteria. If you stop taking the medicine after 2 or 3 days because you feel better, the strongest bacteria survive. These surviving bacteria multiply and become immune to that antibiotic, making future infections much harder to treat with standard medicines.',
    whenToSeekHelp: 'If you experience severe allergic reactions (hives, swelling of face or lips, difficulty breathing) or severe watery diarrhea, contact emergency services or your doctor immediately.'
  },
  {
    id: '2',
    title: 'Maternal Nutrition & Essential Care During Early Pregnancy',
    category: 'Maternal Health',
    readTime: '6 min read',
    snippet: 'Essential dietary guidance, folic acid supplements, hydration, and routine checkups for expecting mothers.',
    color: '#7C3AED',
    keywords: ['pregnancy', 'maternal', 'folic acid', 'iron', 'calcium', 'baby', 'trimester', 'nutrition', 'prenatal'],
    conditions: ['Pregnancy', 'Morning sickness', 'Anemia in pregnancy'],
    medicines: ['Folic Acid', 'Iron tablets', 'Calcium vitamin D3'],
    symptoms: ['Nausea', 'Fatigue', 'Dizziness', 'Morning sickness'],
    intro: 'Proper nutrition and healthcare during early pregnancy lay the foundation for a healthy mother and baby. Key vitamins and balanced meals are vital in the first trimester.',
    keyPoints: [
      'Take 400 mcg of daily Folic Acid to support healthy neural tube development.',
      'Consume iron-rich foods (green leafy vegetables, lentils, dates) to prevent maternal anemia.',
      'Stay well-hydrated with at least 8-10 glasses of clean water daily.',
      'Avoid unpasteurized milk, raw eggs, excessive caffeine, and self-medication.'
    ],
    simpleExplanation: 'During pregnancy, your body requires extra nutrients to support your developing baby. Folic acid helps build the baby\'s spine and brain, while iron creates hemoglobin to carry oxygen. Regular prenatal visits monitor fetal growth and maternal blood pressure.',
    whenToSeekHelp: 'Seek immediate care for severe abdominal pain, persistent vomiting, vaginal bleeding, sudden swelling of hands/face, or blurred vision.'
  },
  {
    id: '3',
    title: 'Managing High Blood Pressure (Hypertension) at Home',
    category: 'Heart Health',
    readTime: '5 min read',
    snippet: 'Simple dietary changes, low-salt tips, daily blood pressure tracking, and medication adherence for long-term health.',
    color: '#2563EB',
    keywords: ['blood pressure', 'hypertension', 'bp', 'heart', 'telmisartan', 'amlodipine', 'salt', 'dash diet', 'cardiac'],
    conditions: ['High Blood Pressure', 'Hypertension', 'Cardiovascular disease'],
    medicines: ['Telmisartan', 'Amlodipine', 'Losartan', 'Ecosprin'],
    symptoms: ['Headache', 'Dizziness', 'Chest discomfort', 'Shortness of breath'],
    intro: 'High blood pressure is often called a silent condition because it rarely shows obvious warning signs, yet it puts extra strain on your heart and blood vessels.',
    keyPoints: [
      'Reduce daily salt intake to less than 1 teaspoon (under 5 grams) per day.',
      'Take prescribed blood pressure tablets every day at the exact same time without skipping.',
      'Engage in 30 minutes of moderate aerobic activity like brisk walking 5 days a week.',
      'Check and log your blood pressure readings once or twice a week at home.'
    ],
    simpleExplanation: 'When blood pressure remains high over time, it forces your heart to pump harder against stiff arterial walls. Healthy food habits, reduced processed foods, stress reduction, and consistent medication keep your arteries flexible and protect your heart, kidneys, and brain.',
    whenToSeekHelp: 'If your BP exceeds 180/120 mmHg or is accompanied by chest pain, shortness of breath, back pain, or vision changes, go to the nearest emergency room immediately.'
  },
  {
    id: '4',
    title: 'Preventive Healthcare & Essential Annual Health Checkups',
    category: 'Preventive Care',
    readTime: '5 min read',
    snippet: 'Why routine lipid profiles, blood glucose screenings, and kidney function tests catch illnesses early before symptoms appear.',
    color: '#0891B2',
    keywords: ['preventive', 'checkup', 'screening', 'lipid profile', 'cholesterol', 'blood test', 'annual test'],
    conditions: ['Early disease detection', 'High cholesterol', 'Fatty liver', 'Pre-diabetes'],
    medicines: ['Multivitamins', 'Omega-3', 'Prescribed statins'],
    symptoms: ['No early symptoms', 'Silent risk factors'],
    intro: 'Preventive screening detects chronic metabolic diseases at their earliest, most treatable stages before permanent organ damage occurs.',
    keyPoints: [
      'Adults over 30 should get annual fasting blood glucose and lipid panel tests.',
      'Check blood pressure and body mass index (BMI) at every clinic visit.',
      'Maintain an up-to-date record of all medical documents and test reports in MediCare AI.',
      'Discuss family health history with your doctor to customize your screening schedule.'
    ],
    simpleExplanation: 'Many serious conditions like early-stage hypertension, high cholesterol, and pre-diabetes show zero visible symptoms. Regular preventive blood tests give your doctor an objective snapshot to reverse health risks with lifestyle adjustments before chronic medicines are needed.',
    whenToSeekHelp: 'Consult your doctor if screening tests show fasting blood sugar over 126 mg/dL, elevated liver enzymes, or LDL cholesterol above 160 mg/dL.'
  },
  {
    id: '5',
    title: 'Understanding Diabetes & Daily Blood Sugar Management',
    category: 'Diabetes',
    readTime: '6 min read',
    snippet: 'Understanding HbA1c, fasting glucose levels, balanced meal planning, foot care, and oral diabetes medicines.',
    color: '#D97706',
    keywords: ['diabetes', 'blood sugar', 'glucose', 'metformin', 'insulin', 'glycomet', 'hba1c', 'pancreas', 'sugar'],
    conditions: ['Type 2 Diabetes', 'Hyperglycemia', 'Hypoglycemia'],
    medicines: ['Metformin', 'Glimepiride', 'Vildagliptin', 'Insulin'],
    symptoms: ['Frequent urination', 'Excessive thirst', 'Fatigue', 'Slow wound healing'],
    intro: 'Managing diabetes is about keeping blood glucose in a safe target range to avoid long-term nerve, eye, kidney, and cardiovascular complications.',
    keyPoints: [
      'Eat complex fiber-rich carbohydrates (whole grains, oats, vegetables) instead of refined sugars.',
      'Take Metformin or prescribed oral antidiabetic tablets with or after meals.',
      'Inspect your feet daily for small cuts, blisters, or sores.',
      'Carry quick-acting glucose sweets in case of hypoglycemia (sweating, trembling, dizziness).'
    ],
    simpleExplanation: 'In type 2 diabetes, the body produces insulin but cells become resistant to it, causing sugar to build up in the bloodstream. Regular physical movement increases insulin sensitivity, allowing muscles to absorb glucose naturally.',
    whenToSeekHelp: 'If blood sugar drops below 70 mg/dL and does not recover with fast sugar, or if blood glucose is persistently over 300 mg/dL with confusion or nausea, seek urgent emergency care.'
  },
  {
    id: '6',
    title: 'Safe Use of Common Over-The-Counter & Pain Medicines',
    category: 'Medicine Safety',
    readTime: '4 min read',
    snippet: 'Understanding maximum daily doses, avoiding accidental paracetamol double-dosing in combination syrups, and protecting stomach lining.',
    color: '#16A57A',
    keywords: ['paracetamol', 'crocin', 'dolo', 'ibuprofen', 'painkiller', 'nsaid', 'fever', 'headache', 'liver', 'stomach'],
    conditions: ['Fever', 'Body pain', 'Headache', 'Arthritis', 'Viral fever'],
    medicines: ['Paracetamol 650', 'Dolo 650', 'Ibuprofen', 'Combiflam', 'Pantoprazole'],
    symptoms: ['Fever', 'Headache', 'Joint pain', 'Muscle ache'],
    intro: 'Over-the-counter and prescription pain relievers are very effective when used appropriately, but exceeding daily limits can damage the liver or stomach.',
    keyPoints: [
      'Do not exceed 4,000 mg (4 grams) of Paracetamol in 24 hours from all combined sources.',
      'Check cold, cough, and flu syrups to avoid doubling up on hidden paracetamol (acetaminophen).',
      'Always take NSAIDs (like Ibuprofen or Diclofenac) after meals to protect your stomach.',
      'Avoid drinking alcohol while taking daily pain medications.'
    ],
    simpleExplanation: 'Paracetamol is broken down in the liver. Taking too much overwhelms the liver\'s detox pathways, causing cellular damage. Anti-inflammatory pain medicines can irritate the stomach acid barrier, so taking them with food prevents ulcers.',
    whenToSeekHelp: 'If accidental overdose occurs, or if you notice yellowing of the eyes/skin (jaundice), dark urine, or severe stomach pain, visit the hospital emergency department.'
  },
  {
    id: '7',
    title: 'Healthy Nutrition & Immunization Schedules for Children',
    category: 'Child Health',
    readTime: '5 min read',
    snippet: 'Routine vaccination milestones, managing high childhood fever, oral rehydration therapy (ORS) for diarrhea, and growth tracking.',
    color: '#EC4899',
    keywords: ['child', 'pediatric', 'vaccine', 'immunization', 'fever', 'ors', 'diarrhea', 'baby', 'infant'],
    conditions: ['Childhood fever', 'Dehydration', 'Diarrhea', 'Common cold in children'],
    medicines: ['Paracetamol pediatric drops', 'ORS solution', 'Zinc syrup'],
    symptoms: ['High fever', 'Loose stools', 'Lethargy', 'Crying', 'Loss of appetite'],
    intro: 'Timely immunizations protect children from life-threatening preventable illnesses like measles, polio, and hepatitis, while proper home hydration prevents acute dehydration.',
    keyPoints: [
      'Follow your government pediatric immunization chart and do not skip booster doses.',
      'For childhood loose stools, administer Oral Rehydration Salts (ORS) solution continuously in small sips.',
      'Calculate pediatric fever medicines strictly according to the child\'s weight, not age alone.',
      'Never give Aspirin to children or teenagers due to the risk of Reye\'s syndrome.'
    ],
    simpleExplanation: 'Children lose body fluids much faster than adults during vomiting or fever episodes. ORS contains the exact ratio of water, salt, and sugar to speed up intestinal absorption and keep vital organs functioning.',
    whenToSeekHelp: 'Seek immediate pediatric emergency care if an infant under 3 months has a fever over 100.4°F (38°C), or if a child is unresponsive, has sunken eyes, or cannot retain fluids.'
  },
  {
    id: '8',
    title: 'Caring for Elderly Family Members & Home Fall Prevention',
    category: 'Elderly Care',
    readTime: '5 min read',
    snippet: 'Organizing daily pill boxes, home safety modifications, gentle balance exercises, and monitoring drug interactions in senior citizens.',
    color: '#8B5CF6',
    keywords: ['elderly', 'senior', 'falls', 'joints', 'calcium', 'arthritis', 'polypharmacy', 'pill box', 'bone health'],
    conditions: ['Osteoporosis', 'Arthritis', 'Balance disorders', 'High blood pressure in elderly'],
    medicines: ['Shelcal 500', 'Vitamin D3', 'Glucosamine', 'Pain gels'],
    symptoms: ['Joint stiffness', 'Unsteadiness', 'Weak bones', 'Memory lapses with pills'],
    intro: 'As we age, managing multiple prescriptions safely and making home environments slip-free prevents debilitating fractures and medicine mistakes.',
    keyPoints: [
      'Use a 7-day pill organizer (pill box) divided into morning, afternoon, and night slots.',
      'Install grab bars in bathrooms and remove loose carpets or tripping hazards around the home.',
      'Ensure adequate daily calcium and Vitamin D to maintain bone density.',
      'Review all active medicines with a doctor twice a year to discontinue unnecessary pills.'
    ],
    simpleExplanation: 'Aging changes how the body metabolizes medicines, making seniors more sensitive to side effects like dizziness. Simple home modifications and clear schedule reminders allow seniors to remain independent and healthy.',
    whenToSeekHelp: 'Any fall resulting in head impact, inability to bear weight on a leg/hip, or sudden severe confusion requires urgent medical examination.'
  },
  {
    id: '9',
    title: 'Heart-Healthy Lifestyle Habits & Cholesterol Control',
    category: 'Heart Health',
    readTime: '5 min read',
    snippet: 'Replacing saturated fats with heart-friendly nuts and seeds, stress reduction techniques, and understanding HDL/LDL cholesterol ratios.',
    color: '#2563EB',
    keywords: ['heart', 'cardiac', 'cholesterol', 'ldl', 'hdl', 'triglycerides', 'atorvastatin', 'exercise', 'diet'],
    conditions: ['Atherosclerosis', 'Coronary artery disease', 'High cholesterol'],
    medicines: ['Atorvastatin', 'Rosuvastatin', 'Fish oil'],
    symptoms: ['Chest tightness', 'Breathlessness on exertion', 'Fatigue'],
    intro: 'Cardiovascular disease is largely preventable through proactive lifestyle habits, balanced cooking oils, daily movement, and smoking cessation.',
    keyPoints: [
      'Incorporate omega-3 fatty acids from walnuts, flaxseeds, and fatty fish into your weekly diet.',
      'Limit deep-fried foods and bakery trans-fats that drive up bad LDL cholesterol.',
      'Practice 10 minutes of daily deep breathing or meditation to lower cortisol and arterial tension.',
      'Take prescribed cholesterol-lowering statin medications at night as instructed by your doctor.'
    ],
    simpleExplanation: 'Excess LDL cholesterol slowly deposits plaques inside artery walls, narrowing the channels through which blood reaches your heart muscle. Regular cardio exercise raises protective HDL cholesterol, which clears arterial deposits.',
    whenToSeekHelp: 'Seek immediate emergency room care for sudden crushing chest pressure radiating to the left arm, jaw, or neck accompanied by cold sweats.'
  },
  {
    id: '10',
    title: 'Recognizing Early Signs of Dehydration & Seasonal Fevers',
    category: 'Common Diseases',
    readTime: '5 min read',
    snippet: 'Recognizing dengue and viral warning signs, monitoring platelet counts, hydration therapy, and why to avoid NSAIDs during viral fevers.',
    color: '#0284C7',
    keywords: ['dehydration', 'dengue', 'viral fever', 'mosquito', 'platelets', 'hydration', 'paracetamol', 'fever', 'flu'],
    conditions: ['Dengue fever', 'Viral fever', 'Dehydration', 'Heat exhaustion'],
    medicines: ['Paracetamol 500', 'ORS', 'Electrolytes'],
    symptoms: ['High fever', 'Severe eye pain', 'Dry mouth', 'Dark urine', 'Dizziness'],
    intro: 'Seasonal viral infections like dengue and monsoon fevers require diligent hydration and careful temperature management while watching for dehydration.',
    keyPoints: [
      'Use ONLY Paracetamol for fever relief during suspected dengue; NEVER take Ibuprofen or Aspirin as they increase bleeding risks.',
      'Drink 3-4 liters of fluids daily (ORS, coconut water, fresh fruit juices, clear broths).',
      'Check urine color: pale yellow indicates healthy hydration; dark amber signals severe fluid deficit.',
      'Use mosquito repellents, window nets, and eliminate standing water around your living areas.'
    ],
    simpleExplanation: 'High fever accelerates body water loss through sweating and rapid breathing. Replacing lost electrolytes maintains blood volume, prevents dangerous drops in blood pressure, and supports kidneys in filtering toxins.',
    whenToSeekHelp: 'Seek immediate hospitalization if you develop persistent vomiting, severe abdominal pain, bleeding gums/nose, extreme lethargy, or inability to pass urine for 8+ hours.'
  },
  {
    id: '11',
    title: 'Healthy Sleep Habits, Circadian Rhythms & Mental Wellness',
    category: 'Mental Wellness',
    readTime: '4 min read',
    snippet: 'How quality 7-8 hours of sleep restores brain neurotransmitters, improves immune resilience, and stabilizes daily mood.',
    color: '#6366F1',
    keywords: ['sleep', 'insomnia', 'mental health', 'stress', 'anxiety', 'melatonin', 'circadian', 'rest', 'wellness'],
    conditions: ['Insomnia', 'Chronic stress', 'Anxiety', 'Sleep deprivation'],
    medicines: ['Melatonin (supplements)', 'Herbal chamomile tea'],
    symptoms: ['Daytime fatigue', 'Brain fog', 'Irritability', 'Difficulty falling asleep'],
    intro: 'Sleep is not passive downtime; it is an active neurological repair phase essential for memory consolidation, hormonal balance, and psychological health.',
    keyPoints: [
      'Maintain a consistent sleep-wake schedule 7 days a week to strengthen your internal circadian rhythm.',
      'Avoid digital screens (blue light) at least 45 minutes before bedtime.',
      'Keep your sleeping room cool, quiet, and completely dark.',
      'Limit evening caffeine and heavy late-night dinners that disrupt deep REM sleep cycles.'
    ],
    simpleExplanation: 'During deep slow-wave sleep, your brain clears metabolic waste products through the glymphatic system. Consistently missing sleep increases stress hormones like cortisol, impairs insulin sensitivity, and weakens immune defense.',
    whenToSeekHelp: 'Consult a healthcare provider if chronic insomnia lasts more than 3 weeks or if you experience loud snoring with daytime gasping (suspected sleep apnea).'
  },
  {
    id: '12',
    title: 'Basic Everyday First Aid Protocols Everyone Should Know',
    category: 'First Aid',
    readTime: '5 min read',
    snippet: 'Essential action steps for cuts, minor burns, sprains, nosebleeds, and recognizing when an emergency 108 call is required.',
    color: '#DC2626',
    keywords: ['first aid', 'emergency', 'burns', 'cuts', 'nosebleed', 'choking', 'cpr', 'bleeding', 'sprain'],
    conditions: ['Minor cuts', 'Thermal burns', 'Nosebleed', 'Ankle sprain', 'Choking'],
    medicines: ['Antiseptic cream (Betadine)', 'Sterile gauze', 'Ice pack', 'Band-aids'],
    symptoms: ['Bleeding', 'Swelling', 'Pain from injury', 'Skin burn'],
    intro: 'Immediate and calm first-aid response during the first few minutes of an accident prevents infections, reduces tissue damage, and saves lives.',
    keyPoints: [
      'For bleeding cuts: apply firm direct pressure with clean gauze for 5 minutes before applying a bandage.',
      'For burns: cool under running tap water for 10-15 minutes; never use ice, butter, or toothpaste.',
      'For nosebleeds: sit upright and lean forward slightly; pinch the soft part of the nose for 10 minutes continuously.',
      'For sprains: apply R.I.C.E. (Rest, Ice wrapped in towel, Compression bandage, and Elevation above heart level).'
    ],
    simpleExplanation: 'Correct first-aid techniques support the body\'s natural clotting and anti-inflammatory processes without aggravating injured tissues or introducing bacterial contaminants.',
    whenToSeekHelp: 'Immediately call 108 / 102 for deep gaping wounds, loss of consciousness, inability to breathe, severe head trauma, or uncontrollable bleeding.'
  }
];

const POPULAR_TOPICS = [
  { label: 'Medicine Safety', icon: Pill, color: '#16A57A' },
  { label: 'Heart Health', icon: Heart, color: '#2563EB' },
  { label: 'Diabetes', icon: Activity, color: '#D97706' },
  { label: 'Maternal Health', icon: Sparkles, color: '#7C3AED' },
  { label: 'Child Health', icon: Baby, color: '#EC4899' },
  { label: 'Elderly Care', icon: Users, color: '#8B5CF6' },
  { label: 'First Aid', icon: Flame, color: '#DC2626' }
];

const CATEGORIES = [
  'All', 'Medicine Safety', 'Heart Health', 'Diabetes', 
  'Maternal Health', 'Child Health', 'Elderly Care', 
  'Preventive Care', 'Common Diseases', 'Mental Wellness', 'First Aid'
];

const HealthEducationPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Smart search and category filtering
  const filteredArticles = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return HEALTH_ARTICLES.filter((art) => {
      // Category Match
      const matchesCategory = selectedCategory === 'All' || art.category.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;
      if (!query) return true;

      // Smart multi-field search
      const inTitle = art.title.toLowerCase().includes(query);
      const inSnippet = art.snippet.toLowerCase().includes(query);
      const inContent = (art.simpleExplanation || '').toLowerCase().includes(query);
      const inCategory = art.category.toLowerCase().includes(query);
      const inKeywords = (art.keywords || []).some(k => k.toLowerCase().includes(query));
      const inConditions = (art.conditions || []).some(c => c.toLowerCase().includes(query));
      const inMedicines = (art.medicines || []).some(m => m.toLowerCase().includes(query));
      const inSymptoms = (art.symptoms || []).some(s => s.toLowerCase().includes(query));

      return inTitle || inSnippet || inContent || inCategory || inKeywords || inConditions || inMedicines || inSymptoms;
    });
  }, [searchTerm, selectedCategory]);

  const handleOpenArticle = (art) => {
    setActiveArticle(art);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveArticle(null);
  };

  const handleTopicClick = (topicLabel) => {
    if (selectedCategory === topicLabel) {
      setSelectedCategory('All');
    } else {
      setSelectedCategory(topicLabel);
    }
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.2 }}>
          Learn About Your Health
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', margin: 0 }}>
          Clinically reviewed medical guides, prescription safety instructions, and multilingual family health resources.
        </p>
      </div>

      {/* Search & Category Filter Section */}
      <div className="med-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
        {/* Smart Search Bar with Clear Button */}
        <div className="input-wrapper" style={{ position: 'relative', width: '100%' }}>
          <Search className="input-icon" size={18} />
          <input
            type="text"
            className="input-field"
            placeholder="Search health topics, symptoms, conditions (e.g. Paracetamol, Diabetes, Pregnancy, Blood Pressure)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingRight: searchTerm ? '38px' : '16px' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px'
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Popular Health Topics Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Popular Topics:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {POPULAR_TOPICS.map((topic) => {
              const TopicIcon = topic.icon;
              const isActive = selectedCategory === topic.label;
              return (
                <button
                  key={topic.label}
                  onClick={() => handleTopicClick(topic.label)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: isActive ? 'var(--primary-green)' : 'var(--bg-app)',
                    color: isActive ? 'white' : 'var(--text-primary)',
                    border: `1px solid ${isActive ? 'var(--primary-green)' : 'var(--border-subtle)'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <TopicIcon size={13} color={isActive ? 'white' : topic.color} />
                  <span>{topic.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 no-scrollbar" style={{ overflowX: 'auto', paddingBottom: '4px', width: '100%', scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 600,
                backgroundColor: selectedCategory === cat ? 'var(--primary-green)' : 'var(--bg-app)',
                color: selectedCategory === cat ? 'white' : 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="health-articles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
          {filteredArticles.map((art) => (
            <div 
              key={art.id} 
              className="med-card" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                padding: '22px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxSizing: 'border-box'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span 
                    className="badge-status" 
                    style={{ 
                      backgroundColor: `${art.color || 'var(--primary-green)'}20`, 
                      color: art.color || 'var(--primary-green)',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      padding: '4px 10px',
                      borderRadius: '16px'
                    }}
                  >
                    {art.category}
                  </span>
                  <span className="flex items-center gap-1" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    <Clock size={14} /> {art.readTime}
                  </span>
                </div>

                <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.4' }}>
                  {art.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '18px' }}>
                  {art.snippet}
                </p>
              </div>

              <button
                onClick={() => handleOpenArticle(art)}
                className="btn btn-outline-green"
                style={{ 
                  alignSelf: 'flex-start', 
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '10px'
                }}
              >
                Read Full Article <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="med-card" style={{ padding: '48px 20px', textAlign: 'center', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <BookOpen size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No health topics found
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 16px', lineHeight: '1.6' }}>
            Try searching for another symptom, condition, medicine (e.g. Paracetamol, BP, Diabetes), or clear your filter.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            className="btn btn-primary"
            style={{ margin: '0 auto', fontSize: '13px', padding: '8px 18px' }}
          >
            Reset Filters & View All Articles
          </button>
        </div>
      )}

      {/* Article Reader Modal */}
      <ArticleReaderModal 
        article={activeArticle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </AppLayout>
  );
};

export default HealthEducationPage;
