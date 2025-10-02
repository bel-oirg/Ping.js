'use client'

import React, { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/layouts/theme-toggle'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const Header = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 flex justify-end items-center p-4  text-frontground z-50" data-main-header>
      <div className="flex items-center gap-3">
        {/* <ThemeToggle /> */}
        {mounted && <LanguageSwitcher />}
      </div>
    </header>
  )
}

export default Header
