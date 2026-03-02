import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getAvatarEmoji } from '../utils/avatarUtils';
import headerStyles from '../components/SiteHeader.module.css';

const topNav = [
  { id: 'main',     label: 'Главная'  },
  { id: 'about',    label: 'О себе'   },
  { id: 'services', label: 'Услуги'   },
  { id: 'contacts', label: 'Контакты' },
  { id: 'reviews',  label: 'Отзывы'   },
];

interface SiteHeaderProps {
  /** Refs для скролла — передаются только на главной странице */
  refs?: {
    hero?:     React.RefObject<HTMLElement | null>;
    about?:    React.RefObject<HTMLElement | null>;
    services?: React.RefObject<HTMLElement | null>;
    contacts?: React.RefObject<HTMLElement | null>;
  };
  /** Принудительно всегда показывать шапку (для внутренних страниц) */
  alwaysVisible?: boolean;
  /** ID текущей активной вкладки nav */
  activeId?: string;
}

export default function SiteHeader({ refs, alwaysVisible = false, activeId }: SiteHeaderProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isAuthenticated, logout, user } = useAuthStore();
  const headerRef = useRef<HTMLElement>(null);

  const [visible,    setVisible]    = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [scrolled,   setScrolled]   = useState(false);

  const avatarEmoji = isAuthenticated ? getAvatarEmoji(user?.avatar_id) : '👤';

  useEffect(() => {
    if (alwaysVisible) { setVisible(true); return; }
    const fn = () => {
      const cur = window.scrollY;
      setScrolled(cur > 40);
      setVisible(cur < lastScroll || cur < 10);
      setLastScroll(cur);
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, [lastScroll, alwaysVisible]);

  const scrollToRef = (ref?: React.RefObject<HTMLElement | null>) => {
    if (!ref?.current) return;
    const hh = headerRef.current?.offsetHeight ?? 72;
    window.scrollTo({ top: ref.current.getBoundingClientRect().top + window.scrollY - hh - 16, behavior: 'smooth' });
  };

  const handleNav = (id: string) => {
    setVisible(true);
    if (id === 'reviews') { navigate('/reviews'); return; }
    if (location.pathname !== '/') {
      const scrollMap: Record<string, string> = { about: 'about', services: 'services', contacts: 'contacts' };
      navigate('/', { state: { scrollTo: scrollMap[id] ?? 'main' } });
      return;
    }
    // На главной — скроллим к рефу
    if (id === 'main')     scrollToRef(refs?.hero);
    if (id === 'about')    scrollToRef(refs?.about);
    if (id === 'services') scrollToRef(refs?.services);
    if (id === 'contacts') scrollToRef(refs?.contacts);
  };

  const handleOrder = () => {
    window.scrollTo(0, 0);
    navigate(isAuthenticated ? '/create-order' : '/auth', { state: { from: { pathname: '/create-order' } } });
  };

  const handleProfile = () => {
    window.scrollTo(0, 0);
    navigate(isAuthenticated ? '/cabinet' : '/auth');
  };

  return (
    <header
      ref={headerRef}
      className={[
        headerStyles.header,
        (visible || alwaysVisible) ? headerStyles.visible : '',
        scrolled ? headerStyles.scrolled : '',
      ].join(' ')}
      onMouseEnter={() => setVisible(true)}
    >
      <div className={headerStyles.inner}>
        {/* Лого */}
        <div className={headerStyles.logo} onClick={() => navigate('/')}>
          <span className={headerStyles.logoIcon}>🔧</span>
          <span className={headerStyles.logoText}>Ремонт-Онлайн</span>
        </div>

        {/* Навигация */}
        <nav className={headerStyles.nav}>
          {topNav.map(item => (
            <button
              key={item.id}
              className={[headerStyles.navBtn, activeId === item.id ? headerStyles.navBtnActive : ''].join(' ')}
              onClick={() => handleNav(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Правый блок */}
        <div className={headerStyles.right}>
          <button className={headerStyles.orderBtn} onClick={handleOrder}>
            Оформить заказ
          </button>
          {isAuthenticated && (
            <button className={headerStyles.logoutBtn} onClick={() => logout()}>
              Выйти
            </button>
          )}
          <button className={headerStyles.avatar} onClick={handleProfile} title="Личный кабинет">
            <span className={isAuthenticated ? headerStyles.avatarAuth : headerStyles.avatarGuest}>
              {avatarEmoji}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}