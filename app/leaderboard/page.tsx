'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface LeaderEntry {
  rank: number
  user_id: string
  username: string
  total_votes: number
  correct_votes: number
  score: number
  accuracy: number
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([])
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [userRank, setUserRank] = useState<LeaderEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUser({ id: user.id, email: user.email || '' })

    // Build leaderboard from votes table dynamically
    const { data: votes } = await supabase
      .from('votes')
      .select('user_id, poll_id, option_id, is_correct')

    const { data: authUsers } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(100)

    // If leaderboard table has data use it, otherwise derive from votes
    if (authUsers && authUsers.length > 0) {
      const ranked = authUsers.map((u, i) => ({
        ...u,
        rank: i + 1,
        accuracy: u.total_votes > 0 ? Math.round((u.correct_votes / u.total_votes) * 100) : 0
      }))
      setLeaders(ranked)
      if (user) {
        const found = ranked.find(r => r.user_id === user.id)
        if (found) setUserRank(found)
      }
    } else if (votes && votes.length > 0) {
      // Derive from votes
      const map: { [uid: string]: { total: number; correct: number } } = {}
      votes.forEach(v => {
        if (!map[v.user_id]) map[v.user_id] = { total: 0, correct: 0 }
        map[v.user_id].total++
        if (v.is_correct) map[v.user_id].correct++
      })
      const ranked = Object.entries(map)
        .map(([uid, s], i) => ({
          rank: i + 1,
          user_id: uid,
          username: uid === user?.id ? user.email.split('@')[0] : `Forecaster #${i + 1}`,
          total_votes: s.total,
          correct_votes: s.correct,
          score: s.correct * 10 + s.total,
          accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
        }))
        .sort((a, b) => b.score - a.score)
        .map((e, i) => ({ ...e, rank: i + 1 }))
      setLeaders(ranked)
      if (user) {
        const found = ranked.find(r => r.user_id === user.id)
        if (found) setUserRank(found)
      }
    }

    setLoading(false)
  }

  function getMedal(rank: number) {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  function getBadge(entry: LeaderEntry) {
    if (entry.rank === 1) return { label: 'Top Forecaster', color: '#FFD700' }
    if (entry.rank <= 3) return { label: 'Elite', color: '#C0C0C0' }
    if (entry.total_votes >= 10) return { label: 'Active', color: '#DC143C' }
    return { label: 'Newcomer', color: 'rgba(245,237,216,0.3)' }
  }

  if (loading) return (
    <main style={{ background: '#0D0D0D', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.75rem', color: 'rgba(245,237,216,0.3)' }}>Loading...</span>
    </main>
  )

  return (
    <main style={{ background: '#0D0D0D', minHeight: '100vh', color: '#F5EDD8', fontFamily: "'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; }

        .lb-row {
          display: grid;
          grid-template-columns: 48px 1fr auto auto auto;
          gap: 12px;
          align-items: center;
          padding: 16px 20px;
          border-radius: 8px;
          border: 1px solid rgba(245,237,216,0.07);
          background: #1A1A1A;
          margin-bottom: 8px;
          transition: border-color 0.2s, background 0.2s;
        }
        .lb-row:hover { border-color: rgba(245,237,216,0.14); background: #1f1f1f; }
        .lb-row.top1 { border-color: rgba(255,215,0,0.25); background: rgba(255,215,0,0.04); }
        .lb-row.top2 { border-color: rgba(192,192,192,0.2); }
        .lb-row.top3 { border-color: rgba(205,127,50,0.2); }
        .lb-row.is-user { border-color: rgba(220,20,60,0.35); background: rgba(220,20,60,0.05); }

        .rank-num { font-family: 'DM Mono',monospace; font-size: 0.85rem; font-weight: 500; color: rgba(245,237,216,0.3); text-align: center; }
        .rank-medal { font-size: 1.3rem; text-align: center; }
        .user-name { font-family: 'Syne',sans-serif; font-size: 0.88rem; font-weight: 600; color: #F5EDD8; }
        .user-sub { font-family: 'DM Mono',monospace; font-size: 0.6rem; color: rgba(245,237,216,0.3); margin-top: 2px; }
        .stat-col { text-align: right; }
        .stat-val { font-family: 'Instrument Serif',serif; font-size: 1.2rem; color: #F5EDD8; line-height: 1; }
        .stat-val.red { color: #DC143C; }
        .stat-lbl { font-family: 'DM Mono',monospace; font-size: 0.55rem; color: rgba(245,237,216,0.25); letter-spacing: 0.08em; text-transform: uppercase; margin-top: 2px; }
        .badge-pill { font-family: 'DM Mono',monospace; font-size: 0.55rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }

        .user-card {
          background: rgba(220,20,60,0.07);
          border: 1px solid rgba(220,20,60,0.25);
          border-radius: 10px;
          padding: 20px 24px;
          margin-bottom: 32px;
          display: grid;
          grid-template-columns: 1fr repeat(3, auto);
          gap: 24px;
          align-items: center;
        }

        .top3-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          margin-bottom: 32px;
        }
        .podium-card {
          background: #1A1A1A;
          border: 1px solid rgba(245,237,216,0.08);
          border-radius: 10px;
          padding: 20px 16px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .podium-card.p1 { border-color: rgba(255,215,0,0.3); background: rgba(255,215,0,0.04); }
        .podium-card.p2 { border-color: rgba(192,192,192,0.2); }
        .podium-card.p3 { border-color: rgba(205,127,50,0.2); }
        .podium-medal { font-size: 2rem; margin-bottom: 8px; }
        .podium-name { font-family: 'Syne',sans-serif; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; word-break: break-all; }
        .podium-score { font-family: 'Instrument Serif',serif; font-size: 1.6rem; color: #DC143C; line-height: 1; }
        .podium-score-lbl { font-family: 'DM Mono',monospace; font-size: 0.55rem; color: rgba(245,237,216,0.3); letter-spacing: 0.1em; text-transform: uppercase; }
        .podium-votes { font-family: 'DM Mono',monospace; font-size: 0.6rem; color: rgba(245,237,216,0.3); margin-top: 6px; }

        @media (max-width: 600px) {
          .lb-row { grid-template-columns: 36px 1fr auto auto; }
          .user-card { grid-template-columns: 1fr 1fr; }
          .top3-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid rgba(245,237,216,0.12)', background: 'rgba(13,13,13,0.9)', backdropFilter: 'blur(12px)' }}>
        <a href="/" style={{ textDecoration: 'none', fontFamily: "'Instrument Serif',serif", fontSize: '1.4rem', color: '#F5EDD8' }}>Nepo<span style={{ color: '#DC143C' }}>market</span></a>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/polls" style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.65rem', color: 'rgba(245,237,216,0.4)', textDecoration: 'none', border: '1px solid rgba(245,237,216,0.12)', padding: '6px 14px', borderRadius: '4px' }}>← Polls</a>
          {user ? (
            <button onClick={async () => { await supabase.auth.signOut(); window.location.reload() }} style={{ background: 'transparent', border: '1px solid rgba(245,237,216,0.12)', color: 'rgba(245,237,216,0.4)', fontFamily: "'DM Mono',monospace", fontSize: '0.65rem', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' }}>Sign Out</button>
          ) : (
            <a href="/auth" style={{ background: '#DC143C', color: '#F5EDD8', fontFamily: "'Syne',sans-serif", fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 18px', borderRadius: '4px', textDecoration: 'none' }}>Sign In</a>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '110px 20px 80px' }}>

        {/* Header */}
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.65rem', color: '#DC143C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '20px', height: '1px', background: '#DC143C', display: 'inline-block' }}></span>
          Nepal's Best Forecasters
        </div>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(2.2rem,5vw,3.5rem)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '12px' }}>
          The <em style={{ color: '#DC143C' }}>Leaderboard</em>
        </h1>
        <p style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.78rem', color: 'rgba(245,237,216,0.4)', marginBottom: '40px' }}>
          Who has the sharpest political instincts in Nepal? Rankings update in real time.
        </p>

        {/* User's own rank card */}
        {user && userRank && (
          <div className="user-card">
            <div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', color: '#DC143C', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Your Ranking</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '1rem', fontWeight: 700 }}>{userRank.username || user.email.split('@')[0]}</div>
            </div>
            <div className="stat-col">
              <div className="stat-val red">#{userRank.rank}</div>
              <div className="stat-lbl">Rank</div>
            </div>
            <div className="stat-col">
              <div className="stat-val">{userRank.score}</div>
              <div className="stat-lbl">Score</div>
            </div>
            <div className="stat-col">
              <div className="stat-val">{userRank.total_votes}</div>
              <div className="stat-lbl">Votes</div>
            </div>
          </div>
        )}

        {leaders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🏆</div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.4rem', marginBottom: '8px' }}>No rankings yet</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.72rem', color: 'rgba(245,237,216,0.35)', marginBottom: '24px' }}>
              Be the first to vote and claim the top spot.
            </div>
            <a href="/polls" style={{ background: '#DC143C', color: '#F5EDD8', fontFamily: "'Syne',sans-serif", fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 28px', borderRadius: '4px', textDecoration: 'none' }}>Vote Now →</a>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaders.length >= 3 && (
              <div className="top3-grid">
                {[leaders[1], leaders[0], leaders[2]].map((entry, i) => {
                  const podiumClass = entry.rank === 1 ? 'p1' : entry.rank === 2 ? 'p2' : 'p3'
                  return (
                    <div className={`podium-card ${podiumClass}`} key={entry.user_id} style={{ marginTop: entry.rank === 1 ? 0 : '24px' }}>
                      <div className="podium-medal">{getMedal(entry.rank)}</div>
                      <div className="podium-name">{entry.username}</div>
                      <div className="podium-score">{entry.score}</div>
                      <div className="podium-score-lbl">points</div>
                      <div className="podium-votes">{entry.total_votes} votes cast</div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Full table */}
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', color: 'rgba(245,237,216,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', display: 'grid', gridTemplateColumns: '48px 1fr auto auto auto', gap: '12px', padding: '0 20px' }}>
              <span style={{ textAlign: 'center' }}>#</span>
              <span>Forecaster</span>
              <span style={{ textAlign: 'right' }}>Votes</span>
              <span style={{ textAlign: 'right' }}>Score</span>
              <span style={{ textAlign: 'right' }}>Badge</span>
            </div>

            {leaders.map(entry => {
              const medal = getMedal(entry.rank)
              const badge = getBadge(entry)
              const rowClass = entry.rank === 1 ? 'top1' : entry.rank === 2 ? 'top2' : entry.rank === 3 ? 'top3' : entry.user_id === user?.id ? 'is-user' : ''
              return (
                <div key={entry.user_id} className={`lb-row ${rowClass}`}>
                  <div>
                    {medal
                      ? <div className="rank-medal">{medal}</div>
                      : <div className="rank-num">{entry.rank}</div>
                    }
                  </div>
                  <div>
                    <div className="user-name">
                      {entry.username}
                      {entry.user_id === user?.id && <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.55rem', color: '#DC143C', marginLeft: '8px' }}>YOU</span>}
                    </div>
                    <div className="user-sub">{entry.total_votes} votes · {entry.accuracy}% accuracy</div>
                  </div>
                  <div className="stat-col">
                    <div className="stat-val">{entry.total_votes}</div>
                    <div className="stat-lbl">votes</div>
                  </div>
                  <div className="stat-col">
                    <div className="stat-val red">{entry.score}</div>
                    <div className="stat-lbl">pts</div>
                  </div>
                  <div>
                    <div className="badge-pill" style={{ background: `${badge.color}18`, color: badge.color, border: `1px solid ${badge.color}40` }}>
                      {badge.label}
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* CTA if not logged in */}
        {!user && (
          <div style={{ textAlign: 'center', marginTop: '40px', padding: '32px', background: '#1A1A1A', border: '1px solid rgba(245,237,216,0.08)', borderRadius: '10px' }}>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.3rem', marginBottom: '8px' }}>Want to appear here?</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.72rem', color: 'rgba(245,237,216,0.35)', marginBottom: '20px' }}>Sign in and start voting to earn your ranking.</div>
            <a href="/auth" style={{ background: '#DC143C', color: '#F5EDD8', fontFamily: "'Syne',sans-serif", fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 28px', borderRadius: '4px', textDecoration: 'none' }}>Sign In to Compete →</a>
          </div>
        )}
      </div>
    </main>
  )
}