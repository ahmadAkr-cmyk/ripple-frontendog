import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { likePost, commentOnPost } from '../api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];
const getColor = (name) => COLORS[name?.charCodeAt(0) % COLORS.length || 0];
const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

const PostCard = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [comments, setComments] = useState(post.comments || []);

  const handleLike = async () => {
    try {
      await likePost(post._id);
      setLiked(!liked);
      setLikeCount(c => liked ? c - 1 : c + 1);
    } catch { toast.error('Failed to like'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const { data } = await commentOnPost(post._id, { text: commentText });
      setComments(data.comments || [...comments, { user: { _id: user._id, name: user.name }, text: commentText, createdAt: new Date() }]);
      setCommentText('');
      toast.success('Comment added');
    } catch { toast.error('Failed to comment'); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="card-dark rounded-xl p-5 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground" style={{ background: getColor(post.user?.name) }}>
          {getInitials(post.user?.name)}
        </div>
        <div className="flex-1">
          <Link to={`/profile/${post.user?._id}`} className="font-semibold text-card-foreground hover:underline text-sm">{post.user?.name}</Link>
          <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      {post.text && <p className="text-card-foreground text-sm mb-3 leading-relaxed">{post.text}</p>}
      {post.image && <img src={post.image} alt="" className="w-full rounded-lg mb-3 max-h-96 object-cover" />}

      <div className="flex items-center gap-4 border-t border-border pt-3">
        <motion.button whileTap={{ scale: 1.3 }} onClick={handleLike} className="flex items-center gap-1.5 text-sm transition">
          <Heart className={`h-5 w-5 ${liked ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
          <span className={liked ? 'text-accent' : 'text-muted-foreground'}>{likeCount}</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-card-foreground transition">
          <MessageCircle className="h-5 w-5" />
          <span>{comments.length}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              {comments.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground shrink-0" style={{ background: getColor(c.user?.name) }}>
                    {getInitials(c.user?.name)}
                  </div>
                  <div className="card-dark-lighter rounded-lg px-3 py-2 text-xs flex-1">
                    <span className="font-semibold text-card-foreground">{c.user?.name}</span>
                    <span className="text-muted-foreground ml-1">{c.text}</span>
                  </div>
                </div>
              ))}
              <form onSubmit={handleComment} className="flex gap-2 mt-2">
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." className="flex-1 rounded-lg bg-secondary px-3 py-2 text-xs text-card-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                <motion.button whileTap={{ scale: 0.9 }} type="submit" className="rounded-lg gradient-bg p-2 text-primary-foreground">
                  <Send className="h-3.5 w-3.5" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
