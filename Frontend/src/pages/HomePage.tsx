import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../components/HomePage.module.css';
import SiteHeader from '../components/SiteHeader';
import { useAuthStore } from '../store/authStore';

const topNav = [
  { id: 'main',     label: 'Главная'  },
  { id: 'about',    label: 'О себе'   },
  { id: 'services', label: 'Услуги'   },
  { id: 'contacts', label: 'Контакты' },
  { id: 'reviews',  label: 'Отзывы'   },
];

const CATEGORY_ICONS: Record<string, string> = {
  'Смартфоны': '📱', 'Ноутбуки': '💻', 'Планшеты': '📟',
  'Телевизоры': '📺', 'Бытовая техника': '🏠', 'Другое': '🔧',
};

const categories = ['Смартфоны','Ноутбуки','Планшеты','Телевизоры','Бытовая техника','Другое'];

const pricesData: Record<string, { name: string; price: number }[]> = {
  'Смартфоны':       [{ name:'Замена стекла',price:500 },{ name:'Замена аккумулятора',price:4000 },{ name:'Замена дисплея',price:8500 },{ name:'Ремонт разъема зарядки',price:2500 },{ name:'Чистка от пыли',price:1500 },{ name:'Восстановление после воды',price:6000 }],
  'Ноутбуки':        [{ name:'Замена термопасты',price:2000 },{ name:'Замена клавиатуры',price:3500 },{ name:'Чистка системы охлаждения',price:2500 },{ name:'Замена матрицы',price:12000 },{ name:'Ремонт материнской платы',price:15000 },{ name:'Замена аккумулятора',price:7000 }],
  'Планшеты':        [{ name:'Замена стекла',price:4000 },{ name:'Замена аккумулятора',price:5000 },{ name:'Ремонт разъема',price:3000 },{ name:'Замена дисплея',price:9000 },{ name:'Ремонт кнопок',price:2500 }],
  'Телевизоры':      [{ name:'Диагностика',price:1000 },{ name:'Замена блока питания',price:5000 },{ name:'Ремонт подсветки',price:7000 },{ name:'Замена матрицы',price:25000 },{ name:'Прошивка',price:2000 }],
  'Бытовая техника': [{ name:'Диагностика',price:1500 },{ name:'Замена двигателя',price:8000 },{ name:'Ремонт электроники',price:6000 },{ name:'Замена ТЭНа',price:4500 }],
  'Другое':          [{ name:'Консультация',price:500 },{ name:'Диагностика',price:1000 },{ name:'Ремонт любой сложности',price:3000 },{ name:'Профилактика',price:2000 }],
};

const advantages = [
  { id:1, icon:'⚡', title:'Быстрый ремонт',         desc:'Среднее время ремонта — 2 часа' },
  { id:2, icon:'🔩', title:'Оригинальные запчасти',  desc:'Только сертифицированные детали' },
  { id:3, icon:'🛡️', title:'Гарантия 1 год',         desc:'На все виды выполненных работ' },
  { id:4, icon:'🎯', title:'Бесплатная диагностика', desc:'При оформлении заказа на ремонт' },
];

const additionalServices = [
  { id:1, icon:'⚡', name:'Срочный ремонт',           price:'+20%',     desc:'Выполнение за 1 час' },
  { id:2, icon:'🚗', name:'Выезд мастера',             price:'500 ₽',    desc:'На дом или в офис' },
  { id:3, icon:'💾', name:'Резервное копирование',     price:'1 000 ₽',  desc:'Полное сохранение данных' },
  { id:4, icon:'⚙️', name:'Настройка после ремонта',  price:'Бесплатно',desc:'Полная настройка устройства' },
];

const stats = [
  { value:'500', suffix:'+', label:'Выполненных ремонтов' },
  { value:'98',  suffix:'%', label:'Довольных клиентов' },
  { value:'1',   suffix:' год', label:'Гарантия на работы' },
  { value:'2',   suffix:' часа', label:'Среднее время ремонта' },
];

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

