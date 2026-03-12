'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

interface Option { id: string; label: string; sort_order: number }
interface Poll {
  id: string; question: string; category: string
  is_active: boolean; closes_at: string | null; created_at: string
  options: Option[]
  votes: { [optionId: string]: number }
  totalVotes: number
  userVote: string | null
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareModal, setShareModal] = useState<Poll | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const captureRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUser({ id: user.id, email: user.email || '' })
    await fetchPolls(user?.id || null)
    setLoading(false)
  }

  async function fetchPolls(userId: string | null) {
    const now = new Date().toISOString()
    const { data: pollsData } = await supabase
      .from('polls').select('*, poll_options(*)')
      .eq('is_active', true)
      .or(`closes_at.is.null,closes_at.gt.${now}`)
      .order('created_at', { ascending: false })
    if (!pollsData) return
    const { data: votesData } = await supabase.from('votes').select('poll_id, option_id')
    const { data: userVotesData } = userId
      ? await supabase.from('votes').select('poll_id, option_id').eq('user_id', userId)
      : { data: [] }
    const enriched: Poll[] = pollsData.map(p => {
      const options: Option[] = (p.poll_options || []).sort((a: Option, b: Option) => a.sort_order - b.sort_order)
      const pollVotes = (votesData || []).filter(v => v.poll_id === p.id)
      const votes: { [k: string]: number } = {}
      options.forEach(o => { votes[o.id] = 0 })
      pollVotes.forEach(v => { if (votes[v.option_id] !== undefined) votes[v.option_id]++ })
      const userVote = (userVotesData || []).find(v => v.poll_id === p.id)?.option_id || null
      return { ...p, options, votes, totalVotes: pollVotes.length, userVote }
    })
    setPolls(enriched)
  }

  async function castVote(pollId: string, optionId: string) {
    if (!user) { window.location.href = '/auth'; return }
    await supabase.from('votes').insert({ poll_id: pollId, option_id: optionId, user_id: user.id })
    await fetchPolls(user.id)
  }

  async function downloadCard() {
    if (!captureRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#0D0D0D', scale: 1, useCORS: true,
        width: 1080, height: 1920, logging: false,
      })
      const link = document.createElement('a')
      link.download = `nepomarket-poll.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) { console.error(e) }
    setDownloading(false)
  }

  async function downloadAndShare(platform: string) {
    await downloadCard()
    if (platform === 'instagram') {
      setTimeout(() => alert('Card saved! Open Instagram → tap + → Story → select the image from your gallery.'), 500)
    }
  }

  function shareToX() {
    const text = shareModal ? `"${shareModal.question}" — What do you think? Cast your vote on Nepomarket 🇳🇵` : ''
    const url = 'https://nepomarket.com/polls'
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  function shareToFacebook() {
    const url = 'https://nepomarket.com/polls'
    window.open(`https://www.facebook.com/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400')
  }

  function copyLink() {
    navigator.clipboard.writeText('https://nepomarket.com/polls')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function getPct(poll: Poll, optionId: string) {
    if (poll.totalVotes === 0) return 0
    return Math.round((poll.votes[optionId] / poll.totalVotes) * 100)
  }

  function formatExpiry(closes_at: string | null) {
    if (!closes_at) return null
    const diff = new Date(closes_at).getTime() - Date.now()
    const days = Math.floor(diff / 86400000)
    if (days > 0) return `Closes in ${days}d`
    const hrs = Math.floor(diff / 3600000)
    if (hrs > 0) return `Closes in ${hrs}h`
    return 'Closing soon'
  }

  const COLORS = ['#DC143C', 'rgba(245,237,216,0.35)', 'rgba(245,237,216,0.18)']
  const FILLS = [
    'linear-gradient(90deg,#DC143C,#FF4060)',
    'rgba(245,237,216,0.3)',
    'rgba(245,237,216,0.15)'
  ]

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
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }

        .vote-btn { width:100%; background:rgba(245,237,216,0.04); border:1px solid rgba(245,237,216,0.1); border-radius:6px; padding:0; cursor:pointer; overflow:hidden; transition:border-color 0.2s; text-align:left; margin-bottom:10px; }
        .vote-btn:hover:not(:disabled) { border-color:rgba(220,20,60,0.4); }
        .vote-btn.voted { border-color:rgba(220,20,60,0.6); cursor:default; }
        .vote-inner { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; position:relative; z-index:1; }
        .vote-bar { position:absolute; top:0; left:0; bottom:0; background:rgba(220,20,60,0.09); transition:width 0.9s cubic-bezier(0.16,1,0.3,1); border-radius:6px; }
        .vote-label { font-family:'DM Mono',monospace; font-size:0.78rem; color:#F5EDD8; position:relative; z-index:1; }
        .vote-pct { font-family:'DM Mono',monospace; font-size:0.78rem; font-weight:500; color:#DC143C; position:relative; z-index:1; }

        .share-btn { background:transparent; border:1px solid rgba(245,237,216,0.14); color:rgba(245,237,216,0.5); font-family:'DM Mono',monospace; font-size:0.62rem; letter-spacing:0.08em; text-transform:uppercase; padding:7px 14px; border-radius:4px; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
        .share-btn:hover { border-color:rgba(245,237,216,0.3); color:#F5EDD8; }

        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.88); z-index:200; display:flex; align-items:center; justify-content:center; padding:16px; backdrop-filter:blur(10px); animation:fadeIn 0.2s forwards; }
        .modal-box { background:#111; border:1px solid rgba(245,237,216,0.12); border-radius:16px; width:100%; max-width:420px; max-height:92vh; overflow-y:auto; }
        .modal-header { display:flex; justify-content:space-between; align-items:center; padding:18px 22px; border-bottom:1px solid rgba(245,237,216,0.08); }
        .modal-title { font-family:'Syne',sans-serif; font-size:0.85rem; font-weight:700; }
        .close-btn { background:transparent; border:none; color:rgba(245,237,216,0.35); font-size:1.4rem; cursor:pointer; padding:2px 8px; line-height:1; transition:color 0.2s; }
        .close-btn:hover { color:#F5EDD8; }
        .modal-body { padding:20px 22px; }

        /* PREVIEW WRAP */
        .card-preview-wrap { width:378px; height:672px; overflow:hidden; border-radius:10px; border:1px solid rgba(245,237,216,0.1); margin-bottom:18px; background:#0D0D0D; }

        /* Hidden full-size capture card */
        .story-card-capture {
          width:1080px; height:1920px;
          position:fixed; left:-9999px; top:0;
          background:#0D0D0D;
          display:grid;
          grid-template-rows:auto auto 1fr auto;
          overflow:hidden;
        }
        .story-card {
          width:1080px; height:1920px;
          transform:scale(0.35); transform-origin:top left;
          flex-shrink:0; position:relative; overflow:hidden;
          background:#0D0D0D;
          display:grid;
          grid-template-rows:auto auto 1fr auto;
        }

        /* Card zones */
        .card-stripe { position:absolute; top:0; left:0; right:0; height:10px; background:#DC143C; }
        .card-glow-br { position:absolute; bottom:-300px; right:-300px; width:1000px; height:1000px; background:radial-gradient(circle,rgba(220,20,60,0.22),transparent 60%); pointer-events:none; }
        .card-glow-tl { position:absolute; top:-200px; left:-200px; width:600px; height:600px; background:radial-gradient(circle,rgba(220,20,60,0.07),transparent 65%); pointer-events:none; }
        .card-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(245,237,216,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(245,237,216,0.025) 1px,transparent 1px); background-size:80px 80px; pointer-events:none; }

        .card-header { padding:72px 96px 0; display:flex; justify-content:space-between; align-items:center; position:relative; z-index:1; }
        .card-logo-text { font-family:'Instrument Serif',serif; font-size:52px; color:#F5EDD8; letter-spacing:-0.01em; }
        .card-logo-text span { color:#DC143C; }
        .card-badge { background:rgba(220,20,60,0.12); border:1.5px solid rgba(220,20,60,0.35); border-radius:100px; padding:12px 28px; display:flex; align-items:center; gap:12px; }
        .card-badge-dot { width:12px; height:12px; border-radius:50%; background:#DC143C; }
        .card-badge-text { font-family:'DM Mono',monospace; font-size:22px; letter-spacing:0.14em; text-transform:uppercase; color:#DC143C; }

        .card-divider { margin:60px 96px; height:1px; background:linear-gradient(90deg,#DC143C,rgba(220,20,60,0.1)); position:relative; z-index:1; }

        .card-body { padding:60px 96px; display:flex; flex-direction:column; justify-content:center; position:relative; z-index:1; }
        .card-cat { font-family:'DM Mono',monospace; font-size:24px; letter-spacing:0.18em; text-transform:uppercase; color:rgba(245,237,216,0.35); margin-bottom:32px; }
        .card-question { font-family:'Instrument Serif',serif; font-size:96px; line-height:1.04; color:#F5EDD8; margin-bottom:80px; }

        .card-bars { display:flex; flex-direction:column; gap:36px; }
        .card-bar-item {}
        .card-bar-top { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:14px; }
        .card-bar-label { font-family:'DM Mono',monospace; font-size:28px; color:rgba(245,237,216,0.6); }
        .card-bar-pct { font-family:'Instrument Serif',serif; font-size:72px; line-height:1; color:#F5EDD8; }
        .card-bar-pct.top { color:#DC143C; }
        .card-track { height:8px; background:rgba(245,237,216,0.07); border-radius:4px; overflow:hidden; }
        .card-fill-0 { height:100%; border-radius:4px; background:linear-gradient(90deg,#DC143C 0%,#FF3355 100%); }
        .card-fill-1 { height:100%; border-radius:4px; background:rgba(245,237,216,0.28); }
        .card-fill-2 { height:100%; border-radius:4px; background:rgba(245,237,216,0.14); }

        .card-footer { padding:52px 96px 72px; border-top:1px solid rgba(245,237,216,0.07); display:flex; justify-content:space-between; align-items:center; position:relative; z-index:1; }
        .card-footer-left {}
        .card-forecasters { font-family:'DM Mono',monospace; font-size:24px; color:rgba(245,237,216,0.25); margin-bottom:6px; }
        .card-cta { font-family:'Syne',sans-serif; font-size:26px; font-weight:700; color:rgba(245,237,216,0.5); }
        .card-url-box { text-align:right; }
        .card-url-label { font-family:'DM Mono',monospace; font-size:20px; color:rgba(245,237,216,0.2); margin-bottom:6px; }
        .card-url-value { font-family:'Instrument Serif',serif; font-size:34px; color:#F5EDD8; }
        .card-url-value span { color:#DC143C; }

        /* Action buttons */
        .action-row { display:flex; gap:8px; margin-bottom:14px; }
        .dl-btn { flex:1; background:#DC143C; border:none; color:#F5EDD8; font-family:'Syne',sans-serif; font-size:0.75rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; padding:12px 16px; border-radius:4px; cursor:pointer; transition:background 0.2s; }
        .dl-btn:hover { background:#b01030; }
        .dl-btn:disabled { opacity:0.6; cursor:wait; }
        .copy-btn { background:transparent; border:1px solid rgba(245,237,216,0.14); color:rgba(245,237,216,0.55); font-family:'DM Mono',monospace; font-size:0.65rem; letter-spacing:0.06em; padding:12px 16px; border-radius:4px; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
        .copy-btn:hover,.copy-btn.copied { border-color:rgba(76,175,80,0.5); color:#4CAF50; }

        .social-label { font-family:'DM Mono',monospace; font-size:0.58rem; color:rgba(245,237,216,0.25); letter-spacing:0.12em; text-transform:uppercase; margin-bottom:8px; }
        .social-row { display:flex; gap:8px; }
        .soc-btn { flex:1; border:none; padding:11px 8px; border-radius:4px; cursor:pointer; font-family:'Syne',sans-serif; font-size:0.68rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center; gap:5px; text-decoration:none; }
        .soc-btn:hover { opacity:0.82; }
        .soc-x { background:#000; color:#fff; border:1px solid #2a2a2a; }
        .soc-fb { background:#1877F2; color:#fff; }
        .soc-ig { background:linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); color:#fff; }
        .share-note { font-family:'DM Mono',monospace; font-size:0.58rem; color:rgba(245,237,216,0.2); margin-top:10px; line-height:1.7; }
      `}</style>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 40px', borderBottom:'1px solid rgba(245,237,216,0.12)', background:'rgba(13,13,13,0.9)', backdropFilter:'blur(12px)' }}>
        <a href="/" style={{ textDecoration:'none', fontFamily:"'Instrument Serif',serif", fontSize:'1.4rem', color:'#F5EDD8' }}>Nepo<span style={{color:'#DC143C'}}>market</span></a>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          {user ? (
            <>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', color:'rgba(245,237,216,0.35)' }}>{user.email}</span>
              <button onClick={async () => { await supabase.auth.signOut(); window.location.reload() }} style={{ background:'transparent', border:'1px solid rgba(245,237,216,0.12)', color:'rgba(245,237,216,0.4)', fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', padding:'6px 14px', borderRadius:'4px', cursor:'pointer' }}>Sign Out</button>
            </>
          ) : (
            <a href="/auth" style={{ background:'#DC143C', color:'#F5EDD8', fontFamily:"'Syne',sans-serif", fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', padding:'8px 18px', borderRadius:'4px', textDecoration:'none' }}>Sign In</a>
          )}
        </div>
      </nav>

      {/* POLLS */}
      <div style={{ maxWidth:'760px', margin:'0 auto', padding:'110px 20px 80px' }}>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', color:'#DC143C', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ width:'20px', height:'1px', background:'#DC143C', display:'inline-block' }}></span>
          Live Forecasts · Nepal
        </div>
        <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:'clamp(2.2rem,5vw,3.5rem)', letterSpacing:'-0.02em', lineHeight:1.1, marginBottom:'12px' }}>
          What Nepal <em style={{color:'#DC143C'}}>Really</em> Thinks
        </h1>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.78rem', color:'rgba(245,237,216,0.4)', marginBottom:'48px' }}>
          {user ? `Welcome back, ${user.email.split('@')[0]}. Vote on real issues below.` : 'Sign in to cast your vote. Watch the crowd shift in real time.'}
        </p>

        {polls.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 0', fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', color:'rgba(245,237,216,0.2)' }}>No active polls right now.</div>
        )}

        {polls.map(poll => (
          <div key={poll.id} style={{ background:'#1A1A1A', border:'1px solid rgba(245,237,216,0.1)', borderRadius:'12px', padding:'28px', marginBottom:'20px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'160px', height:'160px', background:'radial-gradient(circle,rgba(220,20,60,0.07),transparent 70%)', pointerEvents:'none' }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px', gap:'12px' }}>
              <div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', color:'#DC143C', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'10px', display:'flex', alignItems:'center', gap:'6px' }}>
                  <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#DC143C', display:'inline-block', animation:'pulse 1.5s infinite' }}></span>
                  Live Forecast · {poll.category}
                </div>
                <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:'1.3rem', lineHeight:1.3, color:'#F5EDD8' }}>{poll.question}</div>
              </div>
              <button className="share-btn" onClick={() => setShareModal(poll)}>📤 Share</button>
            </div>
            {poll.closes_at && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', color:'rgba(245,237,216,0.25)', marginBottom:'16px' }}>⏱ {formatExpiry(poll.closes_at)}</div>}
            {poll.options.map((opt) => {
              const pct = getPct(poll, opt.id)
              const hasVoted = poll.userVote !== null
              const isVoted = poll.userVote === opt.id
              return (
                <button key={opt.id} className={`vote-btn ${hasVoted ? 'voted' : ''}`} onClick={() => !hasVoted && castVote(poll.id, opt.id)} disabled={hasVoted}>
                  <div className="vote-bar" style={{ width: hasVoted ? `${pct}%` : '0%' }}></div>
                  <div className="vote-inner">
                    <span className="vote-label">{isVoted ? '✓ ' : ''}{opt.label}</span>
                    {hasVoted && <span className="vote-pct">{pct}%</span>}
                  </div>
                </button>
              )
            })}
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'16px', paddingTop:'14px', borderTop:'1px solid rgba(245,237,216,0.06)' }}>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', color:'rgba(245,237,216,0.25)' }}>{poll.totalVotes} forecaster{poll.totalVotes !== 1 ? 's' : ''}</span>
              {!user && <a href="/auth" style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', color:'#DC143C', textDecoration:'none' }}>Sign in to vote →</a>}
            </div>
          </div>
        ))}
      </div>

      {/* SHARE MODAL */}
      {shareModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShareModal(null) }}>
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">Share this forecast</span>
              <button className="close-btn" onClick={() => setShareModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', color:'rgba(245,237,216,0.25)', marginBottom:'12px', letterSpacing:'0.08em', textTransform:'uppercase' }}>Story Card Preview (9:16)</p>

              {/* CARD PREVIEW — scaled for display */}
              <div className="card-preview-wrap">
                <div ref={cardRef} className="story-card">
                  <div className="card-stripe"></div>
                  <div className="card-glow-br"></div>
                  <div className="card-glow-tl"></div>
                  <div className="card-grid"></div>
                  <div className="card-header">
                    <div className="card-logo-text">Nepo<span>market</span></div>
                    <div className="card-badge"><div className="card-badge-dot"></div><span className="card-badge-text">Live Poll</span></div>
                  </div>
                  <div className="card-divider"></div>
                  <div className="card-body">
                    <div className="card-cat">{shareModal.category} · Nepal</div>
                    <div className="card-question">{shareModal.question}</div>
                    <div className="card-bars">
                      {shareModal.options.map((opt, i) => {
                        const pct = getPct(shareModal, opt.id)
                        return (
                          <div className="card-bar-item" key={opt.id}>
                            <div className="card-bar-top">
                              <span className="card-bar-label">{opt.label}</span>
                              <span className={`card-bar-pct ${i === 0 ? 'top' : ''}`}>{pct}%</span>
                            </div>
                            <div className="card-track">
                              <div className={`card-fill-${Math.min(i, 2)}`} style={{ width:`${pct}%` }}></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="card-footer-left">
                      <div className="card-forecasters">{shareModal.totalVotes} forecasters voted</div>
                      <div className="card-cta">Cast your vote →</div>
                    </div>
                    <div className="card-url-box">
                      <div className="card-url-label">Visit us at</div>
                      <div className="card-url-value">nepo<span>market</span>.com</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* HIDDEN FULL-SIZE CAPTURE CARD */}
              <div ref={captureRef} className="story-card-capture">
                <div className="card-stripe"></div>
                <div className="card-glow-br"></div>
                <div className="card-glow-tl"></div>
                <div className="card-grid"></div>
                <div className="card-header">
                  <div className="card-logo-text">Nepo<span>market</span></div>
                  <div className="card-badge"><div className="card-badge-dot"></div><span className="card-badge-text">Live Poll</span></div>
                </div>
                <div className="card-divider"></div>
                <div className="card-body">
                  <div className="card-cat">{shareModal.category} · Nepal</div>
                  <div className="card-question">{shareModal.question}</div>
                  <div className="card-bars">
                    {shareModal.options.map((opt, i) => {
                      const pct = getPct(shareModal, opt.id)
                      return (
                        <div className="card-bar-item" key={opt.id}>
                          <div className="card-bar-top">
                            <span className="card-bar-label">{opt.label}</span>
                            <span className={`card-bar-pct ${i === 0 ? 'top' : ''}`}>{pct}%</span>
                          </div>
                          <div className="card-track">
                            <div className={`card-fill-${Math.min(i, 2)}`} style={{ width:`${pct}%` }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="card-footer">
                  <div className="card-footer-left">
                    <div className="card-forecasters">{shareModal.totalVotes} forecasters voted</div>
                    <div className="card-cta">Cast your vote →</div>
                  </div>
                  <div className="card-url-box">
                    <div className="card-url-label">Visit us at</div>
                    <div className="card-url-value">nepo<span>market</span>.com</div>
                  </div>
                </div>
              </div>

              {/* DOWNLOAD */}
              <div className="action-row">
                <button className="dl-btn" onClick={downloadCard} disabled={downloading}>
                  {downloading ? 'Generating...' : '⬇ Download Card'}
                </button>
                <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copyLink}>
                  {copied ? '✓ Copied!' : '🔗 Copy Link'}
                </button>
              </div>

              {/* SOCIAL */}
              <div className="social-label">Share directly</div>
              <div className="social-row">
                <button className="soc-btn soc-x" onClick={shareToX}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Post
                </button>
                <button className="soc-btn soc-fb" onClick={shareToFacebook}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </button>
                <button className="soc-btn soc-ig" onClick={() => downloadAndShare('instagram')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  Instagram
                </button>
              </div>
              <p className="share-note">
                Instagram: tap Instagram → download card → open the app → Story → select from gallery.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}