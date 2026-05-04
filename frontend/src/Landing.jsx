import { Link } from 'react-router-dom'
import { useTheme } from './lib/theme'

const Landing = () => {
  const { theme, toggleTheme } = useTheme()
  const styles = {
    page: {
      minHeight: '100vh',
      background: 'var(--page-gradient)',
      color: 'var(--text)',
    },
    nav: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
    },
    navInner: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '18px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    brand: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: '0.4px',
    },
    brandIcon: {
      width: 34,
      height: 34,
    },
    navLinks: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
    },
    navButton: {
      textDecoration: 'none',
      borderRadius: 999,
      padding: '10px 18px',
      fontWeight: 600,
      fontSize: 14,
      border: '1px solid transparent',
    },
    hero: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '140px 24px 80px',
      display: 'grid',
      gap: 32,
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      alignItems: 'center',
    },
    heroCard: {
      background: 'var(--card-bg)',
      borderRadius: 24,
      padding: 32,
      boxShadow: 'var(--shadow)',
      border: '1px solid var(--border)',
    },
    title: {
      margin: 0,
      fontSize: 44,
      lineHeight: 1.05,
      letterSpacing: '-0.02em',
    },
    subtitle: {
      marginTop: 18,
      marginBottom: 28,
      fontSize: 16,
      lineHeight: 1.6,
      color: 'var(--muted)',
    },
    heroActions: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
    },
    primaryCta: {
      textDecoration: 'none',
      borderRadius: 999,
      padding: '12px 22px',
      fontWeight: 700,
      background: 'var(--primary)',
      color: 'var(--primary-contrast)',
    },
    secondaryCta: {
      textDecoration: 'none',
      borderRadius: 999,
      padding: '12px 22px',
      fontWeight: 700,
      border: '1px solid var(--primary)',
      color: 'var(--primary)',
    },
    features: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '0 24px 90px',
      display: 'grid',
      gap: 20,
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    },
    featureCard: {
      background: 'var(--surface)',
      borderRadius: 18,
      padding: 22,
      border: '1px solid var(--border)',
      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
    },
    featureTitle: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
    },
    featureBody: {
      marginTop: 10,
      color: 'var(--muted)',
      fontSize: 14,
      lineHeight: 1.6,
    },
    highlight: {
      display: 'inline-block',
      padding: '6px 12px',
      background: 'var(--primary)',
      color: 'var(--primary-contrast)',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.08em',
    },
    toggleButton: {
      borderRadius: 999,
      padding: '8px 14px',
      border: '1px solid var(--border)',
      background: 'transparent',
      color: 'var(--text)',
      fontWeight: 600,
      cursor: 'pointer',
    },
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.brand}>
            <img src='/vite.svg' alt='PayTM icon' style={styles.brandIcon} />
            <span>PayTM</span>
          </div>
          <div style={styles.navLinks}>
            <button type='button' onClick={toggleTheme} style={styles.toggleButton}>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <Link
              to='/signin'
              style={{
                ...styles.navButton,
                color: 'var(--text)',
                borderColor: 'var(--border)',
              }}
            >
              Sign in
            </Link>
            <Link
              to='/signup'
              style={{
                ...styles.navButton,
                background: 'var(--primary)',
                color: 'var(--primary-contrast)',
              }}
            >
              Create account
            </Link>
          </div>
        </div>
      </nav>

      <section style={styles.hero}>
        <div>
          <span style={styles.highlight}>PAYTM WALLET</span>
          <h1 style={styles.title}>Move money instantly, stay in control everywhere.</h1>
          <p style={styles.subtitle}>
            PayTM lets you check balances, find people, and send payments in seconds. A clean dashboard,
            quick transfer flow, and secure authentication keep your wallet organized.
          </p>
          <div style={styles.heroActions}>
            <Link to='/signup' style={styles.primaryCta}>Get started</Link>
            <Link to='/signin' style={styles.secondaryCta}>I have an account</Link>
          </div>
        </div>

        <div style={styles.heroCard}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Everything you need in one place</h2>
          <p style={styles.subtitle}>
            Track your balance in real time, discover users quickly, and send money with confidence.
            Built for speed, security, and clarity.
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ fontWeight: 600 }}>Instant balance updates</div>
            <div style={{ fontWeight: 600 }}>Search and pay users fast</div>
            <div style={{ fontWeight: 600 }}>Secure JWT-based sessions</div>
          </div>
        </div>
      </section>

      <section style={styles.features}>
        <div style={styles.featureCard}>
          <h3 style={styles.featureTitle}>Real-time wallet view</h3>
          <p style={styles.featureBody}>
            See your available balance immediately on the dashboard with clean, readable stats.
          </p>
        </div>
        <div style={styles.featureCard}>
          <h3 style={styles.featureTitle}>Find and pay in seconds</h3>
          <p style={styles.featureBody}>
            Search by name, pick a recipient, and complete transfers with a simple guided flow.
          </p>
        </div>
        <div style={styles.featureCard}>
          <h3 style={styles.featureTitle}>Secure by default</h3>
          <p style={styles.featureBody}>
            JWT-based authentication keeps sessions safe while still feeling lightweight.
          </p>
        </div>
        <div style={styles.featureCard}>
          <h3 style={styles.featureTitle}>Purpose-built UI</h3>
          <p style={styles.featureBody}>
            Clear navigation, bold typography, and focused actions help you move with confidence.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Landing
