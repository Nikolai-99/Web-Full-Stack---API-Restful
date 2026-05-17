/**
 * pokedex.js — Pokédex Regional
 * ===============================
 * Datos estáticos de los 26 Pokémon y lógica del carrusel interactivo.
 * Los datos están en este módulo pendientes de migración a la API.
 *
 * Dependencias: utils.js (ninguna directa — autocontenido)
 */


// ══════════════════════════════════════════
// DATOS POKÉDEX (26 POKÉMON)
// Pendiente de incorporación en bases de datos + API
// ══════════════════════════════════════════

const POKEMON_DATA = [
  { id: 1,  num: "0001", name: "Bulbasaur",   type: "Planta / Veneno",   lore: "Lleva una semilla en el lomo desde que nace, la cual brota y crece con él.",                           img: "assets/poke_dx/800px-0001Bulbasaur.png" },
  { id: 2,  num: "0002", name: "Ivysaur",     type: "Planta / Veneno",   lore: "Cuando la semilla de su lomo recibe nutrientes, brota una flor de gran tamaño.",                      img: "assets/poke_dx/800px-0002Ivysaur.png" },
  { id: 3,  num: "0003", name: "Venusaur",    type: "Planta / Veneno",   lore: "Su flor se vuelve de un color vibrante si recibe suficiente luz solar.",                              img: "assets/poke_dx/375px-0003Venusaur.png" },
  { id: 4,  num: "0004", name: "Charmander",  type: "Fuego",             lore: "La llama que tiene en la punta de la cola indica su salud y su estado de ánimo.",                     img: "assets/poke_dx/800px-0004Charmander.png" },
  { id: 5,  num: "0005", name: "Charmeleon",  type: "Fuego",             lore: "En la emoción del combate, suelta llamas de un color azulado muy potente.",                          img: "assets/poke_dx/800px-0005Charmeleon.png" },
  { id: 6,  num: "0006", name: "Charizard",   type: "Fuego / Volador",   lore: "Escupe fuego tan caliente que puede fundir hasta las rocas más duras.",                              img: "assets/poke_dx/800px-0006Charizard.png" },
  { id: 7,  num: "0007", name: "Squirtle",    type: "Agua",              lore: "Se oculta dentro de su caparazón y contraataca lanzando agua a presión.",                            img: "assets/poke_dx/800px-0007Squirtle.png" },
  { id: 8,  num: "0008", name: "Wartortle",   type: "Agua",              lore: "Se le considera un símbolo de longevidad. Su cola tiene un pelaje muy tupido.",                      img: "assets/poke_dx/800px-0008Wartortle.png" },
  { id: 9,  num: "0009", name: "Blastoise",   type: "Agua",              lore: "Para acabar con su enemigo, lanza chorros de agua por los cañones de su caparazón.",                 img: "assets/poke_dx/800px-0009Blastoise.png" },
  { id: 10, num: "0010", name: "Caterpie",    type: "Bicho",             lore: "Sus antenas liberan un olor fétido para repeler a sus enemigos.",                                    img: "assets/poke_dx/800px-0010Caterpie.png" },
  { id: 11, num: "0011", name: "Metapod",     type: "Bicho",             lore: "Su cuerpo es blando por dentro, pero su caparazón es tan duro como el acero.",                      img: "assets/poke_dx/800px-0011Metapod.png" },
  { id: 12, num: "0012", name: "Butterfree",  type: "Bicho / Volador",   lore: "Puede volar entre flores recogiendo polen gracias a sus grandes alas.",                              img: "assets/poke_dx/0012Butterfree.png" },
  { id: 13, num: "0013", name: "Weedle",      type: "Bicho / Veneno",    lore: "El aguijón de su cabeza es muy tóxico. Come hojas en los bosques.",                                  img: "assets/poke_dx/800px-0013Weedle.png" },
  { id: 14, num: "0014", name: "Kakuna",      type: "Bicho / Veneno",    lore: "Casi no puede moverse, pero su cuerpo es capaz de endurecerse para defenderse.",                    img: "assets/poke_dx/800px-0014Kakuna.png" },
  { id: 15, num: "0015", name: "Beedrill",    type: "Bicho / Veneno",    lore: "Vuela a gran velocidad y ataca con sus tres aguijones venenosos.",                                   img: "assets/poke_dx/800px-0015Beedrill.png" },
  { id: 16, num: "0016", name: "Pidgey",      type: "Normal / Volador",  lore: "Muy dócil. Si es atacado, suele lanzar arena para cegar al rival.",                                  img: "assets/poke_dx/375px-0016Pidgey.png" },
  { id: 17, num: "0017", name: "Pidgeotto",   type: "Normal / Volador",  lore: "Posee unas garras muy potentes. Vuela en círculos buscando presas.",                                 img: "assets/poke_dx/800px-0017Pidgeotto.png" },
  { id: 18, num: "0018", name: "Pidgeot",     type: "Normal / Volador",  lore: "Vuela a una velocidad increíble. Sus plumas son de gran belleza.",                                   img: "assets/poke_dx/800px-0018Pidgeot.png" },
  { id: 19, num: "0019", name: "Rattata",     type: "Normal",            lore: "Sus colmillos crecen sin parar, por lo que siempre está royendo algo.",                              img: "assets/poke_dx/800px-0019Rattata.png" },
  { id: 20, num: "0020", name: "Raticate",    type: "Normal",            lore: "Sus patas traseras son palmeadas, lo que le permite nadar por los ríos.",                            img: "assets/poke_dx/800px-0020Raticate.png" },
  { id: 21, num: "0021", name: "Spearow",     type: "Normal / Volador",  lore: "A diferencia de Pidgey, tiene un carácter muy agresivo y ruidoso.",                                  img: "assets/poke_dx/800px-0021Spearow.png" },
  { id: 22, num: "0022", name: "Fearow",      type: "Normal / Volador",  lore: "Se caracteriza por tener un cuello y un pico muy largos, ideales para cazar.",                      img: "assets/poke_dx/800px-0022Fearow.png" },
  { id: 23, num: "0023", name: "Ekans",       type: "Veneno",            lore: "Se enrosca para descansar. Su lengua detecta el calor de sus presas.",                               img: "assets/poke_dx/800px-0023Ekans.png" },
  { id: 24, num: "0024", name: "Arbok",       type: "Veneno",            lore: "El patrón de su cara puede paralizar de miedo a sus enemigos.",                                      img: "assets/poke_dx/800px-0024Arbok.png" },
  { id: 25, num: "0025", name: "Pikachu",     type: "Eléctrico",         lore: "Almacena electricidad en las mejillas. Si se siente amenazado, la suelta.",                          img: "assets/poke_dx/800px-0025Pikachu.png" },
  { id: 26, num: "0026", name: "Raichu",      type: "Eléctrico",         lore: "Su cola actúa como toma de tierra para liberar el exceso de energía.",                               img: "assets/poke_dx/800px-0026Raichu.png" },
];


