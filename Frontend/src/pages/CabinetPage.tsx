import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../components/CabinetPage.module.css';
import { ordersApi, reviewsApi, authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Order, OrderStatusHistory, Review } from '../types';

const topNav = [
  { id: 'main', label: 'Главная' },
  { id: 'about', label: 'О себе' },
  { id: 'services', label: 'Услуги' },
  { id: 'contacts', label: 'Контакты' },
  { id: 'reviews', label: 'Отзывы' },
];

// Маппинг ID → эмодзи (серьёзные аватары для бизнес-сайта)
const AVATAR_MAP: Record<number, string> = {
  1: '👤', // Обычный пользователь
  2: '👨‍💼', // Бизнесмен
  3: '👩‍💼', // Бизнесвумен
  4: '🧑‍🔧', // Техник
  5: '👨‍💻', // Разработчик (м)
  6: '👩‍💻', // Разработчик (ж)
  7: '🧑‍🎓', // Студент
  8: '👮', // Офицер
  9: '🧑‍⚕️', // Специалист
  10: '🕵️', // Аналитик
};

const AVATAR_ENTRIES = Object.entries(AVATAR_MAP).map(([k, v]) => ({ id: Number(k), emoji: v }));

// Компонент звёздного рейтинга
interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}

const StarRating = ({ rating, onRatingChange, readonly = false }: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div className={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`${styles.star} ${star <= (hoverRating || rating) ? styles.starFilled : styles.starEmpty}`}
          onClick={() => !readonly && onRatingChange && onRatingChange(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
        >★</span>
      ))}
    </div>
  );
};

