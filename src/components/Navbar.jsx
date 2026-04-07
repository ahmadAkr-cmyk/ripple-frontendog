import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MessageCircle, User, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { searchUsers, sendFriendRequest } from '../api'
import RippleLogo from './RippleLogo'

const Navbar = () => {
  const { user, logout }                        = useAuth()
  const navigate                                = useNavigate()
  const [query, setQuery]                       = useState('')
  const [results, setResults]                   = useState([])
  const [showResults, setShowResults]           = useState(false)
  const [sentRequests, setSentRequests]         = useState({})
  const searchRef                               = useRef(null)
  const debounceRef                             = useRef(null)

  // Search box ke bahar click karne pe dropdown band karo
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = (val) => {
    setQuery(val)
    clearTimeout(debounceRef.current)
    if (!val.trim()) {
      setResults([])
      setShowResults(false)
      return
    }
    // 300ms baad search karo — har keypress pe nahi
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await searchUsers(val)
        setResults(data)
        setShowResults(true)
      } catch {
        setResults([])
      }
    }, 300)
  }

  const handleAddFriend = async (id) => {
    try {
      await sendFriendRequest(id)
      setSentRequests((prev) => ({ ...prev, [id]: true }))
      toast.success('Friend request sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request')
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/auth')
  }

  const getInitials = (name) =>
    name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'

  return (
    <nav className="sticky top-0 z-50 card-dark border-b border-border backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">

        <Link to="/home" className="flex items-center gap-2">
          <RippleLogo size={38} />
          <span className="logo-text text-xl">
            Ripple Media
          </span>
        </Link>

        {/* Search */}
        <div ref={searchRef} className="relative hidden flex-1 max-w-xs sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search people..."
            className="w-full rounded-lg bg-secondary py-2 pl-9 pr-3 text-sm text-card-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          <AnimatePresence>
            {showResults && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-lg card-dark shadow-xl border border-border"
              >
                {results.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-bg text-xs font-bold text-primary-foreground">
                      {getInitials(u.name)}
                    </div>
                    <Link
                      to={`/profile/${u._id}`}
                      onClick={() => setShowResults(false)}
                      className="flex-1 text-sm font-medium text-card-foreground hover:underline"
                    >
                      {u.name}
                    </Link>
                    {u._id !== user?._id && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAddFriend(u._id)}
                        disabled={sentRequests[u._id]}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                          sentRequests[u._id]
                            ? 'bg-muted text-muted-foreground'
                            : 'gradient-bg text-primary-foreground hover:opacity-90'
                        }`}
                      >
                        {sentRequests[u._id] ? 'Sent ✓' : 'Add Friend'}
                      </motion.button>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/messages')}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-card-foreground transition"
          >
            <MessageCircle className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/profile/me')}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-card-foreground transition"
          >
            <User className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-card-foreground transition"
          >
            <LogOut className="h-5 w-5" />
          </motion.button>
        </div>

      </div>
    </nav>
  )
}

export default Navbar