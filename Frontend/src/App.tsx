import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./store/authStore"
import HomePage from "./pages/HomePage"
import CabinetPage from "./pages/CabinetPage"
import CreateOrderPage from "./pages/CreateOrderPage"
import AuthPage from "./pages/AuthPage"
import ReviewsPage from "./pages/ReviewsPage"
import AdminPage from "./pages/AdminPage"
import ClientChat from "./components/ClientChat"
import React from 'react'

// Error Boundary компонент
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#1a2235', color: 'white', minHeight: '100vh' }}>
          <h1 style={{ color: '#ef4444' }}>Ошибка!</h1>
          <pre style={{ fontSize: '12px', marginTop: '20px' }}>{this.state.error?.toString()}</pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
          >
            Перезагрузить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// Компонент защиты маршрута для администратора
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  console.log('AdminRoute check:', { isAuthenticated, role: user?.role })
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

// Компонент защиты маршрута для авторизованных
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function App() {
  console.log('App rendering')
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />

        <Route path="/cabinet" element={
          <PrivateRoute><CabinetPage /></PrivateRoute>
        } />
        <Route path="/create-order" element={
          <PrivateRoute><CreateOrderPage /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><AdminPage /></AdminRoute>
        } />
      </Routes>

    <ClientChat />
    </ErrorBoundary>
  )
}

export default App