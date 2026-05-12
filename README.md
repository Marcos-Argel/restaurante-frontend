# 🌐 Restaurante Frontend

Interfaz de usuario para sistema de gestión de restaurante desarrollada con **React 18** y **Vite**.

---

## 🚀 Tecnologías utilizadas

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 📋 Módulos del sistema

- 🔐 **Login** con autenticación JWT
- 📊 **Dashboard** — resumen general
- 🪑 **Mesas** — gestión de disponibilidad
- 📦 **Pedidos** — creación y seguimiento
- 👨‍🍳 **Cocina** — vista en tiempo real
- 🛒 **Productos y Recetas**
- 📁 **Inventario**
- 🧾 **Facturas**
- 📅 **Reservas**
- 🚚 **Proveedores**
- 📈 **Reportes**
- 👥 **Usuarios**

---

## 📂 Estructura del proyecto
src/

├── components/     # Componentes reutilizables (Layout, UI)

├── context/        # AuthContext (manejo de sesión)

├── pages/          # Vistas por módulo

│   ├── auth/

│   ├── dashboard/

│   ├── mesas/

│   ├── pedidos/

│   ├── cocina/

│   ├── productos/

│   ├── inventario/

│   ├── facturas/

│   ├── reservas/

│   ├── proveedores/

│   ├── reportes/

│   └── usuarios/

└── services/       # Configuración de API (Axios)

---

## 🛠️ Instalación

### Requisitos
- Node.js 18+
- npm o yarn
- Backend corriendo en `localhost:8080`

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/Marcos-Argel/restaurante-frontend.git
cd restaurante-frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en desarrollo**
```bash
npm run dev
```

4. **Build para producción**
```bash
npm run build
```

5. **O con Docker**
```bash
docker build -t restaurante-frontend .
docker run -p 80:80 restaurante-frontend
```

---

## 🔗 Repositorio relacionado

Este frontend consume la API de [restaurante-backend](https://github.com/Marcos-Argel/restaurante-backend).

---

## 📄 Licencia

Proyecto educativo — Sistema de gestión para restaurante.
