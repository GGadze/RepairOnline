import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../components/HomePage.module.css';

const topNav = [
  { id: 'main', label: 'Главная' },
  { id: 'about', label: 'О себе' },
  { id: 'services', label: 'Услуги' },
  { id: 'contacts', label: 'Контакты' },
  { id: 'reviews', label: 'Отзывы' },
];

const categories = [
  'Смартфоны',
  'Ноутбуки',
  'Планшеты',
  'Телевизоры',
  'Бытовая техника',
  'Другое',
];

const pricesData: Record<string, { name: string; price: number }[]> = {
  'Смартфоны': [
    { name: 'Замена стекла', price: 500 },
    { name: 'Замена аккумулятора', price: 4000 },
    { name: 'Замена дисплея', price: 8500 },
    { name: 'Ремонт разъема зарядки', price: 2500 },
    { name: 'Чистка от пыли', price: 1500 },
    { name: 'Восстановление после воды', price: 6000 },
  ],
  'Ноутбуки': [
    { name: 'Замена термопасты', price: 2000 },
    { name: 'Замена клавиатуры', price: 3500 },
    { name: 'Чистка системы охлаждения', price: 2500 },
    { name: 'Замена матрицы', price: 12000 },
    { name: 'Ремонт материнской платы', price: 15000 },
    { name: 'Замена аккумулятора', price: 7000 },
  ],
  'Планшеты': [
    { name: 'Замена стекла', price: 4000 },
    { name: 'Замена аккумулятора', price: 5000 },
    { name: 'Ремонт разъема', price: 3000 },
    { name: 'Замена дисплея', price: 9000 },
    { name: 'Ремонт кнопок', price: 2500 },
  ],
  'Телевизоры': [
    { name: 'Диагностика', price: 1000 },
    { name: 'Замена блока питания', price: 5000 },
    { name: 'Ремонт подсветки', price: 7000 },
    { name: 'Замена матрицы', price: 25000 },
    { name: 'Прошивка', price: 2000 },
  ],
  'Бытовая техника': [
    { name: 'Диагностика', price: 1500 },
    { name: 'Замена двигателя', price: 8000 },
    { name: 'Ремонт электроники', price: 6000 },
    { name: 'Замена ТЭНа', price: 4500 },
  ],
  'Другое': [
    { name: 'Консультация', price: 500 },
    { name: 'Диагностика', price: 1000 },
    { name: 'Ремонт любой сложности', price: 3000 },
    { name: 'Профилактика', price: 2000 },
  ],
};

const advantages = [
  { id: 1, icon: '⚡', title: 'Быстрый ремонт', desc: 'Среднее время ремонта - 2 часа' },
  { id: 2, icon: '🔧', title: 'Оригинальные запчасти', desc: 'Только сертифицированные детали' },
  { id: 3, icon: '💰', title: 'Гарантия 1 год', desc: 'На все виды работ' },
  { id: 4, icon: '🚚', title: 'Бесплатная диагностика', desc: 'При заказе ремонта' },
];

