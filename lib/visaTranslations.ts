import { translations } from './i18n';

// Translation mappings for dynamic visa fields
const visaTypeTranslations: Record<'en' | 'fr' | 'ar', Record<string, string>> = {
  en: {
    'Tourist Visa': 'Tourist Visa',
    'Business Visa': 'Business Visa',
    'Student Visa': 'Student Visa',
    'Work Visa': 'Work Visa',
    'Transit Visa': 'Transit Visa',
    'Medical Visa': 'Medical Visa',
    'Family Visit Visa': 'Family Visit Visa',
    'Conference Visa': 'Conference Visa',
    'Cultural Visa': 'Cultural Visa',
    'Religious Visa': 'Religious Visa',
    'Diplomatic Visa': 'Diplomatic Visa',
    'Official Visa': 'Official Visa',
    'Emergency Visa': 'Emergency Visa',
    'Extension Visa': 'Extension Visa',
  },
  fr: {
    'Tourist Visa': 'Visa Touristique',
    'Business Visa': 'Visa d\'Affaires',
    'Student Visa': 'Visa Étudiant',
    'Work Visa': 'Visa de Travail',
    'Transit Visa': 'Visa de Transit',
    'Medical Visa': 'Visa Médical',
    'Family Visit Visa': 'Visa de Visite Familiale',
    'Conference Visa': 'Visa de Conférence',
    'Cultural Visa': 'Visa Culturel',
    'Religious Visa': 'Visa Religieux',
    'Diplomatic Visa': 'Visa Diplomatique',
    'Official Visa': 'Visa Officiel',
    'Emergency Visa': 'Visa d\'Urgence',
    'Extension Visa': 'Visa de Prolongation',
  },
  ar: {
    'Tourist Visa': 'تأشيرة سياحية',
    'Business Visa': 'تأشيرة عمل',
    'Student Visa': 'تأشيرة طالب',
    'Work Visa': 'تأشيرة عمل',
    'Transit Visa': 'تأشيرة عبور',
    'Medical Visa': 'تأشيرة طبية',
    'Family Visit Visa': 'تأشيرة زيارة عائلية',
    'Conference Visa': 'تأشيرة مؤتمر',
    'Cultural Visa': 'تأشيرة ثقافية',
    'Religious Visa': 'تأشيرة دينية',
    'Diplomatic Visa': 'تأشيرة دبلوماسية',
    'Official Visa': 'تأشيرة رسمية',
    'Emergency Visa': 'تأشيرة طوارئ',
    'Extension Visa': 'تأشيرة تمديد',
  },
};

const entriesTranslations: Record<'en' | 'fr' | 'ar', Record<string, string>> = {
  en: {
    'Single Entry': 'Single Entry',
    'Double Entry': 'Double Entry',
    'Multiple Entry': 'Multiple Entry',
    'Single': 'Single',
    'Double': 'Double',
    'Multiple': 'Multiple',
  },
  fr: {
    'Single Entry': 'Entrée Unique',
    'Double Entry': 'Double Entrée',
    'Multiple Entry': 'Entrées Multiples',
    'Single': 'Unique',
    'Double': 'Double',
    'Multiple': 'Multiples',
  },
  ar: {
    'Single Entry': 'دخول واحد',
    'Double Entry': 'دخولان',
    'Multiple Entry': 'دخول متعدد',
    'Single': 'واحد',
    'Double': 'اثنان',
    'Multiple': 'متعدد',
  },
};

