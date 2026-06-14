import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import styles from '../components/CabinetPage.module.css';
import { ordersApi, reviewsApi, authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Order, OrderStatusHistory, Review } from '../types';

// Компонент звёздного рейтинга — оставляем как у коллеги
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

const AVATAR_EMOJIS = ['👤','😊','😎','🤓','👩‍💻','👨‍💻','🧑‍🔧','👩‍🔧','🦸','🧑‍🎓','😺','🐶','🦊','🐼','🦁','🌟','🎮','🎯','🔧','⚡'];

export default function CabinetPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setUser } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<OrderStatusHistory[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<number, Review>>({});
  const [loading, setLoading] = useState(true);


  // Редактирование профиля
  const [editMode, setEditMode] = useState(false);
  const [editFirst, setEditFirst] = useState('');
  const [editLast,  setEditLast]  = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError,  setEditError]  = useState('');
  const [editOk,     setEditOk]     = useState(false);
  // Смена пароля
  const [passMode,    setPassMode]    = useState(false);
  const [passCurrent, setPassCurrent] = useState('');
  const [passNew,     setPassNew]     = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [passSaving,  setPassSaving]  = useState(false);
  const [passError,   setPassError]   = useState('');
  const [passOk,      setPassOk]      = useState(false);

  // Аватар
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem('user-avatar') || '👤';
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleAvatarSelect = (emoji: string) => {
    setSelectedAvatar(emoji);
    localStorage.setItem('user-avatar', emoji);
    setShowAvatarPicker(false);
    // Уведомляем шапку — она обновит аватар мгновенно
    window.dispatchEvent(new Event('avatar-changed'));
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

        // Загружаем отзывы для завершённых заказов
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




  const openEdit = () => {
    setEditFirst(user?.first_name || '');
    setEditLast(user?.last_name || '');
    setEditPhone(user?.phone || '');
    setEditEmail(user?.email || '');
    setEditError(''); setEditOk(false);
    setEditMode(true);
  };

  const saveProfile = async () => {
    setEditSaving(true); setEditError(''); setEditOk(false);
    try {
      const updated = await authApi.updateProfile({ first_name: editFirst, last_name: editLast, phone: editPhone, email: editEmail });
      setUser(updated);
      setEditOk(true); setEditMode(false);
    } catch (e: any) {
      setEditError(e.response?.data?.error || 'Ошибка сохранения');
    } finally { setEditSaving(false); }
  };

  const savePassword = async () => {
    if (passNew !== passConfirm) { setPassError('Пароли не совпадают'); return; }
    if (passNew.length < 6) { setPassError('Минимум 6 символов'); return; }
    setPassSaving(true); setPassError(''); setPassOk(false);
    try {
      await authApi.changePassword({ current_password: passCurrent, new_password: passNew });
      setPassOk(true); setPassMode(false);
      setPassCurrent(''); setPassNew(''); setPassConfirm('');
    } catch (e: any) {
      setPassError(e.response?.data?.error || 'Неверный текущий пароль');
    } finally { setPassSaving(false); }
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

  // const getOrderStatusClass = (statusName: string) => {
  //   const map: Record<string, string> = {
  //     'Новая': styles.pending, 'Принята': styles.inProgress,
  //     'В процессе': styles.inProgress, 'Ожидание запчастей': styles.pending,
  //     'Готово': styles.completed, 'Выдан': styles.completed, 'Отменён': styles.cancelled,
  //   };
  //   return `${styles.orderStatus} ${map[statusName] || ''}`;
  // };

  const isCompleted = (o: Order) => ['Готово', 'Выдан'].includes(o.status_name);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  const activeCount = (orders || []).filter(o => ['Новая','Принята','В процессе','Ожидание запчастей'].includes(o.status_name)).length;
  const completedCount = (orders || []).filter(o => isCompleted(o)).length;

  return (
    <div className={styles.page}>
      <SiteHeader alwaysVisible />

      <div className={styles.layout}>

        {/* ── ЛЕВАЯ КОЛОНКА ── */}
        <aside className={styles.sidebar}>

          {/* Профиль */}
          <div className={styles.profileCard}>
            <div className={styles.profileTop}>
              <div className={styles.avatarWrap} onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
                <span className={styles.avatarEmoji}>{selectedAvatar}</span>
                <span className={styles.avatarEdit}>✏</span>
              </div>
              {showAvatarPicker && (
                <div className={styles.avatarPicker}>
                  <div className={styles.avatarPickerTitle}>Выберите аватар</div>
                  <div className={styles.avatarGrid}>
                    {AVATAR_EMOJIS.map(emoji => (
                      <button key={emoji} onClick={() => handleAvatarSelect(emoji)}
                        className={`${styles.avatarOpt} ${selectedAvatar === emoji ? styles.avatarOptActive : ''}`}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className={styles.profileMeta}>
                <div className={styles.profileName}>{user?.first_name} {user?.last_name}</div>
                <div className={styles.profileEmail}>{user?.email}</div>
              </div>
            </div>

            <div className={styles.profileDetails}>
              {[
                { label: 'Телефон', val: user?.phone || '—' },
                { label: 'Email', val: user?.email || '—' },
                { label: 'Дата регистрации', val: user?.created_at ? formatDate(user.created_at) : '—' },
              ].map(row => (
                <div key={row.label} className={styles.profileRow}>
                  <span className={styles.profileRowLabel}>{row.label}</span>
                  <span className={styles.profileRowVal}>{row.val}</span>
                </div>
              ))}
            </div>
            {editOk && <div className={styles.editSuccess}>Данные сохранены</div>}
            {passOk && <div className={styles.editSuccess}>Пароль изменён</div>}
            <div className={styles.profileActions}>
              <button className={styles.editBtn} onClick={openEdit}>Редактировать профиль</button>
              <button className={styles.editBtnSecondary} onClick={() => { setPassMode(true); setPassError(''); setPassOk(false); }}>Сменить пароль</button>
            </div>
          </div>

          {/* Статистика */}
          <div className={styles.statsRow}>
            {[
              { n: orders.length, label: 'Всего' },
              { n: activeCount,   label: 'В работе' },
              { n: completedCount,label: 'Завершено' },
            ].map(s => (
              <div key={s.label} className={styles.statBox}>
                <span className={styles.statN}>{s.n}</span>
                <span className={styles.statL}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* История заказов */}
          <div className={styles.ordersCard}>
            <div className={styles.ordersCardHead}>История заказов</div>
            {loading ? (
              <div className={styles.ordersEmpty}>Загрузка...</div>
            ) : orders.length === 0 ? (
              <div className={styles.ordersEmpty}>Заказов пока нет</div>
            ) : (
              <ul className={styles.ordersList}>
                {orders.map(order => (
                  <li key={order.id}
                    className={`${styles.orderItem} ${selectedOrder?.id === order.id ? styles.orderItemActive : ''}`}
                    onClick={() => setSelectedOrder(order)}>
                    <div className={styles.orderItemInner}>
                      <span className={styles.orderItemName}>
                        {order.category_name || order.custom_device_name || 'Устройство'}
                      </span>
                      <span className={styles.orderItemStatus}
                        style={{ color: order.color_code || '#94a3b8' }}>
                        {order.status_name}
                      </span>
                    </div>
                    {isCompleted(order) && (
                      <div className={styles.orderItemMeta}>
                        {reviewsMap[order.id] ? (
                          <span className={styles.orderItemRated}>★ Оценён</span>
                        ) : (
                          <button className={styles.orderItemReviewBtn}
                            onClick={e => { e.stopPropagation(); handleReviewClick(order); }}>
                            Оставить отзыв
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button className={styles.newOrderBtn} onClick={() => { window.scrollTo(0,0); navigate('/create-order'); }}>
            + Новая заявка
          </button>
        </aside>

        {/* ── ПРАВАЯ КОЛОНКА ── */}
        <main className={styles.main}>
          {!selectedOrder ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔧</div>
              <div className={styles.emptyTitle}>Выберите заказ</div>
              <div className={styles.emptyHint}>Нажмите на заказ из списка слева</div>
            </div>
          ) : (
            <>
              {/* Шапка заказа */}
              <div className={styles.orderHeader}>
                <div>
                  <div className={styles.orderHeaderLabel}>Заказ #{selectedOrder.id}</div>
                  <div className={styles.orderHeaderDevice}>
                    {selectedOrder.category_name || selectedOrder.custom_device_name || 'Устройство'}
                  </div>
                </div>
                <span className={styles.orderHeaderStatus} style={{ color: selectedOrder.color_code || '#94a3b8', borderColor: selectedOrder.color_code || '#94a3b8' }}>
                  {selectedOrder.status_name}
                </span>
              </div>

              {/* Детали */}
              <div className={styles.detailsCard}>
                <div className={styles.detailsGrid}>
                  {[
                    { label: 'Устройство', val: selectedOrder.category_name || selectedOrder.custom_device_name || '—' },
                    { label: 'Проблема', val: selectedOrder.problem_description },
                    { label: 'Дата визита', val: `${selectedOrder.appointment_date.split('T')[0]} в ${selectedOrder.appointment_time.slice(0,5)}` },
                    { label: 'Стоимость', val: selectedOrder.final_price ? `${selectedOrder.final_price.toLocaleString()} ₽` : 'Уточняется' },
                  ].map(row => (
                    <div key={row.label} className={styles.detailRow}>
                      <span className={styles.detailLabel}>{row.label}</span>
                      <span className={row.label === 'Стоимость' ? styles.detailPrice : styles.detailVal}>
                        {row.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Таймлайн статусов */}
              <div className={styles.timelineCard}>
                <div className={styles.timelineHead}>Статус ремонта</div>
                {history.length === 0 ? (
                  <div className={styles.timelineEmpty}>Нет данных</div>
                ) : (
                  <div className={styles.timeline}>
                    {history.map((h, i) => (
                      <div key={h.id} className={`${styles.timelineItem} ${i === history.length - 1 ? styles.timelineItemLast : ''}`}>
                        <div className={styles.timelineLine}>
                          <div className={styles.timelineDot} style={{ background: i === history.length - 1 ? '#f59e0b' : '#3b82f6' }} />
                          {i < history.length - 1 && <div className={styles.timelineTrack} />}
                        </div>
                        <div className={styles.timelineContent}>
                          <span className={styles.timelineStatus}>{h.status_name}</span>
                          <span className={styles.timelineDate}>
                            {new Date(h.changed_at).toLocaleString('ru-RU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Отзыв если есть */}
              {reviewsMap[selectedOrder.id] && (
                <div className={styles.reviewCard}>
                  <div className={styles.reviewCardHead}>Ваш отзыв</div>
                  <div className={styles.reviewStarsRow}>
                    <StarRating rating={reviewsMap[selectedOrder.id].rating} readonly />
                  </div>
                  {reviewsMap[selectedOrder.id].comment && (
                    <p className={styles.reviewCardText}>{reviewsMap[selectedOrder.id].comment}</p>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Модалка редактирования профиля */}
      {editMode && (
        <div className={styles.modalOverlay} onClick={() => setEditMode(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTitle}>Редактировать профиль</div>
            <div className={styles.editGrid}>
              <div className={styles.editField}>
                <label className={styles.editLabel}>Имя</label>
                <input className={styles.editInput} value={editFirst} onChange={e => setEditFirst(e.target.value)} placeholder="Имя" />
              </div>
              <div className={styles.editField}>
                <label className={styles.editLabel}>Фамилия</label>
                <input className={styles.editInput} value={editLast} onChange={e => setEditLast(e.target.value)} placeholder="Фамилия" />
              </div>
              <div className={styles.editField} style={{ gridColumn: '1/-1' }}>
                <label className={styles.editLabel}>Email</label>
                <input className={styles.editInput} type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <div className={styles.editField} style={{ gridColumn: '1/-1' }}>
                <label className={styles.editLabel}>Телефон</label>
                <input className={styles.editInput} value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+7 (999) 000-00-00" />
              </div>
            </div>
            {editError && <div className={styles.reviewError}>{editError}</div>}
            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={() => setEditMode(false)}>Отмена</button>
              <button className={styles.submitReviewBtn} onClick={saveProfile} disabled={editSaving}>
                {editSaving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка смены пароля */}
      {passMode && (
        <div className={styles.modalOverlay} onClick={() => setPassMode(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTitle}>Сменить пароль</div>
            <div className={styles.editGrid} style={{ gridTemplateColumns: '1fr' }}>
              <div className={styles.editField}>
                <label className={styles.editLabel}>Текущий пароль</label>
                <input className={styles.editInput} type="password" value={passCurrent} onChange={e => setPassCurrent(e.target.value)} placeholder="••••••" />
              </div>
              <div className={styles.editField}>
                <label className={styles.editLabel}>Новый пароль</label>
                <input className={styles.editInput} type="password" value={passNew} onChange={e => setPassNew(e.target.value)} placeholder="Минимум 6 символов" />
              </div>
              <div className={styles.editField}>
                <label className={styles.editLabel}>Повторите новый пароль</label>
                <input className={styles.editInput} type="password" value={passConfirm} onChange={e => setPassConfirm(e.target.value)} placeholder="Ещё раз" />
              </div>
            </div>
            {passError && <div className={styles.reviewError}>{passError}</div>}
            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={() => setPassMode(false)}>Отмена</button>
              <button className={styles.submitReviewBtn} onClick={savePassword} disabled={passSaving}>
                {passSaving ? 'Сохранение...' : 'Изменить пароль'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка отзыва */}
      {showReviewModal && (
        <div className={styles.modalOverlay} onClick={() => setShowReviewModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTitle}>Оценить ремонт</div>
            <div className={styles.modalDevice}>{reviewOrder?.category_name || reviewOrder?.custom_device_name}</div>
            <div className={styles.ratingLabel}>Оценка</div>
            <div className={styles.starsContainer}>
              <StarRating rating={reviewRating} onRatingChange={setReviewRating} />
            </div>
            <div className={styles.commentLabel}>Комментарий</div>
            <textarea className={styles.commentInput} rows={4}
              value={reviewComment} onChange={e => setReviewComment(e.target.value)}
              placeholder="Расскажите о качестве ремонта..." />
            {reviewError && <div className={styles.reviewError}>{reviewError}</div>}
            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={() => setShowReviewModal(false)}>Отмена</button>
              <button className={styles.submitReviewBtn} onClick={handleReviewSubmit} disabled={reviewLoading}>
                {reviewLoading ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}