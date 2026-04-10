import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { chatApi } from '../services/api'
import type { ChatMessage, ChatConversation } from '../types'
import styles from './ClientChat.module.css'

export default function ClientChat() {
  const { isAuthenticated, user } = useAuthStore()
  
  // РАННИЙ ВОЗВРАТ - до всех хуков
  // Не показываем чат для незалогиненных и для админа
  if (!isAuthenticated || user?.role === 'admin') {
    return null
  }
  
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversation, setConversation] = useState<ChatConversation | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadMessages = useCallback(async () => {
    try {
      const msgs = await chatApi.getMessages()
      setMessages(msgs)
      // Считаем непрочитанные от админа (когда чат закрыт)
      if (!open) {
        setUnread(msgs.filter(m => m.is_from_admin && !m.is_read).length)
      }
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch { /* ignore */ }
  }, [open])

  // Инициализация при первом открытии
  useEffect(() => {
    if (!open) return
    setLoading(true)
    chatApi.getMyConversation().then(data => {
      setConversation(data.conversation)
      setMessages(data.messages)
      setUnread(0)
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [open])

  // Polling пока чат открыт
  useEffect(() => {
    if (!open || !conversation) return
    pollingRef.current = setInterval(loadMessages, 4000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [open, conversation, loadMessages])

  // Фоновый polling для счётчика непрочитанных
  useEffect(() => {
    if (open) return
    const id = setInterval(async () => {
      try {
        const msgs = await chatApi.getMessages()
        setUnread(msgs.filter((m: ChatMessage) => m.is_from_admin && !m.is_read).length)
      } catch { /* ignore */ }
    }, 15000)
    return () => clearInterval(id)
  }, [open])

  const handleSend = async () => {
    if (!input.trim()) return
    const text = input.trim()
    setInput('')
    try {
      await chatApi.sendMessage(text)
      await loadMessages()
    } catch { /* ignore */ }
  }

  return (
    <div className={styles.wrapper}>
      {/* Всплывающее окно чата */}
      {open && (
        <div className={styles.chatBox}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderInfo}>
              <div className={styles.chatHeaderDot} />
              <div>
                <div className={styles.chatHeaderTitle}>Поддержка</div>
                <div className={styles.chatHeaderSub}>Обычно отвечаем в течение дня</div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className={styles.messages}>
            {loading ? (
              <div className={styles.loadingMsg}>Загрузка...</div>
            ) : messages.length === 0 ? (
              <div className={styles.welcomeMsg}>
                <div className={styles.welcomeIcon}>👋</div>
                <div className={styles.welcomeText}>Привет! Задайте любой вопрос — мы поможем.</div>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`${styles.msg} ${msg.is_from_admin ? styles.msgAdmin : styles.msgClient}`}
                >
                  <div className={styles.msgBubble}>{msg.message}</div>
                  <div className={styles.msgTime}>
                    {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <div className={styles.inputRow}>
            <input
              className={styles.input}
              placeholder="Написать сообщение..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              maxLength={1000}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={!input.trim()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Кнопка открытия */}
      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
        onClick={() => { setOpen(o => !o); setUnread(0) }}
        aria-label="Чат с поддержкой"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {!open && unread > 0 && (
          <span className={styles.unreadBadge}>{unread}</span>
        )}
      </button>
    </div>
  )
}