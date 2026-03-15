export default function PrivacyPage() {
  return (
    <main style={{ background: '#0D0D0D', minHeight: '100vh', color: '#F5EDD8', fontFamily: "'Syne', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; }
        h2 { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #F5EDD8; margin-bottom: 12px; margin-top: 40px; }
        p, li { font-family: 'DM Mono', monospace; font-size: 0.78rem; line-height: 1.9; color: rgba(245,237,216,0.55); }
        ul { padding-left: 20px; margin-bottom: 8px; }
        li { margin-bottom: 4px; }
        a { color: #DC143C; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', borderBottom: '1px solid rgba(245,237,216,0.1)', background: 'rgba(13,13,13,0.92)', backdropFilter: 'blur(14px)' }}>
        <a href="/" style={{ textDecoration: 'none', fontFamily: "'Instrument Serif', serif", fontSize: '1.35rem', color: '#F5EDD8', letterSpacing: '-0.01em' }}>
          Nepo<span style={{ color: '#DC143C' }}>market</span>
        </a>
        <a href="/polls" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'rgba(245,237,216,0.4)', textDecoration: 'none', border: '1px solid rgba(245,237,216,0.12)', padding: '6px 14px', borderRadius: '4px' }}>← Polls</a>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '120px 24px 80px' }}>

        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#DC143C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '20px', height: '1px', background: '#DC143C', display: 'inline-block' }}></span>
          Legal
        </div>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(2rem,5vw,3rem)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '8px' }}>
          Privacy &amp; Policy
        </h1>
        <p style={{ color: 'rgba(245,237,216,0.3)', marginBottom: '0' }}>
          Last updated: March 2026
        </p>

        <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid rgba(245,237,216,0.08)' }}>

          <h2>1. What Nepomarket Is</h2>
          <p>
            Nepomarket is a non-monetary civic polling platform for Nepal. We run opinion polls and crowd-wisdom forecasts on political, social, and cultural topics. We do <strong style={{ color: '#F5EDD8' }}>not</strong> involve real money, gambling, or financial instruments of any kind. This platform is fully compliant with Nepal's laws.
          </p>

          <h2>2. Information We Collect</h2>
          <ul>
            <li><strong style={{ color: 'rgba(245,237,216,0.8)' }}>Email address</strong> — when you sign in via magic link or join the waitlist.</li>
            <li><strong style={{ color: 'rgba(245,237,216,0.8)' }}>Vote data</strong> — which option you selected on each poll (linked to your account).</li>
            <li><strong style={{ color: 'rgba(245,237,216,0.8)' }}>Display name</strong> — if you choose to set one on your profile page.</li>
            <li><strong style={{ color: 'rgba(245,237,216,0.8)' }}>Usage data</strong> — standard server logs (IP address, browser, timestamps) via our hosting provider Vercel.</li>
          </ul>
          <p>We do not collect payment information, national ID, or any sensitive personal data.</p>

          <h2>3. How We Use Your Data</h2>
          <ul>
            <li>To authenticate your account and deliver magic-link sign-in emails.</li>
            <li>To display aggregate poll results and leaderboard rankings.</li>
            <li>To notify waitlist members when we launch new features.</li>
            <li>To analyse aggregate (anonymous) trends in public opinion.</li>
          </ul>
          <p>We do <strong style={{ color: '#F5EDD8' }}>not</strong> sell your data to third parties. We do not run targeted advertising.</p>

          <h2>4. Data Storage</h2>
          <p>
            All data is stored on <a href="https://supabase.com" target="_blank" rel="noopener">Supabase</a> (hosted on AWS ap-southeast-1, Singapore). Your email is used solely for authentication. We use Supabase's built-in row-level security to ensure users can only access their own data.
          </p>

          <h2>5. Cookies</h2>
          <p>
            We use a single session cookie for authentication only. We do not use tracking cookies, analytics cookies, or advertising cookies. You can delete this cookie at any time by signing out.
          </p>

          <h2>6. Public Information</h2>
          <p>
            Your vote choices are stored with your user ID but are only shown in aggregate (e.g. "71% voted Yes"). Your display name and leaderboard score are public if you choose to set a username. You can change or remove your display name at any time from your <a href="/profile">profile page</a>.
          </p>

          <h2>7. Your Rights</h2>
          <ul>
            <li><strong style={{ color: 'rgba(245,237,216,0.8)' }}>Access</strong> — request a copy of the data we hold about you.</li>
            <li><strong style={{ color: 'rgba(245,237,216,0.8)' }}>Deletion</strong> — request that your account and all associated data be deleted.</li>
            <li><strong style={{ color: 'rgba(245,237,216,0.8)' }}>Correction</strong> — update your display name or email at any time.</li>
          </ul>
          <p>To exercise any of these rights, email us at <a href="mailto:hello@nepomarket.com">hello@nepomarket.com</a>.</p>

          <h2>8. Non-Monetary Commitment</h2>
          <p>
            Nepomarket operates exclusively as a civic-entertainment and opinion-research platform. No votes have monetary value. No prizes, tokens, or financial rewards are offered. This is crowd wisdom — nothing more, nothing less.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this policy as the platform grows. Significant changes will be communicated via email to registered users. Continued use of the platform after changes constitutes acceptance.
          </p>

          <h2>10. Contact</h2>
          <p>
            Questions? Email <a href="mailto:hello@nepomarket.com">hello@nepomarket.com</a>. We're a small team and will respond within a few days.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: '24px 20px 32px', borderTop: '1px solid rgba(245,237,216,0.06)' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: 'rgba(245,237,216,0.15)', letterSpacing: '0.08em' }}>
          © 2026 Nepomarket.com · Non-monetary civic polling · Nepal
        </span>
      </div>
    </main>
  )
}
