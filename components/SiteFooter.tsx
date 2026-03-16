'use client'
import { useLanguage } from '../lib/useLanguage'

const copy = {
  en: {
    tagline: "What Nepal Really Thinks — Live.",
    links: [
      { label: 'Home',          href: '/' },
      { label: 'Live Polls',    href: '/polls' },
      { label: 'Leaderboard',   href: '/leaderboard' },
      { label: 'Hot News',      href: '/hot-news' },
      { label: 'AI Prediction', href: '/ai-prediction' },
    ],
    copy: '© 2026 Nepomarket.com · Non-monetary civic platform · Nepal',
    privacy: 'Privacy & Policy',
  },
  ne: {
    tagline: 'नेपालले वास्तवमा के सोच्छ — अहिले।',
    links: [
      { label: 'गृहपृष्ठ',           href: '/' },
      { label: 'प्रत्यक्ष मतदान',    href: '/polls' },
      { label: 'लिडरबोर्ड',          href: '/leaderboard' },
      { label: 'ताजा समाचार',        href: '/hot-news' },
      { label: 'AI भविष्यवाणी',      href: '/ai-prediction' },
    ],
    copy: '© २०२६ Nepomarket.com · गैर-मौद्रिक नागरिक मञ्च · नेपाल',
    privacy: 'गोपनीयता र नीति',
  },
}

export default function SiteFooter() {
  const { lang } = useLanguage()
  const t = copy[lang]

  return (
    <footer style={{
      borderTop: '1px solid rgba(245,237,216,0.08)',
      background: 'rgba(10,4,6,0.6)',
      padding: '48px 40px 32px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
        .sf-link { font-family:'DM Mono',monospace; font-size:0.68rem; color:rgba(245,237,216,0.35); text-decoration:none; letter-spacing:0.04em; transition:color 0.2s; white-space:nowrap; }
        .sf-link:hover { color:#DC143C; }
        .sf-privacy { font-family:'DM Mono',monospace; font-size:0.6rem; color:rgba(245,237,216,0.3); text-decoration:underline; text-underline-offset:3px; text-decoration-color:rgba(245,237,216,0.15); letter-spacing:0.06em; transition:color 0.2s, text-decoration-color 0.2s; }
        .sf-privacy:hover { color:#DC143C; text-decoration-color:#DC143C; }
        @media(max-width:640px){ .sf-top{ flex-direction:column !important; gap:28px !important; } .sf-links{ flex-wrap:wrap !important; } .sf-bottom{ flex-direction:column !important; gap:10px !important; text-align:center; } }
      `}</style>

      {/* Top row — logo + nav links */}
      <div className="sf-top" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'40px', marginBottom:'32px' }}>

        {/* Logo + tagline */}
        <div style={{ flexShrink: 0 }}>
          <a href="/" style={{ fontFamily:"'Instrument Serif',serif", fontSize:'1.3rem', color:'#F5EDD8', textDecoration:'none', letterSpacing:'-0.01em' }}>
            Nepo<span style={{ color:'#DC143C' }}>market</span>
            <span style={{ fontSize:'0.9rem', marginLeft:'5px' }}>🇳🇵</span>
          </a>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', color:'rgba(245,237,216,0.25)', marginTop:'8px', letterSpacing:'0.03em', maxWidth:'220px', lineHeight:1.6 }}>
            {t.tagline}
          </p>
        </div>

        {/* Nav links */}
        <div className="sf-links" style={{ display:'flex', gap:'8px 24px', flexWrap:'wrap', justifyContent:'flex-end', paddingTop:'4px' }}>
          {t.links.map(link => (
            <a key={link.href} href={link.href} className="sf-link">{link.label}</a>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height:'1px', background:'linear-gradient(90deg, rgba(220,20,60,0.25) 0%, rgba(245,237,216,0.06) 40%, rgba(0,56,147,0.2) 100%)', marginBottom:'20px' }} />

      {/* Bottom row — copyright + privacy link */}
      <div className="sf-bottom" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'16px' }}>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', color:'rgba(245,237,216,0.18)', letterSpacing:'0.06em' }}>
          {t.copy}
        </p>
        <a href="/privacy" className="sf-privacy">{t.privacy}</a>
      </div>
    </footer>
  )
}
