'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

// ── Types ─────────────────────────────────────────────────────
interface LeaderEntry {
  rank: number
  user_id: string
  username: string
  total_votes: number
  majority_votes: number
  accuracy: number
  score: number
  badge: { emoji: string; label: string; labelNe: string; color: string }
}

type Lang = 'en' | 'ne'

// ── i18n ──────────────────────────────────────────────────────
const UI: Record<Lang, Record<string, string>> = {
  en: {
    brand: 'Nepo', brandAccent: 'market',
    tagline: "Nepal's Best Forecasters",
    hero: 'The', heroAccent: 'Leaderboard', heroEnd: '',
    subtitle: 'Who has the sharpest instincts in Nepal? Rankings update in real time.',
    langLabel: 'नेपाली',
    signInBtn: 'Sign In', signOut: 'Sign Out', polls: '← Polls',
    loading: 'Loading...',
    yourRanking: 'Your Ranking', rank: 'Rank', score: 'Score', votes: 'Votes', accuracy: 'Accuracy',
    noRankingsTitle: 'No rankings yet',
    noRankingsDesc: 'Be the first to vote and claim the top spot.',
    voteNow: 'Vote Now →',
    colRank: '#', colForecaster: 'Forecaster', colVotes: 'Votes', colAccuracy: 'Accuracy', colScore: 'Score', colBadge: 'Badge',
    points: 'pts', votesCast: 'votes cast',
    you: 'YOU',
    ctaTitle: 'Want to appear here?',
    ctaDesc: 'Sign in and start voting to earn your ranking.',
    ctaBtn: 'Sign In to Compete →',
    footer: 'Nepomarket · Non-monetary civic polling', privacyLabel: 'Privacy & Policy',
    howTitle: 'How Scoring Works',
    howAccuracy: 'Accuracy = % of your votes on each poll\'s leading option',
    howScore: 'Score = (accuracy% × 10) + total votes',
    howBadge: 'Badges reflect your rank, vote count, and accuracy',
  },
  ne: {
    brand: 'Nepo', brandAccent: 'market',
    tagline: 'नेपालका उत्कृष्ट पूर्वानुमानकर्ताहरू',
    hero: '', heroAccent: 'लिडरबोर्ड', heroEnd: '',
    subtitle: 'नेपालमा कसको सबैभन्दा तीखो राजनीतिक सूझबुझ छ? वास्तविक समयमा अपडेट।',
    langLabel: 'English',
    signInBtn: 'साइन इन', signOut: 'साइन आउट', polls: '← मतदान',
    loading: 'लोड हुँदैछ...',
    yourRanking: 'तपाईंको स्थान', rank: 'स्थान', score: 'अंक', votes: 'मतहरू', accuracy: 'शुद्धता',
    noRankingsTitle: 'अझै कुनै स्थान छैन',
    noRankingsDesc: 'पहिलो मत दिनुहोस् र शीर्ष स्थान लिनुहोस्।',
    voteNow: 'अहिले मत दिनुहोस् →',
    colRank: '#', colForecaster: 'पूर्वानुमानकर्ता', colVotes: 'मतहरू', colAccuracy: 'शुद्धता', colScore: 'अंक', colBadge: 'ब्याज',
    points: 'अंक', votesCast: 'मतहरू दिइयो',
    you: 'तपाईं',
    ctaTitle: 'यहाँ देखिन चाहनुहुन्छ?',
    ctaDesc: 'साइन इन गर्नुहोस् र आफ्नो स्थान कमाउन मत दिनुहोस्।',
    ctaBtn: 'प्रतिस्पर्धा गर्न साइन इन →',
    footer: 'Nepomarket · गैर-मौद्रिक नागरिक मतदान', privacyLabel: 'गोपनीयता र नीति',
    howTitle: 'स्कोरिङ कसरी काम गर्छ',
    howAccuracy: 'शुद्धता = प्रत्येक मतदानमा अग्रणी विकल्पमा तपाईंको मतको %',
    howScore: 'अंक = (शुद्धता% × १०) + कुल मतहरू',
    howBadge: 'ब्याजहरूले तपाईंको स्थान, मत संख्या र शुद्धता प्रतिबिम्बित गर्छ',
  },
}

