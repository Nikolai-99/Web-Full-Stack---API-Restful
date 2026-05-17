/**
 * utils.js — Utilidades de UI compartidas
 * =========================================
 * Funciones puras de presentación reutilizables por todos los módulos.
 * No tiene dependencias propias del proyecto.
 */

/**
 * Cambia el estado visual de la SPA activando un radio button.
 * @param {string} stateId - ID del radio button a activar.
 */
export function switchState(stateId) {
  const radio = document.getElementById(stateId);
  if (radio) {
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

/**
 * Crea o actualiza un banner de mensaje debajo de un elemento de referencia.
 * @param {string}      bannerId   - ID único del banner.
 * @param {HTMLElement} anchor     - Elemento al que se inserta el banner después.
 * @param {string}      msg        - Mensaje a mostrar. Vacío = ocultar.
 * @param {"error"|"success"} type - Tipo visual del banner.
 */
export function setBanner(bannerId, anchor, msg, type = "error") {
  let banner = document.getElementById(bannerId);

  if (!banner) {
    banner = document.createElement("p");
    banner.id = bannerId;
    banner.setAttribute("role", "alert");
    banner.setAttribute("aria-live", "assertive");
    anchor.insertAdjacentElement("afterend", banner);
  }

  const styles = {
    error: {
      color: "#ff4d4d",
      bg: "rgba(255,77,77,0.1)",
      border: "rgba(255,77,77,0.4)",
    },
    success: {
      color: "rgba(57,255,20,1)",
      bg: "rgba(57,255,20,0.08)",
      border: "rgba(57,255,20,0.4)",
    },
  };
  const s = styles[type] || styles.error;

  banner.style.cssText = [
    `color: ${s.color}`,
    "font-size: 0.82rem",
    "font-weight: 600",
    "text-align: center",
    "padding: 0.45rem 0.75rem",
    "border-radius: 5px",
    `background: ${s.bg}`,
    `border: 1px solid ${s.border}`,
    "margin-top: 0.4rem",
    `display: ${msg ? "block" : "none"}`,
  ].join(";");

  banner.textContent = msg;
}

/**
 * Bloquea o desbloquea un botón durante una petición asíncrona.
 * @param {HTMLButtonElement} btn
 * @param {boolean}           loading
 * @param {string}            loadingText
 * @param {string}            defaultText
 */
export function setButtonLoading(btn, loading, loadingText, defaultText) {
  btn.disabled = loading;
  btn.textContent = loading ? loadingText : defaultText;
}

/**
 * Escapa caracteres HTML para prevenir XSS.
 * Usada en cualquier módulo que inyecte texto dinámico en el DOM.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
