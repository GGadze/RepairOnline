import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../components/CreateOrderPage.module.css';
import { categoriesApi, ordersApi, slotsApi } from '../services/api';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getAvatarEmoji } from '../utils/avatarUtils';
import type { Category, TimeSlot } from '../types';

const topNav = [
  { id: 'main', label: 'Главная' },
  { id: 'about', label: 'О себе' },
  { id: 'services', label: 'Услуги' },
  { id: 'contacts', label: 'Контакты' },
  { id: 'reviews', label: 'Отзывы' },
];

const CATEGORY_ICONS: Record<string, string> = {
  'Смартфоны': '📱', 'Ноутбуки': '💻', 'Планшеты': '📟',
  'Телевизоры': '📺', 'Бытовая техника': '🏠', 'Другое': '🔧',
};

interface ExtraService {
  id: number;
  name: string;
  description: string;
  price: number | string;
  type: 'percentage' | 'fixed' | 'free';
}

const DEFAULT_EXTRA_SERVICES: ExtraService[] = [
  { id: 101, name: 'Срочный ремонт', description: 'За 1 час (+20% от итоговой суммы)', price: '+20%', type: 'percentage' },
  { id: 102, name: 'Выезд мастера', description: 'На дом или в офис', price: 500, type: 'fixed' },
  { id: 103, name: 'Резервное копирование', description: 'Сохранение данных', price: 1000, type: 'fixed' },
  { id: 104, name: 'Настройка после ремонта', description: 'Полная настройка устройства', price: 0, type: 'free' },
];

// ================================================
// Вспомогательные функции для календаря
// ================================================

