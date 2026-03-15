'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../lib/useLanguage'
import SiteFooter from '../../components/SiteFooter'

export default function ProfilePage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [username, setUsername] = useState('')
  const [currentUsername, setCurrentUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { lang, langFlip, toggleLang } = useLanguage()

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { window.location.href = '/auth'; return }
    setUser({ id: authUser.id, email: authUser.email || '' })

    const { data: profile } = await supabase
      .from('profiles').select('username').eq('user_id', authUser.id).single()
    if (profile?.username) {
      setCurrentUsername(profile.username)
      setUsername(profile.username)
    }
    setLoading(false)
  }

  async function saveUsername() {
    if (!user) return
    const trimmed = username.trim()
    if (!trimmed || trimmed.length < 2) { setError('Username must be at least 2 characters.'); return }
    if (trimmed.length > 24) { setError('Username must be 24 characters or less.'); return }
    if (!/^[a-zA-Z0-9_\-. ]+$/.test(trimmed)) { setError('Only letters, numbers, spaces, _ - . allowed.'); return }

    setSaving(true)
    setError('')
    setMessage('')

    const { error: upsertError } = await supabase.from('profiles').upsert(
      { user_id: user.id, username: trimmed, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

    if (upsertError) {
      setError('Failed to save. Try again.')
    } else {
      setCurrentUsername(trimmed)
      setMessage('✓ Username saved!')
    }
    setSaving(false)
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
        input:focus { outline: none; border-color: rgba(220,20,60,0.5) !important; background: rgba(245,237,216,0.09) !important; }
        @keyframes slideSwitch { 0%{transform:translateY(0);opacity:1} 40%{transform:translateY(-6px);opacity:0} 60%{transform:translateY(6px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        .lang-flip { animation: slideSwitch 0.4s ease; }
        .lang-toggle:hover { border-color: rgba(220,20,60,0.5) !important; background: rgba(220,20,60,0.08) !important; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', borderBottom: '1px solid rgba(245,237,216,0.1)', background: 'rgba(13,13,13,0.92)', backdropFilter: 'blur(14px)' }}>
        <a href="/" style={{ textDecoration: 'none', fontFamily: "'Instrument Serif',serif", fontSize: '1.35rem', color: '#F5EDD8', letterSpacing: '-0.01em' }}>
          Nepo<span style={{ color: '#DC143C' }}>market</span>
        </a>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={toggleLang} className="lang-toggle" style={{ background: 'rgba(245,237,216,0.04)', border: '1px solid rgba(245,237,216,0.14)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.25s' }}>
            <span style={{ fontSize: '0.9rem' }}>{lang === 'en' ? '🇳🇵' : '🌐'}</span>
            <span className={langFlip ? 'lang-flip' : ''} style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.65rem', color: '#F5EDD8', fontWeight: 500 }}>{lang === 'en' ? 'नेपाली' : 'English'}</span>
          </button>
          <a href="/polls" style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.65rem', color: 'rgba(245,237,216,0.4)', textDecoration: 'none', border: '1px solid rgba(245,237,216,0.12)', padding: '6px 14px', borderRadius: '4px' }}>← {lang === 'en' ? 'Polls' : 'मतदान'}</a>
          <a href="/leaderboard" style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.65rem', color: 'rgba(245,237,216,0.4)', textDecoration: 'none', border: '1px solid rgba(245,237,216,0.12)', padding: '6px 14px', borderRadius: '4px' }}>{lang === 'en' ? 'Leaderboard' : 'लिडरबोर्ड'}</a>
        </div>
      </nav>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '120px 20px 80px' }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.65rem', color: '#DC143C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '20px', height: '1px', background: '#DC143C', display: 'inline-block' }}></span>
          Your Profile
        </div>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(2rem,5vw,3rem)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '32px' }}>
          Set your <em style={{ color: '#DC143C' }}>forecaster</em> name
        </h1>

        {/* Account info */}
        <div style={{ background: '#1A1A1A', border: '1px solid rgba(245,237,216,0.1)', borderRadius: '10px', padding: '20px 24px', marginBottom: '28px' }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', color: 'rgba(245,237,216,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Signed in as</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.82rem', color: '#F5EDD8' }}>{user?.email}</div>
          {currentUsername && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(245,237,216,0.06)' }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', color: 'rgba(245,237,216,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Current username</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#DC143C' }}>{currentUsername}</div>
            </div>
          )}
        </div>

        {/* Username form */}
        <div style={{ background: '#1A1A1A', border: '1px solid rgba(245,237,216,0.1)', borderRadius: '10px', padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle,rgba(220,20,60,0.08),transparent 70%)', pointerEvents: 'none' }} />

          <label style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', color: 'rgba(245,237,216,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
            Display Name
          </label>
          <input
            type="text"
            placeholder="e.g. KathmanduKing, Pokhara123"
            value={username}
            maxLength={24}
            onChange={e => { setUsername(e.target.value); setError(''); setMessage('') }}
            onKeyDown={e => e.key === 'Enter' && saveUsername()}
            style={{ width: '100%', background: 'rgba(245,237,216,0.06)', border: `1px solid ${error ? 'rgba(220,20,60,0.6)' : 'rgba(245,237,216,0.12)'}`, color: '#F5EDD8', fontFamily: "'DM Mono',monospace", fontSize: '0.9rem', padding: '13px 16px', borderRadius: '4px', marginBottom: '8px', transition: 'border-color 0.2s, background 0.2s' }}
          />
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', color: 'rgba(245,237,216,0.2)', marginBottom: '20px' }}>
            {username.trim().length}/24 · Letters, numbers, spaces, _ - . only
          </div>

          {error && <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.68rem', color: '#DC143C', marginBottom: '14px' }}>{error}</div>}
          {message && <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.68rem', color: '#4CAF50', marginBottom: '14px' }}>{message}</div>}

          <button
            onClick={saveUsername}
            disabled={saving || !username.trim()}
            style={{ width: '100%', background: '#DC143C', border: 'none', color: '#F5EDD8', fontFamily: "'Syne',sans-serif", fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '14px', borderRadius: '4px', cursor: 'pointer', opacity: (saving || !username.trim()) ? 0.6 : 1, transition: 'opacity 0.2s' }}
          >
            {saving ? 'Saving...' : currentUsername ? 'Update Username' : 'Set Username'}
          </button>
        </div>

        {/* Sign out */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
            style={{ background: 'transparent', border: '1px solid rgba(245,237,216,0.1)', color: 'rgba(245,237,216,0.3)', fontFamily: "'DM Mono',monospace", fontSize: '0.65rem', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.06em' }}
          >
            Sign Out
          </button>
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
