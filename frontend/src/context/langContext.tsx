'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import i18n from 'i18next'
import '../utils/i18n' // Import the i18n initialization

export type Lang = 'en' | 'fr'

interface LangContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  mounted: boolean
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  mounted: false
})

interface LangProviderProps {
  children: React.ReactNode
}

/**
 * @name LangProvider
 * @description Provides language context and persists selected language using localStorage.
 * @param {React.ReactNode} param0.children - Child components
 * @returns {JSX.Element} Language context provider wrapping children
 */
export const LangProvider = ({ children }: LangProviderProps) => {
  const [lang, setLang] = useState<Lang>('en')
  const [mounted, setMounted] = useState(false)
  
  // Handle language change
  const handleSetLang = (newLang: Lang) => {
    if (mounted) {
      setLang(newLang)
      i18n.changeLanguage(newLang) // Change i18next language
    }
  }
  
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem('lang') as Lang | null
      if (stored && (stored === 'en' || stored === 'fr')) {
        handleSetLang(stored)
      } else {
        localStorage.setItem('lang', 'en')
        handleSetLang('en')
      }
    } catch (e) {
      handleSetLang('en')
    }
  }, [])
  
  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem('lang', lang)
    } catch (e) {
      // Silent fail for localStorage errors
    }
  }, [lang, mounted])

  return <LangContext.Provider value={{ lang, setLang: handleSetLang, mounted }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
