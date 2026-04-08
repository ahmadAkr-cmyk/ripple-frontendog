import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MessageCircle, User, LogOut, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { searchUsers, sendFriendRequest } from '../api'
import RippleLogo from './RippleLogo'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [sentRequests, setSentRequests] = useState({})
  const [mobileSearch, setMobileSearch] = useState(false)

  const searchRef = useRef(null)
  const mobileSearchRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target)
      ) {
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

    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await searchUsers(val)
        setResults(data)
        setShowResults(true)
      } catch (err) {
        setResults([])
        setShowResults(false)
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

  const SearchDropdown = () => (
    <AnimatePresence>
      {showResults && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-lg card-dark shadow-xl border border-border z-50"
        >
          {results.map((u) => (
            <div
              key={u._id}
              className="flex items-center gap-6 px-4 py-3 hover:bg-secondary/50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-bg text-xs font-bold">
                {getInitials(u.name)}
              </div>

              <Link
                to={`/profile/${u._id}`}
                onClick={() => {
                  setShowResults(false)
                  setMobileSearch(false)
                }}
                className="flex-1 text-sm font-medium"
              >
                {u.name}
              </Link>

              {u._id !== user?._id && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAddFriend(u._id)}
                  disabled={sentRequests[u._id]}
                  className={`px-3 py-1 text-xs rounded-md ${
                    sentRequests[u._id]
                      ? 'bg-muted text-muted-foreground'
                      : 'gradient-bg text-primary-foreground'
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
  )

  return (
    <nav className="sticky top-0 z-50 card-dark border-b border-border">

      <div className="flex items-center justify-between px-4 py-3">

        {/* LOGO */}
        <Link to="/home" className="flex items-center gap-2">
          <RippleLogo size={38} />
          <span className="logo-text text-xl">Ripple Media</span>
        </Link>

        {/* DESKTOP SEARCH */}
        <div ref={searchRef} className="relative hidden sm:block flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search people..."
            className="w-full rounded-lg bg-secondary py-2 pl-9 pr-3 text-sm outline-none"
          />
          <SearchDropdown />
        </div>

        {/* ICONS */}
        <div className="flex items-center gap-4 sm:gap-6">

          {/* FIX: only show on mobile */}
          <button
            className="p-2 rounded-md hover:bg-secondary sm:hidden"
            onClick={() => {
              setMobileSearch((prev) => !prev)
              setQuery('')
              setResults([])
              setShowResults(false)
            }}
          >
            {mobileSearch ? <X /> : <Search />}
          </button>

          <button className="p-2 rounded-md hover:bg-secondary" onClick={() => navigate('/messages')}>
            <MessageCircle />
          </button>

          <button className="p-2 rounded-md hover:bg-secondary" onClick={() => navigate('/profile/me')}>
            <User />
          </button>

          <button className="p-2 rounded-md hover:bg-secondary" onClick={handleLogout}>
            <LogOut />
          </button>

        </div>
      </div>

      {/* MOBILE SEARCH */}
      <AnimatePresence>
        {mobileSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sm:hidden border-t border-border"
          >
            <div ref={mobileSearchRef} className="relative px-4 py-2">

              <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                autoFocus
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search people..."
                className="w-full rounded-lg bg-secondary py-2 pl-9 pr-3 text-sm outline-none"
              />

              <SearchDropdown />

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  )
}

export default Navbar
