package repository

import (
	"github.com/GGadze/RepairOnline/internal/models"
	"github.com/jmoiron/sqlx"
)

type AnalyticsRepository struct {
	db *sqlx.DB
}

func NewAnalyticsRepository(db *sqlx.DB) *AnalyticsRepository {
	return &AnalyticsRepository{db: db}
}

// GetAdminStats — общая статистика за период (from/to в формате 'YYYY-MM-DD';
// пустые строки означают "без фильтра по этой границе").
func (r *AnalyticsRepository) GetAdminStats(from, to string) (*models.AdminStats, error) {
	stats := &models.AdminStats{}
	err := r.db.QueryRow(`
		SELECT
			COUNT(*)                                                    AS total_orders,
			COALESCE(SUM(CASE WHEN DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', NOW())
				THEN o.final_price ELSE 0 END), 0)                     AS monthly_revenue,
			COALESCE(SUM(o.final_price), 0)                            AS total_revenue,
			COUNT(CASE WHEN s.name NOT IN ('Выдан','Отменён') THEN 1 END) AS active_orders,
			COUNT(CASE WHEN s.name = 'Выдан' THEN 1 END)              AS completed_orders
		FROM orders o
		LEFT JOIN order_status_history osh ON osh.order_id = o.id
			AND osh.id = (SELECT MAX(id) FROM order_status_history WHERE order_id = o.id)
		LEFT JOIN statuses s ON s.id = osh.status_id
		WHERE ($1 = '' OR o.created_at >= NULLIF($1,'')::date)
		  AND ($2 = '' OR o.created_at < (NULLIF($2,'')::date + 1))
	`, from, to).Scan(
		&stats.TotalOrders,
		&stats.MonthlyRevenue,
		&stats.TotalRevenue,
		&stats.ActiveOrders,
		&stats.CompletedOrders,
	)
	return stats, err
}

// GetMonthlyRevenue — прибыль по месяцам.
// Если from задан — за выбранный период, иначе за последние 12 месяцев.
func (r *AnalyticsRepository) GetMonthlyRevenue(from, to string) ([]models.MonthlyRevenue, error) {
	var result []models.MonthlyRevenue
	err := r.db.Select(&result, `
		SELECT
			TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
			COALESCE(SUM(final_price), 0)                        AS revenue,
			COUNT(*)                                             AS orders
		FROM orders
		WHERE final_price IS NOT NULL
		  AND ($1 = '' OR created_at >= NULLIF($1,'')::date)
		  AND ($2 = '' OR created_at < (NULLIF($2,'')::date + 1))
		  AND ($1 <> '' OR created_at >= NOW() - INTERVAL '12 months')
		GROUP BY DATE_TRUNC('month', created_at)
		ORDER BY month ASC
	`, from, to)
	return result, err
}

// GetRevenueByUser — прибыль с каждого пользователя за период.
func (r *AnalyticsRepository) GetRevenueByUser(from, to string) ([]models.UserRevenue, error) {
	var result []models.UserRevenue
	err := r.db.Select(&result, `
		SELECT
			u.id                                          AS user_id,
			(u.first_name || ' ' || u.last_name)         AS user_name,
			u.email,
			COUNT(o.id)                                  AS total_orders,
			COALESCE(SUM(o.final_price), 0)              AS revenue
		FROM users u
		JOIN orders o ON o.user_id = u.id
		WHERE ($1 = '' OR o.created_at >= NULLIF($1,'')::date)
		  AND ($2 = '' OR o.created_at < (NULLIF($2,'')::date + 1))
		GROUP BY u.id, u.first_name, u.last_name, u.email
		ORDER BY revenue DESC
	`, from, to)
	return result, err
}