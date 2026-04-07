import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Trash2,
  BadgeCheck,
  Sparkles,
  Loader2,
  ChevronLeft,
  Search,
  Paperclip,
  X,
  CheckCheck,
  Image as ImageIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getConversations, getMessages, sendMessage, unsendMessage, chatWithAI } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import PageTransition from '../components/PageTransition'
import RippleLogo from '../components/RippleLogo'

const COLORS = ['#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444']
const getColor    = (name) => COLORS[name?.charCodeAt(0) % COLORS.length || 0]
const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
const formatConversationTime = (date) => {
  if (!date) return ''
  const value = new Date(date)
  const now = new Date()
  const sameDay = value.toDateString() === now.toDateString()
  if (sameDay) return value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const diffDays = Math.floor((now - value) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) return value.toLocaleDateString([], { weekday: 'short' })
  return value.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
const formatMessageTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

const OFFICIAL_BOT = {
  _id: 'official-ripple',
  name: 'Ripple AI',
  username: 'ripple-ai',
  isOfficial: true,
  isOnline: true,
  lastMessagePreview: 'Ask Ripple AI anything...',
  lastMessageAt: null,
  unreadCount: 0,
}

const WELCOME_MESSAGE = {
  _id: 'welcome-msg',
  sender: 'official-ripple',
  text: `👋 Hey! I'm Ripple AI — your smart assistant on Ripple Media! 🌊

🚀 Ripple Media is a modern social platform built with passion by:

👨‍💻 Muhammad Ahmad
   20-year-old Full Stack Web Developer

💡 Built with React, Node.js, MongoDB & Cloudinary

📬 Want to get in touch? Feel free to reach out anytime!

📞 Phone: +92 315 4603790

Ask me anything about the app, your friends, or just chat for fun — I'm always here! `,
  createdAt: new Date().toISOString(),
  isAI: true,
  isIntro: true,
  seen: true,
}

const Messages = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [officialConversation, setOfficialConversation] = useState(OFFICIAL_BOT)
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [officialMessages, setOfficialMessages] = useState([WELCOME_MESSAGE])
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const [aiTyping, setAiTyping] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [viewerImage, setViewerImage] = useState(null)
  const endRef = useRef(null)
  const fileRef = useRef(null)

  const displayedMessages = activeChat?.isOfficial ? officialMessages : messages

  const sortConversations = useCallback(
    (items) =>
      [...items].sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
        return bTime - aTime
      }),
    []
  )

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true)
    try {
      const { data } = await getConversations()
      setConversations(sortConversations(data))
      setActiveChat((current) => {
        if (!current || current.isOfficial) return current
        return data.find((item) => item._id === current._id) || current
      })
    } catch {
      toast.error('Failed to load conversations')
    } finally {
      setLoadingConversations(false)
    }
  }, [sortConversations])

  useEffect(() => { loadConversations() }, [loadConversations])

  useEffect(() => {
    if (!activeChat || activeChat.isOfficial) {
      setLoadingMsgs(false)
      return
    }
    let cancelled = false
    const loadMessages = async () => {
      setLoadingMsgs(true)
      try {
        const { data } = await getMessages(activeChat._id)
        if (cancelled) return
        setMessages(data)
        setConversations((prev) =>
          prev.map((item) =>
            item._id === activeChat._id ? { ...item, unreadCount: 0 } : item
          )
        )
      } catch {
        if (!cancelled) toast.error('Failed to load messages')
      } finally {
        if (!cancelled) setLoadingMsgs(false)
      }
    }
    loadMessages()
    return () => { cancelled = true }
  }, [activeChat?._id, activeChat?.isOfficial])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayedMessages, aiTyping])

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
  }, [imagePreview])

  const clearSelectedImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    setImageFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const updateConversationMeta = (chatId, updates) => {
    if (chatId === OFFICIAL_BOT._id) {
      setOfficialConversation((prev) => ({ ...prev, ...updates }))
      return
    }
    setConversations((prev) =>
      sortConversations(prev.map((item) =>
        item._id === chatId ? { ...item, ...updates } : item
      ))
    )
  }

  const handleSelectChat = (chat) => {
    setActiveChat(chat)
    if (chat._id !== OFFICIAL_BOT._id) {
      updateConversationMeta(chat._id, { unreadCount: 0 })
    }
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const trimmedText = text.trim()
    if (!activeChat || sending || aiTyping) return
    if (!trimmedText && !imageFile) return

    if (activeChat.isOfficial && imageFile) {
      toast.error('Ripple AI supports text chat only for now')
      return
    }

    setSending(true)

    // ── AI chat ──
    if (activeChat.isOfficial) {
      const messageToSend = trimmedText
      const localUserMessage = {
        _id: `local-${Date.now()}`,
        sender: user?._id,
        text: messageToSend,
        createdAt: new Date().toISOString(),
        seen: true,
      }
      setOfficialMessages((prev) => [...prev, localUserMessage])
      setOfficialConversation((prev) => ({
        ...prev,
        lastMessagePreview: messageToSend,
        lastMessageAt: new Date().toISOString(),
      }))
      setText('')
      setAiTyping(true)

      try {
        const history = [...officialMessages, localUserMessage]
          .filter((m) => !m.isIntro && m.text?.trim())
          .slice(-12)
          .map((m) => ({
            role: m.sender === user?._id ? 'user' : 'model',
            parts: [{ text: m.text }],
          }))

        const { data } = await chatWithAI(messageToSend, history)
        const aiReply = {
          _id: `ai-${Date.now()}`,
          sender: OFFICIAL_BOT._id,
          text: data.reply || 'Main abhi reply nahi kar paya, dobara try karo 🌊',
          createdAt: new Date().toISOString(),
          isAI: true,
          seen: true,
        }
        setOfficialMessages((prev) => [...prev, aiReply])
        setOfficialConversation((prev) => ({
          ...prev,
          lastMessagePreview: data.reply || 'Ripple AI replied',
          lastMessageAt: aiReply.createdAt,
        }))
      } catch (error) {
        toast.error(error?.response?.data?.message || 'AI is offline right now')
        setOfficialMessages((prev) => [...prev, {
          _id: `ai-error-${Date.now()}`,
          sender: OFFICIAL_BOT._id,
          text: 'Main abhi temporarily offline hoon 🌊',
          createdAt: new Date().toISOString(),
          isAI: true,
          seen: true,
        }])
      } finally {
        setAiTyping(false)
        setSending(false)
      }
      return
    }

    // ── ✅ FIX: hamesha FormData bhejo ──
    try {
      const payload = new FormData()
      if (trimmedText) payload.append('text', trimmedText)
      if (imageFile) payload.append('image', imageFile)

      const { data } = await sendMessage(activeChat._id, payload)
      setMessages((prev) => [...prev, data])
      updateConversationMeta(activeChat._id, {
        lastMessagePreview: data.sharedPost
          ? 'You: Shared a post'
          : data.image && data.text
            ? `You: Photo: ${data.text}`
            : data.image
              ? 'You: Sent an image'
              : `You: ${data.text}`,
        lastMessageAt: data.createdAt,
      })
      setText('')
      clearSelectedImage()
    } catch {
      toast.error('Failed to send')
    } finally {
      setSending(false)
    }
  }

  const handleUnsend = async (msgId) => {
    try {
      await unsendMessage(msgId)
      setMessages((prev) => prev.filter((m) => m._id !== msgId))
      toast.success('Message unsent')
      loadConversations()
    } catch {
      toast.error('Failed to unsend')
    }
  }

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase()
    const friendList = query
      ? conversations.filter((item) => {
          const haystack = `${item.name} ${item.username || ''} ${item.lastMessagePreview || ''}`.toLowerCase()
          return haystack.includes(query)
        })
      : conversations
    const officialMatches =
      !query ||
      `${officialConversation.name} ${officialConversation.lastMessagePreview}`.toLowerCase().includes(query)
    return officialMatches ? [officialConversation, ...friendList] : friendList
  }, [conversations, officialConversation, search])

  const lastSentMessageId = useMemo(() => {
    const lastMine = [...displayedMessages]
      .reverse()
      .find((m) => m.sender === user?._id || m.sender?._id === user?._id)
    return lastMine?._id || null
  }, [displayedMessages, user?._id])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-100px)]">
      <Navbar />
      <PageTransition className="flex-1 flex flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-0 md:px-4 py-0 md:py-6 flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-1 overflow-hidden md:rounded-2xl card-dark shadow-xl border-t md:border border-border">

            {/* Sidebar */}
            <div className={`w-full md:w-[360px] border-r border-border overflow-y-auto shrink-0 card-dark ${activeChat ? 'hidden md:block' : 'block'}`}>
              <div className="p-4 border-b border-border space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-card-foreground">Messages</h2>
                  <span className="text-xs text-muted-foreground">{conversations.length} chats</span>
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search conversations"
                    className="w-full rounded-xl bg-secondary pl-10 pr-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border/60 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="p-2 space-y-1">
                {loadingConversations ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No conversations found.</div>
                ) : (
                  filteredConversations.map((chat) => (
                    <motion.button
                      key={chat._id}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => handleSelectChat(chat)}
                      className={`w-full rounded-2xl px-4 py-3 text-left transition border-b border-border/30 last:border-0 ${
                        activeChat?._id === chat._id ? 'bg-secondary ring-1 ring-primary/30' : 'hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          {chat.isOfficial ? (
                            <RippleLogo size={48} />
                          ) : (
                            <div
                              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-primary-foreground"
                              style={{ background: getColor(chat.name) }}
                            >
                              {getInitials(chat.name)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-card-foreground">{chat.name}</span>
                            {chat.isOfficial && <BadgeCheck className="h-3.5 w-3.5 shrink-0 fill-primary text-white" />}
                            <span className="ml-auto text-[11px] text-muted-foreground">{formatConversationTime(chat.lastMessageAt)}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <p className="truncate text-xs text-muted-foreground">{chat.lastMessagePreview || 'Start the conversation'}</p>
                            {chat.unreadCount > 0 && (
                              <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className={`flex flex-1 flex-col card-dark ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
              {!activeChat ? (
                <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground gap-4 px-6 text-center">
                  <RippleLogo size={74} />
                  <div>
                    <p className="text-xl font-semibold text-card-foreground">Select a conversation</p>
                    <p className="mt-2 text-sm text-muted-foreground">Pick a friend from the sidebar to start chatting.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-3 border-b border-border px-4 md:px-6 py-4">
                    <button onClick={() => setActiveChat(null)} className="md:hidden p-1 -ml-1 text-muted-foreground hover:text-card-foreground transition-colors">
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div className="relative shrink-0">
                      {activeChat.isOfficial ? (
                        <RippleLogo size={42} />
                      ) : (
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-primary-foreground"
                          style={{ background: getColor(activeChat.name) }}
                        >
                          {getInitials(activeChat.name)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-semibold text-card-foreground">
                        <span className="truncate">{activeChat.name}</span>
                        {activeChat.isOfficial && <BadgeCheck className="h-4 w-4 fill-primary text-white" />}
                      </div>
                      {activeChat.isOfficial && <p className="text-xs text-emerald-400">AI Assistant</p>}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4">
                    {loadingMsgs ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : displayedMessages.length === 0 ? (
                      <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Say hi!</p>
                    ) : (
                      displayedMessages.map((message, index) => {
                        const isMine = message.sender === user?._id || message.sender?._id === user?._id
                        return (
                          <motion.div
                            key={message._id || index}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex max-w-[86%] items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                              {!isMine && (
                                <div className="relative mb-6 shrink-0">
                                  {activeChat.isOfficial ? (
                                    <RippleLogo size={30} />
                                  ) : (
                                    <div
                                      className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground"
                                      style={{ background: getColor(activeChat.name) }}
                                    >
                                      {getInitials(activeChat.name)}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className={`group flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                <div className={`overflow-hidden rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                  isMine
                                    ? 'gradient-bg text-primary-foreground rounded-br-md'
                                    : 'bg-secondary text-card-foreground rounded-bl-md'
                                }`}>
                                  {message.isAI && (
                                    <div className="mb-2 flex items-center gap-1.5 border-b border-white/10 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                                      <Sparkles className="h-3 w-3" />
                                      Ripple AI
                                    </div>
                                  )}
                                  {message.sharedPost && (
                                    <div className={`w-full max-w-sm rounded-2xl border p-3 ${message.text ? 'mb-3' : ''} ${isMine ? 'border-white/15 bg-white/10' : 'border-border bg-background/70'}`}>
                                      {message.sharedPost.image && (
                                        <img src={message.sharedPost.image} alt="Shared post" className="mb-3 h-40 w-full rounded-xl object-cover" />
                                      )}
                                      <p className={`text-xs font-semibold ${isMine ? 'text-white/80' : 'text-primary'}`}>
                                        Shared from {message.sharedPost.authorName || 'Ripple'}
                                      </p>
                                      {message.sharedPost.text && (
                                        <p className={`mt-2 max-h-16 overflow-hidden text-sm ${isMine ? 'text-white' : 'text-card-foreground'}`}>
                                          {message.sharedPost.text}
                                        </p>
                                      )}
                                      <Link
                                        to={message.sharedPost.link || '/'}
                                        className={`mt-3 inline-flex items-center rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                          isMine ? 'bg-white/15 text-white hover:bg-white/20' : 'gradient-bg text-primary-foreground'
                                        }`}
                                      >
                                        View Post
                                      </Link>
                                    </div>
                                  )}
                                  {message.image && (
                                    <button type="button" onClick={() => setViewerImage(message.image)} className="mb-3 block overflow-hidden rounded-xl">
                                      <img src={message.image} alt="Shared in chat" className="max-h-72 w-full rounded-xl object-cover transition hover:scale-[1.01]" />
                                    </button>
                                  )}
                                  {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
                                </div>
                                <div className={`mt-1 flex items-center gap-2 px-1 text-[11px] text-muted-foreground ${isMine ? 'justify-end' : 'justify-start'}`}>
                                  <span>{formatMessageTime(message.createdAt)}</span>
                                  {isMine && !activeChat.isOfficial && message._id === lastSentMessageId && (
                                    <span className="inline-flex items-center gap-1 text-primary/80">
                                      <CheckCheck className="h-3.5 w-3.5" />
                                      {message.seen ? 'Seen' : 'Sent'}
                                    </span>
                                  )}
                                </div>
                                {isMine && !activeChat.isOfficial && (
                                  <button
                                    onClick={() => handleUnsend(message._id)}
                                    className="mt-1 hidden text-xs text-muted-foreground transition hover:text-destructive group-hover:block"
                                  >
                                    <span className="inline-flex items-center gap-1">
                                      <Trash2 className="h-3.5 w-3.5" />
                                      Unsend
                                    </span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })
                    )}

                    {/* Typing indicator */}
                    <AnimatePresence>
                      {aiTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-end gap-2"
                        >
                          <RippleLogo size={30} />
                          <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay:'0ms'}} />
                            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay:'150ms'}} />
                            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay:'300ms'}} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div ref={endRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t border-border px-4 md:px-6 py-4">
                    {imagePreview && (
                      <div className="mb-3 inline-flex items-center gap-3 rounded-2xl border border-border bg-secondary/50 p-2">
                        <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-xl object-cover" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-card-foreground">{imageFile?.name}</p>
                          <p className="text-xs text-muted-foreground">Ready to send</p>
                        </div>
                        <button type="button" onClick={clearSelectedImage} className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-card-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <form onSubmit={handleSend} className="flex items-end gap-2 md:gap-3">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={activeChat?.isOfficial}
                        className="rounded-2xl bg-secondary p-3 text-muted-foreground transition hover:text-card-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        title={activeChat?.isOfficial ? 'Ripple AI supports text only' : 'Attach image'}
                      >
                        <Paperclip className="h-5 w-5" />
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      <div className="flex-1 rounded-2xl bg-secondary px-4 py-2.5 ring-1 ring-border/60 focus-within:ring-primary transition-all">
                        <textarea
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSend(e)
                            }
                          }}
                          placeholder={activeChat.isOfficial ? 'Ask Ripple AI anything...' : 'Type a message...'}
                          rows={1}
                          className="max-h-28 w-full resize-none bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground outline-none"
                        />
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        type="submit"
                        disabled={sending || aiTyping || (!text.trim() && !imageFile)}
                        className="rounded-2xl gradient-bg px-4 md:px-5 py-3 text-primary-foreground shadow-lg disabled:opacity-50"
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </motion.button>
                    </form>
                    {!activeChat.isOfficial && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Send text, images, or shared posts.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </PageTransition>

      <AnimatePresence>
        {viewerImage && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewerImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          >
            <img src={viewerImage} alt="Fullscreen" className="max-h-full max-w-full rounded-2xl object-contain" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Messages