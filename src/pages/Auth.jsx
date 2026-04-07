import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AtSign, Lock, UserIcon, Waves } from 'lucide-react'
import toast from 'react-hot-toast'
import { login, register } from '../api'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/PageTransition'
import RippleLogo from '../components/RippleLogo'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false)
  const [form, setForm]       = useState({ name: '', username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { loginUser, token }  = useAuth()
  const navigate              = useNavigate()

  useEffect(() => {
    if (token) navigate('/home', { replace: true })
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload    = isLogin
        ? { username: form.username.trim(), password: form.password }
        : { name: form.name.trim(), username: form.username.trim(), password: form.password }
      const { data }   = isLogin ? await login(payload) : await register(payload)

      const userData = {
        _id: data._id || data.id,
        name: data.name,
        username: data.username,
        createdAt: data.createdAt,
      }
      loginUser(userData, data.token)
      toast.success(isLogin ? 'Welcome back!' : 'Account created!')
      navigate('/home')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }))

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col lg:flex-row">

        {/* Left gradient panel */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden gradient-bg p-10 lg:p-20">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-primary-foreground/10"
                style={{
                  width:  60 + i * 40,
                  height: 60 + i * 40,
                  left:   `${10 + i * 18}%`,
                  top:    `${15 + i * 12}%`,
                }}
                animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
              />
            ))}
          </div>
          <div className="relative z-10 text-center flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mb-6 drop-shadow-2xl"
            >
              <RippleLogo size={72} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black tracking-tighter text-white lg:text-7xl uppercase italic drop-shadow-lg"
            >
              Ripple Media
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-xl font-medium text-white/90 drop-shadow-md"
            >
              Connect. Share. Ripple.
            </motion.p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex flex-1 items-center justify-center bg-background p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md card-dark rounded-2xl p-8 shadow-2xl"
          >
            {/* Toggle */}
            <div className="mb-8 flex rounded-lg bg-secondary p-1">
              {['Login', 'Register'].map((tab, idx) => (
                <motion.button
                  key={tab}
                  onClick={() => setIsLogin(idx === 0)}
                  className={`flex-1 rounded-md py-2.5 text-sm font-medium transition ${
                    (idx === 0 ? isLogin : !isLogin)
                      ? 'gradient-bg text-primary-foreground shadow'
                      : 'text-muted-foreground'
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  {tab}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {!isLogin && (
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      required
                      className="w-full rounded-lg bg-secondary py-3 pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => update('username', e.target.value)}
                   required
                    className="w-full rounded-lg bg-secondary py-3 pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    required
                    className="w-full rounded-lg bg-secondary py-3 pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg gradient-bg py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </motion.button>
              </motion.form>
            </AnimatePresence>
          </motion.div>
        </div>

      </div>
    </PageTransition>
  )
}

export default Auth