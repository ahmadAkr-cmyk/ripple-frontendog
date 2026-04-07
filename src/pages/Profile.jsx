import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getUserPosts, getFriendRequests, acceptFriendRequest, rejectFriendRequest, getMyProfile } from '../api'
import Navbar from '../components/Navbar'
import PostCard from '../components/PostCard'
import SkeletonPost from '../components/SkeletonPost'
import PageTransition from '../components/PageTransition'

const COLORS = ['#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444']
const getColor    = (name) => COLORS[name?.charCodeAt(0) % COLORS.length || 0]
const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'

const Profile = () => {
  const { user }                              = useAuth()
  const [tab, setTab]                         = useState('posts')
  const [posts, setPosts]                     = useState([])
  const [requests, setRequests]               = useState([])
  const [profileData, setProfileData]         = useState(null)
  const [loadingPosts, setLoadingPosts]       = useState(true)
  const [loadingReqs, setLoadingReqs]         = useState(true)

  useEffect(() => {
    if (!user) return

    // Apni full profile lo — friends count ke liye
    getMyProfile()
      .then(({ data }) => {
        setProfileData(data.user)
        setPosts(data.posts)
        setLoadingPosts(false)
      })
      .catch(() => setLoadingPosts(false))

    // Aane wali friend requests
    getFriendRequests()
      .then(({ data }) => {
        setRequests(data)
        setLoadingReqs(false)
      })
      .catch(() => setLoadingReqs(false))

  }, [user])

  const handleAccept = async (id) => {
    try {
      await acceptFriendRequest(id)
      setRequests((prev) => prev.filter((r) => r._id !== id))
      toast.success('Friend request accepted!')
    } catch {
      toast.error('Failed to accept')
    }
  }

  const handleReject = async (id) => {
    try {
      await rejectFriendRequest(id)
      setRequests((prev) => prev.filter((r) => r._id !== id))
      toast.success('Request rejected')
    } catch {
      toast.error('Failed to reject')
    }
  }

  if (!user) return null

  const displayUser = profileData || user

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">

          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-dark rounded-xl p-8 shadow-lg text-center"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full gradient-bg text-2xl font-bold text-primary-foreground mb-4">
              {getInitials(displayUser.name)}
            </div>
            <h1 className="text-xl font-bold text-card-foreground">{displayUser.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">@{displayUser.username}</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {new Date(displayUser.createdAt || Date.now()).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {displayUser.friends?.length || 0} friends
              </span>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex rounded-lg card-dark p-1 shadow">
            {[['posts', 'My Posts'], ['requests', 'Friend Requests']].map(([key, label]) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTab(key)}
                className={`flex-1 rounded-md py-2.5 text-sm font-medium transition ${
                  tab === key
                    ? 'gradient-bg text-primary-foreground shadow'
                    : 'text-muted-foreground'
                }`}
              >
                {label}
                {key === 'requests' && requests.length > 0 && (
                  <span className="ml-1 rounded-full bg-accent px-2 py-0.5 text-xs">
                    {requests.length}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {tab === 'posts' ? (
              <motion.div
                key="posts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {loadingPosts ? (
                  [...Array(2)].map((_, i) => <SkeletonPost key={i} />)
                ) : posts.length === 0 ? (
                  <div className="card-dark rounded-xl p-12 text-center shadow-lg">
                    <p className="text-muted-foreground">You haven't posted anything yet.</p>
                  </div>
                ) : (
                  posts.map((p, i) => (
                    <motion.div
                      key={p._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <PostCard post={p} />
                    </motion.div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="requests"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {loadingReqs ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : requests.length === 0 ? (
                  <div className="card-dark rounded-xl p-12 text-center shadow-lg">
                    <p className="text-muted-foreground">No pending friend requests.</p>
                  </div>
                ) : (
                  requests.map((r) => (
                    <motion.div
                      key={r._id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      className="card-dark rounded-xl p-4 shadow-lg flex items-center gap-3"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground shrink-0"
                        style={{ background: getColor(r.sender?.name) }}
                      >
                        {getInitials(r.sender?.name)}
                      </div>
                      <span className="flex-1 text-sm font-medium text-card-foreground">
                        {r.sender?.name}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAccept(r._id)}
                        className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400 hover:bg-emerald-500/30 transition"
                      >
                        <Check className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReject(r._id)}
                        className="rounded-lg bg-destructive/20 p-2 text-destructive hover:bg-destructive/30 transition"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </PageTransition>
    </div>
  )
}

export default Profile