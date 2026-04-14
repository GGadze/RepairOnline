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

  // isLogin=true → форма справа, инфо слева
  // isLogin=false → форма слева, инфо справа
  const [isLogin, setIsLogin] = useState(true);
  const [visible, setVisible] = useState(true); // контент видим/скрыт во время анимации

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [resetMode,  setResetMode]  = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent,  setResetSent]  = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [loading,   setLoading]   = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';
  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);

  const reset = () => {
    setError(''); setSuccess('');
    setEmail(''); setPassword(''); setConfirm('');
    setFirstName(''); setLastName(''); setPhone('');
    setShowPass(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) { setResetError('Введите email'); return; }
    setResetLoading(true); setResetError('');
    try {
      await authApi.requestPasswordReset(resetEmail);
      setResetSent(true);
    } catch (e: any) {
      setResetError(e.response?.data?.error || 'Ошибка. Проверьте email.');
    } finally { setResetLoading(false); }
  };

  const switchMode = () => {
    setVisible(false);                     // гасим весь контент (150ms)
    setTimeout(() => {
      reset();
      setIsLogin(v => !v);               // меняем текст пока скрыт + панели едут
    }, 160);
    setTimeout(() => setVisible(true), 620); // зажигаем когда панели доехали (600ms slide)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      // ЛОГИН - без капчи
      if (!email || !password) {
        setError('Заполните все поля');
        return;
      }
      
      setLoading(true);
      try {
        const data = await authApi.login({ email, password });
        const payload = JSON.parse(atob(data.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
        login(data.user, data.token, payload.role as 'client'|'admin');
        setSuccess('Добро пожаловать!');
        setTimeout(() => {
        window.scrollTo(0,0);
        // Если админ — сразу в админку, иначе туда, откуда пришёл
        const destination = payload.role === 'admin' ? '/admin' : from;
        navigate(destination, { replace: true });
      }, 600);
      } catch (e: any) {
        setError(e.response?.data?.error || 'Неверный email или пароль');
      } finally {
        setLoading(false);
      }
    } else {
      // РЕГИСТРАЦИЯ - без капчи
      if (!email || !password || !confirm || !firstName || !phone) {
        setError('Заполните обязательные поля');
        return;
      }

      // 1. Телефон
      const phoneClean = phone.replace(/\s/g, '');
      if (!/^\+7\d{10}$/.test(phoneClean)) {
        setError('Телефон должен начинаться с +7 и содержать 10 цифр после');
        return;
      }

      // 2. Email
      if (!/^[^\s@]+@[^\s@]+\.(ru|com|net|org|рф)$/i.test(email)) {
        setError('Введите корректный email (например, ivan@mail.ru)');
        return;
      }

      // 3. Имя и фамилия
      if (!/^[a-zA-Zа-яёА-ЯЁ\-]+$/.test(firstName)) {
        setError('Имя может содержать только буквы');
        return;
      }
      if (lastName && !/^[a-zA-Zа-яёА-ЯЁ\-]+$/.test(lastName)) {
        setError('Фамилия может содержать только буквы');
        return;
      }

      // 4. Пароль
      if (password.length < 6) {
        setError('Минимум 6 символов');
        return;
      }
      if (!/[A-ZА-ЯЁ]/.test(password)) {
        setError('Пароль должен содержать хотя бы одну заглавную букву');
        return;
      }
      if (!/\d/.test(password)) {
        setError('Пароль должен содержать хотя бы одну цифру');
        return;
      }

      if (password !== confirm) {
        setError('Пароли не совпадают');
        return;
      }

      setLoading(true);
      try {
        const data = await authApi.register({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone,
          captcha_token: 'test' // Передаём заглушку
        });
        const payload = JSON.parse(atob(data.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
        login(data.user, data.token, payload.role as 'client'|'admin');
        setSuccess('Аккаунт создан!');
        setTimeout(() => {
          window.scrollTo(0,0);
          const destination = payload.role === 'admin' ? '/admin' : from;
          navigate(destination, { replace: true });
        }, 600);
      } catch (e: any) {
        setError(e.response?.data?.error || 'Ошибка регистрации');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={s.page}>
      <SiteHeader alwaysVisible />

      {/*
        Контейнер — relative, overflow hidden.
        Внутри две абсолютно позиционированных панели — инфо и форма.
        При isLogin:   инфо left:0,  форма left:50%
        При !isLogin:  инфо left:50%, форма left:0
        Обе едут через transition: left 0.6s
      */}
      <div className={s.stage}>

        {/* ── Инфо-панель ── */}
        <div className={`${s.panel} ${s.infoPanel} ${isLogin ? s.infoPanelLeft : s.infoPanelRight}`}>
          <div className={`${s.infoBrand} ${visible ? s.contentVisible : s.contentHidden}`}>
            <div className={s.infoBrandMark}>АМ</div>
            <div>
              <div className={s.infoBrandName}>АвтоМастер</div>
              <div className={s.infoBrandSub}>Авто &amp; Электроника</div>
            </div>
          </div>

          <div className={`${s.infoBody} ${visible ? s.contentVisible : s.contentHidden}`}>
            {isLogin ? (
              <>
                <h2 className={s.infoTitle}>
                  Ремонт авто<br/>
                  <em>и электроники</em><br/>
                  в Нижнесакмарском
                </h2>
                <div className={s.infoList}>
                  {[
                    'Авто любых марок и моделей',
                    'Смартфоны, ноутбуки, техника',
                    'Гарантия до 1 года на работы',
                    'Выезд в Нижнесакмарский',
                  ].map(t => (
                    <div key={t} className={s.infoItem}>
                      <span className={s.dot}/>{t}
                    </div>
                  ))}
                </div>

                {/* Мини-статистика */}
                <div className={s.infoStats} style={{ marginTop: '36px' }}>
                  {[
                    { n: '800+', l: 'авто отремонтировано' },
                    { n: '7 лет', l: 'опыта работы' },
                    { n: '98%',  l: 'довольных клиентов' },
                    { n: '1 год', l: 'гарантия на работы' },
                  ].map(s2 => (
                    <div key={s2.n} className={s.infoStat}>
                      <div className={s.infoStatN}>{s2.n}</div>
                      <div className={s.infoStatL}>{s2.l}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className={s.infoTitle}>
                  Личный кабинет —<br/>
                  <em>удобно</em><br/>
                  и просто
                </h2>
                <div className={s.infoList}>
                  {[
                    'Отслеживайте статус ремонта',
                    'История всех ваших заказов',
                    'Оставляйте отзывы о работе',
                    'Записывайтесь онлайн 24/7',
                  ].map(t => (
                    <div key={t} className={s.infoItem}>
                      <span className={s.dot}/>{t}
                    </div>
                  ))}
                </div>

                {/* Цитата */}
                <div className={s.infoQuote}>
                  Регистрация бесплатная. Данные используются только для управления вашими заявками и связи с вами.
                </div>
              </>
            )}
          </div>


        </div>

        {/* ── Форма-панель ── */}
        <div className={`${s.panel} ${s.formPanel} ${isLogin ? s.formPanelRight : s.formPanelLeft}`}>
          <div className={`${s.formInner} ${visible ? s.contentVisible : s.contentHidden}`}>
            <h1 className={s.formTitle}>{isLogin ? 'Вход в аккаунт' : 'Регистрация'}</h1>
            <p className={s.formSub}>{isLogin ? 'Войдите для управления заявками' : 'Создайте аккаунт — это займёт минуту'}</p>

            {error   && <div className={s.alertErr}>&#9888;&nbsp;{error}</div>}
            {success && <div className={s.alertOk}>&#10003;&nbsp;{success}</div>}

            <form onSubmit={handleSubmit} className={s.fields}>
              {!isLogin && (
                <div className={s.row}>
                  <div className={s.field}>
                    <label className={s.label}>Имя *</label>
                    <input className={s.input} type="text" placeholder="Иван"
                      value={firstName} onChange={e => setFirstName(e.target.value)}/>
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Фамилия</label>
                    <input className={s.input} type="text" placeholder="Иванов"
                      value={lastName} onChange={e => setLastName(e.target.value)}/>
                  </div>
                </div>
              )}

              <div className={s.field}>
                <label className={s.label}>Email *</label>
                <input className={s.input} type="email" placeholder="ivan@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}/>
              </div>

              {!isLogin && (
                <div className={s.field}>
                  <label className={s.label}>Телефон *</label>
                  <input className={s.input} type="tel" placeholder="+7 (999) 000-00-00"
                    value={phone} onChange={e => {
                    const val = e.target.value;
                    if (/^[+\d\s]*$/.test(val)) setPhone(val);
                  }}/>
                </div>
              )}

              <div className={s.field}>
                <label className={s.label}>Пароль *</label>
                <div className={s.passWrap}>
                  <input className={s.input} type={showPass ? 'text' : 'password'}
                    placeholder="Минимум 6 символов"
                    value={password} onChange={e => setPassword(e.target.value)}/>
                  <button type="button" className={s.showPass} onClick={() => setShowPass(v => !v)}>
                    {showPass ? 'скрыть' : 'показать'}
                  </button>
                </div>
                {isLogin && (
                  <button type="button" className={s.forgotBtn}
                    onClick={() => { setResetMode(true); setResetEmail(email); setResetSent(false); setResetError(''); }}>
                    Забыл пароль
                  </button>
                )}
              </div>

              {!isLogin && (
                <div className={s.field}>
                  <label className={s.label}>Повторите пароль *</label>
                  <input className={s.input} type={showPass ? 'text' : 'password'}
                    placeholder="Ещё раз"
                    value={confirm} onChange={e => setConfirm(e.target.value)}/>
                </div>
              )}

              <button type="submit" className={s.submit} disabled={loading}>
                {loading
                  ? <span className={s.spinner}/>
                  : isLogin ? 'Войти' : 'Создать аккаунт'}
              </button>
            </form>

            {/* Переключатель режима — прямо под формой */}
            <div className={s.switchRow}>
              {isLogin ? (
                <span>Нет аккаунта?{' '}
                  <button className={s.switchBtn} onClick={switchMode}>Зарегистрироваться</button>
                </span>
              ) : (
                <span>Уже есть аккаунт?{' '}
                  <button className={s.switchBtn} onClick={switchMode}>Войти</button>
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    {/* Модалка сброса пароля */}
      {resetMode && (
        <div className={s.resetOverlay} onClick={() => setResetMode(false)}>
          <div className={s.resetModal} onClick={e => e.stopPropagation()}>
            {!resetSent ? (
              <>
                <div className={s.resetTitle}>Восстановление пароля</div>
                <p className={s.resetSub}>
                  Укажите email — в будущем придёт ссылка для сброса пароля.<br/>
                  Сейчас функция в разработке, обратитесь к администратору.
                </p>
                <form onSubmit={handleReset} className={s.resetForm}>
                  <div className={s.field}>
                    <label className={s.label}>Email</label>
                    <input className={s.input} type="email" placeholder="ivan@example.com"
                      value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
                  </div>
                  {resetError && <div className={s.alertErr}>{resetError}</div>}
                  <div className={s.resetButtons}>
                    <button type="button" className={s.resetCancel} onClick={() => setResetMode(false)}>Отмена</button>
                    <button type="submit" className={s.submit} style={{ flex: 1 }} disabled={resetLoading}>
                      {resetLoading ? 'Отправка...' : 'Отправить'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className={s.resetTitle}>Заявка принята</div>
                <p className={s.resetSub}>
                  Когда функция будет готова — инструкция придёт на <strong>{resetEmail}</strong>.
                  Сейчас обратитесь к администратору напрямую.
                </p>
                <button className={s.submit} onClick={() => setResetMode(false)}>Понятно</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}