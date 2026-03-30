import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFriends, getMessages, sendMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';

const COLORS = ['#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];
const getColor = (name) => COLORS[name?.charCodeAt(0) % COLORS.length || 0];
const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

const Messages = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    getFriends().then(({ data }) => setFriends(data)).catch(() => toast.error('Failed to load friends'));
  }, []);

  useEffect(() => {
    if (!activeChat) return;
    setLoadingMsgs(true);
    getMessages(activeChat._id).then(({ data }) => { setMessages(data); setLoadingMsgs(false); }).catch(() => { toast.error('Failed to load messages'); setLoadingMsgs(false); });
  }, [activeChat]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat) return;
    try {
      const { data } = await sendMessage({ to: activeChat._id, text });
      setMessages([...messages, data]);
      setText('');
      toast.success('Message sent');
    } catch { toast.error('Failed to send'); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-xl card-dark shadow-xl">
            {/* Friends list */}
            <div className="w-80 border-r border-border overflow-y-auto shrink-0">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-bold text-card-foreground">Messages</h2>
              </div>
              {friends.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No friends yet</div>
              ) : friends.map((f) => (
                <motion.button
                  key={f._id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveChat(f)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition hover:bg-secondary/50 ${activeChat?._id === f._id ? 'bg-secondary' : ''}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground shrink-0" style={{ background: getColor(f.name) }}>
                    {getInitials(f.name)}
                  </div>
                  <span className="text-sm font-medium text-card-foreground truncate">{f.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Chat area */}
            <div className="flex flex-1 flex-col">
              {!activeChat ? (
                <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground gap-3">
                  <MessageSquare className="h-12 w-12" />
                  <p className="text-lg">Select a conversation</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-primary-foreground" style={{ background: getColor(activeChat.name) }}>
                      {getInitials(activeChat.name)}
                    </div>
                    <span className="font-semibold text-card-foreground">{activeChat.name}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    {loadingMsgs ? (
                      <div className="flex justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      </div>
                    ) : messages.length === 0 ? (
                      <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Say hi!</p>
                    ) : messages.map((m, i) => {
                      const isMine = m.from === user?._id || m.from?._id === user?._id;
                      return (
                        <motion.div
                          key={m._id || i}
                          initial={{ opacity: 0, x: isMine ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${isMine ? 'gradient-bg text-primary-foreground rounded-br-md' : 'bg-secondary text-card-foreground rounded-bl-md'}`}>
                            {m.text}
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={endRef} />
                  </div>

                  <form onSubmit={handleSend} className="flex gap-3 border-t border-border px-6 py-4">
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-lg bg-secondary px-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
                    />
                    <motion.button whileTap={{ scale: 0.9 }} type="submit" className="rounded-lg gradient-bg px-5 py-3 text-primary-foreground">
                      <Send className="h-4 w-4" />
                    </motion.button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default Messages;
