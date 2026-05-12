import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { adminApi, chatApi, orderServicesApi, slotsApi } from '../services/api'
import type {
  Order, Status, AdminStats, MonthlyRevenue, UserRevenue,
  ChatConversation, ChatMessage, OrderStatusHistory, Category, TimeSlot
} from '../types'
import styles from "../components/AdminPage.module.css"

// ─── API helpers ───────────────────────────────────────────────────────────────
const api = (await import('../services/api')).default

async function fetchStatuses(): Promise<Status[]> {
  const res = await api.get<Status[]>('/statuses').catch(() => ({ data: [] }))
  return (res as any).data ?? []
}

async function fetchOrders(statusId?: number): Promise<Order[]> {
  const res = await api.get<Order[]>('/orders', { params: statusId ? { status_id: statusId } : {} })
  return res.data
}

async function fetchCategories(): Promise<Category[]> {
  const res = await api.get<Category[]>('/categories')
  return res.data
}

// ─── Вспомогательная функция для плоского списка категорий ──────────────────────
function flattenCategories(cats: Category[] | undefined, depth: number = 0): (Category & { depth: number })[] {
  if (!cats || !Array.isArray(cats)) return []
  return cats.flatMap(c => [
    { ...c, depth },
    ...flattenCategories(c.children, depth + 1)
  ])
}

// ─── Правила переходов статусов ────────────────────────────────────────────────
const STATUS_TRANSITIONS: Record<string, string[]> = {
  'Новая': ['Принята', 'Отменён'],
  'Принята': ['В процессе', 'Ожидание запчастей', 'Отменён'],
  'В процессе': ['Ожидание запчастей', 'Готово', 'Отменён'],
  'Ожидание запчастей': ['В процессе', 'Отменён'],
  'Готово': ['Выдан', 'Отменён'],
  'Выдан': [],
  'Отменён': [],
}

const FINAL_STATUSES = ['Выдан', 'Отменён']

// ─── Тип для топ-услуг ──────────────────────────────────────────────────────────
interface TopService {
  service_name: string
  order_count: number
  total_revenue: number
}

