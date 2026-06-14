import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import SiteHeader from '../components/SiteHeader';
import s from '../components/HomePage.module.css';

/* ─── Данные ─── */
const AUTO_SERVICES = [
  { icon: '01', title: 'Двигатель и трансмиссия', desc: 'Диагностика, замена масла, ремонт КПП, ГРМ' },
  { icon: '02', title: 'Ходовая часть', desc: 'Подвеска, амортизаторы, рулевое, подшипники' },
  { icon: '03', title: 'Электрооборудование', desc: 'Аккумулятор, генератор, стартер, бортовая электроника' },
  { icon: '04', title: 'Тормозная система', desc: 'Колодки, диски, суппорты, цилиндры' },
  { icon: '05', title: 'Кондиционер и печка', desc: 'Заправка фреона, ремонт компрессора' },
  { icon: '06', title: 'Выхлопная система', desc: 'Глушитель, катализатор, гофра, сварка' },
];

const TECH_ITEMS = [
  { icon: '', label: 'Смартфоны' },
  { icon: '', label: 'Ноутбуки' },
  { icon: '', label: 'Планшеты' },
  { icon: '', label: 'Телевизоры' },
  { icon: '', label: 'Бытовая техника' },
  { icon: '', label: 'Другое' },
];

const PRICES: Record<string, { name: string; price: number }[]> = {
  'Смартфоны':       [{ name:'Замена стекла',price:500 },{ name:'Замена аккумулятора',price:4000 },{ name:'Замена дисплея',price:8500 },{ name:'Ремонт разъёма зарядки',price:2500 },{ name:'Восстановление после воды',price:6000 }],
  'Ноутбуки':        [{ name:'Замена термопасты',price:2000 },{ name:'Чистка охлаждения',price:2500 },{ name:'Замена матрицы',price:12000 },{ name:'Ремонт материнской платы',price:15000 },{ name:'Замена аккумулятора',price:7000 }],
  'Планшеты':        [{ name:'Замена стекла',price:4000 },{ name:'Замена аккумулятора',price:5000 },{ name:'Ремонт разъёма',price:3000 },{ name:'Замена дисплея',price:9000 }],
  'Телевизоры':      [{ name:'Диагностика',price:1000 },{ name:'Замена блока питания',price:5000 },{ name:'Ремонт подсветки',price:7000 },{ name:'Прошивка',price:2000 }],
  'Бытовая техника': [{ name:'Диагностика',price:1500 },{ name:'Замена двигателя',price:8000 },{ name:'Ремонт электроники',price:6000 },{ name:'Замена ТЭНа',price:4500 }],
  'Другое':          [{ name:'Консультация',price:500 },{ name:'Диагностика',price:1000 },{ name:'Ремонт любой сложности',price:3000 }],
};

const FACTS = [
  { num: '7', unit: 'лет', label: 'в деле' },
  { num: '800+', unit: '', label: 'авто отремонтировано' },
  { num: '500+', unit: '', label: 'гаджетов восстановлено' },
  { num: '98%', unit: '', label: 'довольных клиентов' },
];

/* ─── InView hook ─── */
function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.12) {
  const [v, setV] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold });
    o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return v;
}

/* ─── CountUp ─── */
function CountUp({ target, run }: { target: number; run: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run || target === 0) { setV(target); return; }
    let s: number;
    const step = (ts: number) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 1500, 1);
      setV(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [run, target]);
  return <>{v}</>;
}

