import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../components/CabinetPage.module.css';

const topNav = [
  { id: 'main', label: 'Главная' },
  { id: 'about', label: 'О себе' },
  { id: 'services', label: 'Услуги' },
  { id: 'contacts', label: 'Контакты' },
  { id: 'reviews', label: 'Отзывы' },
];

const isAuthenticated = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

const getUserData = () => {
  return {
    name: localStorage.getItem('userName') || sessionStorage.getItem('userName') || 'Иванов Иван Иванович',
    registerDate: localStorage.getItem('userRegisterDate') || sessionStorage.getItem('userRegisterDate') || '15 марта 2024',
    email: localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || 'ivanov@example.com',
    phone: localStorage.getItem('userPhone') || sessionStorage.getItem('userPhone') || '+7 (999) 123-45-67',
    avatar: localStorage.getItem('userAvatar') || sessionStorage.getItem('userAvatar') || '👤',
  };
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

// Обновленная история заказов с полем reviewed
const ordersHistory = [
  { 
    id: 1, 
    name: 'Телефон', 
    icon: '📱', 
    status: 'Завершен',
    reviewed: true,
    rating: 5,
    reviewComment: 'Отличный ремонт, всё быстро и качественно!',
    reviewDate: '15.03.2024',
    details: {
      device: 'iPhone 12',
      problem: 'Разбит экран',
      master: 'Иванов А.С.',
      price: 8500,
      date: '15.03.2024',
      comment: 'Требуется замена дисплея'
    }
  },
  { 
    id: 2, 
    name: 'Микроволновка', 
    icon: '🔥', 
    status: 'Завершен',
    reviewed: false,
    rating: 0,
    details: {
      device: 'Samsung MW350',
      problem: 'Не греет',
      master: 'Петров В.В.',
      price: 5000,
      date: '14.03.2024',
      comment: 'Замена магнетрона'
    }
  },
  { 
    id: 3, 
    name: 'Утюг', 
    icon: '👕', 
    status: 'В ремонте',
    reviewed: false,
    rating: 0,
    details: {
      device: 'Philips Azur',
      problem: 'Не включается',
      master: 'Сидоров К.М.',
      price: 3000,
      date: '13.03.2024',
      comment: 'Диагностика'
    }
  },
  { 
    id: 4, 
    name: 'Ноутбук', 
    icon: '💻', 
    status: 'Завершен',
    reviewed: true,
    rating: 4,
    reviewComment: 'Хорошо, но долго ждал запчасти',
    reviewDate: '10.03.2024',
    details: {
      device: 'Lenovo IdeaPad',
      problem: 'Не заряжается',
      master: 'Иванов А.С.',
      price: 4500,
      date: '10.03.2024',
      comment: 'Заменен разъем питания'
    }
  },
  { 
    id: 5, 
    name: 'Планшет', 
    icon: '📱', 
    status: 'Завершен',
    reviewed: false,
    rating: 0,
    details: {
      device: 'iPad Air',
      problem: 'Треснуло стекло',
      master: 'Петров В.В.',
      price: 6000,
      date: '08.03.2024',
      comment: 'Замена стекла'
    }
  },
];

const repairStatuses = [
  { id: 1, name: 'Заказ создан', status: 'created' },
  { id: 2, name: 'В процессе ремонта', status: 'inProgress' },
  { id: 3, name: 'Завершен', status: 'completed' },
];

// Типы для пропсов StarRating
interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}

