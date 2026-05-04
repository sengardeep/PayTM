import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from './lib/api'
import { saveSession } from './lib/auth'

const Signin = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        username: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const styles = {
        page: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--page-gradient)',
            padding: '24px',
        },
        card: {
            width: '100%',
            maxWidth: '420px',
            background: 'var(--card-bg)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: 'var(--shadow)',
            border: '1px solid var(--border)',
        },
        title: {
            margin: 0,
            fontSize: '32px',
            fontWeight: '700',
            color: 'var(--text)',
        },
        subtitle: {
            marginTop: '8px',
            marginBottom: '24px',
            color: 'var(--muted)',
            fontSize: '14px',
            lineHeight: '1.5',
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
        },
        field: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
        },
        label: {
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text)',
        },
        input: {
            width: '100%',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--surface-solid)',
            color: 'var(--text)',
            outline: 'none',
            fontSize: '14px',
            boxSizing: 'border-box',
        },
        button: {
            marginTop: '8px',
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: '10px',
            background: loading ? 'rgba(14, 165, 233, 0.6)' : 'var(--accent)',
            color: '#0b1120',
            fontSize: '15px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
        },
        error: {
            margin: 0,
            color: 'var(--danger)',
            fontSize: '14px',
        },
        footer: {
            marginTop: '18px',
            textAlign: 'center',
            fontSize: '14px',
            color: 'var(--muted)',
        },
        link: {
            color: 'var(--accent)',
            textDecoration: 'none',
            fontWeight: '600',
        },
    }

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (!form.username.trim() || !form.password) {
            setError('Username and password are required')
            return
        }

        try {
            setLoading(true)
            setError('')

            const response = await apiRequest('/user/signin', {
                method: 'POST',
                body: {
                    username: form.username.trim().toLowerCase(),
                    password: form.password,
                },
            })

            if (!response?.token) {
                throw new Error('Signin failed: missing auth token')
            }

            saveSession({
                token: response?.token,
                displayName: form.username.trim(),
            })
            navigate('/dashboard', { replace: true })
        } catch (requestError) {
            setError(requestError.message || 'Unable to sign in')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>Sign In</h1>
                <p style={styles.subtitle}>Enter your credentials to access your account</p>

                <form style={styles.form} onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label} htmlFor='username'>
                            Username
                        </label>
                        <input
                            id='username'
                            name='username'
                            style={styles.input}
                            type='text'
                            placeholder='johndoe'
                            value={form.username}
                            onChange={handleChange}
                            autoComplete='username'
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label} htmlFor='password'>
                            Password
                        </label>
                        <input
                            id='password'
                            name='password'
                            style={styles.input}
                            type='password'
                            placeholder='Enter your password'
                            value={form.password}
                            onChange={handleChange}
                            autoComplete='current-password'
                        />
                    </div>

                    {error ? <p style={styles.error}>{error}</p> : null}

                    <button style={styles.button} type='submit' disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Do not have an account? <Link style={styles.link} to='/signup'>Sign up</Link>
                </p>
            </div>
        </div>
    )
}

export default Signin
