'use client'
import { useState, useEffect } from 'react'

export type Lang = 'en' | 'ne'

export function useLanguage() {
  const [lang, setLang] = useState<Lang>('en')
  const [langFlip, setLangFlip] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('nepo-lang') as Lang | null
    if (saved === 'en' || saved === 'ne') setLang(saved)
  }, [])

  function toggleLang() {
    setLangFlip(true)
    setTimeout(() => {
      const next: Lang = lang === 'en' ? 'ne' : 'en'
      localStorage.setItem('nepo-lang', next)
      window.location.reload()
    }, 200)
  }

  return { lang, langFlip, toggleLang }
}
