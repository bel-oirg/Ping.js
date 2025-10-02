import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const exo2 = localFont({
  src: [
    {
      path: '../../public/fonts/Exo2-VariableFont_wght.ttf',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Exo2-Italic-VariableFont_wght.ttf',
      style: 'italic',
    }
  ],
  display: 'swap',
  variable: '--font-exo2',
}) 

export const playwrite = localFont({
  src: [
    {
      path: '../../public/fonts/PlaywriteHU-VariableFont_wght.ttf',
      style: 'normal',
    }
  ],
  display: 'swap',
  variable: '--font-playwrite',
}) 