function CountUp({ to, suffix, run }: { to: number; suffix: string; run: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    const dur = 1600;
    let s: number;
    const step = (ts: number) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / dur, 1);
      setV(Math.round(p * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [run, to]);
  return <>{v}{suffix}</>;
}

export default function HomePage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isAuthenticated } = useAuthStore();

  const heroRef      = useRef<HTMLDivElement>(null);
  const mindmapRef   = useRef<HTMLDivElement>(null);
  const aboutRef     = useRef<HTMLDivElement>(null);
  const servicesRef  = useRef<HTMLDivElement>(null);
  const contactsRef  = useRef<HTMLDivElement>(null);
  const pricesRef    = useRef<HTMLDivElement>(null);
  const statsRef     = useRef<HTMLDivElement>(null);

  const statsInView = useInView(statsRef as React.RefObject<HTMLElement>);

  const [positions,      setPositions]      = useState<{x:number;y:number}[]>([]);
  const [activeCategory, setActiveCategory] = useState('Смартфоны');
  const [headerHeight,   setHeaderHeight]   = useState(72);




  useEffect(() => {
    if (!location.state?.scrollTo) return;
    const s = location.state.scrollTo as string;
    setTimeout(() => {
      const m: Record<string,React.RefObject<HTMLDivElement | null>> = { about:aboutRef, services:servicesRef, contacts:contactsRef };
      const el = (m[s] ?? heroRef).current;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - headerHeight - 20, behavior:'smooth' });
    }, 300);
    navigate('/', { replace:true, state:{} });
  }, [location.state, navigate, headerHeight]);

  const scrollTo = (el: HTMLElement | null) => {
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - headerHeight - 20, behavior:'smooth' });
  };

  const handleNavClick = (id: string) => {
    if (id === 'reviews') { navigate('/reviews'); return; }
    const m: Record<string,React.RefObject<HTMLDivElement | null>> = { main:heroRef, about:aboutRef, services:servicesRef, contacts:contactsRef };
    scrollTo((m[id] ?? heroRef).current);
  };

  const handleOrder = () => {
    window.scrollTo(0,0);
    navigate(isAuthenticated ? '/create-order' : '/auth', { state:{ from:{ pathname:'/create-order' } } });
  };

  useEffect(() => {
    if (!mindmapRef.current) return;
    const calc = () => {
      const rect = mindmapRef.current!.getBoundingClientRect();
      const cx = 220, cy = rect.height / 2, r = Math.min(rect.width * 0.35, 500);
      setPositions(categories.map((_, i) => {
        const deg = -45 + 90 * (i / (categories.length - 1));
        const rad = deg * Math.PI / 180;
        return { x: cx + 220 + 180 + r * Math.cos(rad), y: cy + r * Math.sin(rad) * 0.9 };
      }));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  return (
    <div className={styles.page}>

      {/* ─── ШАПКА ─── */}
      <SiteHeader refs={{ hero: heroRef, about: aboutRef, services: servicesRef, contacts: contactsRef }} />

      {/* ─── HERO ─── */}
      <div ref={heroRef} className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.blob1}/><div className={styles.blob2}/><div className={styles.blob3}/>
        </div>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <div className={styles.heroBadge}>⚡ Профессиональный сервис</div>
            <h1 className={styles.heroTitle}>
              Ремонт техники<br/>
              <span className={styles.heroAccent}>быстро и надёжно</span>
            </h1>
            <p className={styles.heroSub}>
              Смартфоны, ноутбуки, планшеты и бытовая техника.<br/>
              Гарантия 1 год. Диагностика бесплатно.
            </p>
            <div className={styles.heroBtns}>
              <button className={styles.heroBtnMain} onClick={handleOrder}>Оформить заявку →</button>
              <button className={styles.heroBtnGhost} onClick={() => scrollTo(aboutRef.current)}>Узнать больше</button>
            </div>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.heroOrb}>
              <div className={styles.heroOrbInner}>🔧</div>
              <div className={styles.heroOrbRing1}/>
              <div className={styles.heroOrbRing2}/>
              <div className={styles.heroOrbRing3}/>
            </div>
            <div className={styles.heroBadge1}>✅ Гарантия 1 год</div>
            <div className={styles.heroBadge2}>⚡ От 2 часов</div>
            <div className={styles.heroBadge3}>🆓 Диагностика</div>
          </div>
        </div>
        <button className={styles.heroScrollBtn} onClick={() => scrollTo(mindmapRef.current)}>
          <span className={styles.heroScrollArrow}/>
        </button>
      </div>

      {/* ─── MINDMAP ─── */}
      <div className={styles.mindmapSection}>
        <div className={styles.mindmapGlow1}/><div className={styles.mindmapGlow2}/>
        <p className={styles.mindmapHint}>ВЫБЕРИТЕ ТИП УСТРОЙСТВА</p>
        <div ref={mindmapRef} className={styles.mindmap}>
          {/* Центральный орб */}
          <div className={styles.circle}>
            <div className={styles.circleRing1}/>
            <div className={styles.circleRing2}/>
            <div className={styles.circleRing3}/>
            <span className={styles.circleIcon}>🔧</span>
          </div>
          {categories.map((cat, i) => {
            const pos = positions[i];
            if (!pos) return null;
            const rect = mindmapRef.current?.getBoundingClientRect();
            if (!rect) return null;
            const cx = 220, cy = rect.height/2, cr = 220;
            const dx = pos.x-cx, dy = pos.y-cy;
            const ang = Math.atan2(dy,dx)*180/Math.PI;
            const len = Math.sqrt(dx*dx+dy*dy);
            const arrowLen = len - cr - 10 - 15;
            return (
              <React.Fragment key={cat}>
                <div className={styles.rayWrapper} style={{
                  left:`${cx+Math.cos(ang*Math.PI/180)*(cr+10)}px`,
                  top:`${cy+Math.sin(ang*Math.PI/180)*(cr+10)}px`,
                  transform:`rotate(${ang}deg)`,
                  width:`${Math.max(0,arrowLen)}px`,
                  '--rotate':`${ang}deg`,
                } as React.CSSProperties}><div className={styles.ray}/></div>
                <div className={styles.category} style={{
                  left:`${pos.x}px`, top:`${pos.y}px`, '--index':i,
                } as React.CSSProperties}
                  onClick={() => { setActiveCategory(cat); setTimeout(()=>scrollTo(pricesRef.current),50); }}>
                  <span className={styles.catIcon}>{CATEGORY_ICONS[cat]}</span>
                  <span>{cat}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className={styles.orderSection}>
        <button className={styles.orderBtn} onClick={handleOrder}>
          Оформить заявку на ремонт <span className={styles.orderArrow}>→</span>
        </button>
      </div>

      {/* ─── О СЕБЕ ─── */}
      <div ref={aboutRef} className={styles.aboutWrapper}>
        <div className={styles.aboutSection}>
          <div className={styles.aboutBlob1}/><div className={styles.aboutBlob2}/>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutLeft}>
              <span className={styles.aboutTag}>О мастере</span>
              <h2 className={styles.aboutTitle}>О СЕБЕ</h2>
              <p className={styles.aboutText}>
                Занимаюсь ремонтом электроники более 8 лет. Специализируюсь
                на смартфонах, ноутбуках и планшетах всех популярных марок.
                Использую только оригинальные запчасти и даю гарантию на все
                виды выполненных работ.
              </p>
              <p className={styles.aboutText}>
                Принимаю заказы дистанционно — опишите проблему онлайн,
                и я свяжусь с вами для уточнения деталей и записи.
              </p>
              <button className={styles.aboutBtn} onClick={handleOrder}>Записаться на ремонт</button>
            </div>
            <div className={styles.aboutPhotoWrap}>
              <div className={styles.photo}>
                <span style={{fontSize:'3rem'}}>📸</span>
                <span style={{fontSize:'0.9rem',opacity:0.7,marginTop:'0.5rem'}}>Фото мастера</span>
              </div>
              <div className={styles.floatChip1}>8 лет опыта</div>
              <div className={styles.floatChip2}>500+ ремонтов</div>
            </div>
          </div>
        </div>

        {/* ─── СТАТИСТИКА ─── */}
        <div ref={statsRef} className={styles.statsRow}>
          {stats.map((s,i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statNum}>
                <CountUp to={parseInt(s.value)} suffix={s.suffix} run={statsInView}/>
              </div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ─── ПРЕИМУЩЕСТВА ─── */}
        <div className={styles.advantagesSection}>
          <h2 className={styles.sectionTitle}>НАШИ ПРЕИМУЩЕСТВА</h2>
          <div className={styles.advantagesGrid}>
            {advantages.map((adv,i) => (
              <div key={adv.id} className={styles.advantageCard} style={{'--i':i} as React.CSSProperties}>
                <div className={styles.advIconBox}>{adv.icon}</div>
                <h3 className={styles.advantageTitle}>{adv.title}</h3>
                <p className={styles.advantageDesc}>{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── ДОП. УСЛУГИ + ПРАЙС ─── */}
      <div ref={servicesRef}>
        <div className={styles.extraSection}>
          <div className={styles.extraInner}>
            <h2 className={styles.sectionTitleLight}>ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ</h2>
            <div className={styles.extraGrid}>
              {additionalServices.map(s => (
                <div key={s.id} className={styles.extraCard}>
                  <div className={styles.extraIcon}>{s.icon}</div>
                  <h3 className={styles.extraName}>{s.name}</h3>
                  <p className={styles.extraDesc}>{s.desc}</p>
                  <div className={styles.extraPrice}>{s.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div ref={pricesRef} className={styles.pricesSection}>
          <h2 className={styles.sectionTitle}>ПРАЙС-ЛИСТ</h2>
          <p className={styles.pricesHint}>Выберите категорию устройства</p>
          <div className={styles.categoriesTabs}>
            {categories.map(cat => (
              <button key={cat}
                className={`${styles.categoryTab} ${activeCategory===cat ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat)}>
                <span>{CATEGORY_ICONS[cat]}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
          <div className={styles.pricesTable}>
            <div className={styles.tableHeader}>
              <span>Наименование услуги</span><span>Стоимость</span>
            </div>
            <div className={styles.servicesList}>
              {pricesData[activeCategory]?.map((s,i) => (
                <div key={i} className={styles.serviceItem} style={{'--i':i} as React.CSSProperties}>
                  <span className={styles.serviceName}>
                    <span className={styles.serviceNum}>{i+1}</span>{s.name}
                  </span>
                  <span className={styles.servicePrice}>{s.price.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
            <div className={styles.tableNote}>* Точная стоимость определяется после диагностики</div>
          </div>
        </div>
      </div>

      {/* ─── КАРТА + КОНТАКТЫ ─── */}
      <div ref={contactsRef} className={styles.contactsSection}>
        <h2 className={styles.sectionTitle}>КАК НАС НАЙТИ</h2>
        <div className={styles.contactsGrid}>
          <div className={styles.mapBox}>
            <iframe
              src="https://yandex.ru/map-widget/v1/?ll=55.1012%2C51.2088&z=16&pt=55.1012%2C51.2088%2Cpm2rdl&l=map&text=%D0%9D%D0%B8%D0%B6%D0%BD%D0%B5%D1%81%D0%B0%D0%BA%D0%BC%D0%B0%D1%80%D1%81%D0%BA%D0%B8%D0%B9%2C+%D1%83%D0%BB.+%D0%91%D0%B0%D1%81%D1%82%D0%B8%D0%BE%D0%BD%D0%BD%D0%B0%D1%8F+48"
              width="100%" height="100%" frameBorder="0"
              title="п. Нижнесакмарский, ул. Бастионная, 48"
              style={{display:'block',minHeight:340}}
              allowFullScreen
            />
          </div>
          <div className={styles.contactCards}>
            <h3 className={styles.contactsTitle}>Контактная информация</h3>
            {[
              {icon:'📍', label:'Адрес',        val:'п. Нижнесакмарский, ул. Бастионная, 48'},
              {icon:'📞', label:'Телефон',      val:'+7 (987) 773-24-64'},
              {icon:'✉️', label:'Email',        val:'remont-online@mail.ru'},
              {icon:'🕒', label:'Режим работы', val:'Ежедневно с 9:00 до 20:00'},
            ].map(c => (
              <div key={c.label} className={styles.contactCard}>
                <div className={styles.contactIconBox}>{c.icon}</div>
                <div>
                  <div className={styles.contactLabel}>{c.label}</div>
                  <div className={styles.contactVal}>{c.val}</div>
                </div>
              </div>
            ))}
            <button className={styles.contactOrderBtn} onClick={handleOrder}>
              Записаться на ремонт →
            </button>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>🔧 Ремонт-Онлайн</div>
          <div className={styles.footerNav}>
            {topNav.map(item=>(
              <button key={item.id} className={styles.footerLink} onClick={()=>handleNavClick(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          <div className={styles.footerCopy}>© 2026 Ремонт-Онлайн. Все права защищены.</div>
        </div>
      </footer>
    </div>
  );
}