/**
 * admin.js — Panel de Administración
 * ====================================
 * Modal de código de acceso, panel principal con tabla de usuarios
 * y subpanel de actividad individual.
 *
 * Dependencias: config.js, utils.js, session.js
 */

import { API_BASE } from "./config.js";
import { escapeHtml } from "./utils.js";
import { state, saveSession } from "./session.js";


// ──────────────────────────────────────────
// Modal de Código de Administrador
// ──────────────────────────────────────────

/**
 * Abre el modal de ingreso de código de administrador.
 * Solo se muestra si el usuario ha iniciado sesión.
 */
function openAdminModal() {
  if (!state.currentUser) {
    alert("Debes iniciar sesión para acceder al modo administrador.");
    return;
  }

  if (state.currentUser.is_admin) {
    openAdminPanel();
    return;
  }

  const modal = document.getElementById("admin-code-modal");
  const input = document.getElementById("admin-code-input");
  const errorEl = document.getElementById("admin-code-error");

  if (!modal) return;

  if (input) input.value = "";
  if (errorEl) errorEl.textContent = "";

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  setTimeout(() => input?.focus(), 100);
}

function closeAdminModal() {
  const modal = document.getElementById("admin-code-modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

/**
 * Envía el código maestro a la API. Si es correcto, promueve al usuario y abre el panel.
 */
async function confirmAdminCode() {
  const input = document.getElementById("admin-code-input");
  const errorEl = document.getElementById("admin-code-error");
  const confirmBtn = document.getElementById("btn-confirm-admin");
  if (!input || !state.currentUser) return;

  const code = input.value.trim();
  if (!code) {
    if (errorEl) errorEl.textContent = "Por favor, ingresa el código.";
    return;
  }

  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Verificando...";
  }
  if (errorEl) errorEl.textContent = "";

  try {
    const res = await fetch(`${API_BASE}/api/users/${state.currentUser.id}/make_admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret_code: code }),
    });

    if (res.ok) {
      const updatedUser = await res.json();
      saveSession(updatedUser);
      closeAdminModal();
      openAdminPanel();
    } else if (res.status === 403) {
      if (errorEl) errorEl.textContent = "Código incorrecto. Inténtalo de nuevo.";
      if (input) { input.value = ""; input.focus(); }
    } else {
      if (errorEl) errorEl.textContent = "Error del servidor. Inténtalo más tarde.";
    }
  } catch {
    if (errorEl) errorEl.textContent = "No se pudo conectar con el servidor.";
  } finally {
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Confirmar acceso";
    }
  }
}


// ──────────────────────────────────────────
// Panel Principal de Administración
// ──────────────────────────────────────────

function openAdminPanel() {
  const overlay = document.getElementById("admin-overlay");
  if (!overlay) return;
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  loadAdminUsers();
}

function closeAdminPanel() {
  const overlay = document.getElementById("admin-overlay");
  if (!overlay) return;
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  closeActivityPanel();
}

/**
 * Carga la lista completa de usuarios desde la API y rellena la tabla del panel admin.
 */
async function loadAdminUsers() {
  const tbody = document.getElementById("admin-users-tbody");
  const countBadge = document.getElementById("admin-user-count");
  const statusDot = document.getElementById("status-dot");
  const statusLabel = document.getElementById("status-label");

  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" class="admin-loading">Consultando la API...</td></tr>`;
  if (statusDot) { statusDot.className = "status-dot"; }
  if (statusLabel) statusLabel.textContent = "Conectando con la API...";

  try {
    const res = await fetch(`${API_BASE}/api/users`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const users = await res.json();

    if (statusDot) statusDot.className = "status-dot online";
    if (statusLabel) statusLabel.textContent = `Conexión exitosa — ${users.length} usuarios obtenidos`;
    if (countBadge) countBadge.textContent = `${users.length} usuarios`;

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="admin-loading">No hay usuarios registrados aún.</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td style="color:#a78bfa;font-weight:700;">#${u.id}</td>
        <td><strong>${escapeHtml(u.user_name)}</strong></td>
        <td style="font-family:'Courier New',monospace;font-size:0.82rem;">${escapeHtml(u.email)}</td>
        <td>
          <span class="role-badge ${u.is_admin ? 'admin' : 'user'}">
            ${u.is_admin ? '&#9650; Admin' : 'Usuario'}
          </span>
        </td>
        <td>
          <button
            class="btn-view-activity"
            data-user-id="${u.id}"
            data-user-name="${escapeHtml(u.user_name)}"
            data-favorites='${JSON.stringify(u.favorite_pokemons || [])}'
            data-victories="${u.victories || 0}"
            aria-label="Ver actividad de ${escapeHtml(u.user_name)}"
          >
            &#128202; Ver actividad
          </button>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll(".btn-view-activity").forEach(btn => {
      btn.addEventListener("click", () => {
        showActivityPanel(
          btn.dataset.userName,
          JSON.parse(btn.dataset.favorites),
          parseInt(btn.dataset.victories, 10)
        );
      });
    });

  } catch (err) {
    console.error("Error al cargar usuarios admin:", err);
    if (statusDot) statusDot.className = "status-dot offline";
    if (statusLabel) statusLabel.textContent = `Error de conexión: ${err.message}`;
    if (countBadge) countBadge.textContent = "Error";
    tbody.innerHTML = `<tr><td colspan="5" class="admin-loading" style="color:#f87171;">No se pudo conectar con la API. ¿Está el servidor corriendo?</td></tr>`;
  }
}


// ──────────────────────────────────────────
// Panel de Actividad Individual
// ──────────────────────────────────────────

function showActivityPanel(userName, favorites, victories) {
  const panel = document.getElementById("admin-activity-panel");
  const nameEl = document.getElementById("admin-activity-username");
  const favContainer = document.getElementById("activity-favorites");
  const victoriesEl = document.getElementById("victories-count");

  if (!panel) return;

  if (nameEl) nameEl.textContent = userName;

  if (favContainer) {
    if (favorites.length === 0) {
      favContainer.innerHTML = `<p class="admin-empty">Sin cartas favoritas registradas.</p>`;
    } else {
      favContainer.innerHTML = favorites
        .map(name => `<span class="pokemon-tag">&#10084; ${escapeHtml(name)}</span>`)
        .join("");
    }
  }

  if (victoriesEl) victoriesEl.textContent = victories;

  panel.style.display = "block";
  setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}

function closeActivityPanel() {
  const panel = document.getElementById("admin-activity-panel");
  if (panel) panel.style.display = "none";
}


// ──────────────────────────────────────────
// Registro de Eventos del Panel Admin
// ──────────────────────────────────────────

export function initAdminPanel() {
  const btnAdminMode = document.getElementById("btn-admin-mode");
  if (btnAdminMode) btnAdminMode.addEventListener("click", openAdminModal);

  const btnCloseModal = document.getElementById("btn-close-admin-modal");
  if (btnCloseModal) btnCloseModal.addEventListener("click", closeAdminModal);

  const btnConfirm = document.getElementById("btn-confirm-admin");
  if (btnConfirm) btnConfirm.addEventListener("click", confirmAdminCode);

  const codeInput = document.getElementById("admin-code-input");
  if (codeInput) {
    codeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") confirmAdminCode();
      if (e.key === "Escape") closeAdminModal();
    });
  }

  const modal = document.getElementById("admin-code-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeAdminModal();
    });
  }

  const btnCloseAdmin = document.getElementById("btn-close-admin");
  if (btnCloseAdmin) btnCloseAdmin.addEventListener("click", closeAdminPanel);

  const btnCloseActivity = document.getElementById("btn-close-activity");
  if (btnCloseActivity) btnCloseActivity.addEventListener("click", closeActivityPanel);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const overlay = document.getElementById("admin-overlay");
      if (overlay?.classList.contains("is-open")) closeAdminPanel();
    }
  });
}
