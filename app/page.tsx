'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [voted, setVoted] = useState({})

  useEffect(() => {
    fetchPolls()
  }, [])

  async function fetchPolls() {
    const { data: pollsData } = await supabase
      .from('polls')
      .select('*, poll_options(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (pollsData) {
      const pollsWithVotes = await Promise.all(
        pollsData.map(async (poll) => {
          const { data: votes } = await supabase
            .from('votes')
            .select('option_id')
            .eq('poll_id', poll.id)

          const voteCounts: Record<string, number> = {}
          poll.poll_options.forEach(opt => voteCounts[opt.id] = 0)
          votes?.forEach(v => {
            if (voteCounts[v.option_id] !== undefined)
              voteCounts[v.option_id]++
          })

          const total = Object.values(voteCounts).reduce((a, b) => a + b, 0)
          const optionsWithPct = poll.poll_options
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(opt => ({
              ...opt,
              votes: voteCounts[opt.id],
              percentage: total > 0 ? Math.round((voteCounts[opt.id] / total) * 100) : 0
            }))

          return { ...poll, poll_options: optionsWithPct, total_votes: total }
        })
      )
      setPolls(pollsWithVotes)
    }
    setLoading(false)
  }

  async function castVote(pollId, optionId) {
    if (voted[pollId]) return

    await supabase.from('votes').insert({ poll_id: pollId, option_id: optionId })
    setVoted(prev => ({ ...prev, [pollId]: optionId }))
    fetchPolls()
  }

  return (
    <main style={{
      background: '#0D0D0D',
      minHeight: '100vh',
      color: '#F5EDD8',
      fontFamily: "'Syne', sans-serif"
    }}>
      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid rgba(245,237,216,0.12)',
        background: 'rgba(13,13,13,0.9)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.4rem' }}>
          Nepo<span style={{ color: '#DC143C' }}>market</span>
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
          color: '#555', border: '1px solid rgba(245,237,216,0.12)',
          padding: '5px 12px', borderRadius: '20px', letterSpacing: '0.08em'
        }}>
          What Nepal Really Thinks
        </div>
      </nav>

      {/* HERO */}
      <div style={{ paddingTop: '120px', padding: '120px 40px 20px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
          color: '#DC143C', letterSpacing: '0.15em', textTransform: 'uppercase',
          marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span style={{ width: '28px', height: '1px', background: '#DC143C', display: 'inline-block' }}></span>
          Live Forecasts · Nepal
        </div>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '12px'
        }}>
          What Nepal <em style={{ color: '#DC143C' }}>Really</em> Thinks
        </h1>
        <p style={{
          fontFamily: "'DM Mono', monospace", fontSize: '0.78rem',
          color: 'rgba(245,237,216,0.45)', lineHeight: 1.8, marginBottom: '48px'
        }}>
          Vote on real issues. Watch the crowd shift in real time. No gambling — just crowd wisdom.
        </p>
      </div>

      {/* POLLS */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 40px 80px' }}>
        {loading ? (
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: 'rgba(245,237,216,0.3)' }}>
            Loading polls...
          </div>
        ) : polls.length === 0 ? (
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: 'rgba(245,237,216,0.3)' }}>
            No polls yet.
          </div>
        ) : (
          polls.map(poll => (
            <div key={poll.id} style={{
              background: '#1A1A1A',
              border: '1px solid rgba(245,237,216,0.12)',
              borderRadius: '12px', padding: '32px',
              marginBottom: '24px', position: 'relative', overflow: 'hidden'
            }}>
              {/* Glow */}
              <div style={{
                position: 'absolute', top: '-60px', right: '-60px',
                width: '200px', height: '200px',
                background: 'radial-gradient(circle, rgba(220,20,60,0.1), transparent 70%)',
                pointerEvents: 'none'
              }} />

              {/* Label */}
              <div style={{
                fontFamily: "'DM Mono', monospace", fontSize: '0.6rem',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: '#DC143C', marginBottom: '14px',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#DC143C', display: 'inline-block',
                  animation: 'pulse 1.5s infinite'
                }} />
                Live Forecast · {poll.category || 'Nepal'}
              </div>

              {/* Question */}
              <div style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '1.3rem', lineHeight: 1.35,
                color: '#F5EDD8', marginBottom: '28px'
              }}>
                {poll.question}
              </div>

              {/* Options */}
              {poll.poll_options.map((opt, i) => {
                const hasVoted = voted[poll.id]
                const isMyVote = voted[poll.id] === opt.id
                const showResults = !!hasVoted

                return (
                  <div key={opt.id} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontFamily: "'DM Mono', monospace", fontSize: '0.72rem',
                        color: isMyVote ? '#F5EDD8' : 'rgba(245,237,216,0.6)',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}>
                        {isMyVote && <span style={{ color: '#DC143C' }}>✓</span>}
                        {opt.label}
                      </span>
                      {showResults && (
                        <span style={{
                          fontFamily: "'DM Mono', monospace", fontSize: '0.72rem',
                          color: '#F5EDD8', fontWeight: 500
                        }}>
                          {opt.percentage}%
                        </span>
                      )}
                    </div>

                    {/* Bar / Button */}
                    <div
                      onClick={() => castVote(poll.id, opt.id)}
                      style={{
                        height: showResults ? '8px' : '42px',
                        background: showResults ? 'rgba(245,237,216,0.08)' : 'rgba(245,237,216,0.05)',
                        borderRadius: showResults ? '4px' : '6px',
                        overflow: 'hidden', cursor: hasVoted ? 'default' : 'pointer',
                        border: hasVoted ? 'none' : '1px solid rgba(245,237,216,0.15)',
                        transition: 'all 0.3s ease',
                        display: 'flex', alignItems: 'center',
                        position: 'relative'
                      }}
                    >
                      {showResults ? (
                        <div style={{
                          height: '100%', borderRadius: '4px',
                          background: i === 0 ? '#DC143C' : 'rgba(245,237,216,0.25)',
                          width: `${opt.percentage}%`,
                          transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                          opacity: i === 0 ? 1 : 0.7
                        }} />
                      ) : (
                        <span style={{
                          fontFamily: "'DM Mono', monospace", fontSize: '0.72rem',
                          color: 'rgba(245,237,216,0.5)', padding: '0 16px'
                        }}>
                          {opt.label}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Meta */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginTop: '20px', paddingTop: '16px',
                borderTop: '1px solid rgba(245,237,216,0.08)'
              }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: '0.6rem',
                  color: 'rgba(245,237,216,0.3)'
                }}>
                  {poll.total_votes} {poll.total_votes === 1 ? 'forecaster' : 'forecasters'}
                </span>
                {!voted[poll.id] && (
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontSize: '0.6rem',
                    color: 'rgba(245,237,216,0.3)'
                  }}>
                    Click an option to vote
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; }
      `}</style>
    </main>
  )
}
