/**
 * pokeassist.js — Asistente de IA PokéAssist
 * ============================================
 * Widget de chat flotante que se comunica con el endpoint
 * POST /api/ai/chat del backend (Google Gemini).
 * La API Key de Gemini NUNCA aparece en este archivo.
 *
 * Dependencias: config.js, utils.js, session.js
 */

import { API_BASE } from "./config.js";
import { escapeHtml } from "./utils.js";
import { state } from "./session.js";


/**
 * Inicializa el widget de chat de PokéAssist.
 * Gestiona: apertura/cierre del panel, envío de mensajes,
 * historial en memoria, límites de interacción y sanitización.
 */
export function initPokeAssist() {
  const fab        = document.getElementById("pokeassist-fab");
  const panel      = document.getElementById("pokeassist-panel");
  const overlay    = document.getElementById("pokeassist-overlay");
  const closeBtn   = document.getElementById("pokeassist-close");
  const form       = document.getElementById("pokeassist-form");
  const input      = document.getElementById("pokeassist-input");
  const sendBtn    = document.getElementById("pokeassist-send");
  const messages   = document.getElementById("pokeassist-messages");
  const typing     = document.getElementById("pokeassist-typing");
  const limitMsg   = document.getElementById("pokeassist-limit-msg");
  const counterTxt = document.getElementById("pokeassist-counter-text");
  const counterFill= document.getElementById("pokeassist-counter-fill");
  const charCounter= document.getElementById("pokeassist-char-counter");

  if (!fab || !panel) return;

  // ─── Botón lateral (móvil/tablet) ─────────
  const sidebarBtn = document.querySelector(".btn-pokeassist-toggle");

  // ─── Estado del chat ───────────────────────
  const MAX_MESSAGES = 20;
  let messageCount = 0;
  let isOpen = false;
  let isSending = false;
  /** @type {Array<{role: string, content: string}>} */
  const history = [];

  // ─── Abrir / Cerrar panel ──────────────────
  function openPanel() {
    isOpen = true;
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    fab.classList.add("is-open");
    fab.setAttribute("aria-expanded", "true");
    sidebarBtn?.setAttribute("aria-expanded", "true");
    if (window.innerWidth <= 480 || (sidebarBtn && window.getComputedStyle(sidebarBtn).display !== "none")) {
      overlay.classList.add("is-visible");
      document.body.style.overflow = "hidden";
    }
    scrollToBottom();
    if (messageCount < MAX_MESSAGES) input?.focus();
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    fab.classList.remove("is-open");
    fab.setAttribute("aria-expanded", "false");
    sidebarBtn?.setAttribute("aria-expanded", "false");
    overlay.classList.remove("is-visible");
    document.body.style.overflow = "";
  }

  fab.addEventListener("click", () => isOpen ? closePanel() : openPanel());
  sidebarBtn?.addEventListener("click", () => isOpen ? closePanel() : openPanel());
  closeBtn?.addEventListener("click", closePanel);
  overlay?.addEventListener("click", closePanel);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) closePanel();
  });

  // ─── Contador de caracteres en el textarea ──
  input?.addEventListener("input", () => {
    const len = input.value.length;
    if (charCounter) {
      charCounter.textContent = `${len}/500`;
      charCounter.classList.toggle("is-near-limit", len >= 450);
    }
    if (sendBtn) {
      sendBtn.disabled = len === 0 || isSending || messageCount >= MAX_MESSAGES;
    }
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  });

  // Enviar con Enter (Shift+Enter para nueva línea)
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn?.disabled) form?.requestSubmit();
    }
  });

  // ─── Actualizar barra de progreso ──────────
  function updateCounter() {
    const remaining = MAX_MESSAGES - messageCount;
    const pct = ((MAX_MESSAGES - messageCount) / MAX_MESSAGES) * 100;

    if (counterTxt) {
      counterTxt.textContent = remaining > 0
        ? `${remaining} mensaje${remaining !== 1 ? "s" : ""} disponible${remaining !== 1 ? "s" : ""}`
        : "Límite alcanzado";
    }
    if (counterFill) {
      counterFill.style.width = `${pct}%`;
      counterFill.classList.toggle("is-low", remaining <= 5);
    }
  }

  // ─── Configuración de marked (una sola vez) ────
  if (window.marked) {
    window.marked.setOptions({ breaks: true });
  }

  // ─── Renderizar burbuja de mensaje ─────────
  function appendBubble(role, text) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble chat-bubble--${role}`;

    const avatar = document.createElement("div");
    avatar.className = "bubble-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = role === "assistant"
      ? "?"
      : (state.currentUser?.user_name?.[0]?.toUpperCase() || "T");

    const content = document.createElement("div");
    content.className = "bubble-content";

    if (role === "assistant" && window.marked && window.DOMPurify) {
      // Respuestas del asistente: Markdown → HTML → sanitizado XSS
      const rawHtml = window.marked.parse(text);
      content.innerHTML = window.DOMPurify.sanitize(rawHtml);
    } else {
      // Mensajes del usuario: texto plano escapado (sin Markdown)
      content.innerHTML = `<p>${escapeHtml(text)}</p>`;
    }

    if (role === "assistant") {
      bubble.appendChild(avatar);
      bubble.appendChild(content);
    } else {
      bubble.appendChild(content);
      bubble.appendChild(avatar);
    }

    messages?.appendChild(bubble);
    scrollToBottom();
    return bubble;
  }


  function scrollToBottom() {
    if (messages) {
      messages.scrollTop = messages.scrollHeight;
    }
  }

  // ─── Envío del formulario ──────────────────
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSending || messageCount >= MAX_MESSAGES) return;

    const userMessage = input.value.trim();
    if (!userMessage) return;

    if (userMessage.length > 500) {
      alert("El mensaje no puede superar los 500 caracteres.");
      return;
    }

    messageCount++;
    updateCounter();

    appendBubble("user", userMessage);

    input.value = "";
    input.style.height = "auto";
    if (charCounter) charCounter.textContent = "0/500";
    if (sendBtn) sendBtn.disabled = true;

    isSending = true;
    if (typing) typing.hidden = false;
    scrollToBottom();

    const recentHistory = history.slice(-10);

    try {
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: recentHistory,
          user_id: state.currentUser?.id || null,
        }),
      });

      if (typing) typing.hidden = true;

      if (response.ok) {
        const data = await response.json();
        const reply = data.reply || "No obtuve respuesta. Intenta de nuevo.";

        history.push({ role: "user", content: userMessage });
        history.push({ role: "assistant", content: reply });

        appendBubble("assistant", reply);
      } else {
        const err = await response.json().catch(() => ({}));
        // err.detail puede ser string (errores de API) o array de objetos (errores 422 de Pydantic)
        let errorMsg = "Ocurrió un error al contactar al asistente.";
        if (err.detail) {
          if (typeof err.detail === "string") {
            errorMsg = err.detail;
          } else if (Array.isArray(err.detail)) {
            // Errores de validación Pydantic: [{loc, msg, type}, ...]
            errorMsg = err.detail.map(e => e.msg || JSON.stringify(e)).join(". ");
          } else {
            errorMsg = JSON.stringify(err.detail);
          }
        }
        appendBubble("assistant", `⚠️ ${errorMsg}`);
      }

    } catch {
      if (typing) typing.hidden = true;
      appendBubble("assistant", "⚠️ No se pudo conectar con el servidor. ¿Está el backend corriendo?");
    } finally {
      isSending = false;

      if (messageCount >= MAX_MESSAGES) {
        if (limitMsg) limitMsg.hidden = false;
        if (form) form.style.display = "none";
      } else {
        if (sendBtn) {
          sendBtn.disabled = input.value.trim().length === 0;
        }
        input?.focus();
      }

      scrollToBottom();
    }
  });

  updateCounter();
}
