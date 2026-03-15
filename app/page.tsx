'use client'
import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/useLanguage'
import SiteFooter from '../components/SiteFooter'

const UI = {
  en: {
    navTag: 'Launching Soon · Nepal',
    navLeaderboard: 'Leaderboard',
    navPolls: 'Live Polls →',
    eyebrow: "Nepal's Civic-Tech Platform",
    h1a: 'What Nepal 🇳🇵', h1b: 'Really', h1c: 'Thinks —', h1d: 'Live.',
    heroSub: 'Real-time polls + Facebook & Instagram sentiment analysis.\nTrack whether the new government delivers. No gambling. No noise.\nJust crowd wisdom for Nepal\'s next chapter.',
    cta1: 'See Live Polls →', cta2: 'Join Waitlist',
    pollLabel: 'Live Forecast · Kathmandu Valley 🇳🇵',
    pollQ: 'Will the RSP government end load-shedding in the Valley by 2027?',
    opt1: 'Yes — Will deliver', opt2: 'Partial — Some progress', opt3: 'No — Broken promise',
    pollForecasters: '4,812 forecasters', pollActivity: 'Nepal Pulse: 🔴 High Activity',
    featuresEyebrow: 'Platform Features',
    featuresH2: 'Everything Nepal needs to hold power accountable.',
    features: [
      { icon: '📊', title: 'Live Probability Polls', desc: 'Polymarket-style probability bars on real Nepali issues — politics, infrastructure, cricket, development. Vote and watch the crowd shift in real time.', num: '01' },
      { icon: '🇳🇵', title: 'Nepal Pulse Dashboard', desc: 'Real-time sentiment scores scraped from public Facebook and Instagram data. See what Nepal is actually talking about — not what media wants you to think.', num: '02' },
      { icon: '🏆', title: 'Accuracy Leaderboard', desc: 'Every vote is tracked. The best forecasters earn reputation points and badges. Who in Nepal has the sharpest political instincts?', num: '03' },
      { icon: '📱', title: 'Shareable Story Cards', desc: 'One tap to share any poll result as an Instagram or Facebook story. Viral by design — built for how Nepal actually communicates online.', num: '04' },
      { icon: '📰', title: 'Weekly Pulse Report', desc: 'A curated digest of shifting public mood sent to your inbox every Monday. The signal in the noise — in Nepali and English.', num: '05' },
      { icon: '🔒', title: '100% Legal & Non-Monetary', desc: "No gambling. No real money. Fully compliant with Nepal's laws. This is civic entertainment and crowd wisdom — nothing more, nothing less.", num: '06' },
    ],
    stat1: 'Nepalis on\nFacebook', stat2: 'First-time voters\nin 2026 election', stat3: "Of Nepal's population\nunder age 24", stat4: 'Platforms doing\nthis right now',
    waitlistEyebrow: 'Join the Waitlist',
    waitlistH2a: 'Be first when', waitlistH2b: "Nepal's voice", waitlistH2c: 'goes live.',
    waitlistDesc: "We're launching in the weeks after the 2026 election.\nEarly members get founding forecaster status,\npriority access, and permanent leaderboard badges.",
    waitlistBtn: 'Notify Me', waitlistPlaceholder: 'your@email.com',
    waitlistSuccess: "✓ You're on the list. We'll be in touch.",
    footerTag: '© 2026 Nepomarket.com · What Nepal Really Thinks · Built for Nepal\'s next chapter',
    langLabel: 'नेपाली',
  },
  ne: {
    navTag: 'छिट्टै आउँदैछ · नेपाल',
    navLeaderboard: 'लिडरबोर्ड',
    navPolls: 'प्रत्यक्ष मतदान →',
    eyebrow: 'नेपालको नागरिक-प्रविधि मञ्च',
    h1a: 'नेपाल 🇳🇵 ले', h1b: 'वास्तवमा', h1c: 'के सोच्छ —', h1d: 'अहिले।',
    heroSub: 'प्रत्यक्ष मतदान + फेसबुक र इन्स्टाग्राम भावना विश्लेषण।\nनयाँ सरकारले प्रतिज्ञा पूरा गर्छ कि गर्दैन — ट्र्याक गर्नुहोस्।\nजुवा छैन। आवाज मात्र। नेपालको भीड बुद्धि।',
    cta1: 'प्रत्यक्ष मतदान हेर्नुहोस् →', cta2: 'प्रतीक्षा सूचीमा जोडिनुहोस्',
    pollLabel: 'प्रत्यक्ष जनमत · काठमाडौं उपत्यका 🇳🇵',
    pollQ: 'के RSP सरकारले २०२७ सम्म उपत्यकामा लोडसेडिङ अन्त्य गर्छ?',
    opt1: 'हो — पूरा गर्नेछ', opt2: 'आंशिक — केही प्रगति', opt3: 'होइन — झूटो वाचा',
    pollForecasters: '४,८१२ मतदाताहरू', pollActivity: 'नेपाल पल्स: 🔴 उच्च सक्रियता',
    featuresEyebrow: 'प्लेटफर्म सुविधाहरू',
    featuresH2: 'नेपाललाई शक्तिलाई जवाफदेही बनाउन चाहिने सबै कुरा।',
    features: [
      { icon: '📊', title: 'प्रत्यक्ष सम्भावना मतदान', desc: 'वास्तविक नेपाली मुद्दाहरूमा Polymarket-शैलीका सम्भावना पट्टाहरू। मत दिनुहोस् र भीडको धारा हेर्नुहोस्।', num: '०१' },
      { icon: '🇳🇵', title: 'नेपाल पल्स ड्यासबोर्ड', desc: 'सार्वजनिक फेसबुक र इन्स्टाग्राम डाटाबाट वास्तविक समयको भावना स्कोर। मिडियाले होइन, नेपाल वास्तवमा के भन्दैछ।', num: '०२' },
      { icon: '🏆', title: 'शुद्धता लिडरबोर्ड', desc: 'हरेक मत ट्र्याक हुन्छ। उत्कृष्ट पूर्वानुमानकर्ताले प्रतिष्ठा अंक र ब्याजहरू पाउँछन्। नेपालमा सबैभन्दा तीखो राजनीतिक सूझबुझ कसको छ?', num: '०३' },
      { icon: '📱', title: 'साझा गर्न मिल्ने स्टोरी कार्ड', desc: 'एक ट्यापले जुनसुकै मतदान परिणाम इन्स्टाग्राम वा फेसबुक स्टोरीको रूपमा साझा गर्नुहोस्। नेपाल अनलाइन सञ्चार गर्ने तरिकाले बनाइएको।', num: '०४' },
      { icon: '📰', title: 'साप्ताहिक पल्स रिपोर्ट', desc: 'प्रत्येक सोमबार इनबक्समा जनमतको बदलिँदो धारको सारांश। नेपाली र अंग्रेजीमा — संकेत र आवाज।', num: '०५' },
      { icon: '🔒', title: '१००% कानुनी र गैर-मौद्रिक', desc: 'जुवा छैन। वास्तविक पैसा छैन। नेपालको कानुनसँग पूर्ण अनुपालन। यो नागरिक मनोरञ्जन र भीड बुद्धि मात्र हो।', num: '०६' },
    ],
    stat1: 'नेपाली\nफेसबुकमा', stat2: '२०२६ चुनावमा\nपहिलो पटक मतदाता', stat3: 'नेपालको जनसंख्या\n२४ वर्षमुनि', stat4: 'अहिले यो गर्ने\nप्लेटफर्महरू',
    waitlistEyebrow: 'प्रतीक्षा सूचीमा जोडिनुहोस्',
    waitlistH2a: 'नेपालको', waitlistH2b: 'आवाज सुरु', waitlistH2c: 'हुँदा पहिले हुनुहोस्।',
    waitlistDesc: '२०२६ को चुनावपछिको हप्तामा हामी सुरु गर्दैछौं।\nप्रारम्भिक सदस्यहरूले संस्थापक पूर्वानुमानकर्ता दर्जा,\nप्राथमिकता पहुँच र स्थायी लिडरबोर्ड ब्याज पाउँछन्।',
    waitlistBtn: 'सूचित गर्नुहोस्', waitlistPlaceholder: 'your@email.com',
    waitlistSuccess: '✓ तपाईं सूचीमा हुनुहुन्छ। हामी सम्पर्क गर्नेछौं।',
    footerTag: '© २०२६ Nepomarket.com · नेपालले वास्तवमा के सोच्छ · नेपालको अर्को अध्यायका लागि',
    langLabel: 'English',
  },
}