/* ══════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const heroRef     = useRef<HTMLDivElement>(null);
  const autoRef     = useRef<HTMLDivElement>(null);
  const techRef     = useRef<HTMLDivElement>(null);
  const aboutRef    = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);
  const factsRef    = useRef<HTMLDivElement>(null);

  const factsInView = useInView(factsRef as React.RefObject<HTMLElement>);
  const [activeTab, setActiveTab] = useState('Смартфоны');
  const [headerH] = useState(64);

  /* scroll from other pages */
  useEffect(() => {
    if (!location.state?.scrollTo) return;
    const id = location.state.scrollTo as string;
    setTimeout(() => {
      const map: Record<string, React.RefObject<HTMLDivElement | null>> = {
        auto: autoRef, services: techRef, about: aboutRef, contacts: contactsRef,
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
      <SiteHeader refs={{ hero: heroRef, auto: autoRef, services: techRef, about: aboutRef, contacts: contactsRef }} />

      {/* ════════════════════════════════════
          HERO — асимметричный layout
      ════════════════════════════════════ */}
      <section ref={heroRef} className={s.hero}>
        {/* Фоновые декоративные полосы */}
        <div className={s.heroStripe1} />
        <div className={s.heroStripe2} />

        <div className={s.heroInner}>
          {/* Левый столбец — текст */}
          <div className={s.heroLeft}>
            <div className={s.heroEyebrow}>
              <span className={s.heroDot} />
              п. Нижнесакмарский · Работаем 9:00–20:00 ежедневно
            </div>
            <h1 className={s.heroTitle}>
              Ремонт авто<br/>
              <em className={s.heroEm}>и электроники</em>
            </h1>
            <p className={s.heroDesc}>
              Честная диагностика, реальные цены.<br/>
              Один мастер — один ответ за каждую работу.
            </p>
            <div className={s.heroCtas}>
              <button className={s.ctaPrimary} onClick={handleOrder}>
                Записаться на ремонт
              </button>
              <button className={s.ctaGhost} onClick={() => scrollTo(autoRef.current)}>
                Смотреть услуги ↓
              </button>
            </div>
          </div>

          {/* Правый столбец — «человеческий» блок с фото */}
          <div className={s.heroRight}>
            {/*
              📸 ФОТО: здесь нужно фото мастера или гаража.
              Замени src на реальный путь: src="/images/master.jpg"
              Размер: минимум 600×700px, портретная ориентация.
              Пока стоит placeholder.
            */}
            <div className={s.heroPhoto}>
              <div className={s.heroPhotoInner}>
                <img 
                  src="/images/master.jpg" 
                  alt="Мастер за работой"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className={s.heroPill1}>Гарантия до 1 года</div>
              <div className={s.heroPill2}>Ремонт в день обращения</div>
            </div>
          </div>
        </div>

        {/* Бегущие числа — прямо под hero */}
        <div ref={factsRef} className={s.heroFacts}>
          {FACTS.map((f, i) => {
            const num = parseInt(f.num.replace(/\D/g, '')) || 0;
            const suffix = f.num.replace(/\d/g, '');
            return (
              <div key={i} className={s.factItem}>
                <div className={s.factNum}>
                  {num > 0 ? <><CountUp target={num} run={factsInView} />{suffix}</> : f.num}
                  {f.unit && <span className={s.factUnit}>{f.unit}</span>}
                </div>
                <div className={s.factLabel}>{f.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════
          АВТО-УСЛУГИ — «рваная» сетка
      ════════════════════════════════════ */}
      <section ref={autoRef} className={s.autoSection}>
        <div className={s.sectionInner}>
          <div className={s.sectionLabel}>Основное направление</div>
          <div className={s.sectionHeadRow}>
            <h2 className={s.sectionTitle}>Ремонт автомобилей</h2>
            <p className={s.sectionSub}>Любые марки, честная цена до начала работ</p>
          </div>

          {/* Асимметричная сетка 2+2+2 со смещением */}
          <div className={s.autoGrid}>
            {AUTO_SERVICES.map((sv, i) => (
              <div key={i} className={`${s.autoCard} ${s[`autoCard${i}`] || ''}`}>
                <span className={s.autoCardIcon}>{sv.icon}</span>
                <h3 className={s.autoCardTitle}>{sv.title}</h3>
                <p className={s.autoCardDesc}>{sv.desc}</p>
              </div>
            ))}
          </div>

          <div className={s.sectionAction}>
            <button className={s.ctaPrimary} onClick={handleOrder}>
              Записаться на диагностику
            </button>
            <span className={s.actionNote}>Диагностика бесплатно при ремонте</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          ЭЛЕКТРОНИКА — горизонтальный скролл + прайс
      ════════════════════════════════════ */}
      <section ref={techRef} className={s.techSection}>
        <div className={s.sectionInner}>
          <div className={s.sectionLabel}>Также занимаемся</div>
          <div className={s.sectionHeadRow}>
            <h2 className={s.sectionTitle}>Электроника</h2>
            <p className={s.sectionSub}>Смартфоны, ноутбуки, телевизоры, бытовая техника</p>
          </div>

          <div className={s.techLayout}>
            {/* Левая часть — теги + прайс */}
            <div className={s.techLeft}>
              <div className={s.techTags}>
                {TECH_ITEMS.map(t => (
                  <button key={t.label}
                    className={`${s.techTag} ${activeTab === t.label ? s.techTagActive : ''}`}
                    onClick={() => setActiveTab(t.label)}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className={s.priceTable}>
                <div className={s.priceHead}><span>Услуга</span><span>Цена</span></div>
                {PRICES[activeTab]?.map((row, i) => (
                  <div key={i} className={s.priceRow} style={{ '--i': i } as React.CSSProperties}>
                    <span className={s.priceName}>{row.name}</span>
                    <span className={s.priceVal}>{row.price.toLocaleString()} ₽</span>
                  </div>
                ))}
                <div className={s.priceNote}>* Точная стоимость определяется после диагностики</div>
              </div>
            </div>

            {/* Правая часть */}
            <div className={s.techRight}>
              <div className={s.techRightTitle}>Почему обращаются к нам</div>
              {[
                { n: '1–2 часа',  label: 'среднее время ремонта смартфона' },
                { n: 'В день',    label: 'принимаем большинство устройств' },
                { n: '6 мес.',    label: 'гарантия на ремонт электроники'  },
                { n: 'Честно',    label: 'называем цену до начала работ'   },
              ].map((item, i) => (
                <div key={i} className={s.techRightItem}>
                  <div className={s.techRightN}>{item.n}</div>
                  <div className={s.techRightLabel}>{item.label}</div>
                </div>
              ))}
              <p className={s.techRightNote}>
                Не берёмся за работу, если ремонт невыгоден клиенту.
                Скажем честно и посоветуем что делать дальше.
              </p>
              <button className={s.ctaPrimary} onClick={handleOrder}>Записаться на ремонт</button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          О МАСТЕРЕ — живой, асимметричный
      ════════════════════════════════════ */}
      <section ref={aboutRef} className={s.aboutSection}>
        <div className={s.sectionInner}>
          <div className={s.aboutGrid}>
            {/* Фото */}
            <div className={s.aboutPhotoWrap}>
              {/*
                📸 ФОТО: фото мастера за работой или инструменты крупным планом.
                src="/images/about.jpg" — горизонтальное, минимум 800×600px.
              */}
              <div className={s.aboutPhoto}>
                <img 
                  src="/images/about.jpg" 
                  alt="Мастер ремонтирует автомобиль"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className={s.aboutBadge}>7 лет опыта</div>
            </div>

            {/* Текст */}
            <div className={s.aboutText}>
              <div className={s.sectionLabel}>О мастере</div>
              <h2 className={s.sectionTitle}>Работаю честно.<br/>Отвечаю лично.</h2>
              <p className={s.aboutParagraph}>
                Начинал с ремонта телефонов в 2016-м, сейчас основное — автомобили.
                За эти годы через руки прошло больше 800 машин и столько же гаджетов.
              </p>
              <p className={s.aboutParagraph}>
                Называю цену до начала работ. Если ремонт нецелесообразен — говорю об этом
                прямо. Работаю один, без посредников — за каждый ремонт отвечаю лично.
              </p>
              <div className={s.aboutPoints}>
                {[
                  'Называю цену до работы — без сюрпризов',
                  'Оригинальные запчасти или согласованные аналоги',
                  'Гарантия на все виды работ до 1 года',
                  'Выезд в Нижнесакмарский и окрестности',
                ].map((pt, i) => (
                  <div key={i} className={s.aboutPoint}>
                    <span className={s.aboutPointDot} />
                    {pt}
                  </div>
                ))}
              </div>
              <button className={s.ctaPrimary} onClick={handleOrder} style={{ marginTop: '2rem' }}>
                Записаться
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          КОНТАКТЫ + КАРТА
      ════════════════════════════════════ */}
      <section ref={contactsRef} className={s.contactsSection}>
        <div className={s.sectionInner}>
          <div className={s.sectionLabel}>Где найти</div>
          <h2 className={s.sectionTitle}>Контакты</h2>

          <div className={s.contactsGrid}>
            {/* Карта */}
            <div className={s.mapWrap}>
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=55.1012%2C51.2088&z=16&pt=55.1012%2C51.2088%2Cpm2rdl&l=map&text=%D0%9D%D0%B8%D0%B6%D0%BD%D0%B5%D1%81%D0%B0%D0%BA%D0%BC%D0%B0%D1%80%D1%81%D0%BA%D0%B8%D0%B9%2C+%D1%83%D0%BB.+%D0%91%D0%B0%D1%81%D1%82%D0%B8%D0%BE%D0%BD%D0%BD%D0%B0%D1%8F+48"
                width="100%" height="100%" frameBorder="0"
                title="п. Нижнесакмарский, ул. Бастионная, 48"
                style={{ display: 'block', minHeight: 320 }}
                allowFullScreen
              />
            </div>

            {/* Инфо */}
            <div className={s.contactInfo}>
              {[
                { icon: '', label: 'Адрес', val: 'п. Нижнесакмарский,\nул. Бастионная, 48' },
                { icon: '', label: 'Телефон', val: '+7 (987) 773-24-64' },
                { icon: '', label: 'Email', val: 'remont-online@mail.ru' },
                { icon: '', label: 'Время', val: 'Ежедневно 9:00 – 20:00' },
              ].map(c => (
                <div key={c.label} className={s.contactRow}>

                  <div>
                    <div className={s.contactLabel}>{c.label}</div>
                    <div className={s.contactVal}>{c.val}</div>
                  </div>
                </div>
              ))}
              <button className={s.ctaPrimary} onClick={handleOrder} style={{ width: '100%', marginTop: '1.5rem' }}>
                Записаться на ремонт
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FOOTER
      ════════════════════════════════════ */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerBrand}>

            <div>
              <div className={s.footerName}>Ремонт-Онлайн</div>
              <div className={s.footerTagline}>Авто &amp; Электроника</div>
            </div>
          </div>
          <div className={s.footerLinks}>
            {[
              { label: 'Авто',        action: () => scrollTo(autoRef.current) },
              { label: 'Электроника', action: () => scrollTo(techRef.current) },
              { label: 'О мастере',   action: () => scrollTo(aboutRef.current) },
              { label: 'Контакты',    action: () => scrollTo(contactsRef.current) },
              { label: 'Отзывы',      action: () => navigate('/reviews') },
            ].map(l => (
              <button key={l.label} className={s.footerLink} onClick={l.action}>{l.label}</button>
            ))}
          </div>
          <div className={s.footerCopy}>© 2026 · п. Нижнесакмарский</div>
        </div>
      </footer>
    </div>
  );
}