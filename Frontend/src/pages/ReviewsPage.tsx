import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import styles from '../components/ReviewsPage.module.css';
import { reviewsApi } from '../services/api';
import type { Review } from '../types';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

function Stars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`${styles.stars} ${styles['stars_' + size]}`}>
      {[1,2,3,4,5].map(s => (
        <span key={s} className={s <= rating ? styles.starOn : styles.starOff}>★</span>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={styles.ratingBarRow}>
      <span className={styles.ratingBarLabel}>{label}</span>
      <div className={styles.ratingBarTrack}>
        <div className={styles.ratingBarFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.ratingBarCount}>{count}</span>
    </div>
  );
}

export default function ReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [avg,     setAvg]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [sort,    setSort]      = useState<'date_desc' | 'date_asc' | 'rating_desc' | 'rating_asc'>('date_desc');

  useEffect(() => {
    reviewsApi.getAll()
      .then(d => { setReviews(Array.isArray(d.reviews) ? d.reviews : []); setAvg(d.avg_rating || 0); })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...reviews].sort((a, b) => {
    if (sort === 'date_desc')   return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sort === 'date_asc')    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sort === 'rating_desc') return b.rating - a.rating;
    return a.rating - b.rating;
  });

  // Распределение рейтингов
  const dist = [5,4,3,2,1].map(r => ({ r, count: reviews.filter(x => x.rating === r).length }));

  return (
    <div className={styles.page}>
      <SiteHeader alwaysVisible activeId="reviews" />

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroBlob1}/><div className={styles.heroBlob2}/>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>💬 Отзывы клиентов</div>
          <h1 className={styles.heroTitle}>Что говорят<br/><span className={styles.heroAccent}>наши клиенты</span></h1>
          <p className={styles.heroSub}>Реальные отзывы людей, которые доверили нам свою технику</p>
        </div>
      </div>

      <div className={styles.container}>
        {/* Сводка рейтинга */}
        <div className={styles.ratingCard}>
          <div className={styles.ratingLeft}>
            <div className={styles.ratingBig}>{avg > 0 ? avg.toFixed(1) : '—'}</div>
            <Stars rating={Math.round(avg)} size="lg" />
            <div className={styles.ratingTotal}>{reviews.length} {reviews.length === 1 ? 'отзыв' : reviews.length < 5 ? 'отзыва' : 'отзывов'}</div>
          </div>
          <div className={styles.ratingRight}>
            {dist.map(d => <RatingBar key={d.r} label={`${d.r} ★`} count={d.count} total={reviews.length} />)}
          </div>
        </div>

        {/* Сортировка */}
        <div className={styles.sortRow}>
          <span className={styles.sortLabel}>Сортировка:</span>
          {([
            ['date_desc',   'Сначала новые'],
            ['date_asc',    'Сначала старые'],
            ['rating_desc', 'По оценке ↓'],
            ['rating_asc',  'По оценке ↑'],
          ] as const).map(([val, label]) => (
            <button key={val}
              className={`${styles.sortBtn} ${sort === val ? styles.sortBtnActive : ''}`}
              onClick={() => setSort(val)}>{label}</button>
          ))}
        </div>

        {/* Список */}
        {loading ? (
          <div className={styles.loader}>
            <div className={styles.loaderSpinner}/>
            <span>Загрузка отзывов...</span>
          </div>
        ) : sorted.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>💬</div>
            <div className={styles.emptyTitle}>Пока нет отзывов</div>
            <div className={styles.emptySub}>Будьте первым, кто оставит отзыв после ремонта</div>
          </div>
        ) : (
          <div className={styles.grid}>
            {sorted.map((r, i) => (
              <div key={r.id} className={styles.card} style={{ '--i': i } as React.CSSProperties}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>
                    {r.user_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{r.user_name ?? 'Аноним'}</div>
                    <div className={styles.userDate}>{formatDate(r.created_at)}</div>
                  </div>
                  <Stars rating={r.rating} size="sm" />
                </div>
                {r.comment && <p className={styles.cardText}>{r.comment}</p>}
                <div className={styles.cardFooter}>
                  <span className={styles.verifiedBadge}>✓ Проверенный заказ</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className={styles.cta}>
          <div className={styles.ctaText}>
            <h3>Стали нашим клиентом?</h3>
            <p>Поделитесь своим опытом — это поможет другим сделать выбор</p>
          </div>
          <button className={styles.ctaBtn} onClick={() => navigate('/cabinet')}>
            Оставить отзыв →
          </button>
        </div>
      </div>
    </div>
  );
}