/** Сколько дней в месяце */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** День недели первого числа месяца (0=Пн..6=Вс) */
function firstDayOfMonth(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const { isAuthenticated, logout, user } = useAuthStore();

  // Аватар из store
  const avatarEmoji = isAuthenticated ? getAvatarEmoji(user?.avatar_id) : '👤';

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  // Шаг 1
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Category | null>(null);
  const [isCustomDevice, setIsCustomDevice] = useState(false);
  const [customDevice, setCustomDevice] = useState('');

  // Шаг 2
  const [problemDescription, setProblemDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);

  // Шаг 3
  const [services, setServices] = useState<Category[]>([]);
  const [selectedServices, setSelectedServices] = useState<Category[]>([]);

  // Шаг 4
  const [extraServices, setExtraServices] = useState<ExtraService[]>(DEFAULT_EXTRA_SERVICES);
  const [selectedExtraServices, setSelectedExtraServices] = useState<ExtraService[]>([]);

  // Шаг 5 — Календарь
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [availableDatesSet, setAvailableDatesSet] = useState<Set<string>>(new Set());
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [freeSlots, setFreeSlots] = useState<TimeSlot[]>([]);

  // Стоимость
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const cur = window.scrollY;
      if (cur < lastScrollY || cur < 10) setShowHeader(true);
      else if (cur > 100 && cur > lastScrollY) setShowHeader(false);
      setLastScrollY(cur);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const CATEGORY_ORDER = ['Смартфоны', 'Ноутбуки', 'Планшеты', 'Телевизоры', 'Бытовая техника', 'Другое'];

  useEffect(() => {
    categoriesApi.getAll().then((tree) => {
      const roots = tree.filter(c => c.parent_id === null);
      roots.sort((a, b) => {
        const ai = CATEGORY_ORDER.indexOf(a.name), bi = CATEGORY_ORDER.indexOf(b.name);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1; if (bi === -1) return -1;
        return ai - bi;
      });
      setCategories(roots);
    });
  }, []);

  useEffect(() => {
    api.get<ExtraService[]>('/extra-services')
      .then(r => { if (r.data?.length) setExtraServices(r.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    setSelectedSubCategory(null); setSelectedServices([]); setSelectedExtraServices([]);
    setServices([]); setTotalPrice(0);
    if (selectedCategory.name === 'Другое') {
      setIsCustomDevice(true); setSubCategories([]);
      setServices(selectedCategory.children || []);
    } else {
      setIsCustomDevice(false);
      setSubCategories(selectedCategory.children || []);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedSubCategory) return;
    setSelectedServices([]);
    setServices(selectedSubCategory.children || []);
  }, [selectedSubCategory]);

  // ======== РАСЧЁТ СТОИМОСТИ ========
  // Исправленная логика: срочный ремонт считается от ИТОГА (базовая + услуги + фикс. доп.услуги)
  useEffect(() => {
    const servicesTotal = selectedServices.reduce((s, c) => s + c.base_price, 0);
    let fixedExtra = 0;
    let hasUrgent = false;

    selectedExtraServices.forEach(s => {
      if (s.type === 'fixed') fixedExtra += Number(s.price);
      if (s.type === 'percentage') hasUrgent = true;
    });

    // Итог до процентной надбавки
    const baseTotal = servicesTotal + fixedExtra;
    // Срочный ремонт +20% от всего
    const result = hasUrgent ? Math.round(baseTotal * 1.2) : baseTotal;
    setTotalPrice(result);
  }, [selectedServices, selectedExtraServices, selectedSubCategory, selectedCategory]);

  // ======== ЗАГРУЗКА ДОСТУПНЫХ ДАТ ========
  // ВАЖНО: функция объявлена ДО useEffect который её вызывает
  const loadAvailableDates = async (year: number, month: number) => {
    setCalendarLoading(true);
    setAvailableDatesSet(new Set());

    const _today = new Date(); _today.setHours(0, 0, 0, 0);
    const _twoWeeks = new Date(_today); _twoWeeks.setDate(_today.getDate() + 13);

    const datesToCheck: string[] = [];
    for (let d = 1; d <= daysInMonth(year, month); d++) {
      const date = new Date(year, month, d);
      if (date >= _today && date <= _twoWeeks) {
        datesToCheck.push(toDateStr(year, month, d));
      }
    }

    console.log('[Calendar] Checking dates:', datesToCheck);

    if (datesToCheck.length === 0) {
      setCalendarLoading(false);
      return;
    }

    try {
      const results = await Promise.all(
        datesToCheck.map(ds => {
          const timeout = new Promise<TimeSlot[]>(res => setTimeout(() => res([]), 5000));
          const req = slotsApi.getFreeByDate(ds)
            .then(r => Array.isArray(r) ? r : [])
            .catch(() => [] as TimeSlot[]);
          return Promise.race([req, timeout]);
        })
      );
      const available = new Set<string>();
      results.forEach((slots, i) => {
        if (Array.isArray(slots) && slots.length > 0) available.add(datesToCheck[i]);
      });
      console.log('[Calendar] Available dates:', [...available]);
      setAvailableDatesSet(available);
    } catch (err) {
      console.error('[Calendar] Error:', err);
      setAvailableDatesSet(new Set());
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep !== 5) return;
    loadAvailableDates(calendarYear, calendarMonth);
  }, [currentStep, calendarYear, calendarMonth]);

  useEffect(() => {
    if (!selectedDate) return;
    setSelectedTime('');
    slotsApi.getFreeByDate(selectedDate).then(data => setFreeSlots(Array.isArray(data) ? data : [])).catch(() => setFreeSlots([]));
  }, [selectedDate]);

  // ======== ОГРАНИЧЕНИЯ КАЛЕНДАРЯ ========
  // Вычисляем один раз, не внутри render
  const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
  const twoWeeksLater = new Date(todayDate); twoWeeksLater.setDate(todayDate.getDate() + 13);

  const getDayStatus = (year: number, month: number, day: number): 'past' | 'available' | 'booked' | 'future' => {
    const d = new Date(year, month, day);
    if (d < todayDate) return 'past';
    if (d > twoWeeksLater) return 'future';
    const ds = toDateStr(year, month, day);
    // Пока грузим — показываем booked (серый), не available
    if (calendarLoading) return 'booked';
    return availableDatesSet.has(ds) ? 'available' : 'booked';
  };

  // Можно ли перейти на следующий месяц (если в 2-недельном окне есть дни следующего месяца)
  const canGoNextMonth = () => {
    const nextMonthStart = new Date(calendarYear, calendarMonth + 1, 1);
    return nextMonthStart <= twoWeeksLater;
  };

  // Можно ли вернуться на предыдущий месяц
  const canGoPrevMonth = () => {
    const thisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    const currentlyViewing = new Date(calendarYear, calendarMonth, 1);
    return currentlyViewing > thisMonth;
  };

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

  const handleServiceToggle = (s: Category) => {
    setSelectedServices(prev => prev.find(x => x.id === s.id) ? prev.filter(x => x.id !== s.id) : [...prev, s]);
  };

  const handleExtraToggle = (s: ExtraService) => {
    setSelectedExtraServices(prev => prev.find(x => x.id === s.id) ? prev.filter(x => x.id !== s.id) : [...prev, s]);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPhotos(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleSubmit = async () => {
    setSubmitError(''); setLoading(true);
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
      for (const file of photos) await ordersApi.uploadPhoto(order.id, file);
      navigate('/cabinet');
    } catch (e: any) {
      setSubmitError(e.response?.data?.error || 'Ошибка при создании заявки');
      setLoading(false);
    }
  };

  // ======== РЕНДЕР КАЛЕНДАРЯ ========
  const renderCalendar = () => {
    const totalDays = daysInMonth(calendarYear, calendarMonth);
    const firstDow = firstDayOfMonth(calendarYear, calendarMonth);
    const monthLabel = formatMonthLabel(calendarYear, calendarMonth);

    return (
      <div className={styles.calendar}>
        <div className={styles.calendarHeader}>
          <button
            className={styles.calendarNavBtn}
            onClick={() => {
              if (calendarMonth === 0) { setCalendarYear(y => y - 1); setCalendarMonth(11); }
              else setCalendarMonth(m => m - 1);
            }}
            disabled={!canGoPrevMonth()}
          >‹</button>
          <span className={styles.calendarMonth}>{monthLabel}</span>
          <button
            className={styles.calendarNavBtn}
            onClick={() => {
              if (calendarMonth === 11) { setCalendarYear(y => y + 1); setCalendarMonth(0); }
              else setCalendarMonth(m => m + 1);
            }}
            disabled={!canGoNextMonth()}
          >›</button>
        </div>

        <div className={styles.weekDays}>
          {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
            <div key={d} className={styles.weekDay}>{d}</div>
          ))}
        </div>

        <div className={styles.calendarGrid}>
          {/* Пустые ячейки */}
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`e-${i}`} className={styles.calendarEmpty} />
          ))}

          {/* Дни месяца */}
          {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
            const ds = toDateStr(calendarYear, calendarMonth, day);
            const status = getDayStatus(calendarYear, calendarMonth, day);
            const isSelected = selectedDate === ds;
            const isWeekend = ((firstDow + day - 1) % 7) >= 5;

            let cls = styles.calendarDay;
            if (status === 'past') cls += ` ${styles.past}`;
            else if (status === 'future') cls += ` ${styles.future}`;
            else if (status === 'booked') cls += ` ${styles.booked}`;
            else if (status === 'available') cls += ` ${styles.available}`;
            if (isSelected) cls += ` ${styles.selected}`;
            if (isWeekend && status !== 'past' && status !== 'future') cls += ` ${styles.weekend}`;

            return (
              <button
                key={day}
                className={cls}
                onClick={() => status === 'available' && setSelectedDate(ds)}
                disabled={status !== 'available'}
              >
                <span className={styles.dayNumber}>{day}</span>
              </button>
            );
          })}
        </div>

        {/* Легенда */}
        <div className={styles.calendarLegend}>
          {calendarLoading
            ? <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>⏳ Загружаем доступные даты...</span>
            : <>
                <span className={styles.legendItem}><span className={styles.legendDot} style={{ background: '#93c5fd' }} />Доступно</span>
                <span className={styles.legendItem}><span className={styles.legendDot} style={{ background: '#e2e8f0' }} />Недоступно</span>
              </>
          }
        </div>
      </div>
    );
  };

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
                <span className={styles.profileEmojiAuth}>{avatarEmoji}</span>
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
                  <button key={cat.id}
                    className={`${styles.deviceTypeBtn} ${selectedCategory?.id === cat.id ? styles.selected : ''}`}
                    onClick={() => setSelectedCategory(cat)}>
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
                      <button key={sub.id}
                        className={`${styles.brandBtn} ${selectedSubCategory?.id === sub.id ? styles.selected : ''}`}
                        onClick={() => setSelectedSubCategory(sub)}>
                        <span className={styles.brandName}>{sub.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {isCustomDevice && (
                <div className={styles.customDeviceSection}>
                  <h2 className={styles.stepTitle} style={{ marginTop: '2rem' }}>Опишите устройство</h2>
                  <input type="text" className={styles.input}
                    placeholder="Введите название устройства"
                    value={customDevice} onChange={(e) => setCustomDevice(e.target.value)} />
                </div>
              )}

              <div className={styles.stepButtons}>
                <button className={styles.nextBtn} onClick={() => setCurrentStep(2)}
                  disabled={!selectedCategory || (isCustomDevice && !customDevice)}>
                  Далее
                </button>
              </div>
            </div>
          )}

          {/* ШАГ 2 — Проблема */}
          {currentStep === 2 && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Опишите проблему</h2>

              {/* Статичный textarea со скроллом */}
              <textarea
                className={styles.textarea}
                placeholder="Подробно опишите, что случилось с устройством..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
              />

              <div className={styles.photoUpload}>
                <h3>Фотографии поломки (необязательно)</h3>
                <label className={styles.photoLabel}>
                  <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  <span className={styles.photoBtn}>📷 Загрузить фото</span>
                </label>
                {photos.length > 0 && (
                  <div className={styles.photoList}>
                    {photos.map((photo, index) => (
                      <div key={index} className={styles.photoItem}>
                        <span>📸 {photo.name}</span>
                        <button className={styles.removePhoto}
                          onClick={() => setPhotos(photos.filter((_, i) => i !== index))}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.stepButtons}>
                <button className={styles.prevBtn} onClick={() => setCurrentStep(1)}>Назад</button>
                <button className={styles.nextBtn} onClick={() => setCurrentStep(3)} disabled={!problemDescription}>Далее</button>
              </div>
            </div>
          )}

          {/* ШАГ 3 — Услуги */}
          {currentStep === 3 && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Выберите необходимые услуги</h2>
              {services.length === 0 ? (
                <p style={{ color: '#888', marginBottom: '2rem' }}>Услуги для данной категории не найдены</p>
              ) : (
                <div className={styles.servicesList}>
                  {services.map(service => (
                    <div key={service.id}
                      className={`${styles.serviceItem} ${selectedServices.find(s => s.id === service.id) ? styles.selected : ''}`}
                      onClick={() => handleServiceToggle(service)}>
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
                <button className={styles.nextBtn} onClick={() => setCurrentStep(4)}
                  disabled={selectedServices.length === 0}>Далее</button>
              </div>
            </div>
          )}

          {/* ШАГ 4 — Дополнительные услуги */}
          {currentStep === 4 && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Дополнительные услуги</h2>
              <div className={styles.extraServicesList}>
                {extraServices.map(service => (
                  <div key={service.id}
                    className={`${styles.extraServiceItem} ${selectedExtraServices.find(s => s.id === service.id) ? styles.selected : ''}`}
                    onClick={() => handleExtraToggle(service)}>
                    <div className={styles.extraServiceInfo}>
                      <span className={styles.extraServiceName}>{service.name}</span>
                      <span className={styles.extraServiceDesc}>{service.description}</span>
                    </div>
                    <div className={styles.extraServiceRight}>
                      <span className={styles.extraServicePrice}>
                        {service.type === 'free' ? 'Бесплатно'
                          : typeof service.price === 'number' ? `${service.price} ₽`
                          : service.price}
                      </span>
                      <div className={styles.serviceCheck}>
                        {selectedExtraServices.find(s => s.id === service.id) && '✓'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.totalPrice}>
                <span>Итоговая стоимость:</span>
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
              {renderCalendar()}

              {selectedDate && (
                <div className={styles.timeSection}>
                  <h3 className={styles.timeTitle}>
                    🕐 Доступное время —{' '}
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </h3>
                  {freeSlots.length === 0 ? (
                    <p className={styles.noSlots}>На эту дату нет свободных слотов.</p>
                  ) : (
                    <div className={styles.timeSlots}>
                      {freeSlots.map(slot => (
                        <button key={slot.id}
                          className={`${styles.timeSlot} ${selectedTime === slot.slot_time ? styles.timeSlotSelected : ''}`}
                          onClick={() => setSelectedTime(slot.slot_time)}>
                          {slot.slot_time.slice(0, 5)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className={styles.stepButtons}>
                <button className={styles.prevBtn} onClick={() => setCurrentStep(4)}>Назад</button>
                <button className={styles.nextBtn} onClick={() => setCurrentStep(6)}
                  disabled={!selectedDate || !selectedTime}>Далее</button>
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
                    {selectedServices.map(s => <p key={s.id}>{s.name} — {s.base_price} ₽</p>)}
                  </div>
                )}
                {selectedExtraServices.length > 0 && (
                  <div className={styles.confirmSection}>
                    <h3>Дополнительные услуги</h3>
                    {selectedExtraServices.map(s => (
                      <p key={s.id}>
                        {s.name} — {s.type === 'free' ? 'Бесплатно' : typeof s.price === 'number' ? `${s.price} ₽` : s.price}
                      </p>
                    ))}
                  </div>
                )}
                <div className={styles.confirmSection}>
                  <h3>Дата и время визита</h3>
                  <p>
                    {new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {' '}в {selectedTime.slice(0, 5)}
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