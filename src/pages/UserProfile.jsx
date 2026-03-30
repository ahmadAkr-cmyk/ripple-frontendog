import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUser, getUserPosts, sendFriendRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import SkeletonPost from '../components/SkeletonPost';
import PageTransition from '../components/PageTransition';

const COLORS = ['#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];
const getColor = (name) => COLORS[name?.charCodeAt(0) % COLORS.length || 0];
const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

const UserProfile = () => {
  const { id } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (id === me?._id) { navigate('/profile/me', { replace: true }); return; }
    Promise.all([getUser(id), getUserPosts(id)])
      .then(([u, p]) => { setProfile(u.data); setPosts(p.data); })
      .catch(() => toast.error('User not found'))
      .finally(() => setLoading(false));
  }, [id, me, navigate]);

  const handleRequest = async () => {
    try {
      await sendFriendRequest(id);
      setSent(true);
      toast.success('Friend request sent!');
    } catch { toast.error('Failed to send request'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="card-dark mx-auto mt-20 max-w-md rounded-xl p-12 text-center shadow-lg">
        <p className="text-muted-foreground text-lg">User not found</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-dark rounded-xl p-8 shadow-lg text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-primary-foreground mb-4" style={{ background: getColor(profile.name) }}>
              {getInitials(profile.name)}
            </div>
            <h1 className="text-xl font-bold text-card-foreground">{profile.name}</h1>
            <p className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Joined {new Date(profile.createdAt || Date.now()).toLocaleDateString()}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRequest}
              disabled={sent}
              className={`mt-5 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition ${sent ? 'bg-muted text-muted-foreground' : 'gradient-bg text-primary-foreground hover:opacity-90'}`}
            >
              <UserPlus className="h-4 w-4" />
              {sent ? 'Sent ✓' : 'Send Request'}
            </motion.button>
          </motion.div>

          <h2 className="text-lg font-bold text-foreground">Posts</h2>
          {posts.length === 0 ? (
            <div className="card-dark rounded-xl p-12 text-center shadow-lg">
              <p className="text-muted-foreground">No posts yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((p, i) => (
                <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <PostCard post={p} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
};

export default UserProfile;
