'use client'

import { useTranslation as useI18nextTranslation } from 'react-i18next'
import { useLang } from '@/context/langContext'

/**
 * Custom translation hook that integrates with your language context
 * @param {string} namespace - The translation namespace to use
 * @returns Translation utilities and current language
 */
export const useTranslation = (namespace: string = 'common') => {
  const { t, i18n } = useI18nextTranslation(namespace)
  const { lang, setLang, mounted } = useLang()
  
  return {
    t,
    i18n,
    lang,
    setLang,
    mounted
  }
}

export default useTranslation 