import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../components/AuthPage.module.css';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

const topNav = [
  { id: 'main', label: 'Главная' },
  { id: 'about', label: 'О себе' },
  { id: 'services', label: 'Услуги' },
  { id: 'contacts', label: 'Контакты' },
  { id: 'reviews', label: 'Отзывы' },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const { login, isAuthenticated, logout } = useAuthStore();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 10) setShowHeader(true);
      else if (currentScrollY > 100 && currentScrollY > lastScrollY) setShowHeader(false);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (itemId: string) => {
    setShowHeader(true);
    switch (itemId) {
      case 'main': navigate('/'); break;
      case 'about': navigate('/', { state: { scrollTo: 'about' } }); break;
      case 'services': navigate('/', { state: { scrollTo: 'services' } }); break;
      case 'contacts': navigate('/', { state: { scrollTo: 'contacts' } }); break;
      case 'reviews': navigate('/reviews'); break;
    }
  };

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Заполните все поля'); return; }
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const base64 = data.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(decodeURIComponent(escape(atob(base64))));
      login(data.user, data.token, payload.role as 'client' | 'admin');
      setSuccess('Успешный вход! Перенаправление...');
      setTimeout(() => { window.scrollTo(0, 0); navigate(from, { replace: true }); }, 1000);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!email || !password || !confirmPassword || !firstName || !phone) {
      setError('Заполните все обязательные поля'); return;
    }
    if (password !== confirmPassword) { setError('Пароли не совпадают'); return; }
    if (password.length < 6) { setError('Пароль должен быть не менее 6 символов'); return; }
    setLoading(true);
    try {
      const data = await authApi.register({ email, password, first_name: firstName, last_name: lastName, phone });
      const base64 = data.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(decodeURIComponent(escape(atob(base64))));
      login(data.user, data.token, payload.role as 'client' | 'admin');
      setSuccess('Регистрация успешна! Перенаправление...');
      setTimeout(() => { window.scrollTo(0, 0); navigate(from, { replace: true }); }, 1000);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) handleLogin(); else handleRegister();
  };

  const switchMode = () => {
    setIsLogin(!isLogin); setError(''); setSuccess('');
    setEmail(''); setPassword(''); setConfirmPassword('');
    setFirstName(''); setLastName(''); setPhone('');
  };

  return (
    <div className={styles.page}>
      <header
        ref={headerRef}
        className={`${styles.header} ${showHeader ? styles.visible : ''}`}
        onMouseEnter={() => setShowHeader(true)}
      >
        <div className={styles.headerContent}>
          <nav className={styles.topNav}>
            {topNav.map(item => (
              <button key={item.id} className={styles.topBtn} onClick={() => handleNavClick(item.id)}>
                {item.label}
              </button>
            ))}
            <button className={styles.orderHeaderBtn} onClick={() => navigate('/create-order')}>
              Оформить заказ
            </button>
            <div className={styles.profileSection}>
              {isAuthenticated && (
                <button className={styles.logoutTextBtn} onClick={() => { logout(); navigate('/'); }}>
                  Выйти
                </button>
              )}
              <div className={styles.profile} onClick={() => isAuthenticated ? navigate('/cabinet') : null}>
                <span className={isAuthenticated ? styles.profileEmojiAuth : ''}>👤</span>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.authCard}>
          <h1 className={styles.title}>{isLogin ? 'АВТОРИЗАЦИЯ' : 'РЕГИСТРАЦИЯ'}</h1>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email *</label>
              <input type="email" className={styles.input} value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="Введите email" />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Пароль *</label>
              <input type="password" className={styles.input} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Введите пароль" />
            </div>

            {!isLogin && (
              <>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Подтвердите пароль *</label>
                  <input type="password" className={styles.input} value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Повторите пароль" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Имя *</label>
                  <input type="text" className={styles.input} value={firstName}
                    onChange={(e) => setFirstName(e.target.value)} placeholder="Введите имя" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Фамилия</label>
                  <input type="text" className={styles.input} value={lastName}
                    onChange={(e) => setLastName(e.target.value)} placeholder="Введите фамилию" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Телефон *</label>
                  <input type="tel" className={styles.input} value={phone}
                    onChange={(e) => setPhone(e.target.value)} placeholder="+79001234567" />
                </div>
              </>
            )}

            {isLogin && (
              <div className={styles.row}>
                <label className={styles.checkbox}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span>Запомнить меня</span>
                </label>
                <span className={styles.forgotLink}>Забыли пароль?</span>
              </div>
            )}

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Загрузка...' : isLogin ? 'ВОЙТИ' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
            </button>

            <div className={styles.divider} />

            <div className={styles.switchText}>
              {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
              <span className={styles.switchLink} onClick={switchMode}>
                {isLogin ? 'Регистрация' : 'Авторизация'}
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