// ── Badge Logic ───────────────────────────────────────────────
function computeBadge(rank: number, totalVotes: number, accuracy: number): LeaderEntry['badge'] {
  if (rank === 1) return { emoji: '🏆', label: 'Top Forecaster', labelNe: 'शीर्ष पूर्वानुमानकर्ता', color: '#FFD700' }
  if (rank <= 3) return { emoji: '⭐', label: 'Elite', labelNe: 'उत्कृष्ट', color: '#C0C0C0' }
  if (accuracy >= 70) return { emoji: '🎯', label: 'Sharpshooter', labelNe: 'निशानेबाज', color: '#4CAF50' }
  if (totalVotes >= 20) return { emoji: '🔥', label: 'On Fire', labelNe: 'सक्रिय', color: '#FF6B35' }
  if (totalVotes >= 10) return { emoji: '📊', label: 'Active', labelNe: 'सक्रिय', color: '#DC143C' }
  return { emoji: '🌱', label: 'Newcomer', labelNe: 'नयाँ', color: 'rgba(245,237,216,0.35)' }
}

// ── Main ──────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([])
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [userRank, setUserRank] = useState<LeaderEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<Lang>('en')
  const [langFlip, setLangFlip] = useState(false)

  const t = UI[lang]

  function toggleLang() {
    setLangFlip(true)
    setTimeout(() => { setLang(l => l === 'en' ? 'ne' : 'en'); setLangFlip(false) }, 200)
  }

  // ── Supabase: Compute leaderboard from raw votes ────────────
  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) setUser({ id: authUser.id, email: authUser.email || '' })

    // 1. Fetch ALL votes
    const { data: allVotes } = await supabase
      .from('votes')
      .select('user_id, poll_id, option_id')

    if (!allVotes || allVotes.length === 0) {
      setLoading(false)
      return
    }

    // 2. Compute majority option per poll
    const pollOptionCounts: Record<string, Record<string, number>> = {}
    allVotes.forEach(v => {
      if (!pollOptionCounts[v.poll_id]) pollOptionCounts[v.poll_id] = {}
      pollOptionCounts[v.poll_id][v.option_id] = (pollOptionCounts[v.poll_id][v.option_id] || 0) + 1
    })

    const majorityOption: Record<string, string> = {}
    Object.entries(pollOptionCounts).forEach(([pollId, opts]) => {
      let maxCount = 0
      let maxOpt = ''
      Object.entries(opts).forEach(([optId, count]) => {
        if (count > maxCount) { maxCount = count; maxOpt = optId }
      })
      majorityOption[pollId] = maxOpt
    })

    // 3. Aggregate per user: total votes + majority votes
    const userMap: Record<string, { total: number; majority: number }> = {}
    allVotes.forEach(v => {
      if (!userMap[v.user_id]) userMap[v.user_id] = { total: 0, majority: 0 }
      userMap[v.user_id].total++
      if (v.option_id === majorityOption[v.poll_id]) {
        userMap[v.user_id].majority++
      }
    })

    // 4. Build ranked array
    const ranked: LeaderEntry[] = Object.entries(userMap)
      .map(([uid, stats]) => {
        const accuracy = stats.total > 0 ? Math.round((stats.majority / stats.total) * 100) : 0
        const score = Math.round(accuracy * 0.1 * 10) + stats.total  // (accuracy% / 10) * 10 + total = accuracy + total
        const username = uid === authUser?.id
          ? (authUser.email || 'You').split('@')[0]
          : `Forecaster ${uid.slice(0, 5)}`
        return {
          rank: 0,
          user_id: uid,
          username,
          total_votes: stats.total,
          majority_votes: stats.majority,
          accuracy,
          score,
          badge: computeBadge(0, stats.total, accuracy),
        }
      })
      .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy)
      .map((e, i) => ({
        ...e,
        rank: i + 1,
        badge: computeBadge(i + 1, e.total_votes, e.accuracy),
      }))

    setLeaders(ranked)
    if (authUser) {
      const found = ranked.find(r => r.user_id === authUser.id)
      if (found) setUserRank(found)
    }
    setLoading(false)
  }

  function getMedal(rank: number) {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  // ── Loading ─────────────────────────────────────────────────
  if (loading) return (
    <main style={{ background: '#0D0D0D', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.75rem', color: 'rgba(245,237,216,0.3)' }}>{t.loading}</span>
    </main>
  )

  // ── Render ──────────────────────────────────────────────────
  return (
    <main style={{ background: '#0D0D0D', minHeight: '100vh', color: '#F5EDD8', fontFamily: "'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes slideSwitch { 0%{transform:translateY(0);opacity:1} 40%{transform:translateY(-6px);opacity:0} 60%{transform:translateY(6px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .lang-toggle { background:rgba(245,237,216,0.04); border:1px solid rgba(245,237,216,0.14); border-radius:8px; padding:7px 14px; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all 0.25s; }
        .lang-toggle:hover { border-color:rgba(220,20,60,0.5); background:rgba(220,20,60,0.08); }
        .lang-flip { animation: slideSwitch 0.4s ease; }

        .lb-row {
          display: grid;
          grid-template-columns: 48px 1fr 72px 72px 72px auto;
          gap: 12px; align-items: center;
          padding: 14px 20px; border-radius: 8px;
          border: 1px solid rgba(245,237,216,0.07);
          background: #1A1A1A; margin-bottom: 8px;
          transition: border-color 0.2s, background 0.2s;
          animation: fadeIn 0.3s ease forwards;
        }
        .lb-row:hover { border-color: rgba(245,237,216,0.14); background: #1f1f1f; }
        .lb-row.top1 { border-color: rgba(255,215,0,0.25); background: rgba(255,215,0,0.04); }
        .lb-row.top2 { border-color: rgba(192,192,192,0.2); }
        .lb-row.top3 { border-color: rgba(205,127,50,0.2); }
        .lb-row.is-user { border-color: rgba(220,20,60,0.35); background: rgba(220,20,60,0.05); }

        .rank-num { font-family: 'DM Mono',monospace; font-size: 0.85rem; font-weight: 500; color: rgba(245,237,216,0.3); text-align: center; }
        .rank-medal { font-size: 1.3rem; text-align: center; }
        .user-name { font-family: 'Syne',sans-serif; font-size: 0.85rem; font-weight: 600; color: #F5EDD8; }
        .user-sub { font-family: 'DM Mono',monospace; font-size: 0.55rem; color: rgba(245,237,216,0.3); margin-top: 2px; }
        .stat-col { text-align: right; }
        .stat-val { font-family: 'Instrument Serif',serif; font-size: 1.15rem; color: #F5EDD8; line-height: 1; }
        .stat-val.red { color: #DC143C; }
        .stat-val.green { color: #4CAF50; }
        .stat-lbl { font-family: 'DM Mono',monospace; font-size: 0.5rem; color: rgba(245,237,216,0.22); letter-spacing: 0.08em; text-transform: uppercase; margin-top: 2px; }
        .badge-pill { font-family: 'DM Mono',monospace; font-size: 0.52rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; white-space: nowrap; display:inline-flex; align-items:center; gap:4px; }

        .user-card {
          background: rgba(220,20,60,0.07); border: 1px solid rgba(220,20,60,0.25);
          border-radius: 10px; padding: 20px 24px; margin-bottom: 32px;
          display: grid; grid-template-columns: 1fr repeat(4, auto);
          gap: 20px; align-items: center; animation: fadeIn 0.4s ease forwards;
        }

        .top3-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 32px; }
        .podium-card {
          background: #1A1A1A; border: 1px solid rgba(245,237,216,0.08);
          border-radius: 10px; padding: 20px 16px; text-align: center;
          position: relative; overflow: hidden; animation: fadeIn 0.5s ease forwards;
        }
        .podium-card.p1 { border-color: rgba(255,215,0,0.3); background: rgba(255,215,0,0.04); }
        .podium-card.p2 { border-color: rgba(192,192,192,0.2); }
        .podium-card.p3 { border-color: rgba(205,127,50,0.2); }
        .podium-medal { font-size: 2rem; margin-bottom: 8px; }
        .podium-name { font-family: 'Syne',sans-serif; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; word-break: break-all; }
        .podium-score { font-family: 'Instrument Serif',serif; font-size: 1.6rem; color: #DC143C; line-height: 1; }
        .podium-score-lbl { font-family: 'DM Mono',monospace; font-size: 0.52rem; color: rgba(245,237,216,0.3); letter-spacing: 0.1em; text-transform: uppercase; }
        .podium-acc { font-family: 'DM Mono',monospace; font-size: 0.6rem; color: #4CAF50; margin-top: 6px; }
        .podium-votes { font-family: 'DM Mono',monospace; font-size: 0.55rem; color: rgba(245,237,216,0.25); margin-top: 3px; }

        .how-box {
          background: #1A1A1A; border: 1px solid rgba(245,237,216,0.08);
          border-radius: 10px; padding: 20px 24px; margin-top: 32px;
        }
        .how-title { font-family: 'Syne',sans-serif; font-size: 0.8rem; font-weight: 700; margin-bottom: 12px; color: rgba(245,237,216,0.6); }
        .how-item { font-family: 'DM Mono',monospace; font-size: 0.62rem; color: rgba(245,237,216,0.35); line-height: 2; display:flex; gap:8px; align-items:center; }

        @media (max-width: 640px) {
          .lb-row { grid-template-columns: 36px 1fr 56px 56px auto; }
          .lb-row .acc-col { display: none; }
          .user-card { grid-template-columns: 1fr repeat(3, auto); }
          .top3-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ══ NAV ══════════════════════════════════════════════════ */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 28px', borderBottom:'1px solid rgba(245,237,216,0.1)', background:'rgba(13,13,13,0.92)', backdropFilter:'blur(14px)' }}>
        <a href="/" style={{ textDecoration:'none', fontFamily:"'Instrument Serif',serif", fontSize:'1.35rem', color:'#F5EDD8', letterSpacing:'-0.01em' }}>
          {t.brand}<span style={{color:'#DC143C'}}>{t.brandAccent}</span>
        </a>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <button className="lang-toggle" onClick={toggleLang}>
            <span style={{ fontSize:'0.95rem' }}>{lang === 'en' ? '🇳🇵' : '🌐'}</span>
            <span className={langFlip ? 'lang-flip' : ''} style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', color:'#F5EDD8', fontWeight:500 }}>
              {t.langLabel}
            </span>
          </button>
          <a href="/polls" style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', color:'rgba(245,237,216,0.4)', textDecoration:'none', border:'1px solid rgba(245,237,216,0.12)', padding:'6px 14px', borderRadius:'4px' }}>{t.polls}</a>
          {user ? (
            <button onClick={async () => { await supabase.auth.signOut(); window.location.reload() }}
              style={{ background:'transparent', border:'1px solid rgba(245,237,216,0.12)', color:'rgba(245,237,216,0.4)', fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', padding:'6px 14px', borderRadius:'4px', cursor:'pointer' }}>
              {t.signOut}
            </button>
          ) : (
            <a href="/auth" style={{ background:'#DC143C', color:'#F5EDD8', fontFamily:"'Syne',sans-serif", fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', padding:'8px 18px', borderRadius:'4px', textDecoration:'none' }}>
              {t.signInBtn}
            </a>
          )}
        </div>
      </nav>

      {/* ══ CONTENT ══════════════════════════════════════════════ */}
      <div style={{ maxWidth:'760px', margin:'0 auto', padding:'100px 20px 80px' }}>

        {/* Header */}
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', color:'#DC143C', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ width:'20px', height:'1px', background:'#DC143C', display:'inline-block' }}></span>
          {t.tagline}
        </div>
        <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:'clamp(2.2rem,5vw,3.5rem)', letterSpacing:'-0.02em', lineHeight:1.1, marginBottom:'12px' }}>
          {t.hero} <em style={{ color:'#DC143C' }}>{t.heroAccent}</em> {t.heroEnd}
        </h1>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.78rem', color:'rgba(245,237,216,0.4)', marginBottom:'40px', lineHeight:1.6 }}>
          {t.subtitle}
        </p>

        {/* ── User's own rank card ─────────────────────────────── */}
        {user && userRank && (
          <div className="user-card">
            <div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', color:'#DC143C', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'6px' }}>{t.yourRanking}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1rem', fontWeight:700 }}>{userRank.username}</div>
            </div>
            <div className="stat-col">
              <div className="stat-val red">#{userRank.rank}</div>
              <div className="stat-lbl">{t.rank}</div>
            </div>
            <div className="stat-col">
              <div className="stat-val green">{userRank.accuracy}%</div>
              <div className="stat-lbl">{t.accuracy}</div>
            </div>
            <div className="stat-col">
              <div className="stat-val">{userRank.score}</div>
              <div className="stat-lbl">{t.score}</div>
            </div>
            <div className="stat-col">
              <div className="stat-val">{userRank.total_votes}</div>
              <div className="stat-lbl">{t.votes}</div>
            </div>
          </div>
        )}

        {/* ── Empty State ──────────────────────────────────────── */}
        {leaders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'16px' }}>🏆</div>
            <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:'1.4rem', marginBottom:'8px' }}>{t.noRankingsTitle}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', color:'rgba(245,237,216,0.35)', marginBottom:'24px' }}>{t.noRankingsDesc}</div>
            <a href="/polls" style={{ background:'#DC143C', color:'#F5EDD8', fontFamily:"'Syne',sans-serif", fontSize:'0.8rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', padding:'12px 28px', borderRadius:'4px', textDecoration:'none' }}>{t.voteNow}</a>
          </div>
        ) : (
          <>
            {/* ── Top 3 Podium ───────────────────────────────────── */}
            {leaders.length >= 3 && (
              <div className="top3-grid">
                {[leaders[1], leaders[0], leaders[2]].map(entry => {
                  const cls = entry.rank === 1 ? 'p1' : entry.rank === 2 ? 'p2' : 'p3'
                  return (
                    <div className={`podium-card ${cls}`} key={entry.user_id} style={{ marginTop: entry.rank === 1 ? 0 : '24px' }}>
                      <div className="podium-medal">{getMedal(entry.rank)}</div>
                      <div className="podium-name">{entry.username}</div>
                      <div className="podium-score">{entry.score}</div>
                      <div className="podium-score-lbl">{t.points}</div>
                      <div className="podium-acc">{entry.accuracy}% {t.accuracy.toLowerCase()}</div>
                      <div className="podium-votes">{entry.total_votes} {t.votesCast}</div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Table Header ────────────────────────────────────── */}
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', color:'rgba(245,237,216,0.2)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'10px', display:'grid', gridTemplateColumns:'48px 1fr 72px 72px 72px auto', gap:'12px', padding:'0 20px' }}>
              <span style={{ textAlign:'center' }}>{t.colRank}</span>
              <span>{t.colForecaster}</span>
              <span style={{ textAlign:'right' }}>{t.colVotes}</span>
              <span style={{ textAlign:'right' }} className="acc-col">{t.colAccuracy}</span>
              <span style={{ textAlign:'right' }}>{t.colScore}</span>
              <span>{t.colBadge}</span>
            </div>

            {/* ── Table Rows ──────────────────────────────────────── */}
            {leaders.map((entry, i) => {
              const medal = getMedal(entry.rank)
              const rowClass = entry.rank === 1 ? 'top1' : entry.rank === 2 ? 'top2' : entry.rank === 3 ? 'top3' : entry.user_id === user?.id ? 'is-user' : ''
              return (
                <div key={entry.user_id} className={`lb-row ${rowClass}`} style={{ animationDelay: `${i * 0.05}s` }}>
                  <div>
                    {medal ? <div className="rank-medal">{medal}</div> : <div className="rank-num">{entry.rank}</div>}
                  </div>
                  <div>
                    <div className="user-name">
                      {entry.username}
                      {entry.user_id === user?.id && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.5rem', color:'#DC143C', marginLeft:'8px', letterSpacing:'0.1em' }}>{t.you}</span>}
                    </div>
                    <div className="user-sub">{entry.majority_votes}/{entry.total_votes} {lang === 'en' ? 'majority picks' : 'बहुमत छनोट'}</div>
                  </div>
                  <div className="stat-col">
                    <div className="stat-val">{entry.total_votes}</div>
                    <div className="stat-lbl">{t.colVotes}</div>
                  </div>
                  <div className="stat-col acc-col">
                    <div className="stat-val green">{entry.accuracy}%</div>
                    <div className="stat-lbl">{t.colAccuracy}</div>
                  </div>
                  <div className="stat-col">
                    <div className="stat-val red">{entry.score}</div>
                    <div className="stat-lbl">{t.points}</div>
                  </div>
                  <div>
                    <div className="badge-pill" style={{ background:`${entry.badge.color}18`, color:entry.badge.color, border:`1px solid ${entry.badge.color}40` }}>
                      {entry.badge.emoji} {lang === 'en' ? entry.badge.label : entry.badge.labelNe}
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* ── How scoring works ────────────────────────────────── */}
        <div className="how-box">
          <div className="how-title">{t.howTitle}</div>
          <div className="how-item"><span>🎯</span> {t.howAccuracy}</div>
          <div className="how-item"><span>📐</span> {t.howScore}</div>
          <div className="how-item"><span>🏅</span> {t.howBadge}</div>
        </div>

        {/* ── CTA if not logged in ─────────────────────────────── */}
        {!user && (
          <div style={{ textAlign:'center', marginTop:'32px', padding:'32px', background:'#1A1A1A', border:'1px solid rgba(245,237,216,0.08)', borderRadius:'10px' }}>
            <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:'1.3rem', marginBottom:'8px' }}>{t.ctaTitle}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', color:'rgba(245,237,216,0.35)', marginBottom:'20px' }}>{t.ctaDesc}</div>
            <a href="/auth" style={{ background:'#DC143C', color:'#F5EDD8', fontFamily:"'Syne',sans-serif", fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', padding:'12px 28px', borderRadius:'4px', textDecoration:'none' }}>{t.ctaBtn}</a>
          </div>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div style={{ textAlign:'center', padding:'24px 20px 32px', borderTop:'1px solid rgba(245,237,216,0.06)' }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', color:'rgba(245,237,216,0.15)', letterSpacing:'0.08em' }}>{t.footer} · <a href="/privacy" style={{ color:'rgba(245,237,216,0.25)', textDecoration:'underline', textUnderlineOffset:'3px', transition:'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#DC143C')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,237,216,0.25)')}>{t.privacyLabel}</a></span>
      </div>
    </main>
  )
}
