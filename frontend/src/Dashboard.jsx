import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiRequest } from './lib/api'
import { clearSession, getDisplayName } from './lib/auth'
import { useTheme } from './lib/theme'

const Dashboard = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { theme, toggleTheme } = useTheme()

    const [balance, setBalance] = useState(0)
    const [users, setUsers] = useState([])
    const [filter, setFilter] = useState('')
    const [loadingBalance, setLoadingBalance] = useState(true)
    const [loadingUsers, setLoadingUsers] = useState(true)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const username = useMemo(() => getDisplayName() || 'User', [])

    const handleUnauthorized = useCallback(() => {
        clearSession()
        navigate('/signin', { replace: true })
    }, [navigate])

    const loadBalance = useCallback(async () => {
        try {
            setLoadingBalance(true)
            const data = await apiRequest('/account/balance', { withAuth: true })
            setBalance(Number(data?.balance || 0))
        } catch (requestError) {
            if (requestError.status === 401) {
                handleUnauthorized()
                return
            }

            setError(requestError.message || 'Failed to load balance')
        } finally {
            setLoadingBalance(false)
        }
    }, [handleUnauthorized])

    const loadUsers = useCallback(async (searchText) => {
        try {
            setLoadingUsers(true)
            const query = encodeURIComponent(searchText.trim())
            const data = await apiRequest(`/user/bulk?filter=${query}`, { withAuth: true })
            setUsers(Array.isArray(data?.user) ? data.user : [])
        } catch (requestError) {
            if (requestError.status === 401) {
                handleUnauthorized()
                return
            }

            setError(requestError.message || 'Failed to load users')
            setUsers([])
        } finally {
            setLoadingUsers(false)
        }
    }, [handleUnauthorized])

    useEffect(() => {
        loadBalance()
    }, [loadBalance])

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            loadUsers(filter)
        }, 300)

        return () => {
            window.clearTimeout(timerId)
        }
    }, [filter, loadUsers])

    useEffect(() => {
        const stateMessage = location.state?.successMessage
        if (!stateMessage) {
            return
        }

        setSuccessMessage(stateMessage)
        navigate(location.pathname, { replace: true, state: null })
    }, [location.pathname, location.state, navigate])

    const handleLogout = () => {
        clearSession()
        navigate('/signin', { replace: true })
    }

    const getUserFullName = (user) => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
        return fullName || user.username || 'User'
    }

    const handleOpenSendMoney = (user) => {
        const recipientName = getUserFullName(user)
        const encodedName = encodeURIComponent(recipientName)
        navigate(`/send?to=${user._id}&name=${encodedName}`)
    }

    const cardStyle = {
        background: 'var(--card-bg)',
        borderRadius: 16,
        padding: 20,
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border)',
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--page-gradient)', color: 'var(--text)' }}>
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    background: 'var(--nav-bg)',
                    borderBottom: '1px solid var(--border)',
                    boxShadow: '0 2px 12px rgba(15, 23, 42, 0.12)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <div
                    style={{
                        maxWidth: 1100,
                        margin: '0 auto',
                        padding: '16px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ fontSize: 22, fontWeight: 700 }}>PayTM</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <button
                            type='button'
                            onClick={toggleTheme}
                            style={{
                                border: '1px solid var(--border)',
                                borderRadius: 999,
                                padding: '8px 14px',
                                background: 'transparent',
                                color: 'var(--text)',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                        </button>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{username}</span>
                        <button
                            type='button'
                            onClick={handleLogout}
                            style={{
                                border: 0,
                                borderRadius: 8,
                                padding: '10px 14px',
                                background: 'var(--danger)',
                                color: '#fff',
                                cursor: 'pointer',
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
                <div style={{ ...cardStyle, marginBottom: 24 }}>
                    <h1 style={{ margin: 0, fontSize: 28 }}>Dashboard</h1>
                    <p style={{ margin: '8px 0 0', color: 'var(--muted)' }}>Available balance</p>
                    <div style={{ fontSize: 40, fontWeight: 700, marginTop: 8 }}>
                        {loadingBalance ? 'Loading...' : `Rs. ${Number(balance).toLocaleString()}`}
                    </div>
                </div>

                {successMessage ? (
                    <div
                        style={{
                            ...cardStyle,
                            marginBottom: 24,
                            border: '1px solid rgba(34, 197, 94, 0.35)',
                            color: 'var(--success)',
                            background: 'rgba(34, 197, 94, 0.1)',
                        }}
                    >
                        {successMessage}
                    </div>
                ) : null}

                {error ? (
                    <div
                        style={{
                            ...cardStyle,
                            marginBottom: 24,
                            border: '1px solid rgba(248, 113, 113, 0.35)',
                            color: 'var(--danger)',
                            background: 'rgba(248, 113, 113, 0.12)',
                        }}
                    >
                        {error}
                    </div>
                ) : null}

                <div style={cardStyle}>
                    <div
                        style={{
                            display: 'flex',
                            gap: 12,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            marginBottom: 16,
                        }}
                    >
                        <h2 style={{ margin: 0 }}>Users</h2>
                        <input
                            type='text'
                            placeholder='Search by first or last name'
                            value={filter}
                            onChange={(event) => setFilter(event.target.value)}
                            style={{
                                width: '100%',
                                maxWidth: 280,
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: '1px solid var(--border)',
                                background: 'var(--surface-solid)',
                                color: 'var(--text)',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {loadingUsers ? (
                        <p>Loading users...</p>
                    ) : users.length === 0 ? (
                        <p>No users found.</p>
                    ) : (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                gap: 16,
                            }}
                        >
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    style={{
                                        border: '1px solid var(--border)',
                                        borderRadius: 14,
                                        padding: 16,
                                        background: 'var(--surface)',
                                    }}
                                >
                                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                                        {getUserFullName(user)}
                                    </div>
                                    <div style={{ color: 'var(--muted)', marginTop: 4 }}>
                                        @{user.username}
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() => handleOpenSendMoney(user)}
                                        style={{
                                            marginTop: 14,
                                            width: '100%',
                                            border: 0,
                                            borderRadius: 8,
                                            padding: '10px 12px',
                                            background: 'var(--accent)',
                                            color: '#0b1120',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Send money
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard