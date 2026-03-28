import { useEffect, useState, useRef } from 'react'
import {
  getVentasDia, getVentasPeriodo, getMetodosPago,
  getTodosPedidos, getInventario, getMesas, getFacturas
} from '../../services/api'
import { PageHeader, Btn, Card, Input } from '../../components/ui'
import toast from 'react-hot-toast'

const C = { bg: '#0a0a0a', surface: '#111', surface2: '#1a1a1a', border: '#1e1e1e', accent: '#f97316', text: '#f0f0f0', muted: '#666' }

function BarChart({ data, labelKey, valueKey, color = '#f97316', height = 180 }) {
  if (!data?.length) return <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontSize:13 }}>Sin datos</div>
  const max = Math.max(...data.map(d => Number(d[valueKey])||0))||1
  return (
    <div style={{ height, display:'flex', alignItems:'flex-end', gap:4, padding:'0 4px' }}>
      {data.slice(0,14).map((d,i) => {
        const h = Math.max(4,((Number(d[valueKey])||0)/max)*(height-36))
        return (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
            <div style={{ fontSize:8, color:C.muted, fontWeight:600 }}>{Number(d[valueKey]||0).toLocaleString()}</div>
            <div style={{ width:'100%', height:h, background:color, borderRadius:'3px 3px 0 0', opacity:.9 }} />
            <div style={{ fontSize:8, color:C.muted, textAlign:'center', overflow:'hidden', maxWidth:'100%', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
              {String(d[labelKey]||'').substring(0,8)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DonutChart({ data, labelKey, valueKey, size=160 }) {
  if (!data?.length) return null
  const colors = ['#f97316','#3b82f6','#22c55e','#a855f7','#f59e0b','#ef4444','#06b6d4','#ec4899']
  const total = data.reduce((a,d) => a+Number(d[valueKey]||0),0)||1
  let offset = 0
  const r=58, cx=size/2, cy=size/2, stroke=20, circ=2*Math.PI*r
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
      <svg width={size} height={size}>
        {data.map((d,i) => {
          const pct = Number(d[valueKey]||0)/total
          const rot = offset*360-90
          offset += pct
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={colors[i%colors.length]} strokeWidth={stroke}
            strokeDasharray={`${pct*circ} ${circ}`} transform={`rotate(${rot} ${cx} ${cy})`} />
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill={C.text} fontSize="10" fontWeight="700">{data.length} items</text>
      </svg>
      <div style={{ flex:1 }}>
        {data.slice(0,6).map((d,i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:colors[i%colors.length], flexShrink:0 }} />
              <span style={{ fontSize:12, color:C.muted }}>{String(d[labelKey]||'').substring(0,18)}</span>
            </div>
            <span style={{ fontSize:12, color:C.text, fontWeight:600 }}>{Number(d[valueKey]||0).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReportCard({ icon, title, desc, onClick, color='#f97316' }) {
  return (
    <div onClick={onClick} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20, cursor:'pointer', transition:'all .2s' }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor=color; e.currentTarget.style.background='#161616' }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.surface }}>
      <div style={{ fontSize:32, marginBottom:10 }}>{icon}</div>
      <div style={{ fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:15, color:C.text, marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:12, color:C.muted, lineHeight:1.5, marginBottom:14 }}>{desc}</div>
      <div style={{ fontSize:11, color, fontWeight:600, display:'flex', gap:12 }}>
        <span>📄 PDF</span><span>📊 Excel</span>
      </div>
    </div>
  )
}

function ReportModal({ report, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fechaInicio, setFechaInicio] = useState(new Date(Date.now()-7*86400000).toISOString().split('T')[0])
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])

  const cargar = async () => {
    setLoading(true)
    try { setData(await report.fetch(fechaInicio, fechaFin)) }
    catch { toast.error('Error al cargar datos') }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const exportPDF = async () => {
    try {
      const script1 = document.createElement('script')
      script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      document.head.appendChild(script1)
      await new Promise(r => { script1.onload = r; script1.onerror = r })
      const script2 = document.createElement('script')
      script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
      document.head.appendChild(script2)
      await new Promise(r => { script2.onload = r; script2.onerror = r })

      const { jsPDF } = window.jspdf
      const doc = new jsPDF()
      const W = doc.internal.pageSize.width
      const H = doc.internal.pageSize.height

      const drawBorder = () => {
        doc.setFillColor(192,0,0)
        doc.rect(0,0,W,8,'F')       // top
        doc.rect(0,H-8,W,8,'F')     // bottom
        doc.rect(0,0,8,H,'F')       // left
        doc.rect(W-8,0,8,H,'F')     // right
      }

      // Header rojo
      doc.setFillColor(192,0,0); doc.rect(0,0,W,36,'F')
      doc.setTextColor(255,255,255)
      doc.setFontSize(18); doc.setFont('helvetica','bold')
      doc.text('Fast & Healthy',12,16)
      doc.setFontSize(10); doc.setFont('helvetica','normal')
      doc.text(report.title,12,26)
      doc.setFontSize(7)
      doc.text(`Período: ${fechaInicio} al ${fechaFin}  |  ${new Date().toLocaleString('es-CO')}`,12,33)
      doc.setTextColor(0,0,0)
      drawBorder()

      let y = 45
      if (data?.stats) {
        doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.text('RESUMEN EJECUTIVO',14,y); y+=8
        doc.setFont('helvetica','normal'); doc.setFontSize(9)
        data.stats.forEach(s => {
          doc.setFillColor(250,248,245); doc.rect(14,y-4,90,8,'F')
          doc.text(`${s.label}:`,16,y); doc.setFont('helvetica','bold'); doc.text(String(s.value),75,y)
          doc.setFont('helvetica','normal'); y+=10
        })
        y+=6
      }

      if (data?.rows?.length) {
        doc.autoTable({
          head:[data.headers], body:data.rows, startY:y,
          styles:{ fontSize:8, cellPadding:3 },
          headStyles:{ fillColor:[249,115,22], textColor:255, fontStyle:'bold' },
          alternateRowStyles:{ fillColor:[252,252,252] },
          margin:{ left:14, right:14 }
        })
      }

      // Agregar QR en la última página
      const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=https://fast-healthy.railway.app/login'
      const qrImg = await new Promise((res) => {
        const img = new Image(); img.crossOrigin = 'anonymous'
        img.onload = () => { const c = document.createElement('canvas'); c.width=60; c.height=60; c.getContext('2d').drawImage(img,0,0); res(c.toDataURL('image/png')) }
        img.onerror = () => res(null)
        img.src = qrUrl
      })

      const pages = doc.internal.getNumberOfPages()
      for (let i=1;i<=pages;i++) {
        doc.setPage(i)
        drawBorder()
        doc.setFontSize(7); doc.setTextColor(150)
        doc.text(`Fast & Healthy — ${report.title} — Pág ${i}/${pages}`,12,H-3)
        if (i === pages && qrImg) {
          doc.addImage(qrImg, 'PNG', W-28, H-28, 20, 20)
          doc.setFontSize(6); doc.setTextColor(150)
          doc.text('Escanea', W-28, H-8)
        }
      }

      doc.save(`${report.filename}_${fechaInicio}_${fechaFin}.pdf`)
      toast.success('✅ PDF descargado')
    } catch(err) { console.error(err); toast.error('Error al generar PDF') }
  }

  const exportExcel = async () => {
    try {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
      document.head.appendChild(script)
      await new Promise(r => { script.onload = r; script.onerror = r })
      const XLSX = window.XLSX

      const wb = XLSX.utils.book_new()
      if (data?.rows?.length) {
        const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows])
        ws['!cols'] = data.headers.map(() => ({ wch:18 }))
        XLSX.utils.book_append_sheet(wb, ws, 'Datos')
      }
      if (data?.stats) {
        const ws2 = XLSX.utils.aoa_to_sheet([['Indicador','Valor'],...data.stats.map(s=>[s.label,s.value])])
        ws2['!cols'] = [{wch:30},{wch:20}]
        XLSX.utils.book_append_sheet(wb, ws2, 'Resumen')
      }
      const wsMeta = XLSX.utils.aoa_to_sheet([['Reporte',report.title],['Período',`${fechaInicio} al ${fechaFin}`],['Generado',new Date().toLocaleString('es-CO')],['Sistema','Fast & Healthy']])
      wsMeta['!cols'] = [{wch:20},{wch:30}]
      XLSX.utils.book_append_sheet(wb, wsMeta, 'Info')

      XLSX.writeFile(wb, `${report.filename}_${fechaInicio}_${fechaFin}.xlsx`)
      toast.success('✅ Excel descargado')
    } catch(err) { console.error(err); toast.error('Error al generar Excel') }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div className="fade-in" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, width:'100%', maxWidth:820, maxHeight:'90vh', overflow:'auto' }}>
        <div style={{ padding:'20px 24px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:'#161616', borderRadius:'20px 20px 0 0' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:24 }}>{report.icon}</span>
              <h3 style={{ fontFamily:'Poppins, sans-serif', fontSize:18, fontWeight:800, color:C.text }}>{report.title}</h3>
            </div>
            <p style={{ color:C.muted, fontSize:12, marginTop:4 }}>{report.desc}</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:C.muted, fontSize:24, cursor:'pointer' }}>×</button>
        </div>

        <div style={{ padding:24 }}>
          <div style={{ display:'flex', gap:12, alignItems:'flex-end', marginBottom:24, background:C.surface2, padding:16, borderRadius:12 }}>
            <div style={{ flex:1 }}><label style={{ display:'block', fontSize:12, color:'#aaa', marginBottom:6, fontWeight:500 }}>Fecha inicio</label>
              <input type="date" value={fechaInicio} onChange={e=>setFechaInicio(e.target.value)} style={{ width:'100%', background:'#111', border:'1px solid #2a2a2a', borderRadius:10, padding:'10px 13px', color:C.text, fontSize:14, outline:'none' }} /></div>
            <div style={{ flex:1 }}><label style={{ display:'block', fontSize:12, color:'#aaa', marginBottom:6, fontWeight:500 }}>Fecha fin</label>
              <input type="date" value={fechaFin} onChange={e=>setFechaFin(e.target.value)} style={{ width:'100%', background:'#111', border:'1px solid #2a2a2a', borderRadius:10, padding:'10px 13px', color:C.text, fontSize:14, outline:'none' }} /></div>
            <button onClick={cargar} disabled={loading} style={{ background:loading?'#7c3b10':'#f97316', color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontSize:14, fontWeight:600, cursor:loading?'not-allowed':'pointer' }}>
              {loading?'⏳':'🔍'} {loading?'Cargando...':'Consultar'}
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:48, color:C.muted }}><div style={{ fontSize:32, marginBottom:12 }}>⏳</div>Cargando datos...</div>
          ) : data ? (
            <>
              {data.stats && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12, marginBottom:24 }}>
                  {data.stats.map((s,i) => (
                    <div key={i} style={{ background:C.surface2, borderRadius:12, padding:'14px 16px', border:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>{s.label}</div>
                      <div style={{ fontFamily:'Poppins, sans-serif', fontSize:20, fontWeight:800, color:s.color||C.accent }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {data.chart && (
                <div style={{ background:C.surface2, borderRadius:12, padding:20, marginBottom:24, border:`1px solid ${C.border}` }}>
                  <div style={{ fontFamily:'Poppins, sans-serif', fontSize:14, fontWeight:700, color:C.text, marginBottom:16 }}>📊 {data.chart.title}</div>
                  {data.chart.type==='bar' && <BarChart data={data.chart.data} labelKey={data.chart.labelKey} valueKey={data.chart.valueKey} color={data.chart.color||C.accent} />}
                  {data.chart.type==='donut' && <DonutChart data={data.chart.data} labelKey={data.chart.labelKey} valueKey={data.chart.valueKey} />}
                </div>
              )}

              {data.rows?.length>0 && (
                <div style={{ background:C.surface2, borderRadius:12, overflow:'hidden', marginBottom:24, border:`1px solid ${C.border}` }}>
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead><tr style={{ background:'#f9731622' }}>
                        {data.headers.map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, color:C.accent, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', borderBottom:`1px solid ${C.border}` }}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {data.rows.map((row,i) => (
                          <tr key={i} style={{ borderBottom:'1px solid #161616' }}>
                            {row.map((cell,j) => <td key={j} style={{ padding:'10px 14px', fontSize:13, color:j===0?C.text:C.muted }}>{cell}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ display:'flex', gap:12, justifyContent:'center', paddingTop:8 }}>
                <button onClick={exportPDF} style={{ background:'#450a0a', border:'1px solid #7f1d1d', borderRadius:12, padding:'12px 28px', color:'#fca5a5', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Poppins, sans-serif' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#7f1d1d'} onMouseLeave={e=>e.currentTarget.style.background='#450a0a'}>
                  📄 Descargar PDF
                </button>
                <button onClick={exportExcel} style={{ background:'#14532d22', border:'1px solid #166534', borderRadius:12, padding:'12px 28px', color:'#86efac', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Poppins, sans-serif' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#14532d'} onMouseLeave={e=>e.currentTarget.style.background='#14532d22'}>
                  📊 Descargar Excel
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign:'center', padding:48, color:C.muted }}>No hay datos para el período seleccionado</div>
          )}
        </div>
      </div>
    </div>
  )
}

const buildReports = () => [
  { id:'ventas-diarias', icon:'💰', title:'Ventas Diarias', desc:'Total de pedidos cerrados y valor recaudado por día', filename:'ventas_diarias', color:'#22c55e',
    fetch: async (fechaInicio, fechaFin) => {
      const [fr, pr] = await Promise.all([getFacturas(), getTodosPedidos()])
      const facturas = (fr.data.data||[]).filter(f=>f.estado==='EMITIDA' && f.fecha >= fechaInicio && f.fecha <= fechaFin + 'T23:59:59')
      const totalVentas = facturas.reduce((a,f)=>a+Number(f.montoTotal||0),0)
      const porDia = {}
      facturas.forEach(f=>{ const d=f.fecha?.split('T')[0]||'S/F'; if(!porDia[d])porDia[d]={t:0,c:0}; porDia[d].t+=Number(f.montoTotal||0); porDia[d].c++ })
      const chartData = Object.entries(porDia).map(([fecha,v])=>({fecha,total:v.t})).sort((a,b)=>a.fecha.localeCompare(b.fecha))
      return {
        stats:[{label:'Total recaudado',value:`$${totalVentas.toLocaleString()}`,color:'#22c55e'},{label:'Facturas emitidas',value:facturas.length,color:'#3b82f6'},{label:'Ticket promedio',value:facturas.length?`$${Math.round(totalVentas/facturas.length).toLocaleString()}`:'$0',color:'#f97316'}],
        chart:{title:'Ventas por día',type:'bar',data:chartData,labelKey:'fecha',valueKey:'total',color:'#22c55e'},
        headers:['Fecha','Facturas','Total Ventas','Promedio'],
        rows:Object.entries(porDia).map(([f,v])=>[f,v.c,`$${v.t.toLocaleString()}`,`$${Math.round(v.t/v.c).toLocaleString()}`])
      }
    }
  },
  { id:'productos-vendidos', icon:'🍕', title:'Productos Más Vendidos', desc:'Ranking de productos por cantidad vendida en el período', filename:'productos_vendidos', color:'#f97316',
    fetch: async (fechaInicio, fechaFin) => {
      const r = await getTodosPedidos()
      const conteo = {}
      ;(r.data.data||[]).filter(p=>p.fechaCreacion >= fechaInicio && p.fechaCreacion <= fechaFin + 'T23:59:59').forEach(p=>p.items?.forEach(item=>{ const n=item.producto||'Desconocido'; if(!conteo[n])conteo[n]={c:0,t:0}; conteo[n].c+=item.cantidad||0; conteo[n].t+=Number(item.subtotal||0) }))
      const sorted = Object.entries(conteo).map(([nombre,v])=>({nombre,cantidad:v.c,total:v.t})).sort((a,b)=>b.cantidad-a.cantidad)
      return {
        stats:[{label:'Productos distintos',value:sorted.length,color:'#f97316'},{label:'Unidades vendidas',value:sorted.reduce((a,s)=>a+s.cantidad,0),color:'#3b82f6'},{label:'Producto top',value:sorted[0]?.nombre||'N/A',color:'#22c55e'}],
        chart:{title:'Top productos por unidades',type:'bar',data:sorted.slice(0,10),labelKey:'nombre',valueKey:'cantidad',color:'#f97316'},
        headers:['#','Producto','Unidades','Total Generado'],
        rows:sorted.map((s,i)=>[i+1,s.nombre,s.cantidad,`$${s.total.toLocaleString()}`])
      }
    }
  },
  { id:'recaudado-periodo', icon:'📅', title:'Total Recaudado por Período', desc:'Resumen de ingresos por día, semana y mes', filename:'recaudado_periodo', color:'#3b82f6',
    fetch: async (fechaInicio, fechaFin) => {
      const r = await getFacturas()
      const facturas = (r.data.data||[]).filter(f=>f.estado==='EMITIDA' && f.fecha >= fechaInicio && f.fecha <= fechaFin + 'T23:59:59')
      const hoy = new Date().toISOString().split('T')[0]
      const totalDia = facturas.filter(f=>f.fecha?.startsWith(hoy)).reduce((a,f)=>a+Number(f.montoTotal||0),0)
      const totalSem = facturas.filter(f=>(Date.now()-new Date(f.fecha))<7*86400000).reduce((a,f)=>a+Number(f.montoTotal||0),0)
      const totalMes = facturas.filter(f=>new Date(f.fecha).getMonth()===new Date().getMonth()).reduce((a,f)=>a+Number(f.montoTotal||0),0)
      const total = facturas.reduce((a,f)=>a+Number(f.montoTotal||0),0)
      const porDia = {}
      facturas.forEach(f=>{ const d=f.fecha?.split('T')[0]||'S/F'; if(!porDia[d])porDia[d]=0; porDia[d]+=Number(f.montoTotal||0) })
      return {
        stats:[{label:'Hoy',value:`$${totalDia.toLocaleString()}`,color:'#22c55e'},{label:'Esta semana',value:`$${totalSem.toLocaleString()}`,color:'#3b82f6'},{label:'Este mes',value:`$${totalMes.toLocaleString()}`,color:'#f97316'},{label:'Total período',value:`$${total.toLocaleString()}`,color:'#a855f7'}],
        chart:{title:'Evolución de ventas',type:'bar',data:Object.entries(porDia).map(([fecha,total])=>({fecha,total})).sort((a,b)=>a.fecha.localeCompare(b.fecha)),labelKey:'fecha',valueKey:'total',color:'#3b82f6'},
        headers:['Fecha','Total Recaudado'],
        rows:Object.entries(porDia).sort().map(([f,t])=>[f,`$${t.toLocaleString()}`])
      }
    }
  },
  { id:'inventario', icon:'📦', title:'Movimientos de Inventario', desc:'Estado actual del inventario y alertas de stock', filename:'inventario', color:'#a855f7',
    fetch: async (fechaInicio, fechaFin) => {
      const r = await getInventario()
      const inv = r.data.data||[]
      const criticos=inv.filter(i=>i.stockActual<=i.stockMinimo), bajos=inv.filter(i=>i.stockActual>i.stockMinimo&&i.stockActual<=i.stockAlerta), ok=inv.filter(i=>i.stockActual>i.stockAlerta)
      return {
        stats:[{label:'Total ingredientes',value:inv.length,color:'#a855f7'},{label:'OK',value:ok.length,color:'#22c55e'},{label:'Bajo',value:bajos.length,color:'#f59e0b'},{label:'Crítico',value:criticos.length,color:'#ef4444'}],
        chart:{title:'Estado del inventario',type:'donut',data:[{e:'OK',v:ok.length},{e:'Bajo',v:bajos.length},{e:'Crítico',v:criticos.length}],labelKey:'e',valueKey:'v'},
        headers:['Ingrediente','Stock Actual','Mínimo','Unidad','Estado'],
        rows:inv.map(i=>[i.nombreIngrediente,i.stockActual,i.stockMinimo,i.unidadMedida,i.stockActual<=i.stockMinimo?'🔴 CRÍTICO':i.stockActual<=i.stockAlerta?'🟡 BAJO':'🟢 OK'])
      }
    }
  },
  { id:'meseros', icon:'👨‍💼', title:'Rendimiento por Mesero', desc:'Pedidos atendidos y valor generado por mesero', filename:'rendimiento_meseros', color:'#06b6d4',
    fetch: async (fechaInicio, fechaFin) => {
      const r = await getTodosPedidos()
      const por = {}
      ;(r.data.data||[]).filter(p=>p.fechaCreacion >= fechaInicio && p.fechaCreacion <= fechaFin + 'T23:59:59').forEach(p=>{ const n=p.mesero||'Sin asignar'; if(!por[n])por[n]={p:0,t:0}; por[n].p++; por[n].t+=Number(p.total||0) })
      const sorted = Object.entries(por).map(([nombre,v])=>({nombre,pedidos:v.p,total:v.t})).sort((a,b)=>b.total-a.total)
      return {
        stats:[{label:'Meseros activos',value:sorted.length,color:'#06b6d4'},{label:'Total pedidos',value:sorted.reduce((a,s)=>a+s.pedidos,0),color:'#3b82f6'},{label:'Top mesero',value:sorted[0]?.nombre||'N/A',color:'#22c55e'}],
        chart:{title:'Ventas por mesero',type:'bar',data:sorted,labelKey:'nombre',valueKey:'total',color:'#06b6d4'},
        headers:['Mesero','Pedidos','Total Generado','Promedio/Pedido'],
        rows:sorted.map(s=>[s.nombre,s.pedidos,`$${s.total.toLocaleString()}`,`$${s.pedidos?Math.round(s.total/s.pedidos).toLocaleString():0}`])
      }
    }
  },
  { id:'mesas', icon:'🪑', title:'Rotación de Mesas', desc:'Mesas con mayor uso y pedidos generados', filename:'rotacion_mesas', color:'#f59e0b',
    fetch: async (fechaInicio, fechaFin) => {
      const [mr, pr] = await Promise.all([getMesas(), getTodosPedidos()])
      const mesas = mr.data.data||[], pedidos = pr.data.data||[]
      const por = {}
      pedidos.filter(p=>p.mesa).forEach(p=>{ const m=p.mesa; if(!por[m])por[m]={p:0,t:0}; por[m].p++; por[m].t+=Number(p.total||0) })
      const sorted = Object.entries(por).map(([mesa,v])=>({mesa,pedidos:v.p,total:v.t})).sort((a,b)=>b.pedidos-a.pedidos)
      return {
        stats:[{label:'Total mesas',value:mesas.length,color:'#f59e0b'},{label:'Mesas activas',value:sorted.length,color:'#22c55e'},{label:'Mesa top',value:sorted[0]?.mesa||'N/A',color:'#f97316'}],
        chart:{title:'Pedidos por mesa',type:'bar',data:sorted,labelKey:'mesa',valueKey:'pedidos',color:'#f59e0b'},
        headers:['Mesa','Pedidos','Total Generado','Promedio/Pedido'],
        rows:sorted.map(s=>[s.mesa,s.pedidos,`$${s.total.toLocaleString()}`,`$${s.pedidos?Math.round(s.total/s.pedidos).toLocaleString():0}`])
      }
    }
  },
  { id:'horarios', icon:'⏰', title:'Horarios Pico de Ventas', desc:'Horas del día con mayor concentración de pedidos', filename:'horarios_pico', color:'#ef4444',
    fetch: async (fechaInicio, fechaFin) => {
      const r = await getTodosPedidos()
      const por = {}
      ;(r.data.data||[]).filter(p=>p.fechaCreacion >= fechaInicio && p.fechaCreacion <= fechaFin + 'T23:59:59').forEach(p=>{ const h=p.fechaCreacion?new Date(p.fechaCreacion).getHours():null; if(h!==null){const k=`${String(h).padStart(2,'0')}:00`; if(!por[k])por[k]={p:0,t:0}; por[k].p++; por[k].t+=Number(p.total||0)} })
      const datos = Object.entries(por).map(([hora,v])=>({hora,pedidos:v.p,total:v.t})).sort((a,b)=>a.hora.localeCompare(b.hora))
      const pico = datos.reduce((m,d)=>d.pedidos>m.pedidos?d:m,{pedidos:0,hora:'N/A'})
      return {
        stats:[{label:'Hora pico',value:pico.hora,color:'#ef4444'},{label:'Pedidos en pico',value:pico.pedidos,color:'#f97316'},{label:'Horas con actividad',value:datos.length,color:'#3b82f6'}],
        chart:{title:'Pedidos por hora del día',type:'bar',data:datos,labelKey:'hora',valueKey:'pedidos',color:'#ef4444'},
        headers:['Hora','Pedidos','Total Generado'],
        rows:datos.map(d=>[d.hora,d.pedidos,`$${d.total.toLocaleString()}`])
      }
    }
  },
  { id:'cancelados', icon:'❌', title:'Pedidos Cancelados', desc:'Análisis de cancelaciones por período', filename:'pedidos_cancelados', color:'#ef4444',
    fetch: async (fechaInicio, fechaFin) => {
      const r = await getTodosPedidos()
      const todos = (r.data.data||[]).filter(p=>p.fechaCreacion >= fechaInicio && p.fechaCreacion <= fechaFin + 'T23:59:59'), cancelados = todos.filter(p=>p.estado==='CANCELADO')
      const tasa = todos.length?((cancelados.length/todos.length)*100).toFixed(1):0
      const por = {}
      cancelados.forEach(p=>{ const m=p.mesero||'Sin asignar'; por[m]=(por[m]||0)+1 })
      return {
        stats:[{label:'Total cancelados',value:cancelados.length,color:'#ef4444'},{label:'Tasa cancelación',value:`${tasa}%`,color:'#f59e0b'},{label:'Total pedidos',value:todos.length,color:'#888'}],
        chart:{title:'Cancelaciones por mesero',type:'bar',data:Object.entries(por).map(([n,c])=>({nombre:n,cantidad:c})).sort((a,b)=>b.cantidad-a.cantidad),labelKey:'nombre',valueKey:'cantidad',color:'#ef4444'},
        headers:['Pedido','Mesa/Tipo','Mesero','Total','Fecha'],
        rows:cancelados.map(p=>[p.numeroPedido,p.mesa||p.tipoPedido,p.mesero||'N/A',`$${Number(p.total||0).toLocaleString()}`,p.fechaCreacion?.split('T')[0]||''])
      }
    }
  },
  { id:'categorias', icon:'🏷️', title:'Ingresos por Categoría', desc:'Distribución de ventas por categoría de productos', filename:'ingresos_categoria', color:'#a855f7',
    fetch: async (fechaInicio, fechaFin) => {
      const r = await getTodosPedidos()
      const por = {}
      ;(r.data.data||[]).filter(p=>p.fechaCreacion >= fechaInicio && p.fechaCreacion <= fechaFin + 'T23:59:59').forEach(p=>p.items?.forEach(item=>{ const c=item.categoria||'Sin categoría'; if(!por[c])por[c]={c:0,t:0}; por[c].c+=item.cantidad||0; por[c].t+=Number(item.subtotal||0) }))
      const sorted = Object.entries(por).map(([categoria,v])=>({categoria,cantidad:v.c,total:v.t})).sort((a,b)=>b.total-a.total)
      const totalG = sorted.reduce((a,s)=>a+s.total,0)
      return {
        stats:[{label:'Categorías activas',value:sorted.length,color:'#a855f7'},{label:'Total ingresos',value:`$${totalG.toLocaleString()}`,color:'#22c55e'},{label:'Categoría top',value:sorted[0]?.categoria||'N/A',color:'#f97316'}],
        chart:{title:'Ingresos por categoría',type:'donut',data:sorted,labelKey:'categoria',valueKey:'total'},
        headers:['Categoría','Unidades','Total','% del Total'],
        rows:sorted.map(s=>[s.categoria,s.cantidad,`$${s.total.toLocaleString()}`,`${totalG?(s.total/totalG*100).toFixed(1):0}%`])
      }
    }
  },
  { id:'caja', icon:'🧾', title:'Cuadre de Caja por Turno', desc:'Ingresos y métodos de pago por turno de caja', filename:'cuadre_caja', color:'#22c55e',
    fetch: async (fechaInicio, fechaFin) => {
      const r = await getFacturas()
      const facturas = (r.data.data||[]).filter(f=>f.estado==='EMITIDA' && f.fecha >= fechaInicio && f.fecha <= fechaFin + 'T23:59:59')
      const por = {}
      facturas.forEach(f=>{ const m=f.metodoPago||'Sin método'; if(!por[m])por[m]={c:0,t:0}; por[m].c++; por[m].t+=Number(f.montoTotal||0) })
      const total = facturas.reduce((a,f)=>a+Number(f.montoTotal||0),0)
      const ef = por['EFECTIVO']?.t||0, td = (por['TARJETA_DEBITO']?.t||0)+(por['TARJETA_CREDITO']?.t||0), dig = (por['TRANSFERENCIA']?.t||0)+(por['QR']?.t||0)
      return {
        stats:[{label:'Total recaudado',value:`$${total.toLocaleString()}`,color:'#22c55e'},{label:'Efectivo',value:`$${ef.toLocaleString()}`,color:'#f97316'},{label:'Tarjetas',value:`$${td.toLocaleString()}`,color:'#3b82f6'},{label:'Digital',value:`$${dig.toLocaleString()}`,color:'#a855f7'}],
        chart:{title:'Distribución por método de pago',type:'donut',data:Object.entries(por).map(([m,v])=>({metodo:m,total:v.t})),labelKey:'metodo',valueKey:'total'},
        headers:['Método de Pago','Transacciones','Total','% del Total'],
        rows:Object.entries(por).map(([m,v])=>[m,v.c,`$${v.t.toLocaleString()}`,`${total?(v.t/total*100).toFixed(1):0}%`])
      }
    }
  },
]

export default function Reportes() {
  const [activo, setActivo] = useState(null)
  const reports = buildReports()
  const colores = ['#22c55e','#f97316','#3b82f6','#a855f7','#06b6d4','#f59e0b','#ef4444','#ef4444','#a855f7','#22c55e']
  return (
    <div className="fade-in">
      <PageHeader title="Reportes" sub="10 reportes disponibles — descarga en PDF y Excel" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(210px, 1fr))', gap:16 }}>
        {reports.map((r,i) => <ReportCard key={r.id} icon={r.icon} title={r.title} desc={r.desc} color={colores[i]} onClick={()=>setActivo(r)} />)}
      </div>
      {activo && <ReportModal report={activo} onClose={()=>setActivo(null)} />}
    </div>
  )
}
