'use client'
import { useLanguage } from '../lib/useLanguage'

const copy = {
  en: { tag: 'Nepomarket · Non-monetary civic polling', privacy: 'Privacy & Policy' },
  ne: { tag: 'Nepomarket · गैर-मौद्रिक नागरिक मतदान', privacy: 'गोपनीयता र नीति' },
}

export default function SiteFooter() {
  const { lang } = useLanguage()
  const t = copy[lang]

  return (
    <div style={{ textAlign: 'center', padding: '24px 20px 32px', borderTop: '1px solid rgba(245,237,216,0.06)' }}>
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', color: 'rgba(245,237,216,0.15)', letterSpacing: '0.08em' }}>
        {t.tag} ·{' '}
        <a
          href="/privacy"
          style={{ color: 'rgba(245,237,216,0.25)', textDecoration: 'underline', textUnderlineOffset: '3px', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#DC143C')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,237,216,0.25)')}
        >
          {t.privacy}
        </a>
      </span>
    </div>
  )
}
