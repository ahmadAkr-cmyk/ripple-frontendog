import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPost } from '../api';
import { useAuth } from '../context/AuthContext';

const CreatePost = ({ onPost }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('text', text);
      if (image) formData.append('image', image);
      const { data } = await createPost(formData);
      onPost(data);
      setText('');
      setImage(null);
      setPreview(null);
      toast.success('Post created!');
    } catch {
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-dark rounded-xl p-5 shadow-lg">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-bg text-sm font-bold text-primary-foreground shrink-0">
            {getInitials(user?.name)}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="flex-1 resize-none rounded-lg bg-secondary px-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {preview && (
          <div className="relative mt-3 ml-13">
            <img src={preview} alt="" className="max-h-48 rounded-lg object-cover" />
            <button type="button" onClick={() => { setImage(null); setPreview(null); }} className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-primary-foreground">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => fileRef.current.click()} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition">
            <ImagePlus className="h-4 w-4" /> Photo
          </motion.button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading || (!text.trim() && !image)}
            className="rounded-lg gradient-bg px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Post
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreatePost;
