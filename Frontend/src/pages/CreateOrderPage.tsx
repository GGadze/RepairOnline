import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../components/CreateOrderPage.module.css';

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

const getProfileEmoji = () => {
  const userAvatar = localStorage.getItem('userAvatar') || sessionStorage.getItem('userAvatar');
  return userAvatar || '👤';
};

const logout = () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/';
};

const deviceTypes = [
  { id: 1, name: 'Смартфоны', icon: '📱' },
  { id: 2, name: 'Ноутбуки', icon: '💻' },
  { id: 3, name: 'Планшеты', icon: '📱' },
  { id: 4, name: 'Телевизоры', icon: '📺' },
  { id: 5, name: 'Бытовая техника', icon: '🔧' },
  { id: 6, name: 'Другое', icon: '📦' },
];

const phoneBrands = [
  { id: 1, name: 'Apple', icon: '🍎'},
  { id: 2, name: 'Samsung', icon: '⭐'},
  { id: 3, name: 'Xiaomi', icon: '📱'},
];

const services = [
  { id: 1, name: 'Замена стекла', basePrice: 500, category: 'Смартфоны' },
  { id: 2, name: 'Замена аккумулятора', basePrice: 4000, category: 'Смартфоны' },
  { id: 3, name: 'Замена дисплея', basePrice: 8500, category: 'Смартфоны' },
  { id: 4, name: 'Ремонт разъема зарядки', basePrice: 2500, category: 'Смартфоны' },
  { id: 5, name: 'Чистка от пыли', basePrice: 1500, category: 'Смартфоны' },
  { id: 6, name: 'Восстановление после воды', basePrice: 6000, category: 'Смартфоны' },
  { id: 7, name: 'Замена термопасты', basePrice: 2000, category: 'Ноутбуки' },
  { id: 8, name: 'Замена клавиатуры', basePrice: 3500, category: 'Ноутбуки' },
  { id: 9, name: 'Чистка системы охлаждения', basePrice: 2500, category: 'Ноутбуки' },
  { id: 10, name: 'Замена матрицы', basePrice: 12000, category: 'Ноутбуки' },
  { id: 11, name: 'Ремонт материнской платы', basePrice: 15000, category: 'Ноутбуки' },
  { id: 12, name: 'Замена аккумулятора', basePrice: 7000, category: 'Ноутбуки' },
  { id: 13, name: 'Замена стекла', basePrice: 4000, category: 'Планшеты' },
  { id: 14, name: 'Замена аккумулятора', basePrice: 5000, category: 'Планшеты' },
  { id: 15, name: 'Ремонт разъема', basePrice: 3000, category: 'Планшеты' },
  { id: 16, name: 'Замена дисплея', basePrice: 9000, category: 'Планшеты' },
  { id: 17, name: 'Ремонт кнопок', basePrice: 2500, category: 'Планшеты' },
  { id: 18, name: 'Диагностика', basePrice: 1000, category: 'Телевизоры' },
  { id: 19, name: 'Замена блока питания', basePrice: 5000, category: 'Телевизоры' },
  { id: 20, name: 'Ремонт подсветки', basePrice: 7000, category: 'Телевизоры' },
  { id: 21, name: 'Замена матрицы', basePrice: 25000, category: 'Телевизоры' },
  { id: 22, name: 'Прошивка', basePrice: 2000, category: 'Телевизоры' },
  { id: 23, name: 'Диагностика', basePrice: 1500, category: 'Бытовая техника' },
  { id: 24, name: 'Замена двигателя', basePrice: 8000, category: 'Бытовая техника' },
  { id: 25, name: 'Ремонт электроники', basePrice: 6000, category: 'Бытовая техника' },
  { id: 26, name: 'Замена ТЭНа', basePrice: 4500, category: 'Бытовая техника' },
  { id: 27, name: 'Консультация', basePrice: 500, category: 'Другое' },
  { id: 28, name: 'Диагностика', basePrice: 1000, category: 'Другое' },
  { id: 29, name: 'Ремонт любой сложности', basePrice: 3000, category: 'Другое' },
  { id: 30, name: 'Профилактика', basePrice: 2000, category: 'Другое' },
];

