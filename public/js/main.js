/**
 * main.js — Punto de entrada de la aplicación
 * =============================================
 * Orquesta la inicialización de todos los módulos.
 * Este archivo reemplaza el rol de init() en app.js.
 *
 * Importa y coordina: session, auth, cards, pokedex, admin, pokeassist.
 */

import { loadSession } from "./session.js";
import { initLoginForm, initRegisterForm, initProfileForm } from "./auth.js";
import { loadCards, loadCommunity, attach3DInteraction } from "./cards.js";
import { initPokedex } from "./pokedex.js";
import { initAdminPanel } from "./admin.js";
import { initPokeAssist } from "./pokeassist.js";

/**
 * Punto de entrada principal. Se ejecuta cuando el DOM está listo.
 */
function init() {
  console.log("Iniciando aplicación Pokémon TCG (módulos ES6)...");

  // Restaurar sesión guardada antes de cualquier render
  loadSession();

  // Inicializar formularios de autenticación
  initLoginForm();
  initRegisterForm();
  initProfileForm();

  // Cargar datos dinámicos desde la API
  loadCards();
  loadCommunity();

  // Inicializar secciones de la SPA
  initPokedex();
  initAdminPanel();
  initPokeAssist();

  // Adjuntar interacción 3D a los sobres del HTML estático
  document.querySelectorAll(".pack").forEach(pack => {
    attach3DInteraction(pack);
  });
}

// Los módulos ES6 tienen defer implícito.
// Esta guarda cubre el caso en que el script se inyecte dinámicamente.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
