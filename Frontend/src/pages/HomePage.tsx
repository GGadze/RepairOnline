import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import SiteHeader from '../components/SiteHeader';
import s from '../components/HomePage.module.css';

/* ── Данные ── */
const AUTO_SERVICES = [
  { icon: '🔩', title: 'Двигатель и трансмиссия', desc: 'Диагностика, замена масла, ремонт КПП, замена ремня ГРМ' },
  { icon: '🛞', title: 'Ходовая часть', desc: 'Подвеска, амортизаторы, рулевое управление, ступичные подшипники' },
  { icon: '🔋', title: 'Электрооборудование', desc: 'Аккумулятор, генератор, стартер, бортовая электроника' },
  { icon: '❄️', title: 'Кондиционер и печка', desc: 'Заправка фреона, ремонт компрессора, отопитель салона' },
  { icon: '🛑', title: 'Тормозная система', desc: 'Колодки, диски, суппорты, тормозные цилиндры' },
  { icon: '💨', title: 'Выхлопная система', desc: 'Замена глушителя, катализатора, гофры, сварочные работы' },
];

const TECH_SERVICES = [
  { icon: '📱', title: 'Смартфоны', desc: 'Экраны, аккумуляторы, разъёмы зарядки' },
  { icon: '💻', title: 'Ноутбуки', desc: 'Матрицы, клавиатуры, чистка от пыли' },
  { icon: '📺', title: 'Телевизоры', desc: 'Подсветка, платы, настройка Smart TV' },
  { icon: '🏠', title: 'Бытовая техника', desc: 'Стиральные машины, холодильники, плиты' },
];

const STATS = [
  { num: '800+',  label: 'Авто отремонтировано' },
  { num: '500+',  label: 'Гаджетов восстановлено' },
  { num: '7 лет', label: 'Опыта работы' },
  { num: '98%',   label: 'Довольных клиентов' },
];

const ADVANTAGES = [
  { icon: '⚡', title: 'Быстро',          desc: 'Большинство работ — в день обращения' },
  { icon: '🔧', title: 'Честно',          desc: 'Называем цену до начала работ' },
  { icon: '🛡️', title: 'Гарантия',        desc: 'До 1 года на все виды ремонта' },
  { icon: '📍', title: 'Выезд на место', desc: 'Приедем к вам в Нижнесакмарский' },
];

const CATEGORIES_ICONS: Record<string, string> = {
  'Смартфоны': '📱', 'Ноутбуки': '💻', 'Планшеты': '📟',
  'Телевизоры': '📺', 'Бытовая техника': '🏠', 'Другое': '🔧',
};
const CATEGORIES = Object.keys(CATEGORIES_ICONS);

const PRICES: Record<string, { name: string; price: number }[]> = {
  'Смартфоны':       [{ name:'Замена стекла',price:500 },{ name:'Замена аккумулятора',price:4000 },{ name:'Замена дисплея',price:8500 },{ name:'Ремонт разъёма зарядки',price:2500 },{ name:'Чистка от пыли',price:1500 },{ name:'Восстановление после воды',price:6000 }],
  'Ноутбуки':        [{ name:'Замена термопасты',price:2000 },{ name:'Замена клавиатуры',price:3500 },{ name:'Чистка системы охлаждения',price:2500 },{ name:'Замена матрицы',price:12000 },{ name:'Ремонт материнской платы',price:15000 },{ name:'Замена аккумулятора',price:7000 }],
  'Планшеты':        [{ name:'Замена стекла',price:4000 },{ name:'Замена аккумулятора',price:5000 },{ name:'Ремонт разъёма',price:3000 },{ name:'Замена дисплея',price:9000 },{ name:'Ремонт кнопок',price:2500 }],
  'Телевизоры':      [{ name:'Диагностика',price:1000 },{ name:'Замена блока питания',price:5000 },{ name:'Ремонт подсветки',price:7000 },{ name:'Замена матрицы',price:25000 },{ name:'Прошивка',price:2000 }],
  'Бытовая техника': [{ name:'Диагностика',price:1500 },{ name:'Замена двигателя',price:8000 },{ name:'Ремонт электроники',price:6000 },{ name:'Замена ТЭНа',price:4500 }],
  'Другое':          [{ name:'Консультация',price:500 },{ name:'Диагностика',price:1000 },{ name:'Ремонт любой сложности',price:3000 },{ name:'Профилактика',price:2000 }],
};

