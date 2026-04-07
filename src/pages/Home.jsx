import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getPosts } from '../api'
import Navbar from '../components/Navbar'
import CreatePost from '../components/CreatePost'
import PostCard from '../components/PostCard'
import SkeletonPost from '../components/SkeletonPost'
import PageTransition from '../components/PageTransition'
import RippleLogo from '../components/RippleLogo'

const Home = () => {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await getPosts()
        setPosts(data)
      } catch {
        toast.error('Failed to load feed')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const handleNewPost = (post) => {
    setPosts((prev) => [post, ...prev])
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
          <CreatePost onPost={handleNewPost} />

          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => <SkeletonPost key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-dark rounded-xl p-16 text-center shadow-lg border border-border/50 flex flex-col items-center"
            >
              <div className="mb-6 opacity-20">
                <RippleLogo size={80} />
              </div>
              <p className="text-card-foreground text-xl font-bold mb-2">
                Your feed is empty
              </p>
              <p className="text-muted-foreground">
                No posts yet. Be the first to share!
              </p>
            </motion.div>
          ) : (
            <motion.div className="space-y-6">
              {posts.map((post, i) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </PageTransition>
    </div>
  )
}

export default Home