'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/useLanguage'

type User = { id: string; email: string } | null

const copy = {
  en: {
    home: 'Home', polls: 'Live Polls', leaderboard: 'Leaderboard',
    hotNews: 'Hot News', aiPrediction: 'AI Prediction',
    login: 'Login', signUp: 'Sign Up', profile: 'Profile', langLabel: 'नेपाली',
  },
  ne: {
    home: 'गृहपृष्ठ', polls: 'प्रत्यक्ष मतदान', leaderboard: 'लिडरबोर्ड',
    hotNews: 'ताजा समाचार', aiPrediction: 'AI भविष्यवाणी',
    login: 'लग इन', signUp: 'दर्ता', profile: 'प्रोफाइल', langLabel: 'English',
  },
}

export default function SiteNav() {
  const pathname = usePathname()
  const { lang, langFlip, toggleLang } = useLanguage()
  const t = copy[lang]
  const [user, setUser] = useState<User>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) =>
      setUser(data.user ? { id: data.user.id, email: data.user.email! } : null)
    )
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email! } : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const links = [
    { href: '/',               label: t.home,         icon: '🏠', badge: null },
    { href: '/polls',          label: t.polls,        icon: '📊', badge: null },
    { href: '/leaderboard',    label: t.leaderboard,  icon: '🏆', badge: null },
    { href: '/hot-news',       label: t.hotNews,      icon: '🔥', badge: 'NEW' },
    { href: '/ai-prediction',  label: t.aiPrediction, icon: '🤖', badge: 'BETA' },
  ]

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .snav-link {
          position: relative;
          font-family: 'DM Mono', monospace;
          font-size: 0.67rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-decoration: none;
          color: rgba(245,237,216,0.42);
          padding: 6px 11px;
          border-radius: 5px;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .snav-link:hover { color: #F5EDD8; background: rgba(245,237,216,0.05); }
        .snav-link.active { color: #F5EDD8; }
        .snav-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 11px; right: 11px;
          height: 2px;
          background: #DC143C;
          border-radius: 1px;
        }

        .snav-badge-new  { font-family:'Syne',sans-serif; font-size:0.48rem; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; background:rgba(220,20,60,0.18); color:#DC143C; padding:1px 5px; border-radius:3px; }
        .snav-badge-beta { font-family:'Syne',sans-serif; font-size:0.48rem; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; background:rgba(0,56,147,0.3); color:#6ba3e8; padding:1px 5px; border-radius:3px; }

        .snav-lang {
          display: flex; align-items: center; gap: 6px;
          background: rgba(245,237,216,0.03);
          border: 1px solid rgba(245,237,216,0.12);
          border-radius: 8px; padding: 6px 12px;
          cursor: pointer; transition: all 0.2s;
        }
        .snav-lang:hover { border-color: rgba(220,20,60,0.45); background: rgba(220,20,60,0.07); }
        .snav-lang-flip { animation: snavSwitch 0.35s ease; }

        .snav-login {
          font-family:'Syne',sans-serif; font-size:0.7rem; font-weight:600;
          letter-spacing:0.06em; text-transform:uppercase; text-decoration:none;
          color:rgba(245,237,216,0.55);
          border:1px solid rgba(245,237,216,0.16);
          padding:7px 16px; border-radius:5px;
          transition:all 0.2s; white-space:nowrap;
        }
        .snav-login:hover { color:#F5EDD8; border-color:rgba(245,237,216,0.38); background:rgba(245,237,216,0.04); }

        .snav-signup {
          font-family:'Syne',sans-serif; font-size:0.7rem; font-weight:700;
          letter-spacing:0.08em; text-transform:uppercase; text-decoration:none;
          background: linear-gradient(135deg, #DC143C 0%, #a50e2d 100%);
          color:#F5EDD8; padding:7px 18px; border-radius:5px;
          transition:opacity 0.2s; white-space:nowrap; border:none; cursor:pointer;
          box-shadow: 0 2px 12px rgba(220,20,60,0.25);
        }
        .snav-signup:hover { opacity:0.88; }

        .snav-hamburger {
          display:none; background:none; border:none; cursor:pointer;
          color:rgba(245,237,216,0.7); font-size:1.2rem; padding:4px 6px;
          line-height:1;
        }

        .snav-mobile-menu {
          display:none;
          flex-direction:column;
          position:fixed; top:60px; left:0; right:0; z-index:198;
          background:rgba(10,4,6,0.98);
          padding:8px 16px 20px;
          border-bottom:1px solid rgba(245,237,216,0.07);
          backdrop-filter:blur(20px);
          animation:snavSlide 0.2s ease;
        }
        .snav-mobile-menu.open { display:flex; }

        .snav-mobile-link {
          font-family:'DM Mono',monospace; font-size:0.75rem;
          color:rgba(245,237,216,0.48); text-decoration:none;
          padding:11px 12px; border-radius:5px;
          display:flex; align-items:center; gap:10px;
          transition:all 0.2s;
        }
        .snav-mobile-link:hover { color:#F5EDD8; background:rgba(245,237,216,0.05); }
        .snav-mobile-link.active { color:#F5EDD8; border-left:2px solid #DC143C; padding-left:10px; }

        @keyframes snavSwitch { 0%{transform:translateY(0);opacity:1} 40%{transform:translateY(-6px);opacity:0} 60%{transform:translateY(6px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        @keyframes snavSlide  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

        @media (max-width: 960px) {
          .snav-links-desktop { display:none !important; }
          .snav-hamburger { display:flex !important; }
        }
        @media (max-width: 620px) {
          .snav-auth-desktop { display:none !important; }
        }
      `}</style>

      {/* ── NAV BAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: '62px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 28px',
        background: 'linear-gradient(180deg, rgba(22,5,10,0.98) 0%, rgba(13,13,13,0.96) 100%)',
        backdropFilter: 'blur(22px)',
        borderBottom: '1px solid rgba(245,237,216,0.07)',
        overflow: 'visible',
      }}>

        {/* Flag stripe — top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, #DC143C 0%, #DC143C 44%, rgba(245,237,216,0.6) 50%, #003893 56%, #003893 100%)',
          opacity: 0.9,
          pointerEvents: 'none',
        }} />

        {/* Subtle red/blue ambient glow */}
        <div style={{ position:'absolute', top:0, left:0, width:'30%', height:'100%', background:'radial-gradient(ellipse at left center, rgba(220,20,60,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:0, right:0, width:'30%', height:'100%', background:'radial-gradient(ellipse at right center, rgba(0,56,147,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />

        {/* ── LOGO ── */}
        <a href="/" style={{ textDecoration:'none', fontFamily:"'Instrument Serif',serif", fontSize:'1.4rem', color:'#F5EDD8', letterSpacing:'-0.01em', flexShrink:0, position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:'6px' }}>
          Nepo<span style={{ color:'#DC143C' }}>market</span>
          <span style={{ fontSize:'1rem', lineHeight:1 }}>🇳🇵</span>
        </a>

        {/* ── CENTER LINKS ── */}
        <div className="snav-links-desktop" style={{ display:'flex', alignItems:'center', gap:'2px', position:'relative', zIndex:1 }}>
          {links.map(link => (
            <a key={link.href} href={link.href} className={`snav-link${isActive(link.href) ? ' active' : ''}`}>
              <span style={{ fontSize:'0.78rem' }}>{link.icon}</span>
              {link.label}
              {link.badge && (
                <span className={link.badge === 'NEW' ? 'snav-badge-new' : 'snav-badge-beta'}>
                  {link.badge}
                </span>
              )}
            </a>
          ))}
        </div>

        {/* ── RIGHT SIDE ── */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', position:'relative', zIndex:1 }}>

          {/* Language toggle */}
          <button className="snav-lang" onClick={toggleLang}>
            <span style={{ fontSize:'0.88rem' }}>{lang === 'en' ? '🇳🇵' : '🌐'}</span>
            <span className={langFlip ? 'snav-lang-flip' : ''} style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.67rem', color:'#F5EDD8', fontWeight:500 }}>
              {t.langLabel}
            </span>
          </button>

          {/* Auth buttons */}
          <div className="snav-auth-desktop" style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            {user ? (
              <a href="/profile" className="snav-login">
                👤 {user.email.split('@')[0]}
              </a>
            ) : (
              <>
                <a href="/auth" className="snav-login">{t.login}</a>
                <a href="/auth" className="snav-signup">{t.signUp}</a>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="snav-hamburger" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU ── */}
      <div className={`snav-mobile-menu${menuOpen ? ' open' : ''}`}>
        {links.map(link => (
          <a key={link.href} href={link.href} className={`snav-mobile-link${isActive(link.href) ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
            <span>{link.icon}</span>
            {link.label}
            {link.badge && (
              <span className={link.badge === 'NEW' ? 'snav-badge-new' : 'snav-badge-beta'}>{link.badge}</span>
            )}
          </a>
        ))}
        <div style={{ borderTop:'1px solid rgba(245,237,216,0.07)', marginTop:'10px', paddingTop:'12px', display:'flex', gap:'8px' }}>
          {user ? (
            <a href="/profile" className="snav-login" style={{ flex:1, textAlign:'center' }}>👤 {user.email.split('@')[0]}</a>
          ) : (
            <>
              <a href="/auth" className="snav-login" style={{ flex:1, textAlign:'center' }}>{t.login}</a>
              <a href="/auth" className="snav-signup" style={{ flex:1, textAlign:'center' }}>{t.signUp}</a>
            </>
          )}
        </div>
      </div>
    </>
  )
}
