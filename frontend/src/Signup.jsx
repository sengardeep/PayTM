import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from './lib/api'
import { saveSession } from './lib/auth'

const Signup = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
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

        const firstName = form.firstName.trim()
        const lastName = form.lastName.trim()
        const username = form.username.trim().toLowerCase()
        const password = form.password

        if (!firstName || !lastName || !username || !password) {
            setError('All fields are required')
            return
        }

        try {
            setLoading(true)
            setError('')

            const response = await apiRequest('/user/signup', {
                method: 'POST',
                body: {
                    firstName,
                    lastName,
                    username,
                    password,
                },
            })

            if (!response?.token) {
                throw new Error('Signup failed: missing auth token')
            }

            saveSession({
                token: response?.token,
                displayName: firstName,
            })
            navigate('/dashboard', { replace: true })
        } catch (requestError) {
            setError(requestError.message || 'Unable to sign up')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>Sign Up</h1>
                <p style={styles.subtitle}>Enter your information to create an account</p>

                <form style={styles.form} onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label} htmlFor='firstName'>
                            First Name
                        </label>
                        <input
                            id='firstName'
                            name='firstName'
                            style={styles.input}
                            type='text'
                            placeholder='John'
                            value={form.firstName}
                            onChange={handleChange}
                            autoComplete='given-name'
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label} htmlFor='lastName'>
                            Last Name
                        </label>
                        <input
                            id='lastName'
                            name='lastName'
                            style={styles.input}
                            type='text'
                            placeholder='Doe'
                            value={form.lastName}
                            onChange={handleChange}
                            autoComplete='family-name'
                        />
                    </div>

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
                            placeholder='At least 6 characters'
                            value={form.password}
                            onChange={handleChange}
                            autoComplete='new-password'
                        />
                    </div>

                    {error ? <p style={styles.error}>{error}</p> : null}

                    <button style={styles.button} type='submit' disabled={loading}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Already have an account? <Link style={styles.link} to='/signin'>Login</Link>
                </p>
            </div>
        </div>
    )
}

export default Signup