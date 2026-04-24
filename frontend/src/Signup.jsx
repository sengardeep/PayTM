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
            background: 'linear-gradient(135deg, #eef2ff 0%, #e0f2fe 100%)',
            fontFamily: 'Arial, sans-serif',
            padding: '24px',
        },
        card: {
            width: '100%',
            maxWidth: '420px',
            background: '#fff',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.1)',
        },
        title: {
            margin: 0,
            fontSize: '32px',
            fontWeight: '700',
            color: '#111827',
        },
        subtitle: {
            marginTop: '8px',
            marginBottom: '24px',
            color: '#6b7280',
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
            color: '#374151',
        },
        input: {
            width: '100%',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid #d1d5db',
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
            background: loading ? '#93c5fd' : '#2563eb',
            color: '#fff',
            fontSize: '15px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
        },
        error: {
            margin: 0,
            color: '#b91c1c',
            fontSize: '14px',
        },
        footer: {
            marginTop: '18px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280',
        },
        link: {
            color: '#2563eb',
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