export default function CabinetPage() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const { user, isAuthenticated, logout, setUser } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<OrderStatusHistory[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<number, Review>>({});
  const [loading, setLoading] = useState(true);

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Аватар из БД (через user.avatar_id)
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(user?.avatar_id || 1);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Синхронизируем аватар с данными пользователя
  useEffect(() => {
    if (user?.avatar_id) setSelectedAvatarId(user.avatar_id);
  }, [user?.avatar_id]);

  const selectedAvatar = AVATAR_MAP[selectedAvatarId] || '👤';

  const handleAvatarSelect = async (id: number) => {
    setAvatarLoading(true);
    try {
      await authApi.updateAvatar(id);
      setSelectedAvatarId(id);
      if (user) setUser({ ...user, avatar_id: id });
    } catch (e) {
      // Если бэк не ответил — всё равно обновляем локально
      setSelectedAvatarId(id);
    } finally {
      setAvatarLoading(false);
      setShowAvatarPicker(false);
    }
  };

  // Модалка отзыва
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    setLoading(true);
    ordersApi.getAll()
      .then(async (data) => {
        setOrders(data || []);
        if (data.length > 0) setSelectedOrder(data[0]);

        const map: Record<number, Review> = {};
        try {
          const allReviews = await reviewsApi.getAll();
          allReviews.reviews.forEach((r: Review) => { map[r.order_id] = r; });
        } catch {}
        setReviewsMap(map);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!selectedOrder) return;
    ordersApi.getHistory(selectedOrder.id).then(setHistory).catch(() => setHistory([]));
  }, [selectedOrder]);

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

  const handleReviewClick = (order: Order) => {
    setReviewOrder(order);
    setReviewRating(0);
    setReviewComment('');
    setReviewError('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async () => {
    if (reviewRating === 0) { setReviewError('Пожалуйста, поставьте оценку'); return; }
    if (!reviewOrder) return;
    setReviewLoading(true);
    try {
      const review = await reviewsApi.create(reviewOrder.id, { rating: reviewRating, comment: reviewComment });
      setReviewsMap(prev => ({ ...prev, [reviewOrder.id]: review }));
      setShowReviewModal(false);
    } catch (e: any) {
      setReviewError(e.response?.data?.error || 'Ошибка при отправке отзыва');
    } finally {
      setReviewLoading(false);
    }
  };

  const getOrderStatusClass = (statusName: string) => {
    const map: Record<string, string> = {
      'Новая': styles.pending, 'Принята': styles.inProgress,
      'В процессе': styles.inProgress, 'Ожидание запчастей': styles.pending,
      'Готово': styles.completed, 'Выдан': styles.completed, 'Отменён': styles.cancelled,
    };
    return `${styles.orderStatus} ${map[statusName] || ''}`;
  };

  const isCompleted = (o: Order) => ['Готово', 'Выдан'].includes(o.status_name);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  const activeCount = (orders || []).filter(o => ['Новая','Принята','В процессе','Ожидание запчастей'].includes(o.status_name)).length;
  const completedCount = (orders || []).filter(o => isCompleted(o)).length;

  return (
    <div className={styles.page}>
      <header ref={headerRef} className={`${styles.header} ${showHeader ? styles.visible : ''}`}
        onMouseEnter={() => setShowHeader(true)}>
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
                <button className={styles.logoutTextBtn} onClick={() => { logout(); navigate('/'); }}>Выйти</button>
              )}
              <div className={styles.profile} onClick={() => navigate('/cabinet')}>
                <span className={styles.profileEmojiAuth}>{selectedAvatar}</span>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <div className={styles.cabinet}>
        <div className={styles.profileHeader}>
          {/* Аватар с пикером */}
          <div style={{ position: 'relative' }}>
            <div
              className={styles.profileAvatar}
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              style={{ cursor: 'pointer' }}
              title="Нажмите для смены аватара"
            >
              {selectedAvatar}
              <span className={styles.avatarEditBadge}>✏️</span>
            </div>

            {showAvatarPicker && (
              <div className={styles.avatarPicker}>
                <div className={styles.avatarPickerTitle}>Выберите аватар:</div>
                <div className={styles.avatarGrid}>
                  {AVATAR_ENTRIES.map(({ id, emoji }) => (
                    <button
                      key={id}
                      className={`${styles.avatarOption} ${selectedAvatarId === id ? styles.avatarOptionSelected : ''}`}
                      onClick={() => handleAvatarSelect(id)}
                      disabled={avatarLoading}
                      title={`Аватар ${id}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <h1 className={styles.profileTitle}>ПРОФИЛЬ</h1>
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.infoCard}>
            <h2 className={styles.infoTitle}>Личные данные</h2>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Ф.И.:</span>
              <span className={styles.infoValue}>{user?.first_name} {user?.last_name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{user?.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Телефон:</span>
              <span className={styles.infoValue}>{user?.phone}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Дата регистрации:</span>
              <span className={styles.infoValue}>{user?.created_at ? formatDate(user.created_at) : '—'}</span>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h2 className={styles.infoTitle}>Статистика</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{orders.length}</span>
                <span className={styles.statLabel}>Всего ремонтов</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{activeCount}</span>
                <span className={styles.statLabel}>В работе</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{completedCount}</span>
                <span className={styles.statLabel}>Завершено</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Загрузка заказов...</div>
        ) : (
          <div className={styles.mainContent}>
            {/* ЛЕВАЯ КОЛОНКА — История заказов */}
            <div className={styles.leftColumn}>
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>
                  История заказов
                  {orders.length > 0 && (
                    <span className={styles.ordersCount}>{orders.length}</span>
                  )}
                </h2>
                {orders.length === 0 ? (
                  <p style={{ padding: '1rem', color: '#888' }}>У вас пока нет заказов</p>
                ) : (
                  <ul className={styles.ordersList}>
                    {orders.map(order => (
                      <li key={order.id}
                        className={`${styles.orderItem} ${selectedOrder?.id === order.id ? styles.selected : ''}`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className={styles.orderInfo}>
                          <span className={styles.orderName}>
                            <span className={styles.orderIcon}>🔧</span>
                            {order.category_name || order.custom_device_name || 'Устройство'}
                          </span>
                          <span className={getOrderStatusClass(order.status_name)}
                            style={{ color: order.color_code, borderColor: order.color_code }}>
                            {order.status_name}
                          </span>
                        </div>
                        {isCompleted(order) && (
                          <div className={styles.orderReview}>
                            {reviewsMap[order.id] ? (
                              <div className={styles.reviewStars}>
                                <StarRating rating={reviewsMap[order.id].rating} readonly />
                              </div>
                            ) : (
                              <button className={styles.reviewBtn}
                                onClick={(e) => { e.stopPropagation(); handleReviewClick(order); }}>
                                Оцените ремонт
                              </button>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* ПРАВАЯ КОЛОНКА — Детали + История статусов */}
            <div className={styles.rightColumn}>
              {selectedOrder && (
                <>
                  <div className={styles.sectionCard}>
                    <h2 className={styles.sectionTitle}>Детали заказа #{selectedOrder.id}</h2>
                    <div className={styles.orderDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Устройство:</span>
                        <span className={styles.detailValue}>
                          {selectedOrder.category_name || selectedOrder.custom_device_name || '—'}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Проблема:</span>
                        <span className={styles.detailValue}>{selectedOrder.problem_description}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Дата визита:</span>
                        <span className={styles.detailValue}>
                          {selectedOrder.appointment_date} в {selectedOrder.appointment_time}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Стоимость:</span>
                        <span className={styles.detailPrice}>
                          {selectedOrder.final_price ? `${selectedOrder.final_price} ₽` : 'Уточняется'}
                        </span>
                      </div>
                      {reviewsMap[selectedOrder.id] && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Ваш отзыв:</span>
                          <div className={styles.detailReview}>
                            <StarRating rating={reviewsMap[selectedOrder.id].rating} readonly />
                            <p className={styles.reviewText}>{reviewsMap[selectedOrder.id].comment}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.sectionCard}>
                    <h2 className={styles.sectionTitle}>История статусов</h2>
                    <div className={styles.statusList}>
                      {history.length === 0 ? (
                        <p style={{ color: '#888' }}>Нет данных</p>
                      ) : (
                        history.map((h) => (
                          <div key={h.id} className={styles.statusItem}>
                            <div className={styles.statusDot} />
                            <div>
                              <span className={styles.statusText}>{h.status_name}</span>
                              <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: '0.5rem' }}>
                                {new Date(h.changed_at).toLocaleString('ru-RU')}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно отзыва */}
      {showReviewModal && (
        <div className={styles.modalOverlay} onClick={() => setShowReviewModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Оцените ремонт</h2>
            <p className={styles.modalSubtitle}>
              {reviewOrder?.category_name || reviewOrder?.custom_device_name || 'Устройство'}
            </p>

            <div className={styles.modalRating}>
              <span className={styles.ratingLabel}>Ваша оценка:</span>
              <StarRating rating={reviewRating} onRatingChange={setReviewRating} />
            </div>

            <div className={styles.modalComment}>
              <label className={styles.commentLabel}>Комментарий (необязательно)</label>
              <textarea className={styles.commentInput} rows={4} value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Расскажите о качестве ремонта..." />
            </div>

            {reviewError && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{reviewError}</div>}

            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={() => setShowReviewModal(false)}>Отмена</button>
              <button className={styles.submitReviewBtn} onClick={handleReviewSubmit} disabled={reviewLoading}>
                {reviewLoading ? 'Отправка...' : 'Отправить отзыв'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}