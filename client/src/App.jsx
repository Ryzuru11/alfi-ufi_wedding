import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Images, Heart, ArrowUpRight, Sparkles, LockKeyhole } from 'lucide-react'
import { Link, Route, Routes } from 'react-router-dom'
import CameraPage from './pages/CameraPage.jsx'
import GalleryPage from './pages/GalleryPage.jsx'

function Welcome() {
  const [remaining] = useState(() => Number(localStorage.getItem('wedding_tokens') ?? 5))
  return <motion.main className="welcome-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .7 }}>
    <nav className="topbar"><span className="brand-mark"><Heart size={15} strokeWidth={1.5}/> EVERAFTER</span><span className="topbar-note">A DAY TO REMEMBER</span></nav>
    <section className="hero-grid">
      <div className="hero-copy">
        <motion.div className="eyebrow" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .15 }}><span/> THE WEDDING OF</motion.div>
        <motion.h1 initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .25, duration: .8 }}>A moment<br/><em>becomes</em> a memory.</motion.h1>
        <motion.p className="hero-description" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .45 }}>Celebrate with us. Capture a little joy, a big smile, and everything in between. Your moments make our day complete.</motion.p>
        <motion.div className="couple-names" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .55 }}>ALFI <span>&</span> UFI</motion.div>
        <div className="event-meta"><span>14 NOVEMBER 2026</span><i/> <span>WONOSOBO, INDONESIA</span></div>
        <div className="hero-actions"><Link className="primary-btn" to="/camera"><Camera size={17}/> Start capturing <ArrowUpRight size={16}/></Link><Link className="text-link" to="/gallery"><Images size={17}/> View guest gallery</Link></div>
        <div className="token-note"><Sparkles size={15}/> <strong>{remaining}</strong> photo moments available for this session</div>
      </div>
      <motion.div className="hero-visual" initial={{ opacity: 0, scale: .96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .9, delay: .2 }}>
        <div className="photo-frame"><img src="/alfi-ufi.png" alt="Alfi dan Ufi berfoto bersama"/><div className="photo-caption"><span>THE BEGINNING OF FOREVER</span><Heart size={16}/></div></div>
        <div className="floating-stamp">LOVE<br/><span>NOTES</span><Heart size={17}/></div>
        <div className="visual-index">01 <span> / 05</span></div>
      </motion.div>
    </section>
    <footer className="footer"><span>MADE WITH LOVE, SHARED WITH YOU</span><span>SCROLL LESS. CELEBRATE MORE.</span></footer>
  </motion.main>
}

function ThankYou() { return <main className="center-page"><div className="thank-card"><Heart size={26}/><p className="eyebrow">THAT'S A WRAP</p><h1>Thank you for<br/><em>being part of our day.</em></h1><p>Your photo moments have been shared. We’re so glad you celebrated with us.</p><Link className="text-link" to="/gallery">Explore the gallery <ArrowUpRight size={16}/></Link></div></main> }

export default function App() { return <AnimatePresence mode="wait"><Routes><Route path="/" element={<Welcome/>}/><Route path="/camera" element={<CameraPage/>}/><Route path="/gallery" element={<GalleryPage/>}/><Route path="/thank-you" element={<ThankYou/>}/></Routes></AnimatePresence> }
