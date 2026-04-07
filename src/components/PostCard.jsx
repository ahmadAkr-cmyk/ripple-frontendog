import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, MoreVertical, Trash2, Forward, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { likePost, commentOnPost, deletePost, deleteComment, getFriends, sendMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

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

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [isDeleted, setIsDeleted] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [sharingTo, setSharingTo] = useState(null);

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(post._id);
      setIsDeleted(true);
      toast.success('Post deleted');
    } catch { toast.error('Failed to delete post'); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!commentId) {
      toast.error('Invalid comment ID');
      return;
    }
    try {
      await deleteComment(post._id, commentId);
      setComments(comments.filter(c => (c._id || c.id) !== commentId));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete comment'); }
  };

  if (isDeleted) return null;

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
      // data is the comments array from backend
      if (Array.isArray(data)) {
        setComments(data);
      } else if (data.comments) {
        setComments(data.comments);
      }
      setCommentText('');
      toast.success('Comment added');
    } catch { toast.error('Failed to comment'); }
  };

  const handleOpenShare = async () => {
    setShareOpen(true);

    if (friends.length > 0 || loadingFriends) {
      return;
    }

    setLoadingFriends(true);
    try {
      const { data } = await getFriends();
      setFriends(data);
    } catch {
      toast.error('Failed to load friends');
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleShare = async (friendId) => {
    setSharingTo(friendId);
    try {
      const formData = new FormData();
      formData.append('sharedPost', JSON.stringify({
        postId: post._id,
        authorId: post.user?._id,
        authorName: post.user?.name,
        text: post.text || '',
        image: post.image || null,
        link: post.user?._id ? `/profile/${post.user._id}` : '/',
      }));

      await sendMessage(friendId, formData);
      toast.success('Post shared');
      setShareOpen(false);
    } catch {
      toast.error('Failed to share post');
    } finally {
      setSharingTo(null);
    }
  };

  return (
    <>
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
          {user?._id === post.user?._id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-secondary rounded-full transition-colors">
                  <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDeletePost} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleOpenShare} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-card-foreground transition">
            <Forward className="h-5 w-5" />
            <span>Share</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                {comments.map((c, i) => (
                  <div key={c._id || c.id || i} className="flex gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground shrink-0" style={{ background: getColor(c.user?.name) }}>
                      {getInitials(c.user?.name)}
                    </div>
                    <div className="card-dark-lighter rounded-lg px-3 py-2 text-xs flex-1 flex justify-between items-start group">
                      <div>
                        <span className="font-semibold text-card-foreground">{c.user?.name}</span>
                        <span className="text-muted-foreground ml-1">{c.text}</span>
                      </div>
                      {user?._id === c.user?._id && (
                        <button 
                          onClick={() => handleDeleteComment(c._id || c.id)}
                          className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
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

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="border-border bg-card text-card-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
            <DialogDescription>
              Pick a friend to send this post in messages.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {loadingFriends ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading friends...
              </div>
            ) : friends.length === 0 ? (
              <div className="rounded-xl border border-border bg-secondary/40 px-4 py-8 text-center text-sm text-muted-foreground">
                Add friends to start sharing posts.
              </div>
            ) : (
              friends.map((friend) => (
                <button
                  key={friend._id}
                  onClick={() => handleShare(friend._id)}
                  disabled={sharingTo === friend._id}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-left transition hover:bg-secondary disabled:opacity-60"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground"
                    style={{ background: getColor(friend.name) }}
                  >
                    {getInitials(friend.name)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">{friend.name}</p>
                    <p className="text-xs text-muted-foreground">@{friend.username}</p>
                  </div>
                  {sharingTo === friend._id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <Forward className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostCard;
