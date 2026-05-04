import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Signin from './Signin'
import Signup from './Signup'
import Dashboard from './Dashboard'
import SendMoney from './SendMoney'
import { isAuthenticated } from './lib/auth'
import Landing from './Landing'
import { ThemeProvider } from './lib/theme'

const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to='/signin' replace />
  }

  return <Outlet />
}

const GuestRoute = () => {
  if (isAuthenticated()) {
    return <Navigate to='/dashboard' replace />
  }

  return <Outlet />
}

const HomeRedirect = () => {
  if (isAuthenticated()) {
    return <Navigate to='/dashboard' replace />
  }

  return <Landing />
}

function App() {

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomeRedirect />} />

          <Route element={<GuestRoute />}>
            <Route path='/signup' element={<Signup />} />
            <Route path='/signin' element={<Signin />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/send' element={<SendMoney />} />
          </Route>

          <Route path='*' element={<HomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
