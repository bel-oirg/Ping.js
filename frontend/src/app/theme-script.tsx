'use client'

import { useEffect } from 'react'
import { darkTheme } from '@/theme/theme'
import { applyThemeColors } from '@/utils/themeUtils'

export function ThemeScript() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              document.documentElement.classList.add('dark');
              document.documentElement.style.colorScheme = 'dark';

              var root = document.documentElement;
              root.style.setProperty('--background', '#111');
              root.style.setProperty('--frontground', '#eee');
            } catch (e) {
            }
          })();
        `,
      }}
    />
  )
}

export default ThemeScript 