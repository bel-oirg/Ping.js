'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { applyThemeColors } from '@/utils/themeUtils'
import { darkTheme } from '@/theme/theme'
import { ThemeData } from '@/types/theme'

interface ThemeContextType {
  themeData: ThemeData
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  themeData: darkTheme,
  mounted: false
})

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mounted, setMounted] = useState(false)
  const [themeData, setThemeData] = useState<ThemeData>(darkTheme)  
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
    applyThemeColors(themeData)
  }, [mounted, themeData])

  const contextValue = {
    themeData,
    mounted
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext) 