import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import s from '../components/ReviewsPage.module.css';
import { reviewsApi } from '../services/api';
import type { Review } from '../types';

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

function Stars({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <div className={s.stars}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= n ? s.starOn : s.starOff} style={{ fontSize: size }}>★</span>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={s.barRow}>
      <span className={s.barLabel}>{label}</span>
      <div className={s.barTrack}>
        <div className={s.barFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={s.barCount}>{count}</span>
    </div>
  );
}

type SortKey = 'new' | 'old' | 'high' | 'low';

export default function ReviewsPage() {
  const navigate = useNavigate();
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [avg,      setAvg]      = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [sort,     setSort]     = useState<SortKey>('new');

  useEffect(() => {
    reviewsApi.getAll()
      .then(d => {
        setReviews(Array.isArray(d.reviews) ? d.reviews : []);
        setAvg(d.avg_rating || 0);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...reviews].sort((a, b) => {
    if (sort === 'new')  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sort === 'old')  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sort === 'high') return b.rating - a.rating;
    return a.rating - b.rating;
  });

  const dist = [5,4,3,2,1].map(r => ({
    r, count: reviews.filter(x => x.rating === r).length,
  }));

  const totalReviews = reviews.length;
  const label = totalReviews === 1 ? 'отзыв'
    : totalReviews > 1 && totalReviews < 5 ? 'отзыва' : 'отзывов';

  return (
    <div className={s.page}>
      <SiteHeader alwaysVisible activeId="reviews" />

      {/* Шапка страницы */}
      <div className={s.pageHead}>
        <div className={s.pageHeadInner}>
          <div className={s.pageLabel}>Отзывы клиентов</div>
          <h1 className={s.pageTitle}>Что говорят наши клиенты</h1>
          <p className={s.pageSub}>Реальные отзывы о ремонте автомобилей и электроники</p>
        </div>
      </div>

      <div className={s.container}>

        {/* Акцент-цитата */}
        <div className={s.quoteBlock}>
          <div className={s.quoteText}>
            «Работаю один. За каждый ремонт отвечаю лично — именем и репутацией»
          </div>
          <div className={s.quoteAuthor}>— Мастер АвтоМастер, п. Нижнесакмарский</div>
        </div>

        {/* Сводный рейтинг */}
        <div className={s.summary}>
          <div className={s.summaryLeft}>
            <div className={s.bigNum}>{avg > 0 ? avg.toFixed(1) : '—'}</div>
            <Stars n={Math.round(avg)} size={22} />
            <div className={s.totalLabel}>{totalReviews} {label}</div>
          </div>
          <div className={s.bars}>
            {dist.map(d => (
              <RatingBar key={d.r} label={`${d.r} ★`} count={d.count} total={totalReviews} />
            ))}
          </div>
        </div>

        {/* Сортировка */}
        <div className={s.sortRow}>
          <span className={s.sortTitle}>Сортировка:</span>
          {([
            ['new',  'Сначала новые'],
            ['old',  'Сначала старые'],
            ['high', 'Высокий рейтинг'],
            ['low',  'Низкий рейтинг'],
          ] as [SortKey, string][]).map(([v, l]) => (
            <button key={v}
              className={`${s.sortBtn} ${sort === v ? s.sortActive : ''}`}
              onClick={() => setSort(v)}>
              {l}
            </button>
          ))}
        </div>

        {/* Факты о сервисе */}
        <div className={s.factStrip}>
          {[
            { n: '800+', label: 'выполненных ремонтов' },
            { n: '7 лет', label: 'на рынке' },
            { n: '98%', label: 'довольных клиентов' },
          ].map(f => (
            <div key={f.n} className={s.factStripItem}>
              <span className={s.factStripN}>{f.n}</span>
              <span className={s.factStripL}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Карточки */}
        {loading ? (
          <div className={s.loader}>
            <div className={s.spin} />
            <span>Загрузка отзывов...</span>
          </div>
        ) : sorted.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyTitle}>Пока нет отзывов</div>
            <div className={s.emptySub}>Оставьте отзыв после ремонта в личном кабинете</div>
          </div>
        ) : (
          <div className={s.grid}>
            {sorted.map((r, i) => (
              <div key={r.id} className={s.card} style={{ '--i': i } as React.CSSProperties}>
                <div className={s.cardTop}>
                  <div className={s.avatar}>
                    {r.user_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className={s.cardMeta}>
                    <div className={s.cardName}>{r.user_name ?? 'Аноним'}</div>
                    <div className={s.cardDate}>{fmt(r.created_at)}</div>
                  </div>
                  <Stars n={r.rating} size={15} />
                </div>
                {r.comment && <p className={s.cardText}>{r.comment}</p>}
                <div className={s.cardFoot}>
                  <span className={s.verified}>Проверенный заказ</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className={s.cta}>
          <div>
            <div className={s.ctaTitle}>Были у нас?</div>
            <div className={s.ctaSub}>Оставьте отзыв — это поможет другим сделать выбор</div>
          </div>
          <button className={s.ctaBtn} onClick={() => navigate('/cabinet')}>
            Оставить отзыв
          </button>
        </div>

      </div>
    </div>
  );
}