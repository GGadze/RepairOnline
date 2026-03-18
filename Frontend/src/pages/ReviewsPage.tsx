import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import s from '../components/ReviewsPage.module.css';
import { reviewsApi } from '../services/api';
import type { Review } from '../types';

const fmt = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day:'numeric', month:'long', year:'numeric' });

function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= n ? '#f59e0b' : '#1e2d45' }}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg,     setAvg]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort,    setSort]    = useState<'new'|'old'|'high'|'low'>('new');

  useEffect(() => {
    reviewsApi.getAll()
      .then(d => { setReviews(Array.isArray(d.reviews) ? d.reviews : []); setAvg(d.avg_rating || 0); })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...reviews].sort((a, b) => {
    if (sort === 'new')  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sort === 'old')  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sort === 'high') return b.rating - a.rating;
    return a.rating - b.rating;
  });

  const dist = [5,4,3,2,1].map(r => ({ r, count: reviews.filter(x => x.rating === r).length }));

  return (
    <div className={s.page}>
      <SiteHeader alwaysVisible activeId="reviews" />

      <div className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.tag}>Отзывы клиентов</div>
          <h1 className={s.title}>Что говорят<br/>наши клиенты</h1>
          <p className={s.sub}>Реальные отзывы о ремонте авто и электроники</p>
        </div>
      </div>

      <div className={s.container}>
        {/* Сводка */}
        <div className={s.summary}>
          <div className={s.summaryLeft}>
            <div className={s.avgNum}>{avg > 0 ? avg.toFixed(1) : '—'}</div>
            <Stars n={Math.round(avg)} size={22} />
            <div className={s.avgTotal}>{reviews.length} отзывов</div>
          </div>
          <div className={s.bars}>
            {dist.map(d => (
              <div key={d.r} className={s.bar}>
                <span className={s.barLabel}>{d.r} ★</span>
                <div className={s.barTrack}>
                  <div className={s.barFill} style={{ width: reviews.length ? `${(d.count/reviews.length)*100}%` : '0%' }} />
                </div>
                <span className={s.barCount}>{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Сортировка */}
        <div className={s.sortRow}>
          <span className={s.sortLabel}>Сортировка:</span>
          {([['new','Сначала новые'],['old','Сначала старые'],['high','Высокий рейтинг'],['low','Низкий рейтинг']] as const).map(([v,l]) => (
            <button key={v} className={[s.sortBtn, sort===v ? s.sortActive : ''].join(' ')} onClick={() => setSort(v)}>{l}</button>
          ))}
        </div>

        {/* Карточки */}
        {loading ? (
          <div className={s.loader}><div className={s.spin}/> Загрузка...</div>
        ) : sorted.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>💬</div>
            <div className={s.emptyTitle}>Пока нет отзывов</div>
            <div className={s.emptySub}>Будьте первым после ремонта</div>
          </div>
        ) : (
          <div className={s.grid}>
            {sorted.map((r, i) => (
              <div key={r.id} className={s.card} style={{ animationDelay: `${i * 40}ms` }}>
                <div className={s.cardTop}>
                  <div className={s.avatar}>{r.user_name?.charAt(0)?.toUpperCase() ?? '?'}</div>
                  <div className={s.userInfo}>
                    <div className={s.userName}>{r.user_name ?? 'Аноним'}</div>
                    <div className={s.userDate}>{fmt(r.created_at)}</div>
                  </div>
                  <Stars n={r.rating} size={13} />
                </div>
                {r.comment && <p className={s.cardText}>{r.comment}</p>}
                <div className={s.verified}>✓ Проверенный заказ</div>
              </div>
            ))}
          </div>
        )}

        <div className={s.cta}>
          <div>
            <div className={s.ctaTitle}>Были у нас?</div>
            <div className={s.ctaSub}>Оставьте отзыв в личном кабинете</div>
          </div>
          <button className={s.ctaBtn} onClick={() => navigate('/cabinet')}>Личный кабинет →</button>
        </div>
      </div>
    </div>
  );
}