// Компонент звездного рейтинга
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
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default function CabinetPage() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  
  const [selectedOrder, setSelectedOrder] = useState(ordersHistory[0]);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<File[]>([]);
  const [orders, setOrders] = useState(ordersHistory);
  
  const userData = getUserData();
  const profileEmoji = getProfileEmoji();

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
    if (!isAuthenticated()) {
      navigate('/auth');
    }
  }, [navigate]);

  const handleNavClick = (itemId: string) => {
    setShowHeader(true);
    
    switch(itemId) {
      case 'main':
        navigate('/', { state: { scrollTo: 'main' } });
        break;
      case 'about':
        navigate('/', { state: { scrollTo: 'about' } });
        break;
      case 'services':
        navigate('/', { state: { scrollTo: 'services' } });
        break;
      case 'contacts':
        navigate('/', { state: { scrollTo: 'contacts' } });
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
  };

  const handleReviewClick = (order: any) => {
    setReviewOrder(order);
    setReviewRating(0);
    setReviewComment('');
    setReviewPhotos([]);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = () => {
    if (reviewRating === 0) {
      alert('Пожалуйста, поставьте оценку');
      return;
    }

    // Здесь будет отправка на сервер
    console.log({
      orderId: reviewOrder.id,
      rating: reviewRating,
      comment: reviewComment,
      photos: reviewPhotos,
    });

    // Обновляем локально (для демо)
    const updatedOrders = orders.map(order => 
      order.id === reviewOrder.id 
        ? { 
            ...order, 
            reviewed: true, 
            rating: reviewRating, 
            reviewComment, 
            reviewDate: new Date().toLocaleDateString('ru-RU') 
          }
        : order
    );
    setOrders(updatedOrders);

    setShowReviewModal(false);
    setReviewOrder(null);
  };

  const handleReviewPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReviewPhotos([...reviewPhotos, ...Array.from(e.target.files)]);
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'created': return styles.created;
      case 'inProgress': return styles.inProgress;
      case 'completed': return styles.completed;
      default: return '';
    }
  };

  const getOrderStatusClass = (status: string) => {
    switch(status) {
      case 'Ожидает оценки': return `${styles.orderStatus} ${styles.pending}`;
      case 'В ремонте': return `${styles.orderStatus} ${styles.inProgress}`;
      case 'Завершен': return `${styles.orderStatus} ${styles.completed}`;
      default: return styles.orderStatus;
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

      <div className={styles.cabinet}>
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>{profileEmoji}</div>
          <h1 className={styles.profileTitle}>ПРОФИЛЬ</h1>
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.infoCard}>
            <h2 className={styles.infoTitle}>Личные данные</h2>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Ф.И.:</span>
              <span className={styles.infoValue}>{userData.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Дата регистрации:</span>
              <span className={styles.infoValue}>{userData.registerDate}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{userData.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Телефон:</span>
              <span className={styles.infoValue}>{userData.phone}</span>
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
                <span className={styles.statNumber}>{orders.filter(o => o.status === 'В ремонте' || o.status === 'Ожидает оценки').length}</span>
                <span className={styles.statLabel}>В работе</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{orders.filter(o => o.status === 'Завершен').length}</span>
                <span className={styles.statLabel}>Завершено</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.leftColumn}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>История заказов</h2>
              <ul className={styles.ordersList}>
                {orders.map(order => (
                  <li 
                    key={order.id} 
                    className={`${styles.orderItem} ${selectedOrder.id === order.id ? styles.selected : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className={styles.orderInfo}>
                      <span className={styles.orderName}>
                        <span className={styles.orderIcon}>{order.icon}</span>
                        {order.name}
                      </span>
                      <span className={getOrderStatusClass(order.status)}>
                        {order.status}
                      </span>
                    </div>
                    {order.status === 'Завершен' && (
                      <div className={styles.orderReview}>
                        {order.reviewed ? (
                          <div className={styles.reviewStars}>
                            <StarRating rating={order.rating || 0} readonly={true} />
                          </div>
                        ) : (
                          <button 
                            className={styles.reviewBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReviewClick(order);
                            }}
                          >
                            Оцените ремонт
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Детали заказа</h2>
              <div className={styles.orderDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Устройство:</span>
                  <span className={styles.detailValue}>{selectedOrder.details.device}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Проблема:</span>
                  <span className={styles.detailValue}>{selectedOrder.details.problem}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Мастер:</span>
                  <span className={styles.detailValue}>{selectedOrder.details.master}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Стоимость:</span>
                  <span className={styles.detailPrice}>{selectedOrder.details.price} ₽</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Дата:</span>
                  <span className={styles.detailValue}>{selectedOrder.details.date}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Комментарий:</span>
                  <span className={styles.detailComment}>{selectedOrder.details.comment}</span>
                </div>
                {selectedOrder.reviewed && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Ваш отзыв:</span>
                    <div className={styles.detailReview}>
                      <StarRating rating={selectedOrder.rating || 0} readonly={true} />
                      <p className={styles.reviewText}>{selectedOrder.reviewComment}</p>
                      <span className={styles.reviewDate}>{selectedOrder.reviewDate}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Статус ремонта</h2>
              <div className={styles.statusList}>
                {repairStatuses.map(status => (
                  <div 
                    key={status.id} 
                    className={`${styles.statusItem} ${getStatusClass(status.status)}`}
                  >
                    <div className={styles.statusDot} />
                    <span className={styles.statusText}>{status.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно для отзыва */}
      {showReviewModal && (
        <div className={styles.modalOverlay} onClick={() => setShowReviewModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Оцените ремонт</h2>
            <p className={styles.modalSubtitle}>{reviewOrder?.name} - {reviewOrder?.details.device}</p>
            
            <div className={styles.modalRating}>
              <span className={styles.ratingLabel}>Ваша оценка:</span>
              <StarRating rating={reviewRating} onRatingChange={setReviewRating} />
            </div>

            <div className={styles.modalComment}>
              <label className={styles.commentLabel}>Комментарий (необязательно)</label>
              <textarea
                className={styles.commentInput}
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Расскажите о качестве ремонта..."
              />
            </div>

            <div className={styles.modalPhoto}>
              <label className={styles.photoLabel}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleReviewPhotoUpload}
                  style={{ display: 'none' }}
                />
                <span className={styles.photoBtn}>📷 Прикрепить фото</span>
              </label>
              
              {reviewPhotos.length > 0 && (
                <div className={styles.photoList}>
                  {reviewPhotos.map((photo, index) => (
                    <div key={index} className={styles.photoItem}>
                      <span>📸 {photo.name}</span>
                      <button
                        className={styles.removePhoto}
                        onClick={() => setReviewPhotos(reviewPhotos.filter((_, i) => i !== index))}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={() => setShowReviewModal(false)}>
                Отмена
              </button>
              <button className={styles.submitReviewBtn} onClick={handleReviewSubmit}>
                Отправить отзыв
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}