const requirementTranslations: Record<'en' | 'fr' | 'ar', Record<string, string>> = {
  en: {
    'Valid passport with at least 6 months validity': 'Valid passport with at least 6 months validity',
    'Recent passport-sized photos': 'Recent passport-sized photos',
    'Completed visa application form': 'Completed visa application form',
    'Flight itinerary or travel plans': 'Flight itinerary or travel plans',
    'Hotel booking confirmation': 'Hotel booking confirmation',
    'Bank statements for the last 3 months': 'Bank statements for the last 3 months',
    'Employment letter': 'Employment letter',
    'University acceptance letter': 'University acceptance letter',
    'Medical certificate': 'Medical certificate',
    'Birth certificate': 'Birth certificate',
    'Marriage certificate': 'Marriage certificate',
    'Invitation letter from host': 'Invitation letter from host',
    'Conference registration confirmation': 'Conference registration confirmation',
    'Company registration documents': 'Company registration documents',
    'Tax documents': 'Tax documents',
    'Police clearance certificate': 'Police clearance certificate',
    'Medical insurance': 'Medical insurance',
    'Yellow fever vaccination certificate': 'Yellow fever vaccination certificate',
  },
  fr: {
    'Valid passport with at least 6 months validity': 'Passeport valide avec au moins 6 mois de validité',
    'Recent passport-sized photos': 'Photos d\'identité récentes',
    'Completed visa application form': 'Formulaire de demande de visa rempli',
    'Flight itinerary or travel plans': 'Itinéraire de vol ou plans de voyage',
    'Hotel booking confirmation': 'Confirmation de réservation d\'hôtel',
    'Bank statements for the last 3 months': 'Relevés bancaires des 3 derniers mois',
    'Employment letter': 'Lettre d\'emploi',
    'University acceptance letter': 'Lettre d\'acceptation universitaire',
    'Medical certificate': 'Certificat médical',
    'Birth certificate': 'Certificat de naissance',
    'Marriage certificate': 'Certificat de mariage',
    'Invitation letter from host': 'Lettre d\'invitation de l\'hôte',
    'Conference registration confirmation': 'Confirmation d\'inscription à la conférence',
    'Company registration documents': 'Documents d\'enregistrement de l\'entreprise',
    'Tax documents': 'Documents fiscaux',
    'Police clearance certificate': 'Certificat de police',
    'Medical insurance': 'Assurance médicale',
    'Yellow fever vaccination certificate': 'Certificat de vaccination contre la fièvre jaune',
  },
  ar: {
    'Valid passport with at least 6 months validity': 'جواز سفر صالح لمدة لا تقل عن 6 أشهر',
    'Recent passport-sized photos': 'صور شخصية حديثة بحجم جواز السفر',
    'Completed visa application form': 'نموذج طلب التأشيرة مكتمل',
    'Flight itinerary or travel plans': 'خط سير الرحلة أو خطط السفر',
    'Hotel booking confirmation': 'تأكيد حجز الفندق',
    'Bank statements for the last 3 months': 'كشوف حساب بنكي لآخر 3 أشهر',
    'Employment letter': 'خطاب عمل',
    'University acceptance letter': 'خطاب قبول الجامعة',
    'Medical certificate': 'شهادة طبية',
    'Birth certificate': 'شهادة ميلاد',
    'Marriage certificate': 'شهادة زواج',
    'Invitation letter from host': 'خطاب دعوة من المضيف',
    'Conference registration confirmation': 'تأكيد تسجيل المؤتمر',
    'Company registration documents': 'وثائق تسجيل الشركة',
    'Tax documents': 'وثائق ضريبية',
    'Police clearance certificate': 'شهادة الشرطة',
    'Medical insurance': 'تأمين طبي',
    'Yellow fever vaccination certificate': 'شهادة تطعيم الحمى الصفراء',
  },
};

// Utility functions for translating dynamic visa fields
export const translateVisaType = (visaType: string, language: 'en' | 'fr' | 'ar'): string => {
  return visaTypeTranslations[language][visaType] || visaType;
};

export const translateEntries = (entries: string, language: 'en' | 'fr' | 'ar'): string => {
  return entriesTranslations[language][entries] || entries;
};

export const translateRequirement = (requirement: string, language: 'en' | 'fr' | 'ar'): string => {
  return requirementTranslations[language][requirement] || requirement;
};

export const translateDescription = (description: string, language: 'en' | 'fr' | 'ar'): string => {
  // For descriptions, we'll use a simple approach - split by sentences and translate common phrases
  // This is a basic implementation - in a real app, you might want more sophisticated translation
  const commonPhrases: Record<'en' | 'fr' | 'ar', Record<string, string>> = {
    en: {
      'This visa allows': 'This visa allows',
      'tourists to visit': 'tourists to visit',
      'for tourism purposes': 'for tourism purposes',
      'business travelers': 'business travelers',
      'to conduct business': 'to conduct business',
      'students to study': 'students to study',
      'workers to work': 'workers to work',
      'family visits': 'family visits',
      'medical treatment': 'medical treatment',
      'religious purposes': 'religious purposes',
      'cultural activities': 'cultural activities',
      'conferences and events': 'conferences and events',
      'official government business': 'official government business',
      'diplomatic missions': 'diplomatic missions',
    },
    fr: {
      'This visa allows': 'Ce visa permet',
      'tourists to visit': 'aux touristes de visiter',
      'for tourism purposes': 'à des fins touristiques',
      'business travelers': 'aux voyageurs d\'affaires',
      'to conduct business': 'de mener des affaires',
      'students to study': 'aux étudiants d\'étudier',
      'workers to work': 'aux travailleurs de travailler',
      'family visits': 'les visites familiales',
      'medical treatment': 'les traitements médicaux',
      'religious purposes': 'les fins religieuses',
      'cultural activities': 'les activités culturelles',
      'conferences and events': 'les conférences et événements',
      'official government business': 'les affaires gouvernementales officielles',
      'diplomatic missions': 'les missions diplomatiques',
    },
    ar: {
      'This visa allows': 'يسمح هذا التأشيرة',
      'tourists to visit': 'للسياح بزيارة',
      'for tourism purposes': 'لأغراض سياحية',
      'business travelers': 'للمسافرين التجاريين',
      'to conduct business': 'لإجراء الأعمال',
      'students to study': 'للطلاب بالدراسة',
      'workers to work': 'للعمال بالعمل',
      'family visits': 'الزيارات العائلية',
      'medical treatment': 'العلاج الطبي',
      'religious purposes': 'الأغراض الدينية',
      'cultural activities': 'الأنشطة الثقافية',
      'conferences and events': 'المؤتمرات والفعاليات',
      'official government business': 'الأعمال الحكومية الرسمية',
      'diplomatic missions': 'المهام الدبلوماسية',
    },
  };

  let translated = description;
  Object.entries(commonPhrases.en).forEach(([en, translation]) => {
    if (translated.includes(en)) {
      translated = translated.replace(new RegExp(en, 'g'), commonPhrases[language][en]);
    }
  });

  return translated;
};