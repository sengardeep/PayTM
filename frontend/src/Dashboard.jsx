import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiRequest } from './lib/api'
import { clearSession, getDisplayName } from './lib/auth'

const Dashboard = () => {
    const navigate = useNavigate()
    const location = useLocation()

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
        background: '#ffffff',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    background: '#fff',
                    borderBottom: '1px solid #e5e7eb',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 600, color: '#111827' }}>{username}</span>
                        <button
                            type='button'
                            onClick={handleLogout}
                            style={{
                                border: 0,
                                borderRadius: 8,
                                padding: '10px 14px',
                                background: '#dc3545',
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
                    <p style={{ margin: '8px 0 0', color: '#666' }}>Available balance</p>
                    <div style={{ fontSize: 40, fontWeight: 700, marginTop: 8 }}>
                        {loadingBalance ? 'Loading...' : `Rs. ${Number(balance).toLocaleString()}`}
                    </div>
                </div>

                {successMessage ? (
                    <div
                        style={{
                            ...cardStyle,
                            marginBottom: 24,
                            border: '1px solid #bbf7d0',
                            color: '#166534',
                            background: '#f0fdf4',
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
                            border: '1px solid #f5c2c7',
                            color: '#b02a37',
                            background: '#fff5f5',
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
                                border: '1px solid #d1d5db',
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
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 12,
                                        padding: 16,
                                        background: '#fff',
                                    }}
                                >
                                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                                        {getUserFullName(user)}
                                    </div>
                                    <div style={{ color: '#666', marginTop: 4 }}>
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
                                            background: '#0d6efd',
                                            color: '#fff',
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