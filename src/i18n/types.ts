export type LanguageCode = 'de' | 'en' | 'ar' | 'ku' | 'tr' | 'uk' | 'ru';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  rtl: boolean;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false },
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'ku', name: 'Kurdish', nativeName: 'کوردی', rtl: true },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', rtl: false },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', rtl: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false },
];

export const RTL_LANGUAGES: LanguageCode[] = LANGUAGES.filter(l => l.rtl).map(l => l.code);
