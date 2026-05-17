/**
 * session.js — Gestión de sesión de usuario
 * ===========================================
 * Fuente única de verdad para el estado del usuario autenticado.
 * Exporta un objeto `state` mutable compartido por todos los módulos,
 * evitando problemas de sincronización con primitivos importados.
 *
 * Dependencias: utils.js
 */

import { switchState } from "./utils.js";

/**
 * Estado global de sesión.
 * Todos los módulos importan este objeto y leen `state.currentUser`.
 * Al ser un objeto (referencia), los cambios son visibles en todos los módulos.
 * @type {{ currentUser: Object|null }}
 */
export const state = {
  currentUser: null,
};

/**
 * Persiste la sesión del usuario en localStorage y actualiza la UI.
 * @param {Object} user - Datos del usuario devueltos por la API.
 */
export function saveSession(user) {
  console.log("Guardando sesión para:", user.user_name);
  state.currentUser = user;
  localStorage.setItem("pokemon_session", JSON.stringify(user));
  window.dispatchEvent(new Event("storage"));
  updateAuthUI();
}

/**
 * Recupera la sesión guardada en localStorage al iniciar la aplicación.
 */
export function loadSession() {
  const saved = localStorage.getItem("pokemon_session");
  console.log("Intentando cargar sesión desde localStorage:", saved ? "Existe" : "No existe");
  if (saved) {
    try {
      state.currentUser = JSON.parse(saved);
      console.log("Sesión cargada exitosamente para:", state.currentUser.user_name);
      updateAuthUI();
    } catch (e) {
      console.error("Error al cargar la sesión:", e);
      localStorage.removeItem("pokemon_session");
    }
  }
}

/**
 * Cierra la sesión del usuario actual.
 */
export function logout() {
  state.currentUser = null;
  localStorage.removeItem("pokemon_session");
  window.dispatchEvent(new Event("storage"));
  updateAuthUI();
  switchState("state-home");
  alert("Has cerrado sesión correctamente.");
}

/**
 * Actualiza los elementos de la navbar y los botones de favoritos
 * según el estado de autenticación actual.
 */
export function updateAuthUI() {
  const trigger = document.getElementById("auth-trigger");
  const text = document.getElementById("auth-text");

  if (state.currentUser) {
    text.textContent = `Bienvenido ${state.currentUser.user_name}`;
    trigger.setAttribute("for", "state-profile");
    trigger.classList.add("logged-in");

    // Rellenar campos del perfil
    const profileUser = document.getElementById("profile-username");
    const profileEmail = document.getElementById("profile-email");
    if (profileUser) profileUser.value = state.currentUser.user_name;
    if (profileEmail) profileEmail.value = state.currentUser.email;
  } else {
    text.textContent = "Iniciar sesión";
    trigger.setAttribute("for", "state-login");
    trigger.classList.remove("logged-in");
  }

  // Actualizar estado de corazones de favoritos
  document.querySelectorAll(".btn-fav").forEach(btn => {
    const cardId = parseInt(btn.dataset.cardId);
    if (state.currentUser && state.currentUser.favorite_ids && state.currentUser.favorite_ids.includes(cardId)) {
      btn.classList.add("is-favorite");
    } else {
      btn.classList.remove("is-favorite");
    }
  });
}
