import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import styles from '../components/AuthPage.module.css';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function AuthPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, isAuthenticated } = useAuthStore();

  const [isLogin,          setIsLogin]          = useState(true);
  const [email,            setEmail]            = useState('');
  const [password,         setPassword]         = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [firstName,        setFirstName]        = useState('');
  const [lastName,         setLastName]         = useState('');
  const [phone,            setPhone]            = useState('');
  const [error,            setError]            = useState('');
  const [success,          setSuccess]          = useState('');
  const [loading,          setLoading]          = useState(false);
  const [showPass,         setShowPass]         = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Заполните все поля'); return; }
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const b64  = data.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
      const payload = JSON.parse(decodeURIComponent(escape(atob(b64))));
      login(data.user, data.token, payload.role as 'client' | 'admin');
      setSuccess('Добро пожаловать!');
      setTimeout(() => { window.scrollTo(0,0); navigate(from, { replace: true }); }, 900);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Неверный email или пароль');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setError('');
    if (!email || !password || !confirmPassword || !firstName || !phone) { setError('Заполните обязательные поля'); return; }
    if (password !== confirmPassword) { setError('Пароли не совпадают'); return; }
    if (password.length < 6) { setError('Пароль должен быть не менее 6 символов'); return; }
    setLoading(true);
    try {
      const data = await authApi.register({ email, password, first_name: firstName, last_name: lastName, phone });
      const b64  = data.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
      const payload = JSON.parse(decodeURIComponent(escape(atob(b64))));
      login(data.user, data.token, payload.role as 'client' | 'admin');
      setSuccess('Регистрация успешна!');
      setTimeout(() => { window.scrollTo(0,0); navigate(from, { replace: true }); }, 900);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Ошибка регистрации');
    } finally { setLoading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); isLogin ? handleLogin() : handleRegister(); };

  const reset = () => { setError(''); setSuccess(''); setEmail(''); setPassword(''); setConfirmPassword(''); setFirstName(''); setLastName(''); setPhone(''); };

  return (
    <div className={styles.page}>
      <SiteHeader alwaysVisible />

      {/* Left decorative panel */}
      <div className={styles.leftPanel}>
        <div className={styles.leftBlob1}/><div className={styles.leftBlob2}/><div className={styles.leftBlob3}/>
        <div className={styles.leftContent}>
          <div className={styles.leftLogo}>🔧</div>
          <h2 className={styles.leftTitle}>Ремонт-Онлайн</h2>
          <p className={styles.leftSub}>Профессиональный ремонт техники с гарантией</p>
          <div className={styles.leftFeatures}>
            {['⚡ Быстро — от 2 часов', '🛡️ Гарантия 1 год', '🎯 Бесплатная диагностика', '🚗 Выезд на дом'].map(f => (
              <div key={f} className={styles.leftFeature}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formBox}>

          {/* Toggle */}
          <div className={styles.toggle}>
            <button className={`${styles.toggleBtn} ${isLogin ? styles.toggleActive : ''}`}
              onClick={() => { setIsLogin(true); reset(); }}>Вход</button>
            <button className={`${styles.toggleBtn} ${!isLogin ? styles.toggleActive : ''}`}
              onClick={() => { setIsLogin(false); reset(); }}>Регистрация</button>
          </div>

          <h1 className={styles.title}>{isLogin ? 'С возвращением!' : 'Создать аккаунт'}</h1>
          <p className={styles.subtitle}>{isLogin ? 'Войдите, чтобы управлять заявками' : 'Заполните данные для регистрации'}</p>

          {error   && <div className={styles.alertError}><span>⚠️</span>{error}</div>}
          {success && <div className={styles.alertSuccess}><span>✅</span>{success}</div>}

          <form className={styles.form} onSubmit={handleSubmit}>
            {!isLogin && (
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Имя *</label>
                  <input className={styles.input} type="text" placeholder="Иван" value={firstName} onChange={e=>setFirstName(e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Фамилия</label>
                  <input className={styles.input} type="text" placeholder="Иванов" value={lastName} onChange={e=>setLastName(e.target.value)} />
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>Email *</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>✉️</span>
                <input className={`${styles.input} ${styles.inputWithIcon}`} type="email" placeholder="ivan@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
            </div>

            {!isLogin && (
              <div className={styles.field}>
                <label className={styles.label}>Телефон *</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>📞</span>
                  <input className={`${styles.input} ${styles.inputWithIcon}`} type="tel" placeholder="+7 (999) 000-00-00" value={phone} onChange={e=>setPhone(e.target.value)} />
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>Пароль *</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>🔒</span>
                <input className={`${styles.input} ${styles.inputWithIcon}`} type={showPass ? 'text' : 'password'} placeholder="Минимум 6 символов" value={password} onChange={e=>setPassword(e.target.value)} />
                <button type="button" className={styles.showPass} onClick={()=>setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {!isLogin && (
              <div className={styles.field}>
                <label className={styles.label}>Подтвердите пароль *</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input className={`${styles.input} ${styles.inputWithIcon}`} type={showPass ? 'text' : 'password'} placeholder="Повторите пароль" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
                </div>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner}/> : null}
              {loading ? 'Подождите...' : isLogin ? 'Войти в аккаунт' : 'Создать аккаунт'}
            </button>
          </form>

          <p className={styles.switchText}>
            {isLogin ? 'Нет аккаунта? ' : 'Уже зарегистрированы? '}
            <button className={styles.switchLink} onClick={() => { setIsLogin(!isLogin); reset(); }}>
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}