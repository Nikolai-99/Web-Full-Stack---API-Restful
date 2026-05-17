/**
 * auth.js — Formularios de autenticación y perfil
 * =================================================
 * Gestiona Login, Registro y edición de Perfil de usuario.
 *
 * Dependencias: config.js, utils.js, session.js
 */

import { API_BASE } from "./config.js";
import { setBanner, setButtonLoading, switchState } from "./utils.js";
import { state, saveSession, logout } from "./session.js";


// ══════════════════════════════════════════
// FORMULARIO DE INICIO DE SESIÓN
// ══════════════════════════════════════════

export function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    setBanner("login-error", form.querySelector(".form-actions"), "");

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const submitBtn = form.querySelector("button[type='submit']");

    if (!email || !password) {
      setBanner("login-error", form.querySelector(".form-actions"),
        "Por favor, completa todos los campos.");
      return;
    }

    setButtonLoading(submitBtn, true, "Ingresando…", "Ingresar");

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const user = await response.json();
        form.reset();
        saveSession(user);
        alert(`¡Bienvenido, ${user.user_name}! 👋`);
        switchState("state-home");
        return;
      }

      if (response.status === 401) {
        const err = await response.json().catch(() => ({}));
        setBanner("login-error", form.querySelector(".form-actions"),
          err.detail || "Credenciales incorrectas. Verifica tu email y contraseña.");
        return;
      }

      if (response.status === 422) {
        setBanner("login-error", form.querySelector(".form-actions"),
          "El usuario o correo electrónico ingresado no es válido.");
        return;
      }

      setBanner("login-error", form.querySelector(".form-actions"),
        "Error del servidor. Inténtalo de nuevo más tarde.");

    } catch {
      setBanner("login-error", form.querySelector(".form-actions"),
        "No se pudo conectar con el servidor. ¿Está el backend corriendo en localhost:8000?");
    } finally {
      setButtonLoading(submitBtn, false, "", "Ingresar");
    }
  });
}


// ══════════════════════════════════════════
// FORMULARIO DE REGISTRO
// ══════════════════════════════════════════

export function initRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    setBanner("reg-username-error", document.getElementById("reg-nombre"), "");
    setBanner("reg-email-error", form.querySelector(".form-actions"), "");

    const user_name = document.getElementById("reg-nombre").value.trim();
    const birth_date = document.getElementById("reg-datos").value;
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const submitBtn = form.querySelector("button[type='submit']");

    if (!user_name || !birth_date || !email || !password) {
      setBanner("reg-email-error", form.querySelector(".form-actions"),
        "Por favor, completa todos los campos.");
      return;
    }

    setButtonLoading(submitBtn, true, "Creando cuenta…", "Crear Cuenta");

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name, birth_date, email, password }),
      });

      if (response.status === 201) {
        const user = await response.json();
        form.reset();
        saveSession(user);
        alert(`¡Bienvenido, ${user.user_name}! Tu cuenta ha sido creada satisfactoriamente.`);
        switchState("state-home");
        return;
      }

      if (response.status === 409) {
        const err = await response.json().catch(() => ({}));
        const detail = err.detail || {};

        if (detail.field === "user_name") {
          setBanner("reg-username-error", document.getElementById("reg-nombre"),
            detail.msg || "El nombre de usuario ya está ocupado.");
        } else if (detail.field === "email") {
          setBanner("reg-email-error", form.querySelector(".form-actions"),
            detail.msg || "El email ya se encuentra registrado.");
        } else {
          setBanner("reg-email-error", form.querySelector(".form-actions"),
            detail.msg || "Ya existe una cuenta con estos datos.");
        }
        return;
      }

      if (response.status === 422) {
        setBanner("reg-email-error", form.querySelector(".form-actions"),
          "Hay errores en los datos ingresados. Verifica el formato del correo y la fecha.");
        return;
      }

      setBanner("reg-email-error", form.querySelector(".form-actions"),
        "Error del servidor. Inténtalo de nuevo más tarde.");

    } catch {
      setBanner("reg-email-error", form.querySelector(".form-actions"),
        "No se pudo conectar con el servidor. ¿Está el backend corriendo en localhost:8000?");
    } finally {
      setButtonLoading(submitBtn, false, "", "Crear Cuenta");
    }
  });
}


// ══════════════════════════════════════════
// FORMULARIO DE PERFIL
// ══════════════════════════════════════════

export function initProfileForm() {
  const form = document.getElementById("profile-form");
  if (!form) return;

  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!state.currentUser) return;

    setBanner("profile-msg", form.querySelector(".form-actions"), "");

    const user_name = document.getElementById("profile-username").value.trim();
    const password = document.getElementById("profile-password").value;
    const submitBtn = form.querySelector("button[type='submit']");

    if (!user_name) {
      setBanner("profile-msg", form.querySelector(".form-actions"), "El nombre de usuario no puede estar vacío.");
      return;
    }

    const payload = { user_name };
    if (password) payload.password = password;

    setButtonLoading(submitBtn, true, "Guardando…", "Guardar Cambios");

    try {
      const response = await fetch(`${API_BASE}/api/users/${state.currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        saveSession(updatedUser);
        document.getElementById("profile-password").value = "";
        setBanner("profile-msg", form.querySelector(".form-actions"), "¡Perfil actualizado con éxito! 👋", "success");
        return;
      }

      if (response.status === 409) {
        const err = await response.json().catch(() => ({}));
        const msg = err.detail?.msg || "Ese nombre de usuario ya está en uso. Prueba con otro.";
        setBanner("profile-msg", form.querySelector(".form-actions"), msg, "error");
        return;
      }

      const errorData = await response.json().catch(() => ({}));
      setBanner("profile-msg", form.querySelector(".form-actions"), errorData.detail || "Error al actualizar el perfil.");

    } catch {
      setBanner("profile-msg", form.querySelector(".form-actions"), "No se pudo conectar con el servidor.");
    } finally {
      setButtonLoading(submitBtn, false, "", "Guardar Cambios");
    }
  });
}
