import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import s from '../components/AuthPage.module.css';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();

  const [isLogin,         setIsLogin]         = useState(true);
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName,       setFirstName]       = useState('');
  const [lastName,        setLastName]        = useState('');
  const [phone,           setPhone]           = useState('');
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');
  const [loading,         setLoading]         = useState(false);
  const [showPass,        setShowPass]        = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';
  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);

  const reset = () => { setError(''); setSuccess(''); setEmail(''); setPassword(''); setConfirmPassword(''); setFirstName(''); setLastName(''); setPhone(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (isLogin) {
      if (!email || !password) { setError('Заполните все поля'); return; }
      setLoading(true);
      try {
        const data = await authApi.login({ email, password });
        const payload = JSON.parse(atob(data.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
        login(data.user, data.token, payload.role as 'client'|'admin');
        setSuccess('Добро пожаловать!');
        setTimeout(() => { window.scrollTo(0,0); navigate(from, { replace: true }); }, 700);
      } catch (e: any) { setError(e.response?.data?.error || 'Неверный email или пароль'); }
      finally { setLoading(false); }
    } else {
      if (!email || !password || !confirmPassword || !firstName || !phone) { setError('Заполните обязательные поля'); return; }
      if (password !== confirmPassword) { setError('Пароли не совпадают'); return; }
      if (password.length < 6) { setError('Минимум 6 символов'); return; }
      setLoading(true);
      try {
        const data = await authApi.register({ email, password, first_name: firstName, last_name: lastName, phone });
        const payload = JSON.parse(atob(data.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
        login(data.user, data.token, payload.role as 'client'|'admin');
        setSuccess('Аккаунт создан!');
        setTimeout(() => { window.scrollTo(0,0); navigate(from, { replace: true }); }, 700);
      } catch (e: any) { setError(e.response?.data?.error || 'Ошибка регистрации'); }
      finally { setLoading(false); }
    }
  };

  return (
    <div className={s.page}>
      <SiteHeader alwaysVisible />
      <div className={s.left}>
        <div className={s.leftContent}>
          <div className={s.brand}>
            <span className={s.brandMark}>🔧</span>
            <div>
              <div className={s.brandName}>АвтоМастер</div>
              <div className={s.brandSub}>Авто &amp; Электроника</div>
            </div>
          </div>
          <h2 className={s.leftTitle}>Ремонт авто<br/>и электроники<br/>в Нижнесакмарском</h2>
          <div className={s.leftFeatures}>
            {['🚗 Авто любых марок', '📱 Любые гаджеты', '🛡️ Гарантия до 1 года', '📍 Выезд на место'].map(f => (
              <div key={f} className={s.leftFeature}>{f}</div>
            ))}
          </div>
        </div>
      </div>
      <div className={s.right}>
        <div className={s.form}>
          <div className={s.tabs}>
            <button className={[s.tab, isLogin ? s.tabActive : ''].join(' ')} onClick={() => { setIsLogin(true); reset(); }}>Войти</button>
            <button className={[s.tab, !isLogin ? s.tabActive : ''].join(' ')} onClick={() => { setIsLogin(false); reset(); }}>Регистрация</button>
          </div>
          <h1 className={s.formTitle}>{isLogin ? 'Вход в аккаунт' : 'Создать аккаунт'}</h1>
          <p className={s.formSub}>{isLogin ? 'Войдите для управления заявками' : 'Заполните данные'}</p>

          {error   && <div className={s.alertError}>⚠ {error}</div>}
          {success && <div className={s.alertOk}>✓ {success}</div>}

          <form onSubmit={handleSubmit} className={s.fields}>
            {!isLogin && (
              <div className={s.row}>
                <div className={s.field}>
                  <label className={s.label}>Имя *</label>
                  <input className={s.input} type="text" placeholder="Иван" value={firstName} onChange={e=>setFirstName(e.target.value)} />
                </div>
                <div className={s.field}>
                  <label className={s.label}>Фамилия</label>
                  <input className={s.input} type="text" placeholder="Иванов" value={lastName} onChange={e=>setLastName(e.target.value)} />
                </div>
              </div>
            )}
            <div className={s.field}>
              <label className={s.label}>Email *</label>
              <input className={s.input} type="email" placeholder="ivan@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            {!isLogin && (
              <div className={s.field}>
                <label className={s.label}>Телефон *</label>
                <input className={s.input} type="tel" placeholder="+7 (999) 000-00-00" value={phone} onChange={e=>setPhone(e.target.value)} />
              </div>
            )}
            <div className={s.field}>
              <label className={s.label}>Пароль *</label>
              <div className={s.passWrap}>
                <input className={s.input} type={showPass ? 'text' : 'password'} placeholder="Минимум 6 символов" value={password} onChange={e=>setPassword(e.target.value)} />
                <button type="button" className={s.showPass} onClick={()=>setShowPass(!showPass)}>{showPass ? '🙈' : '👁'}</button>
              </div>
            </div>
            {!isLogin && (
              <div className={s.field}>
                <label className={s.label}>Подтвердите пароль *</label>
                <input className={s.input} type={showPass ? 'text' : 'password'} placeholder="Повторите пароль" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
              </div>
            )}
            <button type="submit" className={s.submit} disabled={loading}>
              {loading ? <span className={s.spinner}/> : null}
              {loading ? 'Подождите...' : isLogin ? 'Войти' : 'Создать аккаунт'}
            </button>
          </form>
          <p className={s.switchText}>
            {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            <button className={s.switchLink} onClick={() => { setIsLogin(!isLogin); reset(); }}>
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}