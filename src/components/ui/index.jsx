// Tarjeta de estadística para dashboard
export function StatCard({ icon, label, value, color = '#f97316', sub }) {
  return (
    <div className="fade-in" style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '42px', height: '42px', background: color + '22', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{icon}</div>
        <span style={{ color: '#777', fontSize: '13px', fontWeight: '500' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: '800', color: '#f0f0f0' }}>{value}</div>
      {sub && <div style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>{sub}</div>}
    </div>
  )
}

// Modal genérico
export function Modal({ title, onClose, children, width = '500px' }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="fade-in" style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '20px', width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '17px', fontWeight: '700', color: '#f0f0f0' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  )
}

// Input genérico
export function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      {label && <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px', fontWeight: '500' }}>{label}</label>}
      <input {...props} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '10px 13px', color: '#f0f0f0', fontSize: '14px', outline: 'none', ...(props.style || {}) }}
        onFocus={e => e.target.style.borderColor = '#f97316'}
        onBlur={e => e.target.style.borderColor = '#2a2a2a'}
      />
    </div>
  )
}

// Select genérico
export function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      {label && <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px', fontWeight: '500' }}>{label}</label>}
      <select {...props} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '10px 13px', color: '#f0f0f0', fontSize: '14px', outline: 'none', cursor: 'pointer', ...(props.style || {}) }}>
        {children}
      </select>
    </div>
  )
}

// Botón primario
export function Btn({ children, onClick, type = 'button', variant = 'primary', disabled, small }) {
  const styles = {
    primary: { background: '#f97316', color: '#fff', border: 'none' },
    secondary: { background: '#1e1e1e', color: '#ccc', border: '1px solid #2a2a2a' },
    danger: { background: '#7f1d1d', color: '#fca5a5', border: 'none' },
    success: { background: '#14532d', color: '#86efac', border: 'none' },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...styles[variant], borderRadius: '10px', padding: small ? '7px 14px' : '10px 18px',
      fontSize: small ? '12px' : '14px', fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .5 : 1, fontFamily: 'Poppins, sans-serif', transition: 'opacity .15s'
    }}>
      {children}
    </button>
  )
}

// Badge de estado
export function Badge({ estado }) {
  const map = {
    LIBRE:          { bg: '#14532d', color: '#86efac', label: 'Libre' },
    OCUPADA:        { bg: '#7c2d12', color: '#fdba74', label: 'Ocupada' },
    RESERVADA:      { bg: '#1e3a5f', color: '#93c5fd', label: 'Reservada' },
    FUERA_SERVICIO: { bg: '#1c1917', color: '#a8a29e', label: 'Fuera servicio' },
    PENDIENTE:      { bg: '#422006', color: '#fbbf24', label: 'Pendiente' },
    EN_PREPARACION: { bg: '#1e3a5f', color: '#60a5fa', label: 'En preparación' },
    LISTO:          { bg: '#14532d', color: '#86efac', label: 'Listo' },
    SERVIDO:        { bg: '#312e81', color: '#a5b4fc', label: 'Servido' },
    PAGADO:         { bg: '#166534', color: '#4ade80', label: 'Pagado' },
    CANCELADO:      { bg: '#450a0a', color: '#fca5a5', label: 'Cancelado' },
    ACTIVO:         { bg: '#14532d', color: '#86efac', label: 'Activo' },
    INACTIVO:       { bg: '#1c1917', color: '#a8a29e', label: 'Inactivo' },
    AGOTADO:        { bg: '#450a0a', color: '#fca5a5', label: 'Agotado' },
    EMITIDA:        { bg: '#14532d', color: '#86efac', label: 'Emitida' },
    ANULADA:        { bg: '#450a0a', color: '#fca5a5', label: 'Anulada' },
  }
  const s = map[estado] || { bg: '#1a1a1a', color: '#888', label: estado }
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
      {s.label}
    </span>
  )
}

// Tabla genérica
export function Table({ headers, children, empty = 'Sin registros' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: '#666', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #1e1e1e' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Tr({ children, onClick }) {
  return (
    <tr onClick={onClick} style={{ borderBottom: '1px solid #161616', cursor: onClick ? 'pointer' : 'default', transition: 'background .1s' }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = '#161616' }}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {children}
    </tr>
  )
}

export function Td({ children }) {
  return <td style={{ padding: '13px 16px', fontSize: '14px', color: '#ccc' }}>{children}</td>
}

// Page header
export function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
      <div>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '24px', fontWeight: '800', color: '#f0f0f0' }}>{title}</h1>
        {sub && <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// Card container
export function Card({ children, style }) {
  return (
    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '16px', ...style }}>
      {children}
    </div>
  )
}
