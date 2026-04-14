import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import s from '../components/SiteHeader.module.css';

const NAV = [
  { id: 'main',     label: 'Главная'  },
  { id: 'auto',     label: 'Авто'     },
  { id: 'services', label: 'Электроника' },
  { id: 'about',    label: 'О нас'    },
  { id: 'contacts', label: 'Контакты' },
  { id: 'reviews',  label: 'Отзывы'   },
];

interface SiteHeaderProps {
  refs?: {
    hero?:     React.RefObject<HTMLElement | null>;
    auto?:     React.RefObject<HTMLElement | null>;
    services?: React.RefObject<HTMLElement | null>;
    about?:    React.RefObject<HTMLElement | null>;
    contacts?: React.RefObject<HTMLElement | null>;
  };
  alwaysVisible?: boolean;
  activeId?: string;
}

export default function SiteHeader({ refs, alwaysVisible = false, activeId }: SiteHeaderProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isAuthenticated, logout, user, role } = useAuthStore();
  const headerRef = useRef<HTMLElement>(null);

  const [visible,  setVisible]  = useState(true);
  const [lastY,    setLastY]    = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [avatarEmoji, setAvatarEmoji] = useState('👤');

  // Читаем при монтировании и при смене авторизации
  useEffect(() => {
    setAvatarEmoji(localStorage.getItem('user-avatar') || '👤');
  }, [isAuthenticated]);

  // Слушаем кастомное событие — мгновенное обновление в той же вкладке
  useEffect(() => {
    const sync = () => setAvatarEmoji(localStorage.getItem('user-avatar') || '👤');
    window.addEventListener('avatar-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('avatar-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (alwaysVisible) { setVisible(true); return; }
    const fn = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setVisible(y < lastY || y < 10);
      setLastY(y);
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, [lastY, alwaysVisible]);

  const scrollToRef = (ref?: React.RefObject<HTMLElement | null>) => {
    if (!ref?.current) return;
    const hh = headerRef.current?.offsetHeight ?? 64;
    window.scrollTo({ top: ref.current.getBoundingClientRect().top + window.scrollY - hh - 12, behavior: 'smooth' });
  };

  const handleNav = (id: string) => {
    setVisible(true);
    if (id === 'reviews') { navigate('/reviews'); return; }
    if (location.pathname !== '/') {
      const map: Record<string, string> = { auto:'auto', services:'services', about:'about', contacts:'contacts' };
      navigate('/', { state: { scrollTo: map[id] ?? 'main' } });
      return;
    }
    const map: Record<string, React.RefObject<HTMLElement | null> | undefined> = {
      main: refs?.hero, auto: refs?.auto, services: refs?.services,
      about: refs?.about, contacts: refs?.contacts,
    };
    scrollToRef(map[id]);
  };

  const handleOrder = () => {
    window.scrollTo(0, 0);
    navigate(isAuthenticated ? '/create-order' : '/auth', { state: { from: { pathname: '/create-order' } } });
  };

  return (
    <header
      ref={headerRef}
      className={[s.header, (visible || alwaysVisible) ? s.visible : '', scrolled ? s.scrolled : ''].join(' ')}
      onMouseEnter={() => setVisible(true)}
    >
      <div className={s.inner}>
        <div className={s.logo} onClick={() => navigate('/')}>
          <div className={s.logoMark}>АМ</div>
          <div>
            <div className={s.logoText}>АвтоМастер</div>
            <div className={s.logoSub}>Авто &amp; Электроника</div>
          </div>
        </div>

        <nav className={s.nav}>
          {NAV.map(item => (
            <button key={item.id}
              className={[s.navBtn, activeId === item.id ? s.navBtnActive : ''].join(' ')}
              onClick={() => handleNav(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className={s.right}>
  {/* Кнопка "Записаться" — только для клиентов и гостей */}
  {role !== 'admin' && (
    <button className={s.orderBtn} onClick={handleOrder}>Записаться</button>
  )}
  
  {/* Кнопка "Панель" — только для админа */}
  {role === 'admin' && (
    <button className={s.adminBtn} onClick={() => navigate('/admin')}>
      ⚙️ Панель
    </button>
  )}
  
  {isAuthenticated && (
    <button className={s.logoutBtn} onClick={() => logout()}>Выйти</button>
  )}
  
  {/* Аватар — для клиента ведёт в /cabinet, для админа в /admin */}
  <button className={s.avatar} onClick={() => { 
    window.scrollTo(0,0); 
    if (!isAuthenticated) {
      navigate('/auth');
    } else if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/cabinet');
    }
  }}>
    <span className={isAuthenticated ? s.avatarAuth : s.avatarGuest}>{isAuthenticated ? avatarEmoji : '👤'}</span>
  </button>
</div>
      </div>
    </header>
  );
}