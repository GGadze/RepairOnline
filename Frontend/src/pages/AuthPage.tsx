import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../components/AuthPage.module.css';

const topNav = [
  { id: 'main', label: 'Главная' },
  { id: 'about', label: 'О себе' },
  { id: 'services', label: 'Услуги' },
  { id: 'contacts', label: 'Контакты' },
  { id: 'reviews', label: 'Отзывы' },
];

const users = [
  { 
    id: 1, 
    login: 'Юзер1', 
    password: '123',
    name: 'Иванов Иван Иванович',
    registerDate: '15 марта 2024',
    email: 'ivanov@example.com',
    phone: '+7 (999) 123-45-67',
    avatar: '👨‍💼'
  },
  { 
    id: 2, 
    login: 'Юзер2', 
    password: '1234',
    name: 'Петров Петр Петрович',
    registerDate: '20 марта 2024',
    email: 'petrov@example.com',
    phone: '+7 (999) 765-43-21',
    avatar: '👨‍🔧'
  },
];

const isAuthenticated = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

const getProfileEmoji = () => {
  const userAvatar = localStorage.getItem('userAvatar') || sessionStorage.getItem('userAvatar');
  return userAvatar || '👤';
};

const logout = () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/';
};

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);
  
  const [isLogin, setIsLogin] = useState(true);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const profileEmoji = getProfileEmoji();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY) {
        setShowHeader(true);
      } 
      else if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setShowHeader(false);
      }
      
      if (currentScrollY < 10) {
        setShowHeader(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToElement = (element: HTMLElement | null) => {
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - headerHeight - 20;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  const handleNavClick = (itemId: string) => {
    setShowHeader(true);
    
    switch(itemId) {
      case 'main':
        if (window.location.pathname !== '/') {
          navigate('/');
          setTimeout(() => scrollToElement(mainRef.current), 100);
        } else {
          scrollToElement(mainRef.current);
        }
        break;
      case 'about':
        if (window.location.pathname !== '/') {
          navigate('/');
          setTimeout(() => scrollToElement(aboutRef.current), 100);
        } else {
          scrollToElement(aboutRef.current);
        }
        break;
      case 'services':
        if (window.location.pathname !== '/') {
          navigate('/');
          setTimeout(() => scrollToElement(servicesRef.current), 100);
        } else {
          scrollToElement(servicesRef.current);
        }
        break;
      case 'contacts':
        if (window.location.pathname !== '/') {
          navigate('/');
          setTimeout(() => scrollToElement(contactsRef.current), 100);
        } else {
          scrollToElement(contactsRef.current);
        }
        break;
      case 'reviews':
        navigate('/reviews');
        break;
      default:
        break;
    }
  };



  const handleOrderClick = () => {
    window.scrollTo(0, 0);
    if (isAuthenticated()) {
      navigate('/create-order');
    } else {
      navigate('/auth', { state: { from: { pathname: '/create-order' } } });
    }
  };

  const handleProfileClick = () => {
    if (isAuthenticated()) {
      window.scrollTo(0, 0);
      navigate('/cabinet');
    } else {
      navigate('/auth', { state: { from: { pathname: '/cabinet' } } });
    }
  };

  const handleLogoutClick = () => {
    logout();
  };

  const handleLogin = () => {
    setError('');
    
    if (!login || !password) {
      setError('Заполните все поля');
      return;
    }

    const user = users.find(u => u.login === login && u.password === password);
    
    if (user) {
      if (rememberMe) {
        localStorage.setItem('authToken', 'true');
        localStorage.setItem('userId', user.id.toString());
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userPhone', user.phone);
        localStorage.setItem('userAvatar', user.avatar);
        localStorage.setItem('userRegisterDate', user.registerDate);
      } else {
        sessionStorage.setItem('authToken', 'true');
        sessionStorage.setItem('userId', user.id.toString());
        sessionStorage.setItem('userName', user.name);
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userPhone', user.phone);
        sessionStorage.setItem('userAvatar', user.avatar);
        sessionStorage.setItem('userRegisterDate', user.registerDate);
      }
      
      setSuccess('Успешный вход! Перенаправление...');
      setTimeout(() => {
        window.scrollTo(0, 0);
        navigate(from, { replace: true });
      }, 1500);
    } else {
      setError('Неверный логин или пароль');
    }
  };

  const handleRegister = () => {
    setError('');
    
    if (!login || !password || !confirmPassword) {
      setError('Заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 3) {
      setError('Пароль должен быть не менее 3 символов');
      return;
    }

    const existingUser = users.find(u => u.login === login);
    
    if (existingUser) {
      setError('Пользователь с таким логином уже существует');
      return;
    }

    const newUser = {
      id: users.length + 1,
      login,
      password,
      name: 'Новый пользователь',
      registerDate: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
      email: 'new@example.com',
      phone: '+7 (999) 000-00-00',
      avatar: '👤'
    };

    users.push(newUser);
    
    if (rememberMe) {
      localStorage.setItem('authToken', 'true');
      localStorage.setItem('userId', newUser.id.toString());
      localStorage.setItem('userName', newUser.name);
      localStorage.setItem('userEmail', newUser.email);
      localStorage.setItem('userPhone', newUser.phone);
      localStorage.setItem('userAvatar', newUser.avatar);
      localStorage.setItem('userRegisterDate', newUser.registerDate);
    } else {
      sessionStorage.setItem('authToken', 'true');
      sessionStorage.setItem('userId', newUser.id.toString());
      sessionStorage.setItem('userName', newUser.name);
      sessionStorage.setItem('userEmail', newUser.email);
      sessionStorage.setItem('userPhone', newUser.phone);
      sessionStorage.setItem('userAvatar', newUser.avatar);
      sessionStorage.setItem('userRegisterDate', newUser.registerDate);
    }
    
    setSuccess('Регистрация успешна! Перенаправление...');
    setTimeout(() => {
      window.scrollTo(0, 0);
      navigate(from, { replace: true });
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setLogin('');
    setPassword('');
    setConfirmPassword('');
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
              <button 
                key={item.id} 
                className={styles.topBtn}
                onClick={() => handleNavClick(item.id)}
              >
                {item.label}
              </button>
            ))}
            <button className={styles.orderHeaderBtn} onClick={handleOrderClick}>
              Оформить заказ
            </button>
            
            <div className={styles.profileSection}>
              {isAuthenticated() && (
                <button className={styles.logoutTextBtn} onClick={handleLogoutClick}>
                  Выйти
                </button>
              )}
              <div className={styles.profile} onClick={handleProfileClick}>
                <span className={isAuthenticated() ? styles.profileEmojiAuth : ''}>
                  {profileEmoji}
                </span>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Невидимые рефы для навигации с главной */}
      <div ref={mainRef} style={{ display: 'none' }} />
      <div ref={aboutRef} style={{ display: 'none' }} />
      <div ref={servicesRef} style={{ display: 'none' }} />
      <div ref={contactsRef} style={{ display: 'none' }} />

      <div className={styles.container}>
        <div className={styles.authCard}>
          <h1 className={styles.title}>{isLogin ? 'АВТОРИЗАЦИЯ' : 'РЕГИСТРАЦИЯ'}</h1>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Логин</label>
              <input
                type="text"
                className={`${styles.input} ${error && !login ? styles.error : ''}`}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Введите логин"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Пароль</label>
              <input
                type="password"
                className={`${styles.input} ${error && !password ? styles.error : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
              />
            </div>

            {!isLogin && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Подтвердите пароль</label>
                <input
                  type="password"
                  className={`${styles.input} ${error && !confirmPassword ? styles.error : ''}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                />
              </div>
            )}

            {isLogin && (
              <div className={styles.row}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Запомнить меня</span>
                </label>
                <span className={styles.forgotLink}>Забыли пароль?</span>
              </div>
            )}

            <button type="submit" className={styles.button}>
              {isLogin ? 'ВОЙТИ' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
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