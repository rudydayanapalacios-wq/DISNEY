// ============================================================
// CONFIGURACIÓN DE URLS BASE (Constantes obligatorias de la rúbrica)
// ============================================================
const BASE_URL = "https://api.disneyapi.dev"; // URL fija de la API pública de Disney
const BACKEND_URL = "http://localhost:3000"; // URL de nuestro servidor nativo local

let currentPage = 1; // Variable para saber qué página de la API estamos cargando
let isSearching = false; // Bandera para saber si el usuario está viendo resultados de una búsqueda

// ============================================================
// CAPTURA DE ELEMENTOS DEL DOM (Búsqueda por ID)
// ============================================================
const grid = document.getElementById("grid");
const status = document.getElementById("status");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const resetButton = document.getElementById("resetButton");
const loadMoreButton = document.getElementById("loadMoreButton");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");

// Función modular que construye las rutas de la API de Disney
const makeApiUrl = (endpoint) => `${BASE_URL}/${endpoint}`;

// ============================================================
// FUNCIONES DE RENDERIZADO (Creación de HTML desde JS)
// ============================================================

// Esta función toma los datos de un personaje y fabrica una tarjeta HTML
function createCharacterCard(character) {
  const card = document.createElement("div");
  card.className = "card";
  
  // EVENTO DE CLIC EN LA TARJETA: Cuando se toca la tarjeta, se abre el modal con sus detalles
  card.addEventListener("click", () => openDetail(character));

  // Contenedor para que la foto quede cuadrada y bonita
  const imgContainer = document.createElement("div");
  imgContainer.className = "card__image-container";

  const img = document.createElement("img");
  img.className = "card__image";
    
  // Normalizamos la imagen de la API (puede venir como imageUrl o image)
  const finalImg = character.imageUrl || character.image || "https://via.placeholder.com/150?text=No+Image";
  img.src = finalImg;
  img.alt = character.name;
  img.loading = "lazy"; // Hace que la imagen cargue solo cuando entra en pantalla (optimización)

  const name = document.createElement("h3");
  name.className = "card__name";
  name.textContent = character.name; // Agrega el nombre del personaje

  // Metemos la imagen en su contenedor, y luego todo dentro de la tarjeta
  imgContainer.appendChild(img);
  card.appendChild(imgContainer);
  card.appendChild(name);
  
  return card; // Devolvemos la tarjeta lista para meterla al HTML
}

// ============================================================
// PETICIONES FETCH ASÍNCRONAS (Consumo de APIs)
// ============================================================

// Trae los personajes generales organizados por páginas (Usa async/await)
async function fetchCharacters(page) {
  try {
    status.textContent = "Cargando magia desde Disney..."; // Feedback visual al usuario
    
    // Petición HTTP GET a la API pidiendo 24 personajes por página
    const response = await fetch(makeApiUrl(`character?page=${page}&pageSize=24`));
    
    // Validación de errores: si la respuesta no es exitosa (status 200-299), lanza un error
    if (!response.ok) throw new Error("Error al conectar con el Reino de Disney");
    
    // Convierte los datos recibidos a un objeto JavaScript entendible
    const result = await response.json();
    const characters = result.data || [];

    // Si es la página 1, limpiamos el contenido viejo de la pantalla
    if (page === 1) grid.innerHTML = "";
    
    // Recorremos el arreglo de personajes e insertamos cada uno en la cuadrícula
    characters.forEach(char => {
      // Validamos que contenga nombre y un identificador válido
      if (char.name && (char._id || char.id)) {
        grid.appendChild(createCharacterCard(char));
      }
    });

    status.textContent = ""; // Quitamos el mensaje de cargando
    loadMoreButton.style.display = "block"; // Mostramos el botón de cargar más
  } catch (error) {
    status.textContent = `Error: ${error.message}`;
  }
}

// OPCIÓN A: Busca personajes por nombre y pinta las coincidencias en la cuadrícula
async function searchCharacter(name) {
  try {
    isSearching = true;
    grid.innerHTML = ""; // Limpiamos la pantalla para mostrar solo lo buscado
    loadMoreButton.style.display = "none"; // Ocultamos el botón de cargar más páginas
    status.textContent = `Buscando a "${name}"...`;

    // Petición fetch usando filtros de la API de Disney (?name=Nombre)
    const response = await fetch(makeApiUrl(`character?name=${encodeURIComponent(name)}`));
    if (!response.ok) throw new Error("No se pudo completar la búsqueda");

    const result = await response.json();
    const data = result.data;
    
    // La API de Disney a veces devuelve un objeto solo o un arreglo. Lo controlamos aquí:
    const characters = Array.isArray(data) ? data : (data ? [data] : []);

    // Si la lista viene vacía, informamos en pantalla
    if (characters.length === 0) {
      status.textContent = `No se encontró ningún personaje que coincida con "${name}".`;
      return;
    }

    // Pintamos todos los personajes encontrados
    characters.forEach(char => {
      if (char.name && (char._id || char.id)) {
        grid.appendChild(createCharacterCard(char));
      }
    });
    status.textContent = `Resultados encontrados: ${characters.length}`;
  } catch (error) {
    status.textContent = `Error: ${error.message}`;
  }
}

