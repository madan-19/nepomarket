'use client'
import SiteNav from '../../components/SiteNav'
import SiteFooter from '../../components/SiteFooter'
import { useLanguage } from '../../lib/useLanguage'

const copy = {
  en: {
    eyebrow: 'Coming Soon · Beta',
    h1: 'AI Prediction',
    sub: "Machine-learning models trained on Nepal's voting patterns, social sentiment, and historical outcomes — predicting the next political event before it happens.",
    feature1: 'Outcome Probability Engine',
    feature1Desc: 'ML model predicting election outcomes, policy decisions, and development milestones',
    feature2: 'Sentiment Fusion',
    feature2Desc: 'Real-time social media + crowd vote fusion for next-level forecast accuracy',
    feature3: 'Nepal Political Graph',
    feature3Desc: 'Interactive knowledge graph of parties, leaders, and influence networks',
    back: '← Back to Polls',
  },
  ne: {
    eyebrow: 'छिट्टै आउँदैछ · बेटा',
    h1: 'AI भविष्यवाणी',
    sub: 'नेपालको मतदान ढाँचा, सामाजिक भावना र ऐतिहासिक नतिजाहरूमा प्रशिक्षित मेसिन लर्निङ मोडेलहरू — अर्को राजनीतिक घटना हुनुअघि नै भविष्यवाणी।',
    feature1: 'नतिजा सम्भावना इन्जिन',
    feature1Desc: 'चुनाव नतिजा, नीति निर्णय र विकास लक्ष्यको भविष्यवाणी गर्ने ML मोडेल',
    feature2: 'भावना संयोजन',
    feature2Desc: 'उच्च-स्तरीय पूर्वानुमान सटीकताका लागि सामाजिक सञ्जाल + भीड मतदान संयोजन',
    feature3: 'नेपाल राजनीतिक ग्राफ',
    feature3Desc: 'दलहरू, नेताहरू र प्रभाव नेटवर्कको अन्तरक्रियात्मक ज्ञान ग्राफ',
    back: '← मतदानमा फर्कनुहोस्',
  },
}

export default function AIPredictionPage() {
  const { lang } = useLanguage()
  const t = copy[lang]

  const features = [
    { icon: '🧠', title: t.feature1, desc: t.feature1Desc, color: '#DC143C' },
    { icon: '📡', title: t.feature2, desc: t.feature2Desc, color: '#003893' },
    { icon: '🕸️', title: t.feature3, desc: t.feature3Desc, color: '#6ba3e8' },
  ]

  return (
    <main style={{ background: '#0D0D0D', minHeight: '100vh', fontFamily: "'Syne', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes orbit { from{transform:rotate(0deg) translateX(22px) rotate(0deg)} to{transform:rotate(360deg) translateX(22px) rotate(-360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
      <SiteNav />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '160px 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#003893', display: 'inline-block', animation: 'pulse 2.5s ease infinite' }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#6ba3e8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{t.eyebrow}</span>
        </div>

        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', color: '#F5EDD8', lineHeight: 1.1, marginBottom: '24px' }}>
          🤖 {t.h1}
        </h1>

        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.85rem', color: 'rgba(245,237,216,0.45)', lineHeight: 1.8, marginBottom: '56px' }}>
          {t.sub}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '48px' }}>
          {features.map(f => (
            <div key={f.title} style={{ background: '#1A1A1A', border: `1px solid rgba(245,237,216,0.08)`, borderLeft: `3px solid ${f.color}`, borderRadius: '8px', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: '16px', textAlign: 'left' }}>
              <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{f.icon}</span>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.82rem', fontWeight: 700, color: '#F5EDD8', marginBottom: '4px', letterSpacing: '0.04em' }}>{f.title}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'rgba(245,237,216,0.38)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <a href="/polls" style={{ display: 'inline-block', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'rgba(245,237,216,0.35)', textDecoration: 'none', borderBottom: '1px solid rgba(245,237,216,0.12)', paddingBottom: '2px' }}>
          {t.back}
        </a>
      </div>
      <SiteFooter />
    </main>
  )
}
