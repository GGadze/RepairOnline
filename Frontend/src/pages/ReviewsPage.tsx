import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../components/ReviewsPage.module.css';
import { reviewsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Review } from '../types';

const topNav = [
  { id: 'main', label: 'Главная' },
  { id: 'about', label: 'О себе' },
  { id: 'services', label: 'Услуги' },
  { id: 'contacts', label: 'Контакты' },
  { id: 'reviews', label: 'Отзывы' },
];

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

const StarRating = ({ rating }: { rating: number }) => (
  <div className={styles.stars}>
    {[1, 2, 3, 4, 5].map(star => (
      <span key={star} className={star <= rating ? styles.starFilled : styles.starEmpty}>★</span>
    ))}
  </div>
);

export default function ReviewsPage() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, logout } = useAuthStore();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
  }, []);

  useEffect(() => {
    reviewsApi.getAll()
      .then((data) => {
        setReviews(data.reviews);
        setAvgRating(data.avg_rating);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
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

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'date') {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? -diff : diff;
    } else {
      return sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
    }
  });

  const toggleSort = (type: 'date' | 'rating') => {
    if (sortBy === type) setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    else { setSortBy(type); setSortOrder('desc'); }
  };

  const scrollToElement = (element: HTMLElement | null) => {
    if (!element) return;
    window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - headerHeight - 20, behavior: 'smooth' });
  };

  const handleNavClick = (itemId: string) => {
    setShowHeader(true);
    switch (itemId) {
      case 'main': navigate('/'); break;
      case 'about': navigate('/', { state: { scrollTo: 'about' } }); break;
      case 'services': navigate('/', { state: { scrollTo: 'services' } }); break;
      case 'contacts': navigate('/', { state: { scrollTo: 'contacts' } }); break;
      case 'reviews': scrollToElement(reviewsRef.current); break;
    }
  };

  return (
    <div className={styles.page}>
      <header ref={headerRef} className={`${styles.header} ${showHeader ? styles.visible : ''}`}
        onMouseEnter={() => setShowHeader(true)}>
        <div className={styles.headerContent}>
          <nav className={styles.topNav}>
            {topNav.map(item => (
              <button key={item.id}
                className={`${styles.topBtn} ${item.id === 'reviews' ? styles.active : ''}`}
                onClick={() => handleNavClick(item.id)}>
                {item.label}
              </button>
            ))}
            <button className={styles.orderHeaderBtn} onClick={() => {
              window.scrollTo(0, 0);
              navigate(isAuthenticated ? '/create-order' : '/auth');
            }}>
              Оформить заказ
            </button>
            <div className={styles.profileSection}>
              {isAuthenticated && (
                <button className={styles.logoutTextBtn} onClick={() => { logout(); navigate('/'); }}>Выйти</button>
              )}
              <div className={styles.profile} onClick={() => navigate(isAuthenticated ? '/cabinet' : '/auth')}>
                <span className={isAuthenticated ? styles.profileEmojiAuth : ''}>👤</span>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className={styles.main} ref={reviewsRef}>
        <div className={styles.container}>
          <h1 className={styles.title}>ОТЗЫВЫ НАШИХ КЛИЕНТОВ</h1>

          {/* Средний рейтинг */}
          {avgRating > 0 && (
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <StarRating rating={Math.round(avgRating)} />
              <span style={{ marginLeft: '0.5rem', color: '#888' }}>
                {avgRating.toFixed(1)} из 5 ({reviews.length} отзывов)
              </span>
            </div>
          )}

          <div className={styles.sortBar}>
            <span className={styles.sortLabel}>Сортировать по:</span>
            <button className={`${styles.sortBtn} ${sortBy === 'date' ? styles.active : ''}`}
              onClick={() => toggleSort('date')}>
              Дате {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button className={`${styles.sortBtn} ${sortBy === 'rating' ? styles.active : ''}`}
              onClick={() => toggleSort('rating')}>
              Оценке {sortBy === 'rating' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>Загрузка отзывов...</div>
          ) : (
            <div className={styles.reviewsGrid}>
              {sortedReviews.map(review => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerInfo}>
                      <span className={styles.reviewerAvatar}>👤</span>
                      <div>
                        <h3 className={styles.reviewerName}>{review.user_name}</h3>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  {review.comment && <p className={styles.reviewText}>{review.comment}</p>}
                  <div className={styles.reviewDate}>{formatDate(review.created_at)}</div>
                </div>
              ))}
            </div>
          )}

          {!loading && sortedReviews.length === 0 && (
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
