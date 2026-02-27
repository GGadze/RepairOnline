import { Outlet, Link } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div>
      <header style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px' }}>
        <nav style={{ display: 'flex', gap: '20px' }}>
          <Link to="/">Главная</Link>
          <Link to="/login">Вход</Link>
          <Link to="/register">Регистрация</Link>
          <Link to="/cabinet">Личный кабинет</Link>
          <Link to="/admin">Админка</Link>
        </nav>
      </header>
      
      <main style={{ padding: '20px' }}>
        {/* Здесь будут отображаться страницы */}
        <Outlet />
      </main>

      <footer style={{ padding: '20px', background: '#f0f0f0', marginTop: '20px', textAlign: 'center' }}>
        © 2026 Ремонт-Онлайн
      </footer>
    </div>
  )
}