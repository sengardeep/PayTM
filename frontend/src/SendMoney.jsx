import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiRequest } from './lib/api'
import { clearSession } from './lib/auth'

const SendMoney = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const recipientId = searchParams.get('to') || ''
  const recipientName = useMemo(
    () => searchParams.get('name') || 'user',
    [searchParams]
  )

  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!recipientId) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, recipientId])

  const handleSubmit = async (event) => {
    event.preventDefault()

    const transferAmount = Number(amount)
    if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      setLoading(true)
      setError('')

      await apiRequest('/account/transfer', {
        method: 'POST',
        withAuth: true,
        body: {
          to: recipientId,
          amount: transferAmount,
        },
      })

      navigate('/dashboard', {
        replace: true,
        state: {
          successMessage: `Rs. ${transferAmount.toLocaleString()} sent to ${recipientName}`,
        },
      })
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession()
        navigate('/signin', { replace: true })
        return
      }

      setError(requestError.message || 'Transfer failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--page-gradient)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        color: 'var(--text)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--card-bg)',
          borderRadius: 18,
          padding: 24,
          boxShadow: 'var(--shadow)',
          border: '1px solid var(--border)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28 }}>Send Money</h1>
        <p style={{ marginTop: 8, color: 'var(--muted)' }}>
          You are sending money to <strong>{recipientName}</strong>
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
          <label htmlFor='amount' style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
            Amount (INR)
          </label>
          <input
            id='amount'
            type='number'
            min='1'
            step='1'
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder='Enter amount'
            style={{
              width: '100%',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 16,
              boxSizing: 'border-box',
              background: 'var(--surface-solid)',
              color: 'var(--text)',
            }}
          />

          {error ? (
            <p style={{ marginTop: 10, color: 'var(--danger)', fontSize: 14 }}>
              {error}
            </p>
          ) : null}

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <Link
              to='/dashboard'
              style={{
                flex: 1,
                textAlign: 'center',
                textDecoration: 'none',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '11px 12px',
                fontWeight: 600,
              }}
            >
              Cancel
            </Link>
            <button
              type='submit'
              disabled={loading}
              style={{
                flex: 1,
                border: 'none',
                borderRadius: 10,
                padding: '12px 12px',
                background: loading ? 'rgba(14, 165, 233, 0.6)' : 'var(--accent)',
                color: '#0b1120',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Sending...' : 'Send Money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SendMoney