// ══════════════════════════════════════════
// RENDERIZADO Y CONTROLES DE LA POKÉDEX
// ══════════════════════════════════════════

/**
 * Renderiza la lista de Pokémon en el carrusel.
 * @param {Array} list - Lista de Pokémon filtrada/ordenada.
 */
function renderPokedex(list) {
  const container = document.getElementById("pokedex-list");
  if (!container) return;

  container.innerHTML = list.map(p => `
    <article class="pokedex-card">
      <div class="pk-img-container">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
      </div>
      <div class="pk-info">
        <span class="pk-number">#${p.num}</span>
        <h3 class="pk-name">${p.name}</h3>
        <span class="pk-type">${p.type}</span>
        <p class="pk-lore">${p.lore}</p>
      </div>
    </article>
  `).join("");
}

/**
 * Inicializa el ordenamiento y la navegación por flechas del carrusel.
 */
export function initPokedex() {
  const sortSelect = document.getElementById("pokedex-sort");
  const carousel = document.getElementById("pokedex-list");
  const prevBtn = document.getElementById("pokedex-prev");
  const nextBtn = document.getElementById("pokedex-next");

  if (!sortSelect || !carousel) return;

  renderPokedex(POKEMON_DATA);

  sortSelect.addEventListener("change", () => {
    const val = sortSelect.value;
    let sorted = [...POKEMON_DATA];

    if (val === "num-asc")    sorted.sort((a, b) => a.id - b.id);
    else if (val === "num-desc")   sorted.sort((a, b) => b.id - a.id);
    else if (val === "alpha-asc")  sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (val === "alpha-desc") sorted.sort((a, b) => b.name.localeCompare(a.name));

    renderPokedex(sorted);
    carousel.scrollLeft = 0;
  });

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => {
      carousel.scrollBy({ left: -350, behavior: "smooth" });
    });
    nextBtn.addEventListener("click", () => {
      carousel.scrollBy({ left: 350, behavior: "smooth" });
    });
  }

  document.getElementById("state-pokedex")?.addEventListener("change", (e) => {
    if (e.target.checked) {
      console.log("Pokédex abierta");
    }
  });
}
