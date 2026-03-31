import axios from "axios";

const api = axios.create({
<<<<<<<<< Temporary merge branch 1
 baseURL: 'https://restaurante-backend-2mpl.onrender.com/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
=========
  baseURL: import.meta.env.VITE_API_URL || "https://restaurante-backend-h125.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Log de depuración técnica para ver qué método sale realmente del cliente
  console.log(`🚀 Enviando ${config.method?.toUpperCase()} a: ${config.url}`);
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;

export const login = (data) => api.post("/auth/login", data);
export const getUsuarios = () => api.get("/usuarios");
export const crearUsuario = (data) => api.post("/usuarios", data);
export const actualizarUsuario = (id, data) => api.put(`/usuarios/${id}`, data);
export const cambiarEstadoUsuario = (id, activo) =>
  api.patch(`/usuarios/${id}/estado?activo=${activo}`);
export const getRoles = () => api.get("/roles");
export const getCategorias = () => api.get("/categorias");
export const crearCategoria = (data) => api.post("/categorias", data);
export const actualizarCategoria = (id, data) =>
  api.put(`/categorias/${id}`, data);
export const eliminarCategoria = (id) => api.delete(`/categorias/${id}`);
export const getProductos = () => api.get("/productos");
export const getMenu = () => api.get("/productos/menu");
export const crearProducto = (data) => api.post("/productos", data);
export const actualizarProducto = (id, data) =>
  api.put(`/productos/${id}`, data);
export const cambiarEstadoProducto = (id, estado) =>
  api.patch(`/productos/${id}/estado?estado=${estado}`);
export const eliminarProducto = (id) => api.delete(`/productos/${id}`);
export const getMesas = () => api.get("/mesas");
export const crearMesa = (data) => api.post("/mesas", data);
export const actualizarMesa = (id, data) => api.put(`/mesas/${id}`, data);
export const cambiarEstadoMesa = (id, estado) =>
  api.patch(`/mesas/${id}/estado?estado=${estado}`);
export const eliminarMesa = (id) => api.delete(`/mesas/${id}`);
export const getPedidos = () => api.get("/pedidos");
export const getTodosPedidos = () => api.get("/pedidos/todos");
export const getPedidosCocina = () => api.get("/pedidos/cocina");
export const getPedido = (id) => api.get(`/pedidos/${id}`);
export const crearPedido = (data) => api.post("/pedidos", data);
export const cambiarEstadoPedido = (id, estado) =>
  api.patch(`/pedidos/${id}/estado`, { estado });
export const getFacturas = () => api.get("/facturas");
export const crearFactura = (data) => api.post("/facturas", data);
export const anularFactura = (id) => api.patch(`/facturas/${id}/anular`);
export const getInventario = () => api.get("/inventario");
export const getStockBajo = () => api.get("/inventario/stock-bajo");
export const crearIngrediente = (data) => api.post("/inventario", data);
export const actualizarIngrediente = (id, data) =>
  api.put(`/inventario/${id}`, data);
export const ajustarStock = (id, data) =>
  api.post(`/inventario/${id}/ajuste`, data);
export const getProveedores = () => api.get("/proveedores");
export const crearProveedor = (data) => api.post("/proveedores", data);
export const actualizarProveedor = (id, data) =>
  api.put(`/proveedores/${id}`, data);
export const getCompras = () => api.get("/compras");
export const crearCompra = (data) => api.post("/compras", data);
export const getReservas = () => api.get("/reservas");
export const crearReserva = (data) => api.post("/reservas", data);
export const cambiarEstadoReserva = (id, estado) =>
  api.patch(`/reservas/${id}/estado?estado=${estado}`);
export const getTurnos = () => api.get("/turnos");
export const abrirTurno = (data) => api.post("/turnos/abrir", data);
export const cerrarTurno = (id, data) =>
  api.patch(`/turnos/${id}/cerrar`, data);
export const getVentasDia = () => api.get("/reportes/ventas-dia");
export const getVentasPeriodo = (inicio, fin) =>
  api.get(`/reportes/ventas-periodo?inicio=${inicio}&fin=${fin}`);
export const getMetodosPago = () => api.get("/reportes/metodos-pago");
