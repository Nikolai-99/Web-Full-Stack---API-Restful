/**
 * cards.js — Cartas, Sobres 3D y Favoritos
 * ==========================================
 * Gestiona la carga dinámica de cartas desde la API,
 * la interacción 3D de sobres/cartas y el toggle de favoritos.
 *
 * Dependencias: config.js, utils.js, session.js
 */

import { API_BASE } from "./config.js";
import { switchState } from "./utils.js";
import { state, saveSession } from "./session.js";


// ══════════════════════════════════════════
// LÓGICA DE INTERACCIÓN 3D
// ══════════════════════════════════════════

/**
 * Añade la funcionalidad de rotación 3D mediante clic mantenido a un elemento.
 * @param {HTMLElement} element - El sobre o carta a interactuar.
 */
export function attach3DInteraction(element) {
  let isPressed = false;
  const inner = element.querySelector(".pack-inner, .card-inner");
  const holoOverlay = element.querySelector(".holo-gradient-layer");

  if (!inner) return;

  const startInteraction = (e) => {
    if (window.innerWidth < 768) return;

    const slotIdx = element.classList.contains("card-1") ? "1" :
      element.classList.contains("card-2") ? "2" :
        element.classList.contains("card-3") ? "3" : "4";
    const radio = document.getElementById(`card-${slotIdx}-selected`);

    if (radio && radio.checked) {
      if (e) {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
      }
    }

    isPressed = true;
    inner.style.transition = "none";
    element.classList.add("is-pressed");
  };

  const endInteraction = () => {
    if (!isPressed) return;
    isPressed = false;
    inner.style.transition = "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    inner.style.transform = "rotateY(0deg) rotateX(0deg)";

    if (holoOverlay) {
      holoOverlay.style.backgroundPosition = "0% 50%";
    }
    element.classList.remove("is-pressed");
  };

  const handleMove = (x, y) => {
    if (!isPressed || window.innerWidth < 768) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateY = ((x - centerX) / (rect.width / 2)) * 35;
    const rotateX = ((y - centerY) / (rect.height / 2)) * -35;

    inner.style.transform = `scale(1.12) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;

    if (holoOverlay) {
      const bgX = 50 + rotateY * 2.5;
      const bgY = 50 - rotateX * 2.5;
      holoOverlay.style.backgroundPosition = `${bgX}% ${bgY}%`;
    }
  };

  // Eventos PC
  element.addEventListener("mousedown", startInteraction);
  window.addEventListener("mouseup", endInteraction);
  window.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY));

  // Eventos Móvil
  element.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) startInteraction();
  }, { passive: true });
  window.addEventListener("touchend", endInteraction);
  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });
}


// ══════════════════════════════════════════
// CARGA DINÁMICA DE CARTAS (API)
// ══════════════════════════════════════════

/**
 * Carga las cartas desde la API y las inyecta en el DOM con interacción 3D.
 */
export async function loadCards() {
  const container = document.getElementById("cards-container");
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE}/api/cards`);
    if (!response.ok) throw new Error("No se pudieron cargar las cartas.");

    const cards = await response.json();

    const groups = {};
    cards.forEach(c => {
      if (!groups[c.slot_index]) groups[c.slot_index] = [];
      groups[c.slot_index].push(c);
    });

    container.innerHTML = "";

    Object.keys(groups).sort().forEach(slotIdx => {
      const slotCards = groups[slotIdx];
      const li = document.createElement("li");
      li.className = `card-slot slot-${slotIdx}`;

      li.innerHTML = `
        <label for="card-${slotIdx}-selected" class="card-label">
            <figure class="card card-${slotIdx}">
                <div class="card-inner">
                    <div class="card-front" aria-label="Carta de Pokémon"></div>
                    <div class="card-back" aria-hidden="true"></div>
                    <i class="holo-gradient-layer" aria-hidden="true"></i>
                </div>
            </figure>
        </label>
        <article class="card-details">
            ${slotCards.map(c => `
              <div class="info-pack-${c.pack_type.toLowerCase()}">
                  <h2>
                    ${c.name}
                    <button class="btn-fav" data-card-id="${c.id}" aria-label="Añadir a favoritos">
                      <svg class="fav-icon" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                  </h2>
                  <p>${c.description}</p>
              </div>
            `).join("")}
            <label for="card-none" class="close-details-btn">Cerrar Detalle</label>
        </article>
      `;
      container.appendChild(li);

      const cardEl = li.querySelector(".card");
      if (cardEl) attach3DInteraction(cardEl);

      li.querySelectorAll(".btn-fav").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          toggleFavorite(parseInt(btn.dataset.cardId), btn);
        });
      });
    });

    console.log("Cartas cargadas dinámicamente desde la API.");
  } catch (error) {
    console.error("Error al cargar cartas:", error);
    container.innerHTML = `<p class="error-text">Error al conectar con la Pokedex de la API.</p>`;
  }
}


// ══════════════════════════════════════════
// COMUNIDAD
// ══════════════════════════════════════════

/**
 * Carga la lista de usuarios para la sección de Comunidad.
 */
export async function loadCommunity() {
  const container = document.getElementById("community-list-container");
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE}/api/users`);
    if (!response.ok) throw new Error("No se pudo cargar la comunidad.");

    const users = await response.json();

    if (users.length === 0) {
      container.innerHTML = "<p>¡Sé el primer entrenador en unirte!</p>";
      return;
    }

    const table = document.createElement("table");
    table.className = "community-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Entrenador</th>
          <th>ID</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td><strong>${u.user_name}</strong></td>
            <td>#${u.id}</td>
            <td>${u.email}</td>
          </tr>
        `).join("")}
      </tbody>
    `;

    container.innerHTML = "";
    container.appendChild(table);
    console.log("Comunidad cargada desde la API.");
  } catch (error) {
    console.error("Error al cargar comunidad:", error);
    container.innerHTML = "<p>Error al cargar los datos de la comunidad.</p>";
  }
}


// ══════════════════════════════════════════
// FAVORITOS
// ══════════════════════════════════════════

/**
 * Alterna el estado de favorito de una carta en la base de datos.
 * @param {number} cardId - ID de la carta.
 * @param {HTMLElement} btn - Botón de corazón que activó la acción.
 */
export async function toggleFavorite(cardId, btn) {
  if (!state.currentUser) {
    alert("¡Debes iniciar sesión para guardar tus cartas favoritas!");
    switchState("state-home");
    setTimeout(() => switchState("state-login"), 100);
    return;
  }

  btn.classList.toggle("is-favorite");

  try {
    const response = await fetch(`${API_BASE}/api/favorites/${cardId}?user_id=${state.currentUser.id}`, {
      method: "POST",
    });

    if (response.ok) {
      const updatedUser = await response.json();
      saveSession(updatedUser);
      console.log("Favorito actualizado en servidor.");
    } else {
      btn.classList.toggle("is-favorite");
      alert("No se pudo guardar el favorito. Inténtalo de nuevo.");
    }
  } catch (error) {
    console.error("Error al guardar favorito:", error);
    btn.classList.toggle("is-favorite");
  }
}
