import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [verClave, setVerClave] = useState(false);
  const [errores, setErrores] = useState({
    email: "",
    password: "",
    general: "",
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const validar = () => {
    const e = { email: "", password: "", general: "" };
    if (!form.email.trim()) e.email = "El correo es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Ingresa un correo válido";
    if (!form.password.trim()) e.password = "La contraseña es obligatoria";
    else if (form.password.length < 4)
      e.password = "La contraseña es muy corta";
    setErrores(e);
    return !e.email && !e.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setLoading(true);
    setErrores({ email: "", password: "", general: "" });

    try {
      // Aseguramos que los datos van sin espacios que puedan romper las validaciones de Spring (@Email)
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      toast.success("Bienvenido al sistema");
      navigate("/");
    } catch (err) {
      console.error("❌ Error completo del servidor:", err.response?.data); // VITAL para ver el JSON de error

      // Si el backend lanza el error de "Method GET not supported", lo capturamos aquí
      const mensajeServidor = err.response?.data?.message || "";

      const msg =
        err.response?.status === 401
          ? "Correo o contraseña incorrectos"
          : mensajeServidor.includes("GET")
            ? "Error de configuración de red (POST transformado en GET)"
            : "Error al conectar con el servidor";

      setErrores((prev) => ({ ...prev, general: msg }));
    } finally {
      setLoading(false);
    }
  };

  const inp = (field) => ({
    style: {
      width: "100%",
      background: "#1a1a1a",
      border: `1px solid ${errores[field] ? "#ef4444" : "#2a2a2a"}`,
      borderRadius: "10px",
      padding: "12px 14px",
      color: "#f0f0f0",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color .2s",
    },
    onFocus: (e) =>
      (e.target.style.borderColor = errores[field] ? "#ef4444" : "#c00000"),
    onBlur: (e) =>
      (e.target.style.borderColor = errores[field] ? "#ef4444" : "#2a2a2a"),
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #1a0000 0%, transparent 50%), radial-gradient(circle at 75% 75%, #0d0d0d 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="fade-in"
        style={{ width: "100%", maxWidth: "420px", position: "relative" }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ marginBottom: "16px", display: "inline-block" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #c00000, #e00000)",
                borderRadius: "20px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "42px",
                boxShadow: "0 0 30px rgba(200,0,0,0.4)",
                border: "2px solid #ff3333",
              }}
            >
              🐔
            </div>
          </div>
          <h1
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "30px",
              fontWeight: "800",
              color: "#f0f0f0",
              letterSpacing: "-0.5px",
              lineHeight: 1.1,
            }}
          >
            Fast & Healthy
          </h1>
          <p style={{ color: "#777", marginTop: "6px", fontSize: "14px" }}>
            Sistema de Gestión
          </p>
        </div>

        <div
          style={{
            background: "#111",
            border: "1px solid #2a0000",
            borderRadius: "20px",
            padding: "36px",
            boxShadow: "0 0 40px rgba(200,0,0,0.1)",
          }}
        >
          <h2
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "20px",
              fontWeight: "700",
              marginBottom: "24px",
              color: "#f0f0f0",
            }}
          >
            Iniciar Sesión
          </h2>

          {errores.general && (
            <div
              style={{
                background: "#450a0a",
                border: "1px solid #7f1d1d",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "16px" }}>⚠️</span>
              <span
                style={{
                  color: "#fca5a5",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                {errores.general}
              </span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            autoComplete="off"
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#aaa",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  setErrores((p) => ({ ...p, email: "", general: "" }));
                }}
                placeholder="correo@ejemplo.com"
                {...inp("email")}
              />
              {errores.email && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    marginTop: "5px",
                  }}
                >
                  ⚠ {errores.email}
                </div>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#aaa",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={verClave ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    setErrores((p) => ({ ...p, password: "", general: "" }));
                  }}
                  placeholder="••••••••"
                  style={{ ...inp("password").style, paddingRight: "44px" }}
                  onFocus={inp("password").onFocus}
                  onBlur={inp("password").onBlur}
                />
                <button
                  type="button"
                  onClick={() => setVerClave(!verClave)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#666",
                    padding: "4px",
                  }}
                >
                  {verClave ? "🙈" : "👁️"}
                </button>
              </div>
              {errores.password && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    marginTop: "5px",
                  }}
                >
                  ⚠ {errores.password}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "8px",
                background: loading
                  ? "#7a0000"
                  : "linear-gradient(135deg, #c00000, #e00000)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "13px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {loading ? "Ingresando..." : "🔥 Ingresar"}
            </button>
          </form>
        </div>
        <p
          style={{
            textAlign: "center",
            color: "#555",
            fontSize: "12px",
            marginTop: "24px",
          }}
        >
          Fast & Healthy © 2026
        </p>
      </div>
    </div>
  );
}