// ─── Основной компонент ────────────────────────────────────────────────────────
type Tab = 'dashboard' | 'orders' | 'catalog' | 'schedule' | 'chat'

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('dashboard')

  // Dashboard
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [monthly, setMonthly] = useState<MonthlyRevenue[]>([])
  const [userRevenue, setUserRevenue] = useState<UserRevenue[]>([])
  const [topServices, setTopServices] = useState<TopService[]>([])
  const [statusDistribution, setStatusDistribution] = useState<{ name: string; count: number; color: string }[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  
  const [selectedClient, setSelectedClient] = useState<UserRevenue | null>(null)
  const [clientOrders, setClientOrders] = useState<Order[]>([])
  const [clientLoading, setClientLoading] = useState(false)

  // Фильтры для аналитики
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState<string>(() => new Date().toISOString().split('T')[0])

  // Orders
  const [orders, setOrders] = useState<Order[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [filterStatus, setFilterStatus] = useState<number>(0)
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [orderSearch, setOrderSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderHistory, setOrderHistory] = useState<OrderStatusHistory[]>([])
  const [orderServices, setOrderServices] = useState<any[]>([])
  const [statusComment, setStatusComment] = useState('')
  const [newStatusId, setNewStatusId] = useState<number>(0)
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Catalog
  const [categories, setCategories] = useState<Category[]>([])
  const [catSearch, setCatSearch] = useState('')
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null)
  const [editingPrice, setEditingPrice] = useState<string>('')
  const [showCatModal, setShowCatModal] = useState(false)
  const [catEditId, setCatEditId] = useState<number | null>(null)
  const [catName, setCatName] = useState('')
  const [catParentId, setCatParentId] = useState<number | null>(null)
  const [catBasePrice, setCatBasePrice] = useState('')

  // Schedule
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [newSlotTime, setNewSlotTime] = useState('10:00')

  // Chat
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeChatId, setActiveChatId] = useState<number | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Guards ──
  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return }
    if (user?.role !== 'admin') { navigate('/'); return }
  }, [isAuthenticated, user, navigate])

  // ─── Загрузка данных для аналитики ─────────────────────────────────────────────
  const loadDashboardData = useCallback(async () => {
    setStatsLoading(true)
    try {
      const [s, m, u] = await Promise.all([
        adminApi.getStats(),
        adminApi.getMonthlyRevenue(),
        adminApi.getUserRevenue(),
      ])
      setStats(s)
      setMonthly(m || [])
      setUserRevenue(u || [])

      // Загружаем топ-услуги и распределение по статусам (из заказов)
      const allOrders = await fetchOrders()
      const allStatuses = await fetchStatuses()
      
      // Распределение по статусам
      const dist = allStatuses.map(st => ({
        name: st.name,
        count: allOrders.filter(o => o.status_name === st.name).length,
        color: st.color_code
      })).filter(d => d.count > 0)
      setStatusDistribution(dist)

      // Топ-5 услуг (собираем из всех заказов)
      const serviceCounts: Record<string, { count: number; revenue: number }> = {}
      for (const order of allOrders) {
        try {
          const svc = await orderServicesApi.getServices(order.id)
          for (const s of svc) {
            if (!serviceCounts[s.service_name]) {
              serviceCounts[s.service_name] = { count: 0, revenue: 0 }
            }
            serviceCounts[s.service_name].count++
            serviceCounts[s.service_name].revenue += s.price || 0
          }
        } catch {}
      }
      const top: TopService[] = Object.entries(serviceCounts)
        .map(([name, data]) => ({ service_name: name, order_count: data.count, total_revenue: data.revenue }))
        .sort((a, b) => b.order_count - a.order_count)
        .slice(0, 5)
      setTopServices(top)

    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab !== 'dashboard') return
    loadDashboardData()
  }, [tab, loadDashboardData])

  // ── Load orders ──
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const [s, o] = await Promise.all([fetchStatuses(), fetchOrders(filterStatus || undefined)])
      setStatuses(s || [])
      setOrders(o || [])
    } finally {
      setOrdersLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    if (tab !== 'orders') return
    loadOrders()
  }, [tab, loadOrders])

  // ── Load catalog ──
  const loadCategories = useCallback(() => {
    fetchCategories().then(cats => setCategories(cats || []))
  }, [])
  useEffect(() => {
    if (tab !== 'catalog') return
    loadCategories()
  }, [tab, loadCategories])

  // ── Load schedule ──
  const loadSlots = useCallback(async () => {
    if (!selectedScheduleDate) return
    setSlotsLoading(true)
    try {
      const data = await slotsApi.getFreeByDate(selectedScheduleDate)
      setSlots(data || [])
    } catch { setSlots([]) }
    finally { setSlotsLoading(false) }
  }, [selectedScheduleDate])

  useEffect(() => {
    if (tab !== 'schedule') return
    loadSlots()
  }, [tab, loadSlots])

  // ── Load chat ──
  useEffect(() => {
    if (tab !== 'chat') return
    chatApi.listConversations().then(r => setConversations(r || []))
  }, [tab])

  const loadChatMessages = useCallback(() => {
    if (!activeChatId) return
    chatApi.getMessages(activeChatId).then(r => {
      setChatMessages(r || [])
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    })
  }, [activeChatId])

  useEffect(() => {
    if (!activeChatId) return
    loadChatMessages()
    pollingRef.current = setInterval(loadChatMessages, 4000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [activeChatId, loadChatMessages])

  // ── Select order ──
  const handleSelectOrder = async (order: Order) => {
    setSelectedOrder(order)
    setNewStatusId(0)
    setStatusComment('')
    try {
      const [hist, svc] = await Promise.all([
        api.get(`/orders/${order.id}/history`),
        orderServicesApi.getServices(order.id),
      ])
      setOrderHistory((hist as any).data || [])
      setOrderServices(svc || [])
    } catch { setOrderHistory([]); setOrderServices([]) }
  }

  // ── Update status ──
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatusId) return
    
    
    await api.patch(`/admin/orders/${selectedOrder.id}/status`, {
      status_id: newStatusId,
      comment: statusComment,
    })
    
    await loadOrders()
    
    const { data: updatedOrder } = await api.get(`/orders/${selectedOrder.id}`)
    setSelectedOrder(updatedOrder)
    
    const { data: history } = await api.get(`/orders/${selectedOrder.id}/history`)
    setOrderHistory(history || [])
    
    setNewStatusId(0)
    setStatusComment('')
  }

  // ── Quick cancel order ──
  const handleCancelOrder = async () => {
    if (!selectedOrder) return
    const cancelStatus = statuses.find(s => s.name === 'Отменён')
    if (!cancelStatus) return
    if (!confirm('Отменить заказ?')) return
    await api.patch(`/admin/orders/${selectedOrder.id}/status`, {
      status_id: cancelStatus.id,
      comment: 'Отменён администратором',
    })
    await loadOrders()
    setSelectedOrder(null)
  }

  // ── Send chat message ──
  const handleSendChat = async () => {
    if (!chatInput.trim() || !activeChatId) return
    await chatApi.sendMessage(chatInput.trim(), activeChatId)
    setChatInput('')
    loadChatMessages()
    chatApi.listConversations().then(r => setConversations(r || []))
  }

  // ─── Получить доступные статусы для перехода ──────────────────────────────────
  const getAllowedStatuses = (currentStatus: string | undefined): Status[] => {
    if (!currentStatus) return []
    const allowedNames = STATUS_TRANSITIONS[currentStatus] || []
    return (statuses || []).filter(s => allowedNames.includes(s.name))
  }

  const isFinalStatus = (statusName: string | undefined): boolean => {
    if (!statusName) return false
    return FINAL_STATUSES.includes(statusName)
  }

  // ── Catalog CRUD ──
  const handleSaveCategory = async () => {
    if (!catName.trim()) return
    const payload = {
      name: catName,
      parent_id: catParentId,
      level: 0,
      base_price: parseFloat(catBasePrice) || 0
    }
    try {
      if (catEditId) {
        await api.put(`/admin/categories/${catEditId}`, payload)
      } else {
        await api.post('/admin/categories', payload)
      }
      await loadCategories()
      closeModal()
    } catch (err) { console.error(err) }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Удалить категорию и все вложенные?')) return
    await api.delete(`/admin/categories/${id}`)
    loadCategories()
  }

  const handleUpdatePrice = async (id: number, price: number) => {
    const cat = flattenCategories(categories).find(c => c.id === id)
    if (!cat) return
    await api.put(`/admin/categories/${id}`, {
      name: cat.name,
      parent_id: cat.parent_id,
      level: cat.level,
      base_price: price
    })
    loadCategories()
  }

  const startEditPrice = (id: number, currentPrice: number) => {
    setEditingPriceId(id)
    setEditingPrice(String(currentPrice))
  }

  const savePrice = (id: number) => {
    const price = parseFloat(editingPrice) || 0
    handleUpdatePrice(id, price)
    setEditingPriceId(null)
  }

  const openModal = (cat?: Category) => {
    if (cat) {
      setCatEditId(cat.id)
      setCatName(cat.name)
      setCatParentId(cat.parent_id ?? null)
      setCatBasePrice(String(cat.base_price))
    } else {
      setCatEditId(null)
      setCatName('')
      setCatParentId(null)
      setCatBasePrice('')
    }
    setShowCatModal(true)
  }

  const closeModal = () => {
    setShowCatModal(false)
    setCatEditId(null)
    setCatName('')
    setCatParentId(null)
    setCatBasePrice('')
  }

  // ── Schedule actions ──
  const handleDeleteSlot = async (id: number) => {
    if (!confirm('Удалить слот?')) return
    await slotsApi.delete(id)
    loadSlots()
  }

  const handleAddSlot = async () => {
    if (!selectedScheduleDate || !newSlotTime) return
    await slotsApi.create(selectedScheduleDate, newSlotTime)
    loadSlots()
    setNewSlotTime('10:00')
  }

  const handleBlockDay = async () => {
    if (!confirm('Заблокировать весь день? Все свободные слоты будут удалены.')) return
    for (const slot of slots) {
      if (!slot.is_booked) {
        await slotsApi.delete(slot.id)
      }
    }
    loadSlots()
  }

  // ── Загрузка деталей клиента ─────────────────────────────────────────────────
