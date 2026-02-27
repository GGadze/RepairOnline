import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../components/ReviewsPage.module.css';

const topNav = [
  { id: 'main', label: 'Главная' },
  { id: 'about', label: 'О себе' },
  { id: 'services', label: 'Услуги' },
  { id: 'contacts', label: 'Контакты' },
  { id: 'reviews', label: 'Отзывы' },
];

// Моковые данные отзывов
const allReviews = [
  {
    id: 1,
    author: 'Алексей Петров',
    avatar: '👨',
    rating: 5,
    date: '2024-03-15',
    text: 'Отличный сервис! Быстро починили iPhone, заменили стекло за 2 часа. Цены адекватные, качество работы на высоте. Рекомендую!',
    device: 'iPhone 12',
  },
  {
    id: 2,
    author: 'Екатерина Смирнова',
    avatar: '👩',
    rating: 5,
    date: '2024-03-14',
    text: 'Обращалась с ноутбуком, не включался. Оказалось проблема с материнской платой. Всё починили, дали гарантию. Спасибо большое!',
    device: 'Lenovo IdeaPad',
  },
  {
    id: 3,
    author: 'Дмитрий Иванов',
    avatar: '👨',
    rating: 4,
    date: '2024-03-12',
    text: 'Хороший сервис, вежливые мастера. Немного долго ждал запчасти, но в целом доволен. Цены чуть выше среднего, но качество того стоит.',
    device: 'Samsung Galaxy S21',
  },
  {
    id: 4,
    author: 'Ольга Новикова',
    avatar: '👩',
    rating: 5,
    date: '2024-03-10',
    text: 'Очень довольна ремонтом планшета. Сделали быстро, качественно. Отдельное спасибо за консультацию и помощь в выборе чехла!',
    device: 'iPad Air',
  },
  {
    id: 5,
    author: 'Сергей Морозов',
    avatar: '👨',
    rating: 3,
    date: '2024-03-08',
    text: 'Ремонтировал телевизор. Вроде всё хорошо, но пришлось дважды возвращаться из-за мелкого дефекта. Надеюсь, больше проблем не будет.',
    device: 'LG 43"',
  },
  {
    id: 6,
    author: 'Анна Кузнецова',
    avatar: '👩',
    rating: 5,
    date: '2024-03-05',
    text: 'Лучший сервис в городе! Починили микроволновку за час, ещё и диагностику бесплатно сделали. Цены приятно удивили. Обязательно вернусь!',
    device: 'Samsung MW350',
  },
  {
    id: 7,
    author: 'Павел Соколов',
    avatar: '👨',
    rating: 4,
    date: '2024-03-03',
    text: 'Нормальный сервис, всё работает. Единственное - не предупредили, что ремонт займёт больше времени, чем обещали. Но результат порадовал.',
    device: 'iPhone 13',
  },
  {
    id: 8,
    author: 'Мария Волкова',
    avatar: '👩',
    rating: 5,
    date: '2024-03-01',
    text: 'Огромное спасибо мастеру! Починил утюг, который я уже хотела выкинуть. Работает как новый. Очень довольна сервисом!',
    device: 'Philips Azur',
  },
  {
    id: 9,
    author: 'Игорь Белов',
    avatar: '👨',
    rating: 5,
    date: '2024-02-28',
    text: 'Профессиональный подход к делу. Починили ноутбук после залития. Восстановили данные, заменили клавиатуру. Всё работает отлично!',
    device: 'Asus ROG',
  },
  {
    id: 10,
    author: 'Татьяна Лебедева',
    avatar: '👩',
    rating: 4,
    date: '2024-02-25',
    text: 'Хороший сервис, вежливые сотрудники. Немного дороговато, но зато с гарантией. Буду рекомендовать знакомым.',
    device: 'Xiaomi Redmi Note 10',
  },
  {
    id: 11,
    author: 'Андрей Козлов',
    avatar: '👨',
    rating: 5,
    date: '2024-02-22',
    text: 'Отличное обслуживание! Быстро, качественно, недорого. Починили кофемашину, теперь варит кофе лучше, чем новая!',
    device: 'DeLonghi',
  },
  {
    id: 12,
    author: 'Наталья Сорокина',
    avatar: '👩',
    rating: 5,
    date: '2024-02-20',
    text: 'Спасибо за быстрый ремонт телефона! Заменили стекло за час, качество отличное. Цена порадовала. Обязательно приду ещё!',
    device: 'iPhone 14',
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
  window.location.reload();
};

// Функция для форматирования даты
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Компонент звездного рейтинга
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={star <= rating ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
    </div>
  );
};

export default function ReviewsPage() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  
  
  const [profileEmoji, setProfileEmoji] = useState(getProfileEmoji());
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [displayedReviews, setDisplayedReviews] = useState(allReviews);

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
    // Сортировка отзывов
    const sorted = [...allReviews].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        return sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
      }
    });
    setDisplayedReviews(sorted);
  }, [sortBy, sortOrder]);

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
        navigate('/', { state: { scrollTo: 'main' } });
      } else {
        scrollToElement(mainRef.current);
      }
      break;
    case 'about':
      if (window.location.pathname !== '/') {
        navigate('/', { state: { scrollTo: 'about' } });
      } else {
        scrollToElement(aboutRef.current);
      }
      break;
    case 'services':
      if (window.location.pathname !== '/') {
        navigate('/', { state: { scrollTo: 'services' } });
      } else {
        scrollToElement(servicesRef.current);
      }
      break;
    case 'contacts':
      if (window.location.pathname !== '/') {
        navigate('/', { state: { scrollTo: 'contacts' } });
      } else {
        scrollToElement(contactsRef.current);
      }
      break;
    case 'reviews':
      if (window.location.pathname !== '/reviews') {
        navigate('/reviews');
      } else {
        scrollToElement(reviewsRef.current);
      }
      break;
    default:
      break;
  }
};

  const toggleSort = (type: 'date' | 'rating') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
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
                className={`${styles.topBtn} ${item.id === 'reviews' ? styles.active : ''}`}
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

      <main className={styles.main} ref={reviewsRef}>
        <div className={styles.container}>
          <h1 className={styles.title}>ОТЗЫВЫ НАШИХ КЛИЕНТОВ</h1>
          
          <div className={styles.sortBar}>
            <span className={styles.sortLabel}>Сортировать по:</span>
            <button 
              className={`${styles.sortBtn} ${sortBy === 'date' ? styles.active : ''}`}
              onClick={() => toggleSort('date')}
            >
              Дате {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              className={`${styles.sortBtn} ${sortBy === 'rating' ? styles.active : ''}`}
              onClick={() => toggleSort('rating')}
            >
              Оценке {sortBy === 'rating' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>

          <div className={styles.reviewsGrid}>
            {displayedReviews.map(review => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewerInfo}>
                    <span className={styles.reviewerAvatar}>{review.avatar}</span>
                    <div>
                      <h3 className={styles.reviewerName}>{review.author}</h3>
                      <p className={styles.reviewDevice}>{review.device}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className={styles.reviewText}>{review.text}</p>
                <div className={styles.reviewDate}>
                  {formatDate(review.date)}
                </div>
              </div>
            ))}
          </div>

          {displayedReviews.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📝</div>
              <div>Пока нет отзывов</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}