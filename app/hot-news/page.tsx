'use client'
import SiteNav from '../../components/SiteNav'
import SiteFooter from '../../components/SiteFooter'
import { useLanguage } from '../../lib/useLanguage'

const copy = {
  en: {
    eyebrow: 'Coming Soon',
    h1: 'Hot News',
    sub: "Real-time Nepali political news, trending topics, and viral stories — all in one feed. We're building it.",
    back: '← Back to Polls',
  },
  ne: {
    eyebrow: 'छिट्टै आउँदैछ',
    h1: 'ताजा समाचार',
    sub: 'नेपाली राजनीतिको ताजा समाचार, ट्रेन्डिङ विषय र भाइरल कथाहरू — एउटै फिडमा। हामी बनाउँदैछौं।',
    back: '← मतदानमा फर्कनुहोस्',
  },
}

export default function HotNewsPage() {
  const { lang } = useLanguage()
  const t = copy[lang]

  return (
    <main style={{ background: '#0D0D0D', minHeight: '100vh', fontFamily: "'Syne', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
      <SiteNav />

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '160px 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC143C', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#DC143C', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{t.eyebrow}</span>
        </div>

        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', color: '#F5EDD8', lineHeight: 1.1, marginBottom: '24px' }}>
          🔥 {t.h1}
        </h1>

        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.85rem', color: 'rgba(245,237,216,0.45)', lineHeight: 1.8, marginBottom: '48px' }}>
          {t.sub}
        </p>

        {/* Fake article skeletons */}
        {[1,2,3].map(i => (
          <div key={i} style={{ background: '#1A1A1A', border: '1px solid rgba(245,237,216,0.07)', borderRadius: '8px', padding: '18px', marginBottom: '12px', display: 'flex', gap: '16px', alignItems: 'center', opacity: 1 - i * 0.25 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '6px', background: 'rgba(245,237,216,0.06)', flexShrink: 0 }} />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ height: '10px', background: 'rgba(245,237,216,0.08)', borderRadius: '4px', marginBottom: '8px', width: ['80%','65%','72%'][i-1] }} />
              <div style={{ height: '8px', background: 'rgba(245,237,216,0.05)', borderRadius: '4px', width: ['55%','45%','60%'][i-1] }} />
            </div>
          </div>
        ))}

        <a href="/polls" style={{ display: 'inline-block', marginTop: '32px', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'rgba(245,237,216,0.35)', textDecoration: 'none', borderBottom: '1px solid rgba(245,237,216,0.12)', paddingBottom: '2px' }}>
          {t.back}
        </a>
      </div>
      <SiteFooter />
    </main>
  )
}