const additionalServices = [
  { id: 1, name: 'Срочный ремонт', price: '+30%', desc: 'За 1 час' },
  { id: 2, name: 'Выезд мастера', price: '500 ₽', desc: 'На дом или в офис' },
  { id: 3, name: 'Резервное копирование', price: '1000 ₽', desc: 'Сохранение данных' },
  { id: 4, name: 'Настройка после ремонта', price: 'Бесплатно', desc: 'Полная настройка устройства' },
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
  window.location.reload();
};

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mindmapRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);
  const pricesRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Смартфоны');
  const [showPrices, setShowPrices] = useState(true);
  const [profileEmoji, setProfileEmoji] = useState(getProfileEmoji());
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

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

  useEffect(() => {
  if (location.state?.scrollTo) {
    const section = location.state.scrollTo;
    // Даем время на загрузку страницы и рендер компонентов
    setTimeout(() => {
      let element = null;
      switch(section) {
        case 'about':
          element = aboutRef.current;
          break;
        case 'services':
          element = servicesRef.current;
          break;
        case 'contacts':
          element = contactsRef.current;
          break;
        case 'main':
        default:
          element = mindmapRef.current;
          break;
      }
      
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerHeight - 20;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 300); // Увеличил задержку до 300ms
    navigate('/', { replace: true, state: {} });
  }
}, [location.state, navigate, headerHeight]); // Добавил headerHeight в зависимости

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
        scrollToElement(mindmapRef.current);
        break;
      case 'about':
        scrollToElement(aboutRef.current);
        break;
      case 'services':
        scrollToElement(servicesRef.current);
        break;
      case 'contacts':
        scrollToElement(contactsRef.current);
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
    window.scrollTo(0, 0);
    if (isAuthenticated()) {
      navigate('/cabinet');
    } else {
      navigate('/auth', { state: { from: { pathname: '/cabinet' } } });
    }
  };

  const handleLogoutClick = () => {
    logout();
    setProfileEmoji('👤');
  };

  const scrollToPrices = (category: string) => {
    setActiveCategory(category);
    setShowPrices(true);
    scrollToElement(pricesRef.current);
  };

  useEffect(() => {
    if (!mindmapRef.current) return;
    
    const updatePositions = () => {
      const rect = mindmapRef.current!.getBoundingClientRect();
      
      const circleCenterX = 220;
      const circleCenterY = rect.height / 2;
      const circleRadius = 220;

      const radius = Math.min(rect.width * 0.35, 500);
      const startAngle = -45;
      const endAngle = 45;
      
      const newPositions = categories.map((_, i) => {
        const t = i / (categories.length - 1);
        const angleDeg = startAngle + (endAngle - startAngle) * t;
        const angleRad = angleDeg * (Math.PI / 180);
        
        return {
          x: circleCenterX + circleRadius + 180 + radius * Math.cos(angleRad),
          y: circleCenterY + radius * Math.sin(angleRad) * 0.9,
        };
      });
      
      setPositions(newPositions);
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    
    return () => window.removeEventListener('resize', updatePositions);
  }, []);

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

      <div ref={mindmapRef} className={styles.mindmap}>
        <div className={styles.circle}>🔧</div>

        {categories.map((cat, i) => {
          const pos = positions[i];
          if (!pos) return null;

          const rect = mindmapRef.current?.getBoundingClientRect();
          if (!rect) return null;

          const circleCenterX = 220;
          const circleCenterY = rect.height / 2;
          const circleRadius = 220;

          const dx = pos.x - circleCenterX;
          const dy = pos.y - circleCenterY;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          
          const totalLength = Math.sqrt(dx * dx + dy * dy);
          const startOffset = circleRadius + 10;
          const endOffset = 15;
          const arrowLength = totalLength - startOffset - endOffset;

          return (
            <React.Fragment key={cat}>
              <div
                className={styles.rayWrapper}
                style={{
                  left: `${circleCenterX + Math.cos(angle * Math.PI / 180) * startOffset}px`,
                  top: `${circleCenterY + Math.sin(angle * Math.PI / 180) * startOffset}px`,
                  transform: `rotate(${angle}deg)`,
                  width: `${Math.max(0, arrowLength)}px`,
                  '--rotate': `${angle}deg`,
                } as React.CSSProperties}
              >
                <div className={styles.ray} />
              </div>
              <div
                className={styles.category}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  '--index': i,
                } as React.CSSProperties}
                onClick={() => scrollToPrices(cat)}
              >
                {cat}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className={styles.orderSection}>
        <button className={styles.orderBtn} onClick={handleOrderClick}>
          Оформить заказ
        </button>
      </div>

      <div ref={aboutRef}>
        <div className={styles.aboutSection}>
          <div className={styles.colorBlock1} />
          <div className={styles.colorBlock2} />
          <div className={styles.aboutBar}>
            <div className={styles.aboutTitle}>О СЕБЕ</div>
            <div className={styles.photo}>ФОТКА</div>
          </div>
        </div>

        <div className={styles.advantagesSection}>
          <h2 className={styles.sectionTitle}>НАШИ ПРЕИМУЩЕСТВА</h2>
          <div className={styles.advantagesGrid}>
            {advantages.map(adv => (
              <div key={adv.id} className={styles.advantageCard}>
                <span className={styles.advantageIcon}>{adv.icon}</span>
                <h3 className={styles.advantageTitle}>{adv.title}</h3>
                <p className={styles.advantageDesc}>{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div ref={servicesRef}>
        <div className={styles.additionalSection}>
          <h2 className={styles.sectionTitle}>ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ</h2>
          <div className={styles.additionalGrid}>
            {additionalServices.map(service => (
              <div key={service.id} className={styles.additionalCard}>
                <h3 className={styles.additionalName}>{service.name}</h3>
                <p className={styles.additionalDesc}>{service.desc}</p>
                <span className={styles.additionalPrice}>{service.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div ref={pricesRef} className={styles.pricesSection}>
          <h2 className={styles.pricesTitle}>КАТЕГОРИИ</h2>
          
          <div className={styles.categoriesTabs}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.categoryTab} ${activeCategory === cat ? styles.active : ''}`}
                onClick={() => {
                  setActiveCategory(cat);
                  setShowPrices(true);
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.pricesTable}>
            <div className={styles.tableHeader}>
              <span>Наименование</span>
              <span>Цена</span>
            </div>
            
            <div className={styles.servicesList}>
              {showPrices && activeCategory && pricesData[activeCategory] ? (
                pricesData[activeCategory].map((service, index) => (
                  <div key={index} className={styles.serviceItem}>
                    <span className={styles.serviceName}>{service.name}</span>
                    <span className={styles.servicePrice}>{service.price} ₽</span>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🔧</div>
                  <div>Выберите категорию</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div ref={contactsRef} className={styles.mapSection}>
        <h2 className={styles.sectionTitle}>МЫ НА КАРТЕ</h2>
        <div className={styles.mapContainer}>
          <iframe
            src="https://yandex.ru/map-widget/v1/?um=constructor%3A1a2b3c4d5e6f7g8h9i0j&source=constructor"
            width="100%"
            height="400"
            frameBorder="0"
            title="Яндекс Карта"
            className={styles.map}
          ></iframe>
        </div>
        <div className={styles.contacts}>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}>📍</span>
            <span>г. Краснодар, ул. Красная, 123</span>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}>📞</span>
            <span>+7 (861) 123-45-67</span>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}>✉️</span>
            <span>info@remont-online.ru</span>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}>🕒</span>
            <span>Ежедневно с 10:00 до 20:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}