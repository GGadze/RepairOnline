import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../components/CreateOrderPage.module.css';
import { categoriesApi, ordersApi, slotsApi } from '../services/api';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Category, TimeSlot } from '../types';

const topNav = [
  { id: 'main', label: 'Главная' },
  { id: 'about', label: 'О себе' },
  { id: 'services', label: 'Услуги' },
  { id: 'contacts', label: 'Контакты' },
  { id: 'reviews', label: 'Отзывы' },
];

const CATEGORY_ICONS: Record<string, string> = {
  'Смартфоны': '📱',
  'Ноутбуки': '💻',
  'Планшеты': '📟',
  'Телевизоры': '📺',
  'Бытовая техника': '🏠',
  'Другое': '🔧',
};

// Дополнительные услуги (временные, пока не пришли с бэка)
interface ExtraService {
  id: number;
  name: string;
  description: string;
  price: number | string;
  type: 'percentage' | 'fixed' | 'free';
}

const DEFAULT_EXTRA_SERVICES: ExtraService[] = [
  { id: 101, name: 'Срочный ремонт', description: 'За 1 час', price: '+20%', type: 'percentage' },
  { id: 102, name: 'Выезд мастера', description: 'На дом или в офис', price: 500, type: 'fixed' },
  { id: 103, name: 'Резервное копирование', description: 'Сохранение данных', price: 1000, type: 'fixed' },
  { id: 104, name: 'Настройка после ремонта', description: 'Полная настройка устройства', price: 0, type: 'free' },
];

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const { isAuthenticated, logout } = useAuthStore();

  const avatar = localStorage.getItem('user-avatar') || '👤';

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  // Шаг 1 — устройство
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Category | null>(null);
  const [isCustomDevice, setIsCustomDevice] = useState(false);
  const [customDevice, setCustomDevice] = useState('');

  // Шаг 2 — проблема
  const [problemDescription, setProblemDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);

  // Шаг 3 — услуги
  const [services, setServices] = useState<Category[]>([]);
  const [selectedServices, setSelectedServices] = useState<Category[]>([]);

  // Шаг 4 — дополнительные услуги
  const [selectedExtraServices, setSelectedExtraServices] = useState<ExtraService[]>([]);

  const [extraServices, setExtraServices] = useState<ExtraService[]>(DEFAULT_EXTRA_SERVICES);

  // Шаг 5 — время
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [freeSlots, setFreeSlots] = useState<TimeSlot[]>([]);
  const [calendarDays, setCalendarDays] = useState<{ date: number; dateStr: string; dayOfWeek: string; isPast: boolean; month: number; year: number; monthLabel: string }[]>([]);

  // Общая стоимость
  const [totalPrice, setTotalPrice] = useState(0);

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

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

  const CATEGORY_ORDER = ['Смартфоны', 'Ноутбуки', 'Планшеты', 'Телевизоры', 'Бытовая техника', 'Другое'];

  useEffect(() => {
    categoriesApi.getAll().then((tree) => {
      const roots = tree.filter(c => c.parent_id === null);
      roots.sort((a, b) => {
        const ai = CATEGORY_ORDER.indexOf(a.name);
        const bi = CATEGORY_ORDER.indexOf(b.name);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
      setCategories(roots);
    });
  }, []);

  // Загружаем доп. услуги с бэка; если эндпоинта нет — используем дефолтный список
  useEffect(() => {
    api.get<ExtraService[]>('/extra-services')
      .then(r => { if (r.data && r.data.length > 0) setExtraServices(r.data); })
      .catch(() => { /* бэк не поддерживает, оставляем DEFAULT_EXTRA_SERVICES */ });
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    setSelectedSubCategory(null);
    setSelectedServices([]);
    setSelectedExtraServices([]);
    setServices([]); // сбрасываем услуги при смене категории
    setTotalPrice(0); // сбрасываем цену
    if (selectedCategory.name === 'Другое') {
      setIsCustomDevice(true);
      setSubCategories([]);
      // Для «Другое» услуги могут прийти как children или быть пустыми
      const children = selectedCategory.children || [];
      setServices(children);
    } else {
      setIsCustomDevice(false);
      setSubCategories(selectedCategory.children || []);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedSubCategory) return;
    setSelectedServices([]); // сбрасываем выбранные услуги при смене подкатегории
    setServices(selectedSubCategory.children || []);
  }, [selectedSubCategory]);

  useEffect(() => {
    // Расчет стоимости
    let base = selectedSubCategory?.base_price || selectedCategory?.base_price || 0;
    let servicesTotal = selectedServices.reduce((sum, s) => sum + s.base_price, 0);
    let extraTotal = 0;
    
    let percentageMultiplier = 1;
    selectedExtraServices.forEach(service => {
      if (service.type === 'percentage') {
        // Срочный ремонт +20% применяем ко всей сумме (базовая + услуги)
        percentageMultiplier *= 1.2;
      } else if (service.type === 'fixed') {
        extraTotal += Number(service.price);
      }
      // Бесплатные игнорируем
    });
    
    setTotalPrice(Math.round((base + servicesTotal) * percentageMultiplier + extraTotal));
  }, [selectedServices, selectedExtraServices, selectedSubCategory, selectedCategory]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 13); // 14 дней включительно
    const days = [];
    for (let d = new Date(today); d <= twoWeeksLater; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = d.getMonth();
      const day = d.getDate();
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const monthLabel = new Date(d).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      days.push({ 
        date: day, 
        dateStr, 
        dayOfWeek: new Date(d).toLocaleDateString('ru-RU', { weekday: 'short' }), 
        isPast: false,
        month,
        year,
        monthLabel,
      });
    }
    setCalendarDays(days);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setSelectedTime('');
    slotsApi.getFreeByDate(selectedDate).then(data => setFreeSlots(data || [])).catch(() => setFreeSlots([]));
  }, [selectedDate]);

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

  const handleServiceToggle = (service: Category) => {
    setSelectedServices(prev =>
      prev.find(s => s.id === service.id) ? prev.filter(s => s.id !== service.id) : [...prev, service]
    );
  };

  const handleExtraServiceToggle = (service: ExtraService) => {
    setSelectedExtraServices(prev =>
      prev.find(s => s.id === service.id) ? prev.filter(s => s.id !== service.id) : [...prev, service]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPhotos(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleSubmit = async () => {
    setSubmitError('');
    setLoading(true);
    try {
      const categoryId = selectedSubCategory?.id ?? selectedCategory?.id ?? null;
      const order = await ordersApi.create({
        category_id: isCustomDevice ? null : categoryId,
        custom_device_name: isCustomDevice ? customDevice : null,
        problem_description: problemDescription,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        is_custom_device: isCustomDevice,
      });
      for (const file of photos) {
        await ordersApi.uploadPhoto(order.id, file);
      }
      navigate('/cabinet');
    } catch (e: any) {
      setSubmitError(e.response?.data?.error || 'Ошибка при создании заявки');
      setLoading(false);
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
              <button key={item.id} className={styles.topBtn} onClick={() => handleNavClick(item.id)}>
                {item.label}
              </button>
            ))}
            <button className={styles.orderHeaderBtn} onClick={() => navigate('/create-order')}>
              Оформить заказ
            </button>
            <div className={styles.profileSection}>
              {isAuthenticated && (
                <button className={styles.logoutTextBtn} onClick={() => { logout(); navigate('/'); }}>
                  Выйти
                </button>
              )}
              <div className={styles.profile} onClick={() => navigate('/cabinet')}>
                <span className={styles.profileEmojiAuth}>{avatar}</span>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <div className={styles.createOrder}>
        <h1 className={styles.pageTitle}>ОФОРМЛЕНИЕ ЗАЯВКИ</h1>

        <div className={styles.progressBar}>
          {['Устройство', 'Проблема', 'Услуги', 'Доп. услуги', 'Время', 'Подтверждение'].map((label, i) => (
            <div key={label} className={`${styles.progressStep} ${currentStep >= i + 1 ? styles.active : ''}`}>
              <span className={styles.stepNumber}>{i + 1}</span>
              <span className={styles.stepLabel}>{label}</span>
            </div>
          ))}
        </div>

        <div className={styles.formContainer}>
          {/* ШАГ 1 — Устройство */}
          {currentStep === 1 && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Выберите тип устройства</h2>
              <div className={styles.deviceTypes}>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`${styles.deviceTypeBtn} ${selectedCategory?.id === cat.id ? styles.selected : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span className={styles.deviceIcon}>{CATEGORY_ICONS[cat.name] || '🔧'}</span>
                    <span className={styles.deviceName}>{cat.name}</span>
                  </button>
                ))}
              </div>

              {subCategories.length > 0 && (
                <>
                  <h2 className={styles.stepTitle} style={{ marginTop: '2rem' }}>Уточните устройство</h2>
                  <div className={styles.brandsGrid}>
                    {subCategories.map(sub => (
                      <button
                        key={sub.id}
                        className={`${styles.brandBtn} ${selectedSubCategory?.id === sub.id ? styles.selected : ''}`}
                        onClick={() => setSelectedSubCategory(sub)}
                      >
                        <span className={styles.brandName}>{sub.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {isCustomDevice && (
                <div className={styles.customDeviceSection}>
                  <h2 className={styles.stepTitle} style={{ marginTop: '2rem' }}>Опишите устройство</h2>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Введите название устройства"
                    value={customDevice}
                    onChange={(e) => setCustomDevice(e.target.value)}
                  />
                </div>
              )}

              <div className={styles.stepButtons}>
                <button
                  className={styles.nextBtn}
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedCategory || (isCustomDevice && !customDevice)}
                >
                  Далее
                </button>
              </div>
            </div>
          )}

          {/* ШАГ 2 — Проблема */}
          {currentStep === 2 && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Опишите проблему</h2>
              <textarea
                className={styles.textarea}
                rows={5}
                placeholder="Подробно опишите, что случилось с устройством..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
              />
              <div className={styles.photoUpload}>
                <h3>Фотографии поломки (необязательно)</h3>
                <label className={styles.photoLabel}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                  <span className={styles.photoBtn}>📷 Загрузить фото</span>
                </label>
                {photos.length > 0 && (
                  <div className={styles.photoList}>
                    {photos.map((photo, index) => (
                      <div key={index} className={styles.photoItem}>
                        <span>📸 {photo.name}</span>
                        <button
                          className={styles.removePhoto}
                          onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.stepButtons}>
                <button className={styles.prevBtn} onClick={() => setCurrentStep(1)}>Назад</button>
                <button
                  className={styles.nextBtn}
                  onClick={() => setCurrentStep(3)}
                  disabled={!problemDescription}
                >
                  Далее
                </button>
              </div>
            </div>
          )}

          {/* ШАГ 3 — Услуги */}
          {currentStep === 3 && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Выберите необходимые услуги</h2>
              {services.length === 0 ? (
                <p style={{ color: '#888' }}>Услуги для данной категории не найдены</p>
              ) : (
                <div className={styles.servicesList}>
                  {services.map(service => (
                    <div
                      key={service.id}
                      className={`${styles.serviceItem} ${selectedServices.find(s => s.id === service.id) ? styles.selected : ''}`}
                      onClick={() => handleServiceToggle(service)}
                    >
                      <div className={styles.serviceInfo}>
                        <span className={styles.serviceName}>{service.name}</span>
                        <span className={styles.servicePrice}>{service.base_price} ₽</span>
                      </div>
                      <div className={styles.serviceCheck}>
                        {selectedServices.find(s => s.id === service.id) && '✓'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.totalPrice}>
                <span>Текущая стоимость:</span>
                <span className={styles.price}>{totalPrice} ₽</span>
              </div>
              <div className={styles.stepButtons}>
                <button className={styles.prevBtn} onClick={() => setCurrentStep(2)}>Назад</button>
                <button className={styles.nextBtn} onClick={() => setCurrentStep(4)} disabled={selectedServices.length === 0}>Далее</button>
              </div>
            </div>
          )}

          {/* ШАГ 4 — Дополнительные услуги */}
          {currentStep === 4 && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Дополнительные услуги</h2>
              <div className={styles.extraServicesList}>
                {extraServices.map(service => (
                  <div
                    key={service.id}
                    className={`${styles.extraServiceItem} ${selectedExtraServices.find(s => s.id === service.id) ? styles.selected : ''}`}
                    onClick={() => handleExtraServiceToggle(service)}
                  >
                    <div className={styles.extraServiceInfo}>
                      <span className={styles.extraServiceName}>{service.name}</span>
                      <span className={styles.extraServiceDesc}>{service.description}</span>
                    </div>
                    <div className={styles.extraServiceRight}>
                      <span className={styles.extraServicePrice}>
                        {typeof service.price === 'number' ? `${service.price} ₽` : service.price}
                      </span>
                      <div className={styles.serviceCheck}>
                        {selectedExtraServices.find(s => s.id === service.id) && '✓'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.totalPrice}>
                <span>Текущая стоимость:</span>
                <span className={styles.price}>{totalPrice} ₽</span>
              </div>
              <div className={styles.stepButtons}>
                <button className={styles.prevBtn} onClick={() => setCurrentStep(3)}>Назад</button>
                <button className={styles.nextBtn} onClick={() => setCurrentStep(5)}>Далее</button>
              </div>
            </div>
          )}

          {/* ШАГ 5 — Время */}
          {currentStep === 5 && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Выберите удобную дату</h2>
              {/* Группируем дни по месяцам */}
              {(() => {
                const months: { label: string; key: string; days: typeof calendarDays }[] = [];
                calendarDays.forEach(day => {
                  const key = `${day.year}-${day.month}`;
                  const existing = months.find(m => m.key === key);
                  if (existing) existing.days.push(day);
                  else months.push({ label: day.monthLabel, key, days: [day] });
                });
                return months.map(({ label, key, days: mDays }) => {
                  // Определяем день недели первого дня месяца в нашем диапазоне
                  const firstDay = new Date(mDays[0].dateStr);
                  // 0=вс,1=пн,...6=сб → переводим в 0=пн,...6=вс
                  const dow = (firstDay.getDay() + 6) % 7;
                  return (
                    <div key={key} className={styles.calendar}>
                      <div className={styles.calendarHeader}>
                        <span className={styles.calendarMonth}>{label}</span>
                      </div>
                      <div className={styles.weekDays}>
                        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                          <div key={d} className={styles.weekDay}>{d}</div>
                        ))}
                      </div>
                      <div className={styles.calendarGrid}>
                        {/* Пустые ячейки для выравнивания первого дня */}
                        {Array.from({ length: dow }).map((_, i) => (
                          <div key={`empty-${i}`} className={styles.calendarEmpty} />
                        ))}
                        {mDays.map(day => (
                          <button
                            key={day.dateStr}
                            className={`${styles.calendarDay} ${styles.available} ${selectedDate === day.dateStr ? styles.selected : ''}`}
                            onClick={() => setSelectedDate(day.dateStr)}
                          >
                            <span className={styles.dayNumber}>{day.date}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}

              {selectedDate && (
                <div className={styles.timeSection}>
                  <h3 className={styles.timeTitle}>
                    🕐 Доступное время —{' '}
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </h3>
                  {freeSlots.length === 0 ? (
                    <p className={styles.noSlots}>На эту дату нет свободных слотов. Выберите другой день.</p>
                  ) : (
                    <div className={styles.timeSlots}>
                      {freeSlots.map(slot => (
                        <button
                          key={slot.id}
                          className={`${styles.timeSlot} ${selectedTime === slot.slot_time ? styles.timeSlotSelected : ''}`}
                          onClick={() => setSelectedTime(slot.slot_time)}
                        >
                          {slot.slot_time.slice(0, 5)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className={styles.stepButtons}>
                <button className={styles.prevBtn} onClick={() => setCurrentStep(4)}>Назад</button>
                <button
                  className={styles.nextBtn}
                  onClick={() => setCurrentStep(6)}
                  disabled={!selectedDate || !selectedTime}
                >
                  Далее
                </button>
              </div>
            </div>
          )}

          {/* ШАГ 6 — Подтверждение */}
          {currentStep === 6 && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Подтверждение заявки</h2>
              <div className={styles.confirmation}>
                <div className={styles.confirmSection}>
                  <h3>Устройство</h3>
                  <p>{isCustomDevice ? customDevice : (selectedSubCategory?.name || selectedCategory?.name)}</p>
                </div>
                <div className={styles.confirmSection}>
                  <h3>Проблема</h3>
                  <p>{problemDescription}</p>
                </div>
                {selectedServices.length > 0 && (
                  <div className={styles.confirmSection}>
                    <h3>Услуги</h3>
                    {selectedServices.map(s => (
                      <p key={s.id}>{s.name} — {s.base_price} ₽</p>
                    ))}
                  </div>
                )}
                {selectedExtraServices.length > 0 && (
                  <div className={styles.confirmSection}>
                    <h3>Дополнительные услуги</h3>
                    {selectedExtraServices.map(s => (
                      <p key={s.id}>
                        {s.name} — {typeof s.price === 'number' ? `${s.price} ₽` : s.price}
                      </p>
                    ))}
                  </div>
                )}
                <div className={styles.confirmSection}>
                  <h3>Дата и время визита</h3>
                  <p>
                    {new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}{' '}
                    в {selectedTime.slice(0, 5)}
                  </p>
                </div>
                <div className={styles.confirmTotal}>
                  <span>Итоговая стоимость:</span>
                  <span className={styles.finalPrice}>{totalPrice} ₽</span>
                </div>
              </div>
              {submitError && <div style={{ color: 'red', marginBottom: '1rem' }}>{submitError}</div>}
              <div className={styles.stepButtons}>
                <button className={styles.prevBtn} onClick={() => setCurrentStep(5)}>Назад</button>
                <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Отправка...' : 'Отправить заявку'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}