/* ── Хук: виден ли элемент ── */
function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [v, setV] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return v;
}

function CountUp({ to, suffix, run }: { to: number; suffix: string; run: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    let s: number;
    const step = (ts: number) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 1400, 1);
      setV(Math.round(p * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [run, to]);
  return <>{v}{suffix}</>;
}

/* ══════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const heroRef     = useRef<HTMLDivElement>(null);
  const autoRef     = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const aboutRef    = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);
  const pricesRef   = useRef<HTMLDivElement>(null);
  const statsRef    = useRef<HTMLDivElement>(null);

  const statsInView = useInView(statsRef as React.RefObject<HTMLElement | null>);
  const [activeTab, setActiveTab] = useState('Смартфоны');
  const [headerH,   setHeaderH]   = useState(64);

  useEffect(() => { setHeaderH(64); }, []);

  // Scroll to section from other pages
  useEffect(() => {
    if (!location.state?.scrollTo) return;
    const id = location.state.scrollTo as string;
    setTimeout(() => {
      const map: Record<string, React.RefObject<HTMLDivElement | null>> = {
        auto: autoRef, services: servicesRef, about: aboutRef, contacts: contactsRef,
      };
      const el = (map[id] ?? heroRef).current;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - headerH - 12, behavior: 'smooth' });
    }, 300);
    navigate('/', { replace: true, state: {} });
  }, [location.state, navigate, headerH]);

  const scrollTo = (el: HTMLElement | null) => {
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - headerH - 12, behavior: 'smooth' });
  };

  const handleOrder = () => {
    window.scrollTo(0, 0);
    navigate(isAuthenticated ? '/create-order' : '/auth', { state: { from: { pathname: '/create-order' } } });
  };

  return (
    <div className={s.page}>
      <SiteHeader
        refs={{ hero: heroRef, auto: autoRef, services: servicesRef, about: aboutRef, contacts: contactsRef }}
      />

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.heroLeft}>
            <div className={s.heroBadge}>Нижнесакмарский · Работаем ежедневно 9:00–20:00</div>
            <h1 className={s.heroTitle}>
              Ремонт автомобилей<br/>
              <span className={s.heroAccent}>и электроники</span>
            </h1>
            <p className={s.heroDesc}>
              Честная диагностика, реальные цены, гарантия на работы.<br/>
              Авто — основное направление. Гаджеты и бытовая техника — всегда рядом.
            </p>
            <div className={s.heroBtns}>
              <button className={s.btnPrimary} onClick={handleOrder}>Записаться на ремонт</button>
              <button className={s.btnOutline} onClick={() => scrollTo(autoRef.current)}>Наши услуги ↓</button>
            </div>
            <div className={s.heroTags}>
              <span>🚗 Авто любых марок</span>
              <span>📱 Телефоны и ноутбуки</span>
              <span>🛡️ Гарантия до 1 года</span>
            </div>
          </div>
          <div className={s.heroRight}>
            <div className={s.heroCard}>
              <div className={s.heroCardIcon}>🚗</div>
              <div className={s.heroCardTitle}>Авто на ремонт?</div>
              <div className={s.heroCardDesc}>Диагностика бесплатно при записи на ремонт</div>
              <button className={s.heroCardBtn} onClick={handleOrder}>Записаться</button>
            </div>
            <div className={s.heroCard2}>
              <div className={s.heroCard2Icon}>📱</div>
              <div className={s.heroCard2Text}>Сломался гаджет?</div>
              <button className={s.heroCard2Btn} onClick={() => scrollTo(servicesRef.current)}>Смотреть цены</button>
            </div>
          </div>
        </div>
        <div className={s.heroLine} />
      </section>

      {/* ═══ СТАТИСТИКА ═══ */}
      <div ref={statsRef} className={s.statsBar}>
        {STATS.map((st, i) => {
          const numMatch = st.num.match(/\d+/);
          const num = numMatch ? parseInt(numMatch[0]) : 0;
          const suffix = st.num.replace(/\d+/, '');
          return (
            <div key={i} className={s.statItem}>
              <div className={s.statNum}>
                {num > 0 ? <CountUp to={num} suffix={suffix} run={statsInView} /> : st.num}
              </div>
              <div className={s.statLabel}>{st.label}</div>
            </div>
          );
        })}
      </div>

      {/* ═══ АВТО-УСЛУГИ ═══ */}
      <section ref={autoRef} className={s.section}>
        <div className={s.sectionInner}>
          <div className={s.sectionHead}>
            <div className={s.sectionTag}>Основное направление</div>
            <h2 className={s.sectionTitle}>Ремонт автомобилей</h2>
            <p className={s.sectionDesc}>Работаем с любыми марками и моделями. Честная диагностика перед каждым ремонтом.</p>
          </div>
          <div className={s.autoGrid}>
            {AUTO_SERVICES.map((sv, i) => (
              <div key={i} className={s.autoCard}>
                <div className={s.autoCardIcon}>{sv.icon}</div>
                <div className={s.autoCardTitle}>{sv.title}</div>
                <div className={s.autoCardDesc}>{sv.desc}</div>
              </div>
            ))}
          </div>
          <div className={s.sectionCta}>
            <button className={s.btnPrimary} onClick={handleOrder}>Записаться на диагностику</button>
            <span className={s.sectionCtaNote}>Диагностика бесплатно при ремонте</span>
          </div>
        </div>
      </section>

      {/* ═══ ЭЛЕКТРОНИКА ═══ */}
      <section ref={servicesRef} className={s.sectionAlt}>
        <div className={s.sectionInner}>
          <div className={s.sectionHead}>
            <div className={s.sectionTag}>Также занимаемся</div>
            <h2 className={s.sectionTitle}>Ремонт электроники</h2>
            <p className={s.sectionDesc}>Смартфоны, ноутбуки, телевизоры и бытовая техника — всё в одном месте.</p>
          </div>
          <div className={s.techGrid}>
            {TECH_SERVICES.map((sv, i) => (
              <div key={i} className={s.techCard}>
                <div className={s.techIcon}>{sv.icon}</div>
                <div className={s.techTitle}>{sv.title}</div>
                <div className={s.techDesc}>{sv.desc}</div>
              </div>
            ))}
          </div>

          {/* Прайс электроники */}
          <div className={s.priceBlock} ref={pricesRef}>
            <div className={s.priceTabs}>
              {CATEGORIES.map(cat => (
                <button key={cat}
                  className={[s.priceTab, activeTab === cat ? s.priceTabActive : ''].join(' ')}
                  onClick={() => setActiveTab(cat)}>
                  {CATEGORIES_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
            <div className={s.priceTable}>
              {PRICES[activeTab]?.map((row, i) => (
                <div key={i} className={s.priceRow}>
                  <span className={s.priceName}>{row.name}</span>
                  <span className={s.priceVal}>{row.price.toLocaleString()} ₽</span>
                </div>
              ))}
              <div className={s.priceNote}>* Точная стоимость — после диагностики</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ О НАС ═══ */}
      <section ref={aboutRef} className={s.section}>
        <div className={s.sectionInner}>
          <div className={s.aboutGrid}>
            <div className={s.aboutLeft}>
              <div className={s.sectionTag}>О мастере</div>
              <h2 className={s.sectionTitle}>Работаем честно<br/>с 2016 года</h2>
              <p className={s.aboutText}>
                Начинал с ремонта телефонов — сейчас основной профиль это автомобили.
                За 7 лет отремонтировал более 800 машин и столько же гаджетов.
              </p>
              <p className={s.aboutText}>
                Называю цену до начала работ. Если ремонт нецелесообразен — скажу об этом честно.
                Работаю один, без посредников — отвечаю за каждый ремонт лично.
              </p>
              <div className={s.aboutAdvantages}>
                {ADVANTAGES.map((a, i) => (
                  <div key={i} className={s.advRow}>
                    <span className={s.advIcon}>{a.icon}</span>
                    <div>
                      <div className={s.advTitle}>{a.title}</div>
                      <div className={s.advDesc}>{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={s.aboutRight}>
              <div className={s.aboutPhoto}>
                <span style={{ fontSize: '3rem' }}>📸</span>
                <span style={{ fontSize: '0.875rem', color: '#4e6280', marginTop: '8px' }}>Фото мастера</span>
              </div>
              <div className={s.aboutBadge1}>7 лет опыта</div>
              <div className={s.aboutBadge2}>800+ авто</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ КОНТАКТЫ + КАРТА ═══ */}
      <section ref={contactsRef} className={s.sectionAlt}>
        <div className={s.sectionInner}>
          <div className={s.sectionHead}>
            <h2 className={s.sectionTitle}>Как нас найти</h2>
          </div>
          <div className={s.contactsGrid}>
            <div className={s.mapBox}>
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=55.1012%2C51.2088&z=16&pt=55.1012%2C51.2088%2Cpm2rdl&l=map&text=%D0%9D%D0%B8%D0%B6%D0%BD%D0%B5%D1%81%D0%B0%D0%BA%D0%BC%D0%B0%D1%80%D1%81%D0%BA%D0%B8%D0%B9%2C+%D1%83%D0%BB.+%D0%91%D0%B0%D1%81%D1%82%D0%B8%D0%BE%D0%BD%D0%BD%D0%B0%D1%8F+48"
                width="100%" height="100%" frameBorder="0"
                title="п. Нижнесакмарский, ул. Бастионная, 48"
                style={{ display: 'block', minHeight: 340 }}
                allowFullScreen
              />
            </div>
            <div className={s.contactInfo}>
              <h3 className={s.contactTitle}>Контакты</h3>
              {[
                { icon: '📍', label: 'Адрес',         val: 'п. Нижнесакмарский,\nул. Бастионная, 48' },
                { icon: '📞', label: 'Телефон',       val: '+7 (987) 773-24-64' },
                { icon: '✉️', label: 'Email',         val: 'remont-online@mail.ru' },
                { icon: '🕒', label: 'Время работы',  val: 'Ежедневно 9:00 – 20:00' },
              ].map(c => (
                <div key={c.label} className={s.contactRow}>
                  <span className={s.contactIcon}>{c.icon}</span>
                  <div>
                    <div className={s.contactLabel}>{c.label}</div>
                    <div className={s.contactVal}>{c.val}</div>
                  </div>
                </div>
              ))}
              <button className={s.btnPrimary} style={{ width: '100%', marginTop: '16px' }} onClick={handleOrder}>
                Записаться на ремонт
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerLogo}>
            <span className={s.footerLogoMark}>🔧</span>
            <span>АвтоМастер</span>
          </div>
          <div className={s.footerLinks}>
            {[
              { label: 'Авто',     action: () => scrollTo(autoRef.current)     },
              { label: 'Услуги',   action: () => scrollTo(servicesRef.current)  },
              { label: 'О нас',    action: () => scrollTo(aboutRef.current)     },
              { label: 'Контакты', action: () => scrollTo(contactsRef.current)  },
              { label: 'Отзывы',   action: () => navigate('/reviews')           },
            ].map(l => (
              <button key={l.label} className={s.footerLink} onClick={l.action}>{l.label}</button>
            ))}
          </div>
          <div className={s.footerCopy}>© 2026 АвтоМастер · п. Нижнесакмарский</div>
        </div>
      </footer>
    </div>
  );
}