// ============================================================
// MANEJO DE VENTANA MODAL (Detalles intermedios)
// ============================================================
function openDetail(character) {
  // Convertimos los arreglos de películas a un texto separado por comas
  const filmsList = character.films && character.films.length > 0 
    ? character.films.join(", ") 
    : "Ninguna película registrada";

  // Capturamos las atracciones de los parques como nuestro DATO CURIOSO extra
  const attractionsList = character.parkAttractions && character.parkAttractions.length > 0
    ? character.parkAttractions.join(", ")
    : "No tiene atracciones asignadas en los parques todavía";

  const finalImg = character.imageUrl || character.image || "https://via.placeholder.com/150?text=No+Image";
  const finalId = character._id || character.id || "N/A";

  // Inyectamos el HTML dinámico dentro del modalBody
  modalBody.innerHTML = `
    <div class="detail">
      <img class="detail__image" src="${finalImg}" alt="${character.name}" />
      <h2 class="detail__name">${character.name}</h2>
      <p class="detail__meta">ID Oficial Disney: #${finalId}</p>
      
      <div class="detail__section">
        <h4 class="detail__section-title">Películas</h4>
        <p class="detail__text">${filmsList}</p>
      </div>

      <div class="detail__section">
        <h4 class="detail__section-title">✨ Dato Curioso: Atracciones en Parques</h4>
        <p class="detail__text">${attractionsList}</p>
      </div>

      <button id="saveBackendBtn" class="save-button" type="button">Guardar en mi Colección</button>
    </div>
  `;

  // Asignamos el evento de guardar al botón recién creado dentro del modal
  document.getElementById("saveBackendBtn").addEventListener("click", () => {
    saveToBackend(character);
  });

  modal.classList.remove("hidden"); // Le quitamos la clase ocultar para que aparezca en pantalla
}

function closeModal() {
  modal.classList.add("hidden"); // Le ponemos la clase ocultar
}

// ============================================================
// INTEGRACIÓN FRONTEND-BACKEND (Envío de datos mediante POST)
// ============================================================
async function saveToBackend(character) {
  const saveBtn = document.getElementById("saveBackendBtn");
  const originalText = saveBtn.textContent;
  
  // SANITIZACIÓN ABSOLUTA: Forzamos a que las propiedades se llamen exactamente como el Backend las requiere
  const characterPayload = {
    _id: String(character._id || character.id || Math.floor(Math.random() * 100000)), 
    name: character.name || "Personaje Desconocido", 
    imageUrl: character.imageUrl || character.image || "https://via.placeholder.com/150?text=No+Image",
    films: Array.isArray(character.films) ? character.films : [],
    parkAttractions: Array.isArray(character.parkAttractions) ? character.parkAttractions : []
  };

  try {
    saveBtn.disabled = true; // Deshabilitamos el botón para evitar doble clic erróneo
    saveBtn.textContent = "Guardando...";

    // Hacemos la petición POST al backend nativo apuntando a la ruta /disney
    const response = await fetch(`${BACKEND_URL}/disney`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Le avisamos al servidor que enviamos un JSON
      body: JSON.stringify(characterPayload) // Convertimos el objeto de JS a texto string plano
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error en el servidor local");
    }

    saveBtn.textContent = "¡Guardado con éxito!";
    // Cerramos el modal de forma automática después de 1 segundo
    setTimeout(() => closeModal(), 1000);
  } catch (error) {
    alert(`No se pudo guardar: ${error.message}`);
    saveBtn.disabled = false;
    saveBtn.textContent = originalText;
  }
}

// Paginación: avanza a la siguiente página y hace el fetch
function loadPage() {
  currentPage++;
  fetchCharacters(currentPage);
}

// Limpia los filtros y regresa al inicio general
function resetView() {
  isSearching = false;
  currentPage = 1;
  searchInput.value = "";
  fetchCharacters(currentPage);
}

// ============================================================
// REGISTRO Y ESCUCHA DE EVENTOS DEL DOM (Exigencia de Rúbrica)
// ============================================================

// EVENTO 1: submit en el formulario (Captura Enter o clic en "Buscar")
searchForm.addEventListener("submit", (event) => {
  event.preventDefault(); // EVITA que la página se recargue (vital en SPAs)
  const term = searchInput.value.trim();
  if (term) searchCharacter(term);
});

// EVENTO 2: click en el botón reiniciar
resetButton.addEventListener("click", resetView);

// EVENTO 3: click en el botón cargar más
loadMoreButton.addEventListener("click", loadPage);

// Manejo del clic en el fondo gris oscuro o la X para cerrar la ventana flotante
modal.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close")) closeModal();
});

// EVENTO 4: keydown (Si el usuario presiona la tecla Escape, cerramos el modal)
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

// EVENTO 5: DOMContentLoaded (Se ejecuta apenas el HTML se descarga y renderiza por completo)
document.addEventListener("DOMContentLoaded", () => {
  fetchCharacters(currentPage); // Inicializa trayendo los primeros personajes
});



