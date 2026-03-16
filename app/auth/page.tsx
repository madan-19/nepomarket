'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import SiteNav from '../../components/SiteNav'
import SiteFooter from '../../components/SiteFooter'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/polls` }
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <main style={{
      background: '#0D0D0D', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Syne', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: rgba(220,20,60,0.5) !important; }
      `}</style>

      <SiteNav />

      {/* Centered card area — grows to fill space between nav and footer */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 20px 40px',
      }}>
        <div style={{
          background: '#1A1A1A', border: '1px solid rgba(245,237,216,0.12)',
          borderRadius: '12px', padding: '48px 40px', width: '100%', maxWidth: '420px',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(220,20,60,0.1), transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Logo */}
          <div style={{
            fontFamily: "'Instrument Serif', serif", fontSize: '1.6rem',
            marginBottom: '8px', color: '#F5EDD8'
          }}>
            Nepo<span style={{ color: '#DC143C' }}>market</span>
          </div>

          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
            color: 'rgba(245,237,216,0.35)', letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '32px'
          }}>
            What Nepal Really Thinks
          </div>

          {sent ? (
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📬</div>
              <div style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '1.3rem', color: '#F5EDD8', marginBottom: '12px'
              }}>
                Check your email
              </div>
              <p style={{
                fontFamily: "'DM Mono', monospace", fontSize: '0.72rem',
                color: 'rgba(245,237,216,0.45)', lineHeight: 1.8,
                marginBottom: '24px'
              }}>
                We sent a magic link to <strong style={{ color: '#F5EDD8' }}>{email}</strong>.
                Click it to sign in — no password needed.
              </p>
              <a href="/" style={{
                display: 'inline-block',
                fontFamily: "'DM Mono', monospace", fontSize: '0.68rem',
                color: 'rgba(245,237,216,0.4)', textDecoration: 'none',
                border: '1px solid rgba(245,237,216,0.12)',
                padding: '8px 18px', borderRadius: '4px',
                transition: 'all 0.2s',
              }}>
                ← Back to Home
              </a>
            </div>
          ) : (
            <>
              <div style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '1.5rem', lineHeight: 1.2,
                color: '#F5EDD8', marginBottom: '8px'
              }}>
                Sign in to vote
              </div>
              <p style={{
                fontFamily: "'DM Mono', monospace", fontSize: '0.72rem',
                color: 'rgba(245,237,216,0.45)', lineHeight: 1.7, marginBottom: '28px'
              }}>
                Enter your email. We&apos;ll send you a magic link — no password needed.
              </p>

              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%', background: 'rgba(245,237,216,0.06)',
                  border: `1px solid ${error ? 'rgba(220,20,60,0.8)' : 'rgba(245,237,216,0.12)'}`,
                  color: '#F5EDD8', fontFamily: "'DM Mono', monospace",
                  fontSize: '0.82rem', padding: '14px 18px',
                  borderRadius: '4px', outline: 'none', marginBottom: '12px'
                }}
              />

              {error && (
                <p style={{
                  fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
                  color: '#DC143C', marginBottom: '12px'
                }}>{error}</p>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  width: '100%', background: '#DC143C',
                  border: 'none', color: '#F5EDD8',
                  fontFamily: "'Syne', sans-serif", fontSize: '0.8rem',
                  fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '15px', borderRadius: '4px', cursor: 'pointer',
                  opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s'
                }}
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>

              <p style={{
                fontFamily: "'DM Mono', monospace", fontSize: '0.6rem',
                color: 'rgba(245,237,216,0.25)', marginTop: '16px',
                textAlign: 'center', lineHeight: 1.6
              }}>
                By signing in you agree to our{' '}
                <a href="/privacy" style={{ color: 'rgba(245,237,216,0.4)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                  terms
                </a>
                . Free forever. No spam.
              </p>
            </>
          )}
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}
