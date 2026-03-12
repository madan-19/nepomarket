'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Poll {
  id: string
  question: string
  category: string
  is_active: boolean
  closes_at: string | null
  created_at: string
}

interface NewPoll {
  question: string
  category: string
  options: string[]
  closes_at: string
}

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [polls, setPolls] = useState<Poll[]>([])
  const [newPoll, setNewPoll] = useState<NewPoll>({
    question: '',
    category: 'politics',
    options: ['', '', ''],
    closes_at: ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { checkAdmin() }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth'; return }
    const { data } = await supabase
      .from('admin_users').select('user_id')
      .eq('user_id', user.id).single()
    if (!data) { window.location.href = '/polls'; return }
    setAuthorized(true)
    fetchPolls()
    setLoading(false)
  }

  async function fetchPolls() {
    const { data } = await supabase
      .from('polls').select('*')
      .order('created_at', { ascending: false })
    if (data) setPolls(data)
  }

  async function addPoll() {
    if (!newPoll.question.trim()) { setMessage('Question is required.'); return }
    const validOptions = newPoll.options.filter(o => o.trim())
    if (validOptions.length < 2) { setMessage('At least 2 options required.'); return }

    setSaving(true)
    setMessage('')

    const pollData: { question: string; category: string; closes_at?: string } = {
      question: newPoll.question.trim(),
      category: newPoll.category,
    }
    if (newPoll.closes_at) {
      pollData.closes_at = new Date(newPoll.closes_at).toISOString()
    }

    const { data: poll, error } = await supabase
      .from('polls').insert(pollData).select().single()

    if (error || !poll) { setMessage('Error creating poll.'); setSaving(false); return }

    await supabase.from('poll_options').insert(
      validOptions.map((label, i) => ({
        poll_id: poll.id, label: label.trim(), sort_order: i + 1
      }))
    )

    setNewPoll({ question: '', category: 'politics', options: ['', '', ''], closes_at: '' })
    setMessage('✓ Poll created successfully!')
    fetchPolls()
    setSaving(false)
  }

  async function togglePoll(id: string, current: boolean) {
    await supabase.from('polls').update({ is_active: !current }).eq('id', id)
    fetchPolls()
  }

  async function deletePoll(id: string) {
    if (!confirm('Delete this poll and all its votes?')) return
    await supabase.from('votes').delete().eq('poll_id', id)
    await supabase.from('poll_options').delete().eq('poll_id', id)
    await supabase.from('polls').delete().eq('id', id)
    fetchPolls()
  }

  function updateOption(index: number, value: string) {
    const updated = [...newPoll.options]
    updated[index] = value
    setNewPoll({ ...newPoll, options: updated })
  }

  function getPollStatus(poll: Poll) {
    if (!poll.is_active) return { label: '○ Inactive', color: 'rgba(245,237,216,0.25)' }
    if (poll.closes_at && new Date(poll.closes_at) < new Date()) return { label: '● Expired', color: '#FFC107' }
    return { label: '● Active', color: '#4CAF50' }
  }

  function formatExpiry(closes_at: string | null) {
    if (!closes_at) return 'No expiry'
    const d = new Date(closes_at)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // Min date for the picker = today
  const minDate = new Date().toISOString().slice(0, 16)

  if (loading) return (
    <main style={{ background: '#0D0D0D', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: 'rgba(245,237,216,0.3)' }}>Loading...</span>
    </main>
  )

  if (!authorized) return null

  return (
    <main style={{ background: '#0D0D0D', minHeight: '100vh', color: '#F5EDD8', fontFamily: "'Syne', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; }
        input, select { transition: border-color 0.2s; }
        input:focus, select:focus { outline: none; border-color: rgba(220,20,60,0.5) !important; }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', borderBottom: '1px solid rgba(245,237,216,0.12)',
        background: 'rgba(13,13,13,0.9)', backdropFilter: 'blur(12px)'
      }}>
        <a href="/" style={{ textDecoration: 'none', fontFamily: "'Instrument Serif', serif", fontSize: '1.4rem', color: '#F5EDD8' }}>
          Nepo<span style={{ color: '#DC143C' }}>market</span>
        </a>
        <a href="/polls" style={{
          fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
          color: 'rgba(245,237,216,0.4)', textDecoration: 'none',
          border: '1px solid rgba(245,237,216,0.12)', padding: '6px 14px', borderRadius: '4px'
        }}>← Back to Polls</a>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '120px 40px 80px' }}>

        {/* Header */}
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
          color: '#DC143C', letterSpacing: '0.15em', textTransform: 'uppercase',
          marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span style={{ width: '28px', height: '1px', background: '#DC143C', display: 'inline-block' }}></span>
          Admin Panel
        </div>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.5rem', letterSpacing: '-0.02em', marginBottom: '48px' }}>
          Manage <em style={{ color: '#DC143C' }}>Nepomarket</em>
        </h1>

        {/* ADD NEW POLL */}
        <div style={{
          background: '#1A1A1A', border: '1px solid rgba(245,237,216,0.12)',
          borderRadius: '12px', padding: '32px', marginBottom: '40px',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(220,20,60,0.08), transparent 70%)',
            pointerEvents: 'none'
          }} />

          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: '24px' }}>
            Add New Poll
          </h2>

          {/* Question */}
          <label style={labelStyle}>Question</label>
          <input
            type="text"
            placeholder="e.g. Will Balen Shah run for PM in 2028?"
            value={newPoll.question}
            onChange={e => setNewPoll({ ...newPoll, question: e.target.value })}
            style={inputStyle}
          />

          {/* Category + Expiry side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={newPoll.category}
                onChange={e => setNewPoll({ ...newPoll, category: e.target.value })}
                style={{ ...inputStyle, marginBottom: 0 }}
              >
                <option value="politics">Politics</option>
                <option value="development">Development</option>
                <option value="cricket">Cricket</option>
                <option value="economy">Economy</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="social">Social</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Expiry Date & Time <span style={{ color: 'rgba(245,237,216,0.25)', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="datetime-local"
                min={minDate}
                value={newPoll.closes_at}
                onChange={e => setNewPoll({ ...newPoll, closes_at: e.target.value })}
                style={{ ...inputStyle, marginBottom: 0, colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Expiry note */}
          {newPoll.closes_at && (
            <div style={{
              background: 'rgba(220,20,60,0.06)', border: '1px solid rgba(220,20,60,0.2)',
              borderRadius: '6px', padding: '10px 14px', marginBottom: '20px',
              fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'rgba(245,237,216,0.5)'
            }}>
              ⏱ This poll will automatically close on {formatExpiry(new Date(newPoll.closes_at).toISOString())}
            </div>
          )}

          {/* Options */}
          <label style={labelStyle}>Options</label>
          {newPoll.options.map((opt, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Option ${i + 1} — e.g. Yes, will deliver`}
              value={opt}
              onChange={e => updateOption(i, e.target.value)}
              style={inputStyle}
            />
          ))}

          <button onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, ''] })} style={{
            background: 'transparent', border: '1px dashed rgba(245,237,216,0.2)',
            color: 'rgba(245,237,216,0.4)', fontFamily: "'DM Mono', monospace",
            fontSize: '0.65rem', padding: '8px 16px', borderRadius: '4px',
            cursor: 'pointer', marginBottom: '24px', letterSpacing: '0.08em'
          }}>+ Add Option</button>

          {message && (
            <p style={{
              fontFamily: "'DM Mono', monospace", fontSize: '0.72rem',
              color: message.startsWith('✓') ? '#4CAF50' : '#DC143C', marginBottom: '16px'
            }}>{message}</p>
          )}

          <button onClick={addPoll} disabled={saving} style={{
            background: '#DC143C', border: 'none', color: '#F5EDD8',
            fontFamily: "'Syne', sans-serif", fontSize: '0.8rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '14px 32px', borderRadius: '4px', cursor: 'pointer',
            opacity: saving ? 0.7 : 1
          }}>
            {saving ? 'Creating...' : 'Create Poll'}
          </button>
        </div>

        {/* EXISTING POLLS */}
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>
          All Polls ({polls.length})
        </h2>

        {polls.map(poll => {
          const status = getPollStatus(poll)
          return (
            <div key={poll.id} style={{
              background: '#1A1A1A', border: '1px solid rgba(245,237,216,0.12)',
              borderRadius: '8px', padding: '20px 24px', marginBottom: '12px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.88rem', marginBottom: '8px' }}>
                  {poll.question}
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: 'rgba(245,237,216,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {poll.category}
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: status.color }}>
                    {status.label}
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: 'rgba(245,237,216,0.25)' }}>
                    ⏱ {formatExpiry(poll.closes_at)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => togglePoll(poll.id, poll.is_active)} style={{
                  background: 'transparent',
                  border: `1px solid ${poll.is_active ? 'rgba(255,193,7,0.4)' : 'rgba(76,175,80,0.4)'}`,
                  color: poll.is_active ? '#FFC107' : '#4CAF50',
                  fontFamily: "'DM Mono', monospace", fontSize: '0.6rem',
                  padding: '6px 12px', borderRadius: '4px', cursor: 'pointer',
                  letterSpacing: '0.08em', textTransform: 'uppercase'
                }}>
                  {poll.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => deletePoll(poll.id)} style={{
                  background: 'transparent', border: '1px solid rgba(220,20,60,0.3)',
                  color: 'rgba(220,20,60,0.7)', fontFamily: "'DM Mono', monospace",
                  fontSize: '0.6rem', padding: '6px 12px', borderRadius: '4px',
                  cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase'
                }}>Delete</button>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
  color: 'rgba(245,237,216,0.4)', letterSpacing: '0.1em',
  textTransform: 'uppercase', display: 'block', marginBottom: '8px'
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(245,237,216,0.06)',
  border: '1px solid rgba(245,237,216,0.12)', color: '#F5EDD8',
  fontFamily: "'DM Mono', monospace", fontSize: '0.8rem',
  padding: '12px 16px', borderRadius: '4px', marginBottom: '16px'
}