const loadClientDetails = async (client: UserRevenue) => {
  setSelectedClient(client)
  setClientLoading(true)
  try {
    const allOrders = await fetchOrders()
    const clientOrdersList = allOrders.filter(o => o.user_id === client.user_id)
    setClientOrders(clientOrdersList)
  } catch {
    setClientOrders([])
  } finally {
    setClientLoading(false)
  }
}

  // ── Экспорт в CSV ─────────────────────────────────────────────────────────────

const exportToCSV = () => {
  if (!userRevenue.length) return
  
  const headers = ['Клиент', 'Email', 'Заказов', 'Прибыль']
  const rows = userRevenue.map(u => [
    u.user_name, 
    u.email, 
    String(u.total_orders), 
    // Убираем символ валюты и форматирование, оставляем чистое число
    String(u.revenue).replace(/\D/g, '')
  ])
  
  // Используем точку с запятой как разделитель (стандарт для Excel в РФ)
  const csvContent = [headers, ...rows]
    .map(row => row.join(';'))
    .join('\n')
  
  // Добавляем BOM для корректного отображения кириллицы в Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `revenue_report_${dateFrom}_${dateTo}.csv`
  link.click()
}

  // ── Фильтрация заказов ──
  const filteredOrders = useMemo(() => {
    let result = [...orders]
    
    if (showActiveOnly) {
      result = result.filter(o => !FINAL_STATUSES.includes(o.status_name))
    }
    
    if (orderSearch.trim()) {
      const search = orderSearch.trim().toLowerCase()
      result = result.filter(o => 
        o.user_name?.toLowerCase().includes(search) ||
        String(o.id).includes(search)
      )
    }
    
    return result
  }, [orders, showActiveOnly, orderSearch])

  // ── Фильтрация категорий ──
  const filteredCategories = flattenCategories(categories).filter(c =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  )

  // ── Формат валюты ─────────────────────────────────────────────────────────────
  const fmt = (n: number) => n?.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }) || '0 ₽'
  const maxRevenue = monthly.length > 0 ? Math.max(...monthly.map(m => m.revenue), 1) : 1
  
  // Средний чек
  const avgCheck = stats && stats.total_orders > 0 ? stats.total_revenue / stats.total_orders : 0

  if (!isAuthenticated || user?.role !== 'admin') return null

  return (
    <div className={styles.page}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.sidebarLogo}>RO</div>
          <div>
            <div className={styles.sidebarTitle}>Ремонт-Онлайн</div>
            <div className={styles.sidebarSub}>Панель администратора</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {([
            { id: 'dashboard', icon: '📊', label: 'Аналитика' },
            { id: 'orders', icon: '📋', label: 'Заказы' },
            { id: 'catalog', icon: '🗂️', label: 'Каталог' },
            { id: 'schedule', icon: '📅', label: 'Расписание' },
            { id: 'chat', icon: '💬', label: 'Чат' },
          ] as { id: Tab; icon: string; label: string }[]).map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${tab === item.id ? styles.navItemActive : ''}`}
              onClick={() => { setTab(item.id); setSelectedOrder(null) }}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
              {item.id === 'chat' && conversations?.some(c => c.unread_count > 0) && (
                <span className={styles.badge}>
                  {conversations?.reduce((a, c) => a + c.unread_count, 0) || 0}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.goToSiteBtn} onClick={() => navigate('/')}>
            🏠 На сайт
          </button>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>👤</div>
            <div>
              <div className={styles.adminName}>{user?.first_name} {user?.last_name}</div>
              <div className={styles.adminEmail}>{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>

        {/* ═══════ DASHBOARD ═══════ */}
        {tab === 'dashboard' && (
          <div className={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h1 className={styles.pageTitle} style={{ margin: 0 }}>Аналитика</h1>
              <button className={styles.btnSecondary} onClick={exportToCSV}>📥 Скачать отчёт (CSV)</button>
            </div>

            {/* Фильтр по датам */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <input type="date" className={styles.input} style={{ width: 'auto' }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <span style={{ color: 'var(--c-text3)', alignSelf: 'center' }}>—</span>
              <input type="date" className={styles.input} style={{ width: 'auto' }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
              <button className={styles.btnPrimary} onClick={loadDashboardData}>Применить</button>
            </div>

            {statsLoading ? <div className={styles.loading}>Загрузка...</div> : stats && (
              <>
                {/* Основные показатели */}
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}><div className={styles.statIcon}>📦</div><div className={styles.statValue}>{stats.total_orders}</div><div className={styles.statLabel}>Всего заказов</div></div>
                  <div className={styles.statCard}><div className={styles.statIcon}>💰</div><div className={styles.statValue}>{fmt(stats.monthly_revenue)}</div><div className={styles.statLabel}>Прибыль за месяц</div></div>
                  <div className={styles.statCard}><div className={styles.statIcon}>🏆</div><div className={styles.statValue}>{fmt(stats.total_revenue)}</div><div className={styles.statLabel}>Общая прибыль</div></div>
                  <div className={styles.statCard}><div className={styles.statIcon}>📊</div><div className={styles.statValue}>{fmt(avgCheck)}</div><div className={styles.statLabel}>Средний чек</div></div>
                  <div className={styles.statCard}><div className={styles.statIcon}>⚙️</div><div className={styles.statValue}>{stats.active_orders}</div><div className={styles.statLabel}>В работе</div></div>
                  <div className={styles.statCard}><div className={styles.statIcon}>✅</div><div className={styles.statValue}>{stats.completed_orders}</div><div className={styles.statLabel}>Завершено</div></div>
                </div>

                {/* График прибыли по месяцам + Распределение по статусам */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
                  {monthly.length > 0 && (
                    <div className={styles.chartCard}>
                      <h2 className={styles.chartTitle}>Прибыль по месяцам</h2>
                      <div className={styles.barChart}>
                        {monthly.map(m => (
                          <div key={m.month} className={styles.barWrapper}>
                            <div className={styles.barValue}>{fmt(m.revenue)}</div>
                            <div className={styles.bar} style={{ height: `${(m.revenue / maxRevenue) * 160}px` }} />
                            <div className={styles.barLabel}>{m.month?.slice(5)}/{m.month?.slice(2, 4)}</div>
                            <div className={styles.barOrders}>{m.orders} зак.</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {statusDistribution.length > 0 && (
                    <div className={styles.chartCard}>
                      <h2 className={styles.chartTitle}>Заказы по статусам</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {statusDistribution.map(s => (
                          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: s.color }} />
                            <span style={{ flex: 1, color: 'var(--c-text2)' }}>{s.name}</span>
                            <span style={{ fontWeight: 700, color: 'var(--c-text)' }}>{s.count}</span>
                            <span style={{ color: 'var(--c-text3)', fontSize: '0.8rem' }}>
                              ({((s.count / stats.total_orders) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Топ-5 услуг */}
                {topServices.length > 0 && (
                  <div className={styles.chartCard}>
                    <h2 className={styles.chartTitle}>Топ-5 услуг</h2>
                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead><tr><th>#</th><th>Услуга</th><th>Заказов</th><th>Выручка</th></tr></thead>
                        <tbody>
                          {topServices.map((s, i) => (
                            <tr key={s.service_name}>
                              <td className={styles.textMuted}>{i + 1}</td>
                              <td>{s.service_name}</td>
                              <td>{s.order_count}</td>
                              <td className={styles.textAccent}>{fmt(s.total_revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Прибыль по клиентам */}
                {userRevenue.length > 0 && (
                  <div className={styles.chartCard}>
                    <h2 className={styles.chartTitle}>Прибыль по клиентам</h2>
                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead><tr><th>#</th><th>Клиент</th><th>Email</th><th>Заказов</th><th>Прибыль</th></tr></thead>
                          <tbody>
                            {userRevenue.map((u, i) => (
                              <tr key={u.user_id} onClick={() => loadClientDetails(u)} style={{ cursor: 'pointer' }}>
                                <td>{i + 1}</td>
                                <td>{u.user_name}</td>
                                <td className={styles.textMuted}>{u.email}</td>
                                <td>{u.total_orders}</td>
                                <td className={styles.textAccent}>{fmt(u.revenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══════ ORDERS ═══════ */}
        {tab === 'orders' && (
          <div className={styles.section}>
            <h1 className={styles.pageTitle}>Заказы</h1>
            
            <div className={styles.filterRow}>
              <button className={`${styles.filterBtn} ${filterStatus === 0 ? styles.filterBtnActive : ''}`} onClick={() => setFilterStatus(0)}>Все</button>
              {statuses?.map(s => (
                <button key={s.id} className={`${styles.filterBtn} ${filterStatus === s.id ? styles.filterBtnActive : ''}`} style={filterStatus === s.id ? { borderColor: s.color_code } : {}} onClick={() => setFilterStatus(s.id)}>{s.name}</button>
              ))}
              <div style={{ flex: 1 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--c-text2)' }}>
                <input type="checkbox" checked={showActiveOnly} onChange={e => setShowActiveOnly(e.target.checked)} />
                Только активные
              </label>
              <input className={styles.searchInput} style={{ width: 200 }} placeholder="🔍 Поиск по клиенту или №" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
            </div>

            <div className={styles.ordersLayout}>
              <div className={styles.ordersList}>
                {ordersLoading ? <div className={styles.loading}>Загрузка...</div> : filteredOrders.length === 0 ? <div className={styles.empty}>Нет заказов</div> : filteredOrders.map(order => (
                  <div key={order.id} className={`${styles.orderCard} ${selectedOrder?.id === order.id ? styles.orderCardActive : ''}`} onClick={() => handleSelectOrder(order)}>
                    <div className={styles.orderCardTop}><span className={styles.orderId}>#{order.id}</span><span className={styles.orderStatus} style={{ color: order.color_code || '#94a3b8' }}>{order.status_name || '—'}</span></div>
                    <div className={styles.orderClient}>{order.user_name}</div>
                    <div className={styles.orderDevice}>{order.category_name || order.custom_device_name || 'Устройство не указано'}</div>
                    <div className={styles.orderMeta}><span>{order.appointment_date}</span>{order.final_price != null && <span>{fmt(order.final_price)}</span>}</div>
                  </div>
                ))}
              </div>

              {selectedOrder ? (
                <div className={styles.orderDetail}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 className={styles.detailTitle} style={{ margin: 0 }}>Заказ #{selectedOrder.id}</h2>
                    {!isFinalStatus(selectedOrder.status_name) && (
                      <button className={styles.btnSmallDanger} onClick={handleCancelOrder}>❌ Отменить заказ</button>
                    )}
                  </div>

                  <div className={styles.detailGrid}>
                    <div className={styles.detailRow}><span className={styles.detailLabel}>Клиент</span><span>{selectedOrder.user_name}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailLabel}>Устройство</span><span>{selectedOrder.category_name || selectedOrder.custom_device_name || '—'}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailLabel}>Дата визита</span><span>{selectedOrder.appointment_date} {selectedOrder.appointment_time}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailLabel}>Статус</span><span style={{ color: selectedOrder.color_code || '#94a3b8' }}>{selectedOrder.status_name || '—'}</span></div>
                    {selectedOrder.final_price != null && <div className={styles.detailRow}><span className={styles.detailLabel}>Стоимость</span><span className={styles.textAccent}>{fmt(selectedOrder.final_price)}</span></div>}
                  </div>

                  <div className={styles.detailSection}><div className={styles.detailSectionTitle}>Описание проблемы</div><div className={styles.detailText}>{selectedOrder.problem_description}</div></div>
                  
                  {orderServices.length > 0 && (
                    <div className={styles.detailSection}>
                      <div className={styles.detailSectionTitle}>Выбранные услуги</div>
                      <div className={styles.servicesList}>{orderServices.map((s: any) => <div key={s.id} className={styles.serviceItem}><span>{s.service_name}</span><span className={styles.textAccent}>{fmt(s.price)}</span></div>)}</div>
                    </div>
                  )}
                  
                  {orderHistory.length > 0 && (
  <div className={styles.detailSection}>
    <div className={styles.detailSectionTitle}>История статусов</div>
    <div className={styles.historyList}>
      {orderHistory.map((h: any) => (
        <div key={h.id} className={styles.historyItem}>
          <div className={styles.historyStatus}>{h.status_name}</div>
          {h.comment && <div className={styles.historyComment}>💬 {h.comment}</div>}
          <div className={styles.historyMeta}>{h.changed_by_name} · {new Date(h.changed_at).toLocaleString('ru-RU')}</div>
        </div>
      ))}
    </div>
  </div>
)}

                  {!isFinalStatus(selectedOrder.status_name) && (
                    <div className={styles.detailSection}>
                      <div className={styles.detailSectionTitle}>Изменить статус</div>
                      <div className={styles.statusChangeForm}>
                        <select 
                          className={styles.select} 
                          value={newStatusId} 
                          onChange={e => setNewStatusId(Number(e.target.value))}
                          disabled={getAllowedStatuses(selectedOrder.status_name).length === 0}
                        >
                          <option value={0}>Выберите статус...</option>
                          {getAllowedStatuses(selectedOrder.status_name).map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <input className={styles.input} placeholder="Комментарий (необязательно)" value={statusComment} onChange={e => setStatusComment(e.target.value)} />
                        <button className={styles.btnPrimary} onClick={handleUpdateStatus} disabled={!newStatusId}>Сохранить</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.orderDetailEmpty}><div className={styles.emptyIcon}>📋</div><div>Выберите заказ для просмотра</div></div>
              )}
            </div>
          </div>
        )}

        {/* ═══════ CATALOG ═══════ */}
        {tab === 'catalog' && (
          <div className={styles.section}>
            <h1 className={styles.pageTitle}>Каталог услуг</h1>
            <div className={styles.catalogHeader}>
              <div className={styles.searchWrapper}>
                <input className={styles.searchInput} placeholder="🔍 Поиск по названию..." value={catSearch} onChange={e => setCatSearch(e.target.value)} />
              </div>
              <button className={styles.btnPrimary} onClick={() => openModal()}>+ Добавить категорию</button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>ID</th><th>Название</th><th>Уровень</th><th>Базовая цена</th><th>Действия</th></tr></thead>
                <tbody>
                  {filteredCategories.map(cat => (
                    <tr key={cat.id}>
                      <td className={styles.textMuted}>#{cat.id}</td>
                      <td style={{ paddingLeft: `${cat.depth * 24 + 16}px` }}>
                        {cat.depth > 0 && <span style={{ color: 'var(--c-text3)', marginRight: 6 }}>└─</span>}
                        {cat.name}
                      </td>
                      <td className={styles.textMuted}>{cat.level}</td>
                      <td>
                        {editingPriceId === cat.id ? (
                          <input className={styles.priceInput} type="number" value={editingPrice} onChange={e => setEditingPrice(e.target.value)} onBlur={() => savePrice(cat.id)} onKeyDown={e => e.key === 'Enter' && savePrice(cat.id)} autoFocus />
                        ) : (
                          <span className={cat.base_price > 0 ? styles.textAccent : styles.textMuted} style={{ cursor: 'pointer' }} onClick={() => startEditPrice(cat.id, cat.base_price)}>
                            {cat.base_price > 0 ? fmt(cat.base_price) : '—'}
                          </span>
                        )}
                      </td>
                      <td>
                        <button className={styles.btnSmall} onClick={() => openModal(cat)}>✏️</button>
                        <button className={styles.btnSmallDanger} onClick={() => handleDeleteCategory(cat.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredCategories.length === 0 && <div className={styles.empty} style={{ marginTop: 20 }}>Ничего не найдено</div>}
          </div>
        )}

        {/* ═══════ SCHEDULE ═══════ */}
        {tab === 'schedule' && (
          <div className={styles.section}>
            <h1 className={styles.pageTitle}>Расписание</h1>
            <div className={styles.chartCard}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                <input type="date" className={styles.input} style={{ width: 'auto' }} value={selectedScheduleDate} onChange={e => setSelectedScheduleDate(e.target.value)} />
                <button className={styles.btnSecondary} onClick={handleBlockDay}>🚫 Заблокировать день</button>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input type="time" className={styles.input} style={{ width: 'auto' }} value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} />
                <button className={styles.btnPrimary} onClick={handleAddSlot}>+ Добавить слот</button>
              </div>
              {slotsLoading ? <div className={styles.loading}>Загрузка...</div> : slots.length === 0 ? <div className={styles.empty}>На эту дату нет свободных слотов</div> : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead><tr><th>ID</th><th>Время</th><th>Статус</th><th>Действия</th></tr></thead>
                    <tbody>
                      {slots.map(slot => (
                        <tr key={slot.id}>
                          <td className={styles.textMuted}>#{slot.id}</td>
                          <td>{slot.slot_time.slice(0, 5)}</td>
                          <td><span style={{ color: slot.is_booked ? '#ef4444' : '#22c55e' }}>{slot.is_booked ? 'Занят' : 'Свободен'}</span></td>
                          <td>{!slot.is_booked && <button className={styles.btnSmallDanger} onClick={() => handleDeleteSlot(slot.id)}>🗑️</button>}{slot.is_booked && <span className={styles.textMuted}>—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════ CHAT ═══════ */}
        {tab === 'chat' && (
          <div className={styles.chatLayout}>
            <div className={styles.chatSidebar}>
              <div className={styles.chatSidebarTitle}>Диалоги</div>
              {!conversations || conversations.length === 0 ? <div className={styles.empty}>Нет диалогов</div> : conversations.map(conv => (
                <div key={conv.id} className={`${styles.convItem} ${activeChatId === conv.id ? styles.convItemActive : ''}`} onClick={() => setActiveChatId(conv.id)}>
                  <div className={styles.convName}>{conv.user_name}</div>
                  <div className={styles.convLastMsg}>{conv.last_message || 'Нет сообщений'}</div>
                  {conv.unread_count > 0 && <span className={styles.convBadge}>{conv.unread_count}</span>}
                </div>
              ))}
            </div>
            <div className={styles.chatWindow}>
              {!activeChatId ? (
                <div className={styles.chatEmpty}><div className={styles.emptyIcon}>💬</div><div>Выберите диалог</div></div>
              ) : (
                <>
                  <div className={styles.chatHeader}>{conversations?.find(c => c.id === activeChatId)?.user_name}</div>
                  <div className={styles.chatMessages}>
                    {chatMessages?.map(msg => (
                      <div key={msg.id} className={`${styles.chatMsg} ${msg.is_from_admin ? styles.chatMsgAdmin : styles.chatMsgClient}`}>
                        <div className={styles.chatMsgText}>{msg.message}</div>
                        <div className={styles.chatMsgMeta}>{msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className={styles.chatInputRow}>
                    <input className={styles.chatInput} placeholder="Написать сообщение..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()} />
                    <button className={styles.chatSendBtn} onClick={handleSendChat}>Отправить</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Модалка добавления/редактирования категории ── */}
        {showCatModal && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>{catEditId ? 'Редактировать категорию' : 'Добавить категорию'}</h2>
              <div className={styles.modalFields}>
                <div className={styles.modalField}><label className={styles.modalLabel}>Название</label><input className={styles.input} value={catName} onChange={e => setCatName(e.target.value)} placeholder="Например: Замена стекла" /></div>
                <div className={styles.modalField}><label className={styles.modalLabel}>Родительская категория</label><select className={styles.select} value={catParentId ?? ''} onChange={e => setCatParentId(e.target.value ? Number(e.target.value) : null)}><option value="">Корневая (без родителя)</option>{flattenCategories(categories).filter(c => c.id !== catEditId).map(c => <option key={c.id} value={c.id}>{'—'.repeat(c.depth)} {c.name}</option>)}</select></div>
                <div className={styles.modalField}><label className={styles.modalLabel}>Базовая цена (₽)</label><input className={styles.input} type="number" value={catBasePrice} onChange={e => setCatBasePrice(e.target.value)} placeholder="0" /></div>
              </div>
              <div className={styles.modalButtons}>
                <button className={styles.btnSecondary} onClick={closeModal}>Отмена</button>
                <button className={styles.btnPrimary} onClick={handleSaveCategory}>{catEditId ? 'Сохранить' : 'Добавить'}</button>
              </div>
            </div>
          </div>
        )}

        {selectedClient && (
  <div className={styles.modalOverlay} onClick={() => setSelectedClient(null)}>
    <div className={styles.modal} style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
      <h2 className={styles.modalTitle}>{selectedClient.user_name}</h2>
      <p style={{ color: 'var(--c-text3)', marginBottom: 20 }}>{selectedClient.email}</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statValue}>{selectedClient.total_orders}</div>
          <div className={styles.statLabel}>Всего заказов</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statValue}>{fmt(selectedClient.revenue)}</div>
          <div className={styles.statLabel}>Общая прибыль</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statValue}>{fmt(selectedClient.revenue / selectedClient.total_orders)}</div>
          <div className={styles.statLabel}>Средний чек</div>
        </div>
      </div>

      <h3 style={{ fontSize: '0.9rem', marginBottom: 12 }}>История заказов</h3>
      {clientLoading ? <div className={styles.loading}>Загрузка...</div> : clientOrders.length === 0 ? (
        <div className={styles.empty}>Нет заказов</div>
      ) : (
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          <table className={styles.table}>
            <thead><tr><th>№</th><th>Дата</th><th>Устройство</th><th>Статус</th><th>Сумма</th></tr></thead>
            <tbody>
              {clientOrders.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.appointment_date}</td>
                  <td>{o.category_name || o.custom_device_name || '—'}</td>
                  <td><span style={{ color: o.color_code }}>{o.status_name}</span></td>
                  <td>{o.final_price ? fmt(o.final_price) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.modalButtons} style={{ marginTop: 20 }}>
        <button className={styles.btnSecondary} onClick={() => setSelectedClient(null)}>Закрыть</button>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  )
}