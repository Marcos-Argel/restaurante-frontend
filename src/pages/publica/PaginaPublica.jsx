
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const WHATSAPP = 'https://wa.me/573155400005'
const FACEBOOK = 'https://www.facebook.com/share/16sZ5ae9Jf/'
const TEL = '3155400005'
const DIRECCION = 'Currulao, por el parque'
const HORARIO = 'Lunes a Sabado · 8:00 AM – 10:00 PM  · Domingos cerrado'

const IMG_INTERIOR = 'https://res.cloudinary.com/dyjqz2q6w/image/upload/v1777941889/crowne-plaza-antalya-7890798353-2x1_rf7tvy.jpg'
const IMG_TERRAZA = 'https://digital.ihg.com/is/image/ihg/intercontinental-cancun-5710445083-2x1'
const IMG_BAR = 'https://conocedores.com/wp-content/uploads/2023/10/mejores-bares-de-nueva-york-cocteles-22102023-in7.webp'
const IMG_VIP = 'https://res.cloudinary.com/dyjqz2q6w/image/upload/v1777940798/696c745675e78971ed170d16d26efdac_tk3tjn.jpg'


const AMBIENTES = [
  {
    tipo: 'Interior',
    icono: '🪑',
    descripcion: 'Ambiente acogedor y climatizado, perfecto para reuniones familiares y de negocios.',
    capacidad: 'Mesas de 2 a 6 personas',
    img: IMG_INTERIOR,
    color: '#f97316'
  },
  {
    tipo: 'Terraza',
    icono: '🌿',
    descripcion: 'Disfruta al aire libre con una vista espectacular y brisa fresca en un ambiente relajado.',
    capacidad: 'Mesas de 3 a 5 personas',
    img: IMG_TERRAZA,
    color: '#22c55e'
  },
  {
    tipo: 'Bar',
    icono: '🍺',
    descripcion: 'Zona animada con coctelería artesanal, música y el mejor ambiente nocturno.',
    capacidad: 'Mesas de 4 personas',
    img: IMG_BAR,
    color: '#3b82f6'
  },
  {
    tipo: 'VIP',
    icono: '⭐',
    descripcion: 'Espacio exclusivo para ocasiones especiales con servicio personalizado y privacidad total.',
    capacidad: 'Mesas de 8 personas',
    img: IMG_VIP,
    color: '#a855f7'
  }
]

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function AnimSection({ children, delay = 0, style = {} }) {
  const [ref, visible] = useInView()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(48px)',
      transition: `opacity .8s ease ${delay}s, transform .8s ease ${delay}s`,
      ...style
    }}>
      {children}
    </div>
  )
}

