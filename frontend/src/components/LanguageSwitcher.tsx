'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'

/**
 * Language switcher component
 * Allows users to switch between available languages
 */
export default function LanguageSwitcher() {
  const { lang, setLang, t } = useTranslation('common')

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'fr' : 'en')
  }

  return (
    <Button onClick={toggleLanguage} variant="outline" size="sm">
      {lang === 'en' ? 'Français' : 'English'}
    </Button>
  )
} 