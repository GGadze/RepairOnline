import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { adminApi, chatApi, orderServicesApi } from '../services/api'
import type {
  Order, Status, AdminStats, MonthlyRevenue, UserRevenue,
  ChatConversation, ChatMessage, OrderStatusHistory, Category
} from '../types'
import styles from "../components/AdminPage.module.css";

// ─── Вспомогательные утилиты ───────────────────────────────────────────────

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

// ─── Компонент ─────────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'orders' | 'catalog' | 'chat'

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  console.log('=== AdminPage DEBUG ===')
  console.log('isAuthenticated:', isAuthenticated)
  console.log('user:', user)
  console.log('user?.role:', user?.role)

  const [tab, setTab] = useState<Tab>('dashboard')

  // Dashboard
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [monthly, setMonthly] = useState<MonthlyRevenue[]>([])
  const [userRevenue, setUserRevenue] = useState<UserRevenue[]>([])
  const [statsLoading, setStatsLoading] = useState(true)

  // Orders
  const [orders, setOrders] = useState<Order[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [filterStatus, setFilterStatus] = useState<number>(0)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderHistory, setOrderHistory] = useState<OrderStatusHistory[]>([])
  const [orderServices, setOrderServices] = useState<any[]>([])
  const [statusComment, setStatusComment] = useState('')
  const [newStatusId, setNewStatusId] = useState<number>(0)
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Catalog
  const [categories, setCategories] = useState<Category[]>([])
  const [catName, setCatName] = useState('')
  const [catParentId, setCatParentId] = useState<number | null>(null)
  const [catPrice, setCatPrice] = useState('')
  const [catEditId, setCatEditId] = useState<number | null>(null)
  const [catLoading, setCatLoading] = useState(false)

  // Chat
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeChatId, setActiveChatId] = useState<number | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Guards ──
  useEffect(() => {
    if (!isAuthenticated) { 
      console.log('Redirect: not authenticated')
      navigate('/auth')
      return 
    }
    if (user?.role !== 'admin') { 
      console.log('Redirect: not admin, role =', user?.role)
      navigate('/')
      return 
    }
  }, [isAuthenticated, user, navigate])

  // ── Load dashboard ──
  useEffect(() => {
    if (tab !== 'dashboard') return
    setStatsLoading(true)
    Promise.all([
      adminApi.getStats(),
      adminApi.getMonthlyRevenue(),
      adminApi.getUserRevenue(),
    ]).then(([s, m, u]) => {
      console.log('Dashboard data loaded:', { s, m, u })
      setStats(s)
      setMonthly(m || [])
      setUserRevenue(u || [])
    }).catch((err) => {
      console.error('Failed to load dashboard:', err)
    }).finally(() => setStatsLoading(false))
  }, [tab])

  // ── Load orders ──
  useEffect(() => {
    if (tab !== 'orders') return
    setOrdersLoading(true)
    Promise.all([fetchStatuses(), fetchOrders(filterStatus || undefined)]).then(([s, o]) => {
      setStatuses(s || [])
      setOrders(o || [])
    }).finally(() => setOrdersLoading(false))
  }, [tab, filterStatus])

  // ── Load catalog ──
  useEffect(() => {
    if (tab !== 'catalog') return
    fetchCategories().then(cats => setCategories(cats || []))
  }, [tab])

  // ── Load chat ──
  useEffect(() => {
    if (tab !== 'chat') return
    chatApi.listConversations().then(r => setConversations(r || []))
  }, [tab])

  // ── Chat polling ──
  const loadChatMessages = useCallback(() => {
    if (!activeChatId) return
    chatApi.getMessages(activeChatId).then(r => {
      setChatMessages(r || [])
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }).catch(err => console.error('Failed to load messages:', err))
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
    } catch { 
      setOrderHistory([])
      setOrderServices([])
    }
  }

  // ── Update status ──
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatusId) return
    await api.patch(`/admin/orders/${selectedOrder.id}/status`, {
      status_id: newStatusId,
      comment: statusComment,
    })
    const refreshed = await fetchOrders(filterStatus || undefined)
    setOrders(refreshed || [])
    const updated = refreshed?.find(o => o.id === selectedOrder.id)
    if (updated) handleSelectOrder(updated)
  }

  // ── Send chat message ──
  const handleSendChat = async () => {
    if (!chatInput.trim() || !activeChatId) return
    await chatApi.sendMessage(chatInput.trim(), activeChatId)
    setChatInput('')
    loadChatMessages()
    chatApi.listConversations().then(r => setConversations(r || []))
  }

  // ── Catalog CRUD ──
  const handleSaveCat = async () => {
    if (!catName.trim()) return
    setCatLoading(true)
    try {
      const payload = { name: catName, parent_id: catParentId, level: 0, base_price: parseFloat(catPrice) || 0 }
      if (catEditId) {
        await api.put(`/admin/categories/${catEditId}`, payload)
      } else {
        await api.post('/admin/categories', payload)
      }
      const newCats = await fetchCategories()
      setCategories(newCats || [])
      setCatName(''); setCatParentId(null); setCatPrice(''); setCatEditId(null)
    } catch (err) {
      console.error('Failed to save category:', err)
    } finally { setCatLoading(false) }
  }

  const handleDeleteCat = async (id: number) => {
    if (!confirm('Удалить категорию?')) return
    await api.delete(`/admin/categories/${id}`)
    const newCats = await fetchCategories()
    setCategories(newCats || [])
  }

  const handleEditCat = (cat: Category) => {
    setCatEditId(cat.id); setCatName(cat.name)
    setCatParentId(cat.parent_id ?? null); setCatPrice(String(cat.base_price))
  }

  // ── Flat list of categories (for parent selector) ──
  const flatCats = (cats: Category[] | undefined): Category[] => {
    if (!cats || !Array.isArray(cats)) return []
    return cats.flatMap(c => [c, ...flatCats(c.children ?? [])])
  }

  // ── Format currency ──
  const fmt = (n: number) => n?.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }) || '0 ₽'

  const maxRevenue = monthly && monthly.length > 0 
    ? Math.max(...monthly.map(m => m.revenue), 1)
    : 1

  console.log('Before render check - monthly length:', monthly?.length)
  console.log('userRevenue length:', userRevenue?.length)
  console.log('conversations length:', conversations?.length)
  console.log('categories length:', categories?.length)

  // Guard check
  if (!isAuthenticated || user?.role !== 'admin') {
    console.log('Returning null - not admin')
    return null
  }

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
            { id: 'orders',    icon: '📋', label: 'Заказы' },
            { id: 'catalog',   icon: '🗂️',  label: 'Каталог' },
            { id: 'chat',      icon: '💬', label: 'Чат с клиентами' },
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
            <h1 className={styles.pageTitle}>Аналитика</h1>

            {statsLoading ? (
              <div className={styles.loading}>Загрузка...</div>
            ) : stats && (
              <>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>📦</div>
                    <div className={styles.statValue}>{stats.total_orders}</div>
                    <div className={styles.statLabel}>Всего заказов</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>💰</div>
                    <div className={styles.statValue}>{fmt(stats.monthly_revenue)}</div>
                    <div className={styles.statLabel}>Прибыль за месяц</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>🏆</div>
                    <div className={styles.statValue}>{fmt(stats.total_revenue)}</div>
                    <div className={styles.statLabel}>Общая прибыль</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>⚙️</div>
                    <div className={styles.statValue}>{stats.active_orders}</div>
                    <div className={styles.statLabel}>В работе</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>✅</div>
                    <div className={styles.statValue}>{stats.completed_orders}</div>
                    <div className={styles.statLabel}>Завершено</div>
                  </div>
                </div>

                {monthly && monthly.length > 0 && (
                  <div className={styles.chartCard}>
                    <h2 className={styles.chartTitle}>Прибыль по месяцам</h2>
                    <div className={styles.barChart}>
                      {monthly.map(m => (
                        <div key={m.month} className={styles.barWrapper}>
                          <div className={styles.barValue}>{fmt(m.revenue)}</div>
                          <div
                            className={styles.bar}
                            style={{ height: `${(m.revenue / maxRevenue) * 160}px` }}
                          />
                          <div className={styles.barLabel}>{m.month?.slice(5)}/{m.month?.slice(2, 4)}</div>
                          <div className={styles.barOrders}>{m.orders} зак.</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userRevenue && userRevenue.length > 0 && (
                  <div className={styles.chartCard}>
                    <h2 className={styles.chartTitle}>Прибыль по клиентам</h2>
                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Клиент</th>
                            <th>Email</th>
                            <th>Заказов</th>
                            <th>Прибыль</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userRevenue.map((u, i) => (
                            <tr key={u.user_id}>
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
              <button
                className={`${styles.filterBtn} ${filterStatus === 0 ? styles.filterBtnActive : ''}`}
                onClick={() => setFilterStatus(0)}
              >Все</button>
              {statuses?.map(s => (
                <button
                  key={s.id}
                  className={`${styles.filterBtn} ${filterStatus === s.id ? styles.filterBtnActive : ''}`}
                  style={filterStatus === s.id ? { borderColor: s.color_code } : {}}
                  onClick={() => setFilterStatus(s.id)}
                >{s.name}</button>
              ))}
            </div>

            <div className={styles.ordersLayout}>
              <div className={styles.ordersList}>
                {ordersLoading ? (
                  <div className={styles.loading}>Загрузка...</div>
                ) : orders?.length === 0 ? (
                  <div className={styles.empty}>Нет заказов</div>
                ) : orders?.map(order => (
                  <div
                    key={order.id}
                    className={`${styles.orderCard} ${selectedOrder?.id === order.id ? styles.orderCardActive : ''}`}
                    onClick={() => handleSelectOrder(order)}
                  >
                    <div className={styles.orderCardTop}>
                      <span className={styles.orderId}>#{order.id}</span>
                      <span
                        className={styles.orderStatus}
                        style={{ color: order.color_code || '#94a3b8' }}
                      >{order.status_name || '—'}</span>
                    </div>
                    <div className={styles.orderClient}>{order.user_name}</div>
                    <div className={styles.orderDevice}>
                      {order.category_name || order.custom_device_name || 'Устройство не указано'}
                    </div>
                    <div className={styles.orderMeta}>
                      <span>{order.appointment_date}</span>
                      {order.final_price != null && <span>{fmt(order.final_price)}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {selectedOrder ? (
                <div className={styles.orderDetail}>
                  <h2 className={styles.detailTitle}>Заказ #{selectedOrder.id}</h2>

                  <div className={styles.detailGrid}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Клиент</span>
                      <span>{selectedOrder.user_name}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Устройство</span>
                      <span>{selectedOrder.category_name || selectedOrder.custom_device_name || '—'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Дата визита</span>
                      <span>{selectedOrder.appointment_date} {selectedOrder.appointment_time}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Статус</span>
                      <span style={{ color: selectedOrder.color_code || '#94a3b8' }}>
                        {selectedOrder.status_name || '—'}
                      </span>
                    </div>
                    {selectedOrder.final_price != null && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Стоимость</span>
                        <span className={styles.textAccent}>{fmt(selectedOrder.final_price)}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.detailSection}>
                    <div className={styles.detailSectionTitle}>Описание проблемы</div>
                    <div className={styles.detailText}>{selectedOrder.problem_description}</div>
                  </div>

                  {orderServices?.length > 0 && (
                    <div className={styles.detailSection}>
                      <div className={styles.detailSectionTitle}>Выбранные услуги</div>
                      <div className={styles.servicesList}>
                        {orderServices.map((s: any) => (
                          <div key={s.id} className={styles.serviceItem}>
                            <span>{s.service_name}</span>
                            <span className={styles.textAccent}>{fmt(s.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {orderHistory?.length > 0 && (
                    <div className={styles.detailSection}>
                      <div className={styles.detailSectionTitle}>История статусов</div>
                      <div className={styles.historyList}>
                        {orderHistory.map((h: any) => (
                          <div key={h.id} className={styles.historyItem}>
                            <div className={styles.historyStatus}>{h.status_name}</div>
                            <div className={styles.historyMeta}>
                              {h.changed_by_name} · {new Date(h.changed_at).toLocaleString('ru-RU')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.detailSection}>
                    <div className={styles.detailSectionTitle}>Изменить статус</div>
                    <div className={styles.statusChangeForm}>
                      <select
                        className={styles.select}
                        value={newStatusId}
                        onChange={e => setNewStatusId(Number(e.target.value))}
                      >
                        <option value={0}>Выберите статус...</option>
                        {statuses?.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <input
                        className={styles.input}
                        placeholder="Комментарий (необязательно)"
                        value={statusComment}
                        onChange={e => setStatusComment(e.target.value)}
                      />
                      <button
                        className={styles.btnPrimary}
                        onClick={handleUpdateStatus}
                        disabled={!newStatusId}
                      >Сохранить</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.orderDetailEmpty}>
                  <div className={styles.emptyIcon}>📋</div>
                  <div>Выберите заказ для просмотра</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════ CATALOG ═══════ */}
        {tab === 'catalog' && (
          <div className={styles.section}>
            <h1 className={styles.pageTitle}>Каталог категорий</h1>

            <div className={styles.catForm}>
              <h2 className={styles.catFormTitle}>{catEditId ? 'Редактировать категорию' : 'Добавить категорию'}</h2>
              <div className={styles.catFormFields}>
                <input
                  className={styles.input}
                  placeholder="Название"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                />
                <select
                  className={styles.select}
                  value={catParentId ?? ''}
                  onChange={e => setCatParentId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Корневая категория</option>
                  {flatCats(categories).map(c => (
                    <option key={c.id} value={c.id}>{'—'.repeat(c.level)} {c.name}</option>
                  ))}
                </select>
                <input
                  className={styles.input}
                  placeholder="Базовая цена (₽)"
                  type="number"
                  value={catPrice}
                  onChange={e => setCatPrice(e.target.value)}
                />
                <div className={styles.catFormBtns}>
                  <button className={styles.btnPrimary} onClick={handleSaveCat} disabled={catLoading || !catName.trim()}>
                    {catEditId ? 'Сохранить' : 'Добавить'}
                  </button>
                  {catEditId && (
                    <button className={styles.btnSecondary} onClick={() => {
                      setCatEditId(null); setCatName(''); setCatParentId(null); setCatPrice('')
                    }}>Отмена</button>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.catTree}>
              <CatNode cats={categories} onEdit={handleEditCat} onDelete={handleDeleteCat} depth={0} />
            </div>
          </div>
        )}

        {/* ═══════ CHAT ═══════ */}
        {tab === 'chat' && (
          <div className={styles.chatLayout}>
            <div className={styles.chatSidebar}>
              <div className={styles.chatSidebarTitle}>Диалоги</div>
              {!conversations || conversations.length === 0 ? (
                <div className={styles.empty}>Нет диалогов</div>
              ) : conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`${styles.convItem} ${activeChatId === conv.id ? styles.convItemActive : ''}`}
                  onClick={() => setActiveChatId(conv.id)}
                >
                  <div className={styles.convName}>{conv.user_name}</div>
                  <div className={styles.convLastMsg}>{conv.last_message || 'Нет сообщений'}</div>
                  {conv.unread_count > 0 && (
                    <span className={styles.convBadge}>{conv.unread_count}</span>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.chatWindow}>
              {!activeChatId ? (
                <div className={styles.chatEmpty}>
                  <div className={styles.emptyIcon}>💬</div>
                  <div>Выберите диалог</div>
                </div>
              ) : (
                <>
                  <div className={styles.chatHeader}>
                    {conversations?.find(c => c.id === activeChatId)?.user_name}
                  </div>
                  <div className={styles.chatMessages}>
                    {chatMessages?.map(msg => (
                      <div
                        key={msg.id}
                        className={`${styles.chatMsg} ${msg.is_from_admin ? styles.chatMsgAdmin : styles.chatMsgClient}`}
                      >
                        <div className={styles.chatMsgText}>{msg.message}</div>
                        <div className={styles.chatMsgMeta}>
                          {msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className={styles.chatInputRow}>
                    <input
                      className={styles.chatInput}
                      placeholder="Написать сообщение..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                    />
                    <button className={styles.chatSendBtn} onClick={handleSendChat}>
                      Отправить
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ── Вспомогательный компонент дерева категорий ──────────────────────────────

function CatNode({ cats, onEdit, onDelete, depth }: {
  cats: Category[] | undefined
  onEdit: (c: Category) => void
  onDelete: (id: number) => void
  depth: number
}) {
  if (!cats || !Array.isArray(cats) || cats.length === 0) {
    return null
  }
  
  return (
    <>
      {cats.map(cat => (
        <div key={cat.id} style={{ marginLeft: depth * 20 }}>
          <div className="cat-row" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderBottom: '1px solid var(--c-border)',
          }}>
            <span style={{ flex: 1, color: 'var(--c-text)' }}>
              {depth > 0 && <span style={{ color: 'var(--c-text3)', marginRight: 6 }}>{'└'}</span>}
              {cat.name}
            </span>
            {cat.base_price > 0 && (
              <span style={{ color: 'var(--c-accent)', fontSize: '0.8rem' }}>
                {cat.base_price.toLocaleString('ru-RU')} ₽
              </span>
            )}
            <button
              onClick={() => onEdit(cat)}
              style={{ background: 'none', border: '1px solid var(--c-border2)', borderRadius: 4, color: 'var(--c-text2)', padding: '2px 8px', cursor: 'pointer', fontSize: '0.75rem' }}
            >✏️</button>
            <button
              onClick={() => onDelete(cat.id)}
              style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 4, color: '#ef4444', padding: '2px 8px', cursor: 'pointer', fontSize: '0.75rem' }}
            >🗑️</button>
          </div>
          {cat.children && cat.children.length > 0 && (
            <CatNode cats={cat.children} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} />
          )}
        </div>
      ))}
    </>
  )
}