// Дополнительные услуги с главной страницы
const additionalServices = [
  { id: 31, name: 'Срочный ремонт', price: '+30%', basePrice: 0, desc: 'За 1 час', type: 'extra' },
  { id: 32, name: 'Выезд мастера', price: '500 ₽', basePrice: 500, desc: 'На дом или в офис', type: 'extra' },
  { id: 33, name: 'Резервное копирование', price: '1000 ₽', basePrice: 1000, desc: 'Сохранение данных', type: 'extra' },
  { id: 34, name: 'Настройка после ремонта', price: 'Бесплатно', basePrice: 0, desc: 'Полная настройка устройства', type: 'extra' },
];

const getKrasnodarDate = () => {
  const date = new Date();
  return date;
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const generateCalendarDays = () => {
  const today = getKrasnodarDate();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  
  const year = currentYear;
  const month = currentMonth;
  const daysInMonth = getDaysInMonth(year, month);
  
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const isPastDate = i < currentDay;
    const isBooked = !isPastDate && i % 5 === 0;
    
    days.push({
      date: i,
      dateStr,
      dayOfWeek: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
      isPast: isPastDate,
      isBooked: isBooked,
    });
  }
  return days;
};

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDeviceType, setSelectedDeviceType] = useState<any>(null);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [customDevice, setCustomDevice] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [selectedExtraServices, setSelectedExtraServices] = useState<any[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
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

  useEffect(() => {
    setCalendarDays(generateCalendarDays());
  }, []);

useEffect(() => {
  let price = 0;
  
  // Считаем основные услуги
  selectedServices.forEach(service => {
    price += service.basePrice;
  });
  
  // Считаем дополнительные услуги
  selectedExtraServices.forEach(service => {
    if (service.id === 31) { // Срочный ремонт (+30%)
      price = price * 1.3; // Увеличиваем на 30%
    } else if (service.basePrice) {
      price += service.basePrice;
    }
  });
  
  setTotalPrice(Math.round(price)); // Округляем до целого числа
}, [selectedServices, selectedExtraServices]);

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

  const handleDeviceTypeSelect = (type: any) => {
    setSelectedDeviceType(type);
    setSelectedBrand(null);
    setSelectedServices([]);
    
    if (type.name === 'Другое') {
      setCustomDevice('');
    }
  };

  const handleBrandSelect = (brand: any) => {
    setSelectedBrand(brand);
  };

  const handleServiceSelect = (service: any) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleExtraServiceSelect = (service: any) => {
    if (selectedExtraServices.find(s => s.id === service.id)) {
      setSelectedExtraServices(selectedExtraServices.filter(s => s.id !== service.id));
    } else {
      setSelectedExtraServices([...selectedExtraServices, service]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos([...photos, ...Array.from(e.target.files)]);
    }
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const handleSubmit = () => {
    console.log({
      device_type: selectedDeviceType?.name,
      brand: selectedBrand?.name,
      custom_device: selectedDeviceType?.name === 'Другое' ? customDevice : null,
      problem_description: problemDescription,
      selected_services: selectedServices,
      selected_extra_services: selectedExtraServices,
      photos,
      appointment_date: selectedDate,
      final_price: totalPrice,
    });
    
    navigate('/cabinet');
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

  const getServicesForDevice = () => {
    if (!selectedDeviceType) return [];
    return services.filter(s => s.category === selectedDeviceType.name);
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

      <div className={styles.createOrder}>
        <h1 className={styles.pageTitle}>ОФОРМЛЕНИЕ ЗАЯВКИ</h1>
        
        <div className={styles.progressBar}>
          <div className={`${styles.progressStep} ${currentStep >= 1 ? styles.active : ''}`}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepLabel}>Устройство</span>
          </div>
          <div className={`${styles.progressStep} ${currentStep >= 2 ? styles.active : ''}`}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>Проблема</span>
          </div>
          <div className={`${styles.progressStep} ${currentStep >= 3 ? styles.active : ''}`}>
            <span className={styles.stepNumber}>3</span>
            <span className={styles.stepLabel}>Услуги</span>
          </div>
          <div className={`${styles.progressStep} ${currentStep >= 4 ? styles.active : ''}`}>
            <span className={styles.stepNumber}>4</span>
            <span className={styles.stepLabel}>Доп. услуги</span>
          </div>
          <div className={`${styles.progressStep} ${currentStep >= 5 ? styles.active : ''}`}>
            <span className={styles.stepNumber}>5</span>
            <span className={styles.stepLabel}>Время</span>
          </div>
          <div className={`${styles.progressStep} ${currentStep >= 6 ? styles.active : ''}`}>
            <span className={styles.stepNumber}>6</span>
            <span className={styles.stepLabel}>Подтверждение</span>
          </div>
        </div>

        <div className={styles.formContainer}>
          {currentStep === 1 && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Выберите тип устройства</h2>
              
              <div className={styles.deviceTypes}>
                {deviceTypes.map(type => (
                  <button
                    key={type.id}
                    className={`${styles.deviceTypeBtn} ${selectedDeviceType?.id === type.id ? styles.selected : ''}`}
                    onClick={() => handleDeviceTypeSelect(type)}
                  >
                    <span className={styles.deviceIcon}>{type.icon}</span>
                    <span className={styles.deviceName}>{type.name}</span>
                  </button>
                ))}
              </div>

              {selectedDeviceType?.name === 'Смартфоны' && (
                <>
                  <h2 className={styles.stepTitle} style={{ marginTop: '2rem' }}>Выберите бренд</h2>
                  <div className={styles.brandsGrid}>
                    {phoneBrands.map(brand => (
                      <button
                        key={brand.id}
                        className={`${styles.brandBtn} ${selectedBrand?.id === brand.id ? styles.selected : ''}`}
                        onClick={() => handleBrandSelect(brand)}
                      >
                        <span className={styles.brandIcon}>{brand.icon}</span>
                        <span className={styles.brandName}>{brand.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedDeviceType?.name === 'Другое' && (
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
                  disabled={
                    !selectedDeviceType || 
                    (selectedDeviceType?.name === 'Смартфоны' && !selectedBrand) ||
                    (selectedDeviceType?.name === 'Другое' && !customDevice)
                  }
                >
                  Далее
                </button>
              </div>
            </div>
          )}

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
                <button className={styles.prevBtn} onClick={() => setCurrentStep(1)}>
                  Назад
                </button>
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

          {currentStep === 3 && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Выберите необходимые услуги</h2>
              
              <div className={styles.servicesList}>
                {getServicesForDevice().map(service => (
                  <div
                    key={service.id}
                    className={`${styles.serviceItem} ${selectedServices.find(s => s.id === service.id) ? styles.selected : ''}`}
                    onClick={() => handleServiceSelect(service)}
                  >
                    <div className={styles.serviceInfo}>
                      <span className={styles.serviceName}>{service.name}</span>
                      <span className={styles.servicePrice}>{service.basePrice} ₽</span>
                    </div>
                    <div className={styles.serviceCheck}>
                      {selectedServices.find(s => s.id === service.id) && '✓'}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.totalPrice}>
                <span>Текущая стоимость:</span>
                <span className={styles.price}>{totalPrice} ₽</span>
              </div>

              <div className={styles.stepButtons}>
                <button className={styles.prevBtn} onClick={() => setCurrentStep(2)}>
                  Назад
                </button>
                <button className={styles.nextBtn} onClick={() => setCurrentStep(4)}>
                  Далее
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Дополнительные услуги</h2>
              
              <div className={styles.extraServicesList}>
                {additionalServices.map(service => (
                  <div
                    key={service.id}
                    className={`${styles.extraServiceItem} ${selectedExtraServices.find(s => s.id === service.id) ? styles.selected : ''}`}
                    onClick={() => handleExtraServiceSelect(service)}
                  >
                    <div className={styles.extraServiceInfo}>
                      <span className={styles.extraServiceName}>{service.name}</span>
                      <span className={styles.extraServiceDesc}>{service.desc}</span>
                    </div>
                    <div className={styles.extraServiceRight}>
                      <span className={styles.extraServicePrice}>{service.price}</span>
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
                <button className={styles.prevBtn} onClick={() => setCurrentStep(3)}>
                  Назад
                </button>
                <button className={styles.nextBtn} onClick={() => setCurrentStep(5)}>
                  Далее
                </button>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Выберите удобную дату</h2>
              
              <div className={styles.calendar}>
                <div className={styles.calendarHeader}>
                  <button className={styles.calendarNav}>←</button>
                  <span className={styles.calendarMonth}>
                    {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                  </span>
                  <button className={styles.calendarNav}>→</button>
                </div>
                
                <div className={styles.weekDays}>
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                    <div key={day} className={styles.weekDay}>{day}</div>
                  ))}
                </div>

                <div className={styles.calendarGrid}>
                  {calendarDays.map(day => (
                    <button
                      key={day.date}
                      className={`${styles.calendarDay} 
                        ${day.isPast ? styles.past : ''}
                        ${day.isBooked ? styles.booked : ''}
                        ${!day.isPast && !day.isBooked ? styles.available : ''}
                        ${selectedDate === day.dateStr ? styles.selected : ''}`}
                      onClick={() => !day.isPast && !day.isBooked && handleDateSelect(day.dateStr)}
                      disabled={day.isPast || day.isBooked}
                    >
                      <span className={styles.dayNumber}>{day.date}</span>
                      <span className={styles.dayWeek}>{day.dayOfWeek}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.available}`}></span>
                  <span>Свободно</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.booked}`}></span>
                  <span>Занято</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.past}`}></span>
                  <span>Прошедшие</span>
                </div>
              </div>

              <div className={styles.stepButtons}>
                <button className={styles.prevBtn} onClick={() => setCurrentStep(4)}>
                  Назад
                </button>
                <button
                  className={styles.nextBtn}
                  onClick={() => setCurrentStep(6)}
                  disabled={!selectedDate}
                >
                  Далее
                </button>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Подтверждение заявки</h2>
              
              <div className={styles.confirmation}>
                <div className={styles.confirmSection}>
                  <h3>Устройство</h3>
                  <p>
                    {selectedDeviceType?.name === 'Другое' 
                      ? customDevice 
                      : selectedDeviceType?.name}
                  </p>
                  {selectedBrand && <p className={styles.confirmSubtext}>Бренд: {selectedBrand.name}</p>}
                </div>

                <div className={styles.confirmSection}>
                  <h3>Проблема</h3>
                  <p>{problemDescription}</p>
                </div>

                {selectedServices.length > 0 && (
                  <div className={styles.confirmSection}>
                    <h3>Услуги</h3>
                    {selectedServices.map(service => (
                      <p key={service.id}>{service.name} - {service.basePrice} ₽</p>
                    ))}
                  </div>
                )}

                {selectedExtraServices.length > 0 && (
                  <div className={styles.confirmSection}>
                    <h3>Дополнительные услуги</h3>
                    {selectedExtraServices.map(service => (
                      <p key={service.id}>
                        {service.name} - {service.id === 31 ? '+30% к итогу' : service.price}
                      </p>
                    ))}
                  </div>
                )}

                <div className={styles.confirmSection}>
                  <h3>Дата визита</h3>
                  <p>{new Date(selectedDate).toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</p>
                </div>

                <div className={styles.confirmTotal}>
                  <span>Итоговая стоимость:</span>
                  <span className={styles.finalPrice}>{totalPrice} ₽</span>
                </div>
              </div>

              <div className={styles.stepButtons}>
                <button className={styles.prevBtn} onClick={() => setCurrentStep(5)}>
                  Назад
                </button>
                <button className={styles.submitBtn} onClick={handleSubmit}>
                  Отправить заявку
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}