export default function HomePage() {
  const fillsRef = useRef<NodeListOf<HTMLElement> | null>(null)
  const { lang, langFlip, toggleLang } = useLanguage()
  const t = UI[lang]

  useEffect(() => {
    const fills = document.querySelectorAll<HTMLElement>('.prob-fill')
    fillsRef.current = fills
    const timer = setTimeout(() => {
      fills.forEach(el => {
        el.style.width = (el.dataset.w || '0') + '%'
      })
    }, 900)
    return () => clearTimeout(timer)
  }, [])

  async function joinWaitlist(inputId: string, successId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement
    const success = document.getElementById(successId) as HTMLElement
    const email = input?.value.trim()
    if (!email || !email.includes('@')) {
      if (input) { input.style.borderColor = 'rgba(220,20,60,0.8)'; setTimeout(() => input.style.borderColor = '', 1500) }
      return
    }
    await supabase.from('waitlist').insert({ email })
    if (input) { input.value = ''; input.style.display = 'none' }
    const btn = input?.parentElement?.querySelector('button') as HTMLElement
    if (btn) btn.style.display = 'none'
    if (success) success.style.display = 'block'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --red: #DC143C; --red-dim: #8B0D25;
          --cream: #F5EDD8; --ink: #0D0D0D; --ink2: #1A1A1A;
          --muted: #555; --border: rgba(245,237,216,0.12);
        }
        html { scroll-behavior: smooth; }
        body { background: var(--ink); color: var(--cream); font-family: 'Syne', sans-serif; min-height: 100vh; overflow-x: hidden; }
        body::before {
          content: ''; position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0; opacity: 0.6;
        }
        body::after {
          content: ''; position: fixed; inset: 0;
          background: linear-gradient(135deg,
            rgba(220,20,60,0.055) 0%,
            transparent 38%,
            rgba(0,56,147,0.045) 65%,
            rgba(255,255,255,0.018) 100%);
          pointer-events: none; z-index: 0;
        }
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px 40px; border-bottom: 1px solid var(--border);
          background: rgba(13,13,13,0.85); backdrop-filter: blur(12px);
        }
        .logo { font-family: 'Instrument Serif', serif; font-size: 1.4rem; letter-spacing: -0.02em; color: var(--cream); text-decoration: none; }
        .logo span { color: var(--red); }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .nav-tag { font-family: 'DM Mono', monospace; font-size: 0.65rem; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; border: 1px solid var(--border); padding: 5px 12px; border-radius: 20px; }
        .nav-btn { font-family: 'Syne', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: var(--red); color: var(--cream); border: none; padding: 8px 18px; border-radius: 4px; cursor: pointer; text-decoration: none; transition: background 0.2s; }
        .nav-btn:hover { background: #b01030; }
        .hero { position: relative; z-index: 1; min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; align-items: center; padding: 120px 40px 80px; gap: 60px; max-width: 1300px; margin: 0 auto; }
        .eyebrow { display: inline-flex; align-items: center; gap: 8px; font-family: 'DM Mono', monospace; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--red); margin-bottom: 28px; opacity: 0; animation: fadeUp 0.8s 0.2s forwards; }
        .eyebrow::before { content: ''; width: 28px; height: 1px; background: var(--red); }
        h1 { font-family: 'Instrument Serif', serif; font-size: clamp(3rem, 6vw, 5.2rem); line-height: 1.05; letter-spacing: -0.03em; color: var(--cream); margin-bottom: 28px; opacity: 0; animation: fadeUp 0.8s 0.35s forwards; }
        h1 em { font-style: italic; color: var(--red); }
        .hero-sub { font-family: 'DM Mono', monospace; font-size: 0.82rem; line-height: 1.8; color: rgba(245,237,216,0.55); max-width: 440px; margin-bottom: 44px; opacity: 0; animation: fadeUp 0.8s 0.5s forwards; }
        .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; opacity: 0; animation: fadeUp 0.8s 0.6s forwards; }
        .btn-primary { background: var(--red); border: 1px solid var(--red); color: var(--cream); font-family: 'Syne', sans-serif; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 14px 28px; border-radius: 4px; cursor: pointer; text-decoration: none; transition: background 0.2s; }
        .btn-primary:hover { background: #b01030; }
        .btn-secondary { background: transparent; border: 1px solid var(--border); color: rgba(245,237,216,0.6); font-family: 'DM Mono', monospace; font-size: 0.72rem; letter-spacing: 0.08em; padding: 14px 28px; border-radius: 4px; cursor: pointer; text-decoration: none; transition: border-color 0.2s, color 0.2s; }
        .btn-secondary:hover { border-color: rgba(245,237,216,0.3); color: var(--cream); }
        .waitlist-form { display: flex; gap: 0; max-width: 440px; opacity: 0; animation: fadeUp 0.8s 0.65s forwards; }
        .waitlist-form input { flex: 1; background: rgba(245,237,216,0.06); border: 1px solid var(--border); border-right: none; color: var(--cream); font-family: 'DM Mono', monospace; font-size: 0.8rem; padding: 14px 18px; border-radius: 4px 0 0 4px; outline: none; transition: border-color 0.2s, background 0.2s; }
        .waitlist-form input::placeholder { color: rgba(245,237,216,0.3); }
        .waitlist-form input:focus { border-color: rgba(220,20,60,0.5); background: rgba(245,237,216,0.09); }
        .waitlist-form button { background: var(--red); border: 1px solid var(--red); color: var(--cream); font-family: 'Syne', sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 14px 22px; border-radius: 0 4px 4px 0; cursor: pointer; white-space: nowrap; transition: background 0.2s; }
        .waitlist-form button:hover { background: #b01030; }
        .form-note { font-family: 'DM Mono', monospace; font-size: 0.62rem; color: rgba(245,237,216,0.3); margin-top: 12px; letter-spacing: 0.05em; opacity: 0; animation: fadeUp 0.8s 0.8s forwards; }
        .success-msg { display: none; font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #4CAF50; margin-top: 14px; letter-spacing: 0.05em; }
        .hero-right { opacity: 0; animation: fadeLeft 0.9s 0.6s forwards; }
        .poll-card {
          background: linear-gradient(var(--ink2), var(--ink2)) padding-box,
                      linear-gradient(160deg, rgba(220,20,60,0.65) 0%, rgba(0,56,147,0.65) 52%, rgba(245,237,216,0.28) 100%) border-box;
          border: 1px solid transparent;
          border-radius: 12px; padding: 28px; position: relative; overflow: hidden;
        }
        .poll-card::before { content: ''; position: absolute; top: -60px; right: -60px; width: 180px; height: 180px; background: radial-gradient(circle, rgba(220,20,60,0.12), transparent 70%); pointer-events: none; }
        .prob-fill.yes  { background: #22C55E; }
        .prob-fill.blue { background: #2563EB; }
        .prob-fill.no   { background: rgba(245,237,216,0.18); }
        .poll-label { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--red); margin-bottom: 16px; display: flex; align-items: center; gap: 6px; }
        .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--red); animation: pulse 1.5s infinite; }
        .poll-question { font-family: 'Instrument Serif', serif; font-size: 1.25rem; line-height: 1.35; color: var(--cream); margin-bottom: 24px; }
        .prob-item { margin-bottom: 16px; }
        .prob-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .prob-label { font-family: 'DM Mono', monospace; font-size: 0.72rem; color: rgba(245,237,216,0.7); }
        .prob-pct { font-family: 'DM Mono', monospace; font-size: 0.72rem; font-weight: 500; color: var(--cream); }
        .prob-track { height: 6px; background: rgba(245,237,216,0.08); border-radius: 3px; overflow: hidden; }
        .prob-fill { height: 100%; border-radius: 3px; background: var(--red); width: 0%; transition: width 1.4s cubic-bezier(0.16,1,0.3,1); }
        .prob-fill.alt { background: rgba(245,237,216,0.25); }
        .poll-meta { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); }
        .poll-meta span { font-family: 'DM Mono', monospace; font-size: 0.6rem; color: rgba(245,237,216,0.35); letter-spacing: 0.05em; }
        .pulse-strip { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 14px 40px; overflow: hidden; position: relative; z-index: 1; }
        .pulse-inner { display: flex; gap: 48px; animation: ticker 22s linear infinite; white-space: nowrap; }
        .pulse-item { display: flex; align-items: center; gap: 10px; font-family: 'DM Mono', monospace; font-size: 0.65rem; letter-spacing: 0.05em; color: rgba(245,237,216,0.45); }
        .pulse-item strong { color: var(--cream); }
        .up { color: #4CAF50; } .down { color: var(--red); } .neutral { color: #FFC107; }
        .features { position: relative; z-index: 1; max-width: 1300px; margin: 0 auto; padding: 100px 40px; }
        .section-eyebrow { font-family: 'DM Mono', monospace; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--red); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .section-eyebrow::before { content: ''; width: 20px; height: 1px; background: var(--red); }
        .features h2 { font-family: 'Instrument Serif', serif; font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 60px; max-width: 600px; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .feat { background: var(--ink2); border: 1px solid var(--border); padding: 36px 32px; position: relative; overflow: hidden; transition: background 0.3s; }
        .feat:hover { background: #222; }
        .feat-icon { font-size: 1.6rem; margin-bottom: 20px; display: block; }
        .feat h3 { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; margin-bottom: 10px; color: var(--cream); }
        .feat p { font-family: 'DM Mono', monospace; font-size: 0.72rem; line-height: 1.75; color: rgba(245,237,216,0.45); }
        .feat-num { position: absolute; bottom: 20px; right: 24px; font-family: 'DM Mono', monospace; font-size: 0.6rem; color: rgba(245,237,216,0.1); letter-spacing: 0.1em; }
        .stats { position: relative; z-index: 1; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); display: grid; grid-template-columns: repeat(4, 1fr); }
        .stat { padding: 50px 40px; border-right: 1px solid var(--border); }
        .stat:last-child { border-right: none; }
        .stat-num { font-family: 'Instrument Serif', serif; font-size: 3rem; color: var(--cream); line-height: 1; margin-bottom: 8px; }
        .stat-num span { color: var(--red); }
        .stat-label { font-family: 'DM Mono', monospace; font-size: 0.65rem; color: rgba(245,237,216,0.4); letter-spacing: 0.08em; text-transform: uppercase; line-height: 1.5; }
        .cta-section { position: relative; z-index: 1; max-width: 1300px; margin: 0 auto; padding: 120px 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .cta-section h2 { font-family: 'Instrument Serif', serif; font-size: clamp(2rem, 4vw, 3.4rem); line-height: 1.1; letter-spacing: -0.02em; }
        .cta-section h2 em { font-style: italic; color: var(--red); }
        .cta-right p { font-family: 'DM Mono', monospace; font-size: 0.8rem; line-height: 1.9; color: rgba(245,237,216,0.5); margin-bottom: 32px; }
        .waitlist-form-2 { display: flex; gap: 0; max-width: 420px; }
        .waitlist-form-2 input { flex: 1; background: rgba(245,237,216,0.06); border: 1px solid var(--border); border-right: none; color: var(--cream); font-family: 'DM Mono', monospace; font-size: 0.8rem; padding: 14px 18px; border-radius: 4px 0 0 4px; outline: none; transition: border-color 0.2s, background 0.2s; }
        .waitlist-form-2 input::placeholder { color: rgba(245,237,216,0.3); }
        .waitlist-form-2 input:focus { border-color: rgba(220,20,60,0.5); background: rgba(245,237,216,0.09); }
        .waitlist-form-2 button { background: var(--red); border: 1px solid var(--red); color: var(--cream); font-family: 'Syne', sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 14px 22px; border-radius: 0 4px 4px 0; cursor: pointer; transition: background 0.2s; }
        .waitlist-form-2 button:hover { background: #b01030; }
        .success-msg-2 { display: none; font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #4CAF50; margin-top: 14px; letter-spacing: 0.05em; }
        footer { position: relative; z-index: 1; border-top: 1px solid var(--border); padding: 32px 40px; display: flex; justify-content: space-between; align-items: center; }
        footer p { font-family: 'DM Mono', monospace; font-size: 0.6rem; color: rgba(245,237,216,0.25); letter-spacing: 0.05em; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes slideSwitch { 0%{transform:translateY(0);opacity:1} 40%{transform:translateY(-6px);opacity:0} 60%{transform:translateY(6px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        .lang-flip { animation: slideSwitch 0.4s ease; }
        @media (max-width: 900px) {
          nav { padding: 16px 20px; }
          .hero { grid-template-columns: 1fr; padding: 100px 20px 60px; gap: 40px; }
          .hero-right { animation: fadeUp 0.9s 0.6s forwards; }
          .features { padding: 60px 20px; }
          .features-grid { grid-template-columns: 1fr; }
          .stats { grid-template-columns: repeat(2, 1fr); }
          .stat { border-right: none; border-bottom: 1px solid var(--border); }
          .cta-section { grid-template-columns: 1fr; padding: 60px 20px; gap: 32px; }
          footer { flex-direction: column; gap: 12px; text-align: center; padding: 24px 20px; }
          .pulse-strip { padding: 14px 20px; }
          .nav-tag { display: none; }
        }
        @media (max-width: 480px) {
          .waitlist-form, .waitlist-form-2 { flex-direction: column; }
          .waitlist-form input, .waitlist-form-2 input { border-right: 1px solid var(--border); border-bottom: none; border-radius: 4px 4px 0 0; }
          .waitlist-form button, .waitlist-form-2 button { border-radius: 0 0 4px 4px; }
          .hero-ctas { flex-direction: column; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <a href="/" className="logo">Nepo<span>market</span></a>
        <div className="nav-right">
          <div className="nav-tag">{t.navTag}</div>
          <button onClick={toggleLang} style={{ background: 'rgba(245,237,216,0.04)', border: '1px solid rgba(245,237,216,0.14)', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.25s' }}>
            <span style={{ fontSize: '0.95rem' }}>{lang === 'en' ? '🇳🇵' : '🌐'}</span>
            <span className={langFlip ? 'lang-flip' : ''} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#F5EDD8', letterSpacing: '0.04em', fontWeight: 500 }}>{t.langLabel}</span>
          </button>
          <a href="/leaderboard" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'rgba(245,237,216,0.4)', textDecoration: 'none', border: '1px solid rgba(245,237,216,0.12)', padding: '7px 14px', borderRadius: '4px' }}>{t.navLeaderboard}</a>
          <a href="/polls" className="nav-btn">{t.navPolls}</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div>
          <div className="eyebrow">{t.eyebrow}</div>
          <h1>{t.h1a}<br /><em>{t.h1b}</em> {t.h1c}<br />{t.h1d}</h1>
          <p className="hero-sub">
            {t.heroSub.split('\n').map((line, i) => <span key={i}>{line}{i < 2 && <br />}</span>)}
          </p>
          <div className="hero-ctas">
            <a href="/polls" className="btn-primary">{t.cta1}</a>
            <a href="#waitlist" className="btn-secondary">{t.cta2}</a>
          </div>
        </div>

        <div className="hero-right">
          <div className="poll-card">
            <div className="poll-label">
              <div className="live-dot"></div>
              {t.pollLabel}
            </div>
            <div className="poll-question">{t.pollQ}</div>
            <div className="prob-item">
              <div className="prob-header">
                <span className="prob-label">{t.opt1}</span>
                <span className="prob-pct" style={{color:'#22C55E'}}>71%</span>
              </div>
              <div className="prob-track"><div className="prob-fill yes" data-w="71"></div></div>
            </div>
            <div className="prob-item">
              <div className="prob-header">
                <span className="prob-label">{t.opt2}</span>
                <span className="prob-pct" style={{color:'#60A5FA'}}>20%</span>
              </div>
              <div className="prob-track"><div className="prob-fill blue" data-w="20"></div></div>
            </div>
            <div className="prob-item">
              <div className="prob-header">
                <span className="prob-label">{t.opt3}</span>
                <span className="prob-pct" style={{color:'rgba(245,237,216,0.35)'}}>9%</span>
              </div>
              <div className="prob-track"><div className="prob-fill no" data-w="9"></div></div>
            </div>
            <div className="poll-meta">
              <span>{t.pollForecasters}</span>
              <span>{t.pollActivity}</span>
            </div>
          </div>
        </div>
      </section>

      {/* PULSE TICKER */}
      <div className="pulse-strip">
        <div className="pulse-inner">
          {[...Array(2)].map((_, r) => (
            <span key={r} style={{display:'contents'}}>
              <div className="pulse-item"><strong>Anti-Corruption Bill</strong> <span className="up">↑ 84% support</span></div>
              <div className="pulse-item"><strong>Kathmandu Metro Rail</strong> <span className="neutral">⬤ 61% believe by 2032</span></div>
              <div className="pulse-item"><strong>KP Oli comeback</strong> <span className="down">↓ 12% likelihood</span></div>
              <div className="pulse-item"><strong>Load Shedding End</strong> <span className="up">↑ 71% optimistic</span></div>
              <div className="pulse-item"><strong>Nepal Cricket WC 2027</strong> <span className="up">↑ 78% confident</span></div>
              <div className="pulse-item"><strong>RSP 2-year approval</strong> <span className="neutral">⬤ 68% satisfied</span></div>
            </span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="features">
        <div className="section-eyebrow">{t.featuresEyebrow}</div>
        <h2>{t.featuresH2}</h2>
        <div className="features-grid">
          {t.features.map(f => (
            <div className="feat" key={f.num}>
              <span className="feat-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="feat-num">{f.num}</span>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <div className="stats">
        <div className="stat"><div className="stat-num">17<span>.4M</span></div><div className="stat-label">{t.stat1.split('\n').map((l,i) => <span key={i}>{l}{i===0&&<br/>}</span>)}</div></div>
        <div className="stat"><div className="stat-num">915<span>K</span></div><div className="stat-label">{t.stat2.split('\n').map((l,i) => <span key={i}>{l}{i===0&&<br/>}</span>)}</div></div>
        <div className="stat"><div className="stat-num">46<span>%</span></div><div className="stat-label">{t.stat3.split('\n').map((l,i) => <span key={i}>{l}{i===0&&<br/>}</span>)}</div></div>
        <div className="stat"><div className="stat-num">0</div><div className="stat-label">{t.stat4.split('\n').map((l,i) => <span key={i}>{l}{i===0&&<br/>}</span>)}</div></div>
      </div>

      {/* CTA / WAITLIST */}
      <section className="cta-section" id="waitlist">
        <div>
          <div className="section-eyebrow">{t.waitlistEyebrow}</div>
          <h2>{t.waitlistH2a}<br /><em>{t.waitlistH2b}</em><br />{t.waitlistH2c}</h2>
        </div>
        <div className="cta-right">
          <p>
            {t.waitlistDesc.split('\n').map((line, i) => <span key={i}>{line}{i < 2 && <br />}</span>)}
          </p>
          <div className="waitlist-form-2">
            <input type="email" id="email2" placeholder={t.waitlistPlaceholder} />
            <button onClick={() => joinWaitlist('email2', 'success2')}>{t.waitlistBtn}</button>
          </div>
          <p className="success-msg-2" id="success2">{t.waitlistSuccess}</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <a href="/" className="logo">Nepo<span>market</span></a>
        <p>{t.footerTag}</p>
      </footer>
      <SiteFooter />
    </>
  )
}