export default function PaginaPublica() {
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [catActiva, setCatActiva] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [ambienteActivo, setAmbienteActivo] = useState(0)

  useEffect(() => {
    api.get('/categorias').then(r => {
      const cats = r.data.data || []
      setCategorias(cats)
      if (cats.length) setCatActiva(cats[0].id)
    }).catch(() => {})
    api.get('/productos/menu').then(r => setProductos(r.data.data || [])).catch(() => {})
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const prodsFiltrados = catActiva
    ? productos.filter(p => p.categoria?.id === catActiva)
    : productos

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const amb = AMBIENTES[ambienteActivo]

  return (
    <div style={{ fontFamily: "'Syne', sans-serif", background: '#080808', color: '#f0ece4', minHeight: '100vh', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #c00000; border-radius: 2px; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.6);opacity:0} }
        @keyframes fade-up { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes grain { 0%,100%{transform:translate(0,0)} 10%{transform:translate(-1%,-2%)} 30%{transform:translate(2%,-1%)} 50%{transform:translate(-1%,2%)} 70%{transform:translate(1%,-1%)} 90%{transform:translate(-2%,1%)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .nav-link { color: #888; font-size: 13px; font-weight: 600; text-decoration: none; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; transition: color .2s; }
        .nav-link:hover { color: #f0ece4; }
        .cat-btn { border: none; cursor: pointer; font-family: inherit; transition: all .2s; }
        .cat-btn:hover { transform: translateY(-2px); }
        .prod-card { transition: all .25s; }
        .prod-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(192,0,0,.2); }
        .cta-btn { transition: all .2s; cursor: pointer; }
        .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(192,0,0,.4); }
        .social-btn { transition: all .2s; }
        .social-btn:hover { transform: scale(1.08); }
        .amb-tab { transition: all .25s; cursor: pointer; border: none; font-family: inherit; }
        .amb-tab:hover { opacity: 1 !important; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: '0 5%', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: scrolled ? 'rgba(8,8,8,.95)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid #1a1a1a' : 'none', transition: 'all .3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#c00000,#ff2222)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🐔</div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-.02em' }}>Fast & Healthy</span>
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {[['Inicio','hero'],['Nosotros','nosotros'],['Ambientes','ambientes'],['Menú','menu'],['Contacto','contacto']].map(([l,id]) => (
            <span key={id} className="nav-link" onClick={() => scrollTo(id)}>{l}</span>
          ))}
          <button onClick={() => navigate('/login')} style={{ background: '#c00000', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '.06em', textTransform: 'uppercase', transition: 'background .2s' }}
            onMouseEnter={e => e.target.style.background='#e00000'} onMouseLeave={e => e.target.style.background='#c00000'}>
            Sistema →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '0 5%' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 60% 40%, #2a0000 0%, #080808 70%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: '-50%', backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E\")", animation: 'grain 8s steps(1) infinite', zIndex: 1, opacity: .5 }} />

        <div style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
          <div style={{ width: 400, height: 400, borderRadius: '50%', border: '1px solid #c0000022', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          <div style={{ width: 320, height: 320, borderRadius: '50%', border: '1px solid #c0000033', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          <div style={{ width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, #1a0000 0%, #080808 70%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'float 6s ease-in-out infinite' }}>
            <span style={{ fontSize: 100 }}>🐔</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 3, maxWidth: 600 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#c0000022', border: '1px solid #c0000044', borderRadius: 20, padding: '6px 14px', marginBottom: 24, animation: 'fade-up .8s ease .2s both' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c00000', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '1px solid #c00000', animation: 'pulse-ring 1.5s ease-out infinite' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#ff6666', letterSpacing: '.1em', textTransform: 'uppercase' }}>Abierto ahora · 8AM – 10PM</span>
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(48px, 7vw, 88px)', lineHeight: 1.05, fontWeight: 700, marginBottom: 24, animation: 'fade-up .8s ease .4s both' }}>
            Sabor que<br /><em style={{ fontStyle: 'italic', color: '#c00000' }}>te cuida</em>
          </h1>

          <p style={{ fontSize: 17, color: '#888', lineHeight: 1.8, marginBottom: 40, maxWidth: 460, animation: 'fade-up .8s ease .6s both' }}>
            Comida fresca, rápida y deliciosa en el corazón de Currulao. Ingredientes seleccionados, sabor auténtico.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', animation: 'fade-up .8s ease .8s both' }}>
            <button className="cta-btn" onClick={() => scrollTo('menu')} style={{ background: '#c00000', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 28px', fontSize: 14, fontWeight: 700, letterSpacing: '.04em', fontFamily: 'inherit' }}>
              Ver nuestro menú →
            </button>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="cta-btn" style={{ background: 'transparent', color: '#f0ece4', border: '1px solid #2a2a2a', borderRadius: 12, padding: '14px 28px', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span>💬</span> WhatsApp
            </a>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'fade-up 1s ease 1.2s both' }}>
          <span style={{ fontSize: 10, color: '#555', letterSpacing: '.15em', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, #555, transparent)' }} />
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '60px 5%', borderTop: '1px solid #111', borderBottom: '1px solid #111' }}>
        <AnimSection>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            {[['🍽️', productos.length || '10+', 'Productos en carta'], ['⏰', '8AM–10PM', 'Todos los días'], ['🪑', '4', 'Tipos de mesa'], ['📍', 'Currulao', 'Junto al parque']].map(([ic, val, label]) => (
              <div key={label} style={{ textAlign: 'center', padding: '28px 20px', background: '#0e0e0e', border: '1px solid #111' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{ic}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#f0ece4', marginBottom: 4 }}>{val}</div>
                <div style={{ fontSize: 11, color: '#555', letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>
        </AnimSection>
      </section>

      {/* NOSOTROS */}
      <section id="nosotros" style={{ padding: '100px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <AnimSection>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -16, background: 'linear-gradient(135deg, #c00000, transparent)', borderRadius: 24, opacity: .15 }} />
              <div style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '4/3', position: 'relative' }}>
                <img src={IMG_INTERIOR} alt="Interior Fast & Healthy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #08080888, transparent)' }} />
              </div>
              <div style={{ position: 'absolute', bottom: -20, right: -20, background: '#c00000', borderRadius: 16, padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#fff' }}>100%</div>
                <div style={{ fontSize: 10, color: '#ffaaaa', letterSpacing: '.08em', textTransform: 'uppercase' }}>Ingredientes frescos</div>
              </div>
            </div>
          </AnimSection>

          <AnimSection delay={0.2}>
            <div>
              <div style={{ fontSize: 11, color: '#c00000', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 16 }}>Quiénes somos</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.2, marginBottom: 24 }}>
                Pasión por la<br /><em style={{ color: '#c00000', fontStyle: 'italic' }}>buena comida</em>
              </h2>
              <p style={{ color: '#666', lineHeight: 1.9, marginBottom: 20, fontSize: 15 }}>
                En Fast & Healthy creemos que comer bien no tiene que ser complicado. Preparamos cada plato con ingredientes frescos y seleccionados, con el sabor casero que tanto te gusta.
              </p>
              <p style={{ color: '#555', lineHeight: 1.9, fontSize: 14 }}>
                Ubicados en Currulao, junto al parque, somos el lugar ideal para compartir en familia o disfrutar un momento de tranquilidad con la mejor comida de la zona.
              </p>
              <div style={{ marginTop: 32, display: 'flex', gap: 20 }}>
                {[['Frescura', '🥬'], ['Rapidez', '⚡'], ['Sabor', '❤️']].map(([t, ic]) => (
                  <div key={t} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{ic}</div>
                    <div style={{ fontSize: 12, color: '#888', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>{t}</div>
                  </div>
                ))}
              </div>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* AMBIENTES / TIPOS DE MESA */}
      <section id="ambientes" style={{ padding: '100px 5%', background: '#060606' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <AnimSection>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <div style={{ fontSize: 11, color: '#c00000', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Nuestros espacios</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.1 }}>
                Elige tu <em style={{ color: '#c00000', fontStyle: 'italic' }}>ambiente</em>
              </h2>
              <p style={{ color: '#555', fontSize: 15, marginTop: 16, maxWidth: 500, margin: '16px auto 0' }}>
                Contamos con 4 tipos de espacios para que cada visita sea una experiencia única
              </p>
            </div>
          </AnimSection>

          <AnimSection delay={0.1}>
            {/* Tabs de ambientes */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
              {AMBIENTES.map((a, i) => (
                <button key={a.tipo} className="amb-tab" onClick={() => setAmbienteActivo(i)} style={{
                  background: ambienteActivo === i ? a.color : '#111',
                  border: `1px solid ${ambienteActivo === i ? a.color : '#222'}`,
                  borderRadius: 12, padding: '10px 22px', color: ambienteActivo === i ? '#fff' : '#666',
                  fontSize: 13, fontWeight: 700, opacity: ambienteActivo === i ? 1 : 0.7,
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <span>{a.icono}</span> {a.tipo}
                </button>
              ))}
            </div>

            {/* Panel del ambiente activo */}
            <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 24, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 400 }}>
              {/* Imagen */}
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                {amb.img ? (
                  <img src={amb.img} alt={amb.tipo} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', minHeight: 400, background: `radial-gradient(circle at 30% 60%, ${amb.color}22, #0e0e0e)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100 }}>
                    {amb.icono}
                  </div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, transparent, #0e0e0e)` }} />
              </div>

              {/* Info */}
              <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, background: amb.color + '22', border: `1px solid ${amb.color}44`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {amb.icono}
                  </div>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: amb.color }}>{amb.tipo}</span>
                </div>
                <p style={{ color: '#888', lineHeight: 1.8, fontSize: 15, marginBottom: 24 }}>{amb.descripcion}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: amb.color + '11', border: `1px solid ${amb.color}22`, borderRadius: 12, padding: '12px 16px', marginBottom: 32 }}>
                  <span style={{ fontSize: 18 }}>👥</span>
                  <span style={{ fontSize: 13, color: '#aaa', fontWeight: 600 }}>{amb.capacidad}</span>
                </div>
                <a href={WHATSAPP} target="_blank" rel="noreferrer" style={{ background: amb.color, color: '#fff', borderRadius: 12, padding: '13px 24px', fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'opacity .2s', width: 'fit-content' }}
                  onMouseEnter={e => e.currentTarget.style.opacity='.85'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                  💬 Reservar esta mesa
                </a>
              </div>
            </div>

            {/* Cards resumen de los 4 ambientes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
              {AMBIENTES.map((a, i) => (
                <div key={a.tipo} onClick={() => setAmbienteActivo(i)} style={{ background: ambienteActivo === i ? a.color + '22' : '#0e0e0e', border: `1px solid ${ambienteActivo === i ? a.color : '#1a1a1a'}`, borderRadius: 14, padding: '16px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icono}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: ambienteActivo === i ? a.color : '#888' }}>{a.tipo}</div>
                </div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* MENÚ */}
      <section id="menu" style={{ padding: '100px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <AnimSection>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <div style={{ fontSize: 11, color: '#c00000', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Lo que ofrecemos</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.1 }}>
                Nuestra <em style={{ color: '#c00000', fontStyle: 'italic' }}>carta</em>
              </h2>
            </div>
          </AnimSection>

          {categorias.length > 0 && (
            <AnimSection delay={0.1}>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
                <button className="cat-btn" onClick={() => setCatActiva(null)} style={{ background: !catActiva ? '#c00000' : '#111', border: `1px solid ${!catActiva ? '#c00000' : '#222'}`, borderRadius: 24, padding: '8px 20px', color: !catActiva ? '#fff' : '#888', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                  Todo
                </button>
                {categorias.map(c => (
                  <button key={c.id} className="cat-btn" onClick={() => setCatActiva(c.id)} style={{ background: catActiva === c.id ? '#c00000' : '#111', border: `1px solid ${catActiva === c.id ? '#c00000' : '#222'}`, borderRadius: 24, padding: '8px 20px', color: catActiva === c.id ? '#fff' : '#888', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                    {c.icono} {c.nombre}
                  </button>
                ))}
              </div>
            </AnimSection>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {(prodsFiltrados.length > 0 ? prodsFiltrados : [1,2,3,4,5,6].map(i => ({ id: i, nombre: 'Próximamente', precio: 0, imagenUrl: null, descripcion: 'Delicioso plato en preparación', categoria: { nombre: 'Menú' } }))).map((p, i) => (
              <AnimSection key={p.id} delay={i * 0.06}>
                <div className="prod-card" style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 18, overflow: 'hidden' }}>
                  <div style={{ height: 200, position: 'relative', overflow: 'hidden', background: '#111' }}>
                    {p.imagenUrl
                      ? <img src={p.imagenUrl} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }} onMouseEnter={e => e.target.style.transform='scale(1.08)'} onMouseLeave={e => e.target.style.transform='scale(1)'} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, background: 'radial-gradient(circle at 50% 50%, #1a0000, #0e0e0e)' }}>🍽️</div>
                    }
                    {p.precio > 0 && (
                      <div style={{ position: 'absolute', top: 12, right: 12, background: '#c00000', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                        ${Number(p.precio).toLocaleString('es-CO')}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: '#f0ece4' }}>{p.nombre}</div>
                    {p.descripcion && <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>{p.descripcion}</div>}
                  </div>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" style={{ padding: '100px 5%', background: '#060606' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <AnimSection>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <div style={{ fontSize: 11, color: '#c00000', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Encuéntranos</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5vw, 60px)' }}>
                Visítanos <em style={{ color: '#c00000', fontStyle: 'italic' }}>hoy</em>
              </h2>
            </div>
          </AnimSection>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
            <AnimSection>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { ic: '📍', titulo: 'Dirección', val: DIRECCION },
                  { ic: '⏰', titulo: 'Horario', val: HORARIO },
                  { ic: '📞', titulo: 'Teléfono', val: TEL },
                ].map(({ ic, titulo, val }) => (
                  <div key={titulo} style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 16, padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, background: '#c0000022', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{ic}</div>
                    <div>
                      <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>{titulo}</div>
                      <div style={{ fontSize: 15, color: '#f0ece4', fontWeight: 600 }}>{val}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <a href={FACEBOOK} target="_blank" rel="noreferrer" className="social-btn" style={{ flex: 1, background: '#1877f222', border: '1px solid #1877f244', borderRadius: 14, padding: '14px', textAlign: 'center', textDecoration: 'none', color: '#6ab3f8', fontWeight: 700, fontSize: 13 }}>
                    👍 Facebook
                  </a>
                  <a href={WHATSAPP} target="_blank" rel="noreferrer" className="social-btn" style={{ flex: 1, background: '#25d36622', border: '1px solid #25d36644', borderRadius: 14, padding: '14px', textAlign: 'center', textDecoration: 'none', color: '#6ee7a0', fontWeight: 700, fontSize: 13 }}>
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </AnimSection>

            <AnimSection delay={0.2}>
              <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 20, overflow: 'hidden', aspectRatio: '4/3', position: 'relative' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.1234!2d-76.7!3d7.95!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sCurrulao%2C+Antioquia!5e0!3m2!1ses!2sco!4v1"
                  width="100%" height="100%" style={{ border: 0, filter: 'invert(.9) hue-rotate(180deg)' }}
                  allowFullScreen loading="lazy" title="Ubicación Fast & Healthy"
                />
              </div>
            </AnimSection>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '80px 5%', background: '#c00000', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.08'/%3E%3C/svg%3E\")", opacity: .4 }} />
        <AnimSection>
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 56px)', color: '#fff', marginBottom: 16 }}>¿Listo para pedir?</h2>
            <p style={{ color: '#ffaaaa', fontSize: 16, marginBottom: 32 }}>Contáctanos por WhatsApp o visítanos directamente</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={WHATSAPP} target="_blank" rel="noreferrer" style={{ background: '#fff', color: '#c00000', borderRadius: 12, padding: '14px 28px', fontWeight: 800, fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'transform .2s' }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                💬 Pedir por WhatsApp
              </a>
              <button onClick={() => navigate('/register')} style={{ background: 'transparent', color: '#fff', border: '2px solid #ffffff66', borderRadius: 12, padding: '14px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
                onMouseEnter={e => { e.target.style.borderColor='#fff'; e.target.style.background='#ffffff11' }} onMouseLeave={e => { e.target.style.borderColor='#ffffff66'; e.target.style.background='transparent' }}>
                Crear cuenta →
              </button>
            </div>
          </div>
        </AnimSection>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 5%', background: '#040404', borderTop: '1px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🐔</span>
          <span style={{ fontWeight: 800, fontSize: 14 }}>Fast & Healthy</span>
        </div>
        <div style={{ color: '#444', fontSize: 12 }}>© 2026 Fast & Healthy · Currulao, Antioquia</div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['Inicio','hero'],['Menú','menu'],['Contacto','contacto']].map(([l,id]) => (
            <span key={id} className="nav-link" onClick={() => scrollTo(id)}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  )
}
