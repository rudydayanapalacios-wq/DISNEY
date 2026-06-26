# Disney Wiki — Proyecto educativo de JavaScript

Aplicación de práctica para estudiantes de programación en JavaScript. Consiste en una **Disney Wiki** que consume la API gratuita [Disney API](https://api.disneyapi.dev) desde un frontend hecho con HTML, CSS y JavaScript puro (sin frameworks), y un **backend propio en Node.js** (sin Express ni librerías externas) que guarda en memoria los personajes que el usuario selecciona.

## Descripción

El proyecto está dividido en dos partes:

- **Frontend:** muestra los personajes de Disney en tarjetas, permite buscarlos por nombre, ver su detalle (películas asociadas e ID oficial) junto con un dato curioso extra (atracciones en parques) en una ventana modal, y enviar el personaje elegido al backend con un botón "Guardar".
- **Backend:** un servidor en Node.js que recibe el personaje seleccionado, lo guarda en un objeto en memoria y muestra un mensaje **en la terminal** (no devuelve una respuesta visible en el navegador).

## Conceptos que se aprenden

### Frontend
- **Eventos del DOM** — `addEventListener` con `click`, `submit`, `keydown` y `DOMContentLoaded`.
- **fetch** — peticiones HTTP a una API.
- **Funciones asíncronas** — uso de `async` / `await`.
- **Manejo de la URL base** de APIs gratuitas con constantes y una función que arma las rutas.
- **Promesas** — `.json()`, `Promise.all()` y `try / catch / finally`.

### Backend
- **Programación Orientada a Objetos (POO)** — clases, constructor, atributos, métodos y *getters*.
- **Manejo y almacenamiento de datos** usando únicamente Node.js y funciones de JavaScript (objeto en memoria, `Object.values`, `Object.keys`).

## Estructura del proyecto

```
Entrega_Producto/
├── README.md
├── frontend/
│   ├── index.html        # Estructura de la página (Grilla y modal)
│   ├── styles.css        # Estilos visuales
│   └── app.js            # Lógica: fetch, eventos, promesas y guardado
└── backend/
├── server.js         # Servidor HTTP (clase DisneyServer)
├── models/
│   └── DisneyCharacter.js # Clase DisneyCharacter (POO)
└── store/
└── DisneyStore.js     # Almacén de datos en memoria
```

## Requisitos previos

- [Node.js](https://nodejs.org/) instalado (versión 18 o superior).
- Un navegador web moderno (Chrome, Firefox, Edge, etc.).
- Conexión a internet (para consultar la Disney API).

> No es necesario instalar dependencias: el proyecto no usa `npm install` ni librerías externas.

## Instalación y ejecución

El proyecto necesita **dos procesos corriendo al mismo tiempo**: el backend y el frontend. Abre **dos terminales** (o dos pestañas de terminal).


### 1. Iniciar el backend

En la primera terminal:

```bash
cd backend
node server.js
```

Si todo está bien, verás:

```
Servidor de Disney activo de forma nativa en: http://localhost:3000
```

Deja esta terminal abierta. Aquí aparecerán los mensajes cada vez que se guarde un personaje.

### 2. Iniciar el frontend

El frontend debe servirse desde un servidor local (no se recomienda abrir el index.html con doble clic). En la segunda terminal:

```bash
cd frontend
python3 -m http.server 5500
```

Luego abre en el navegador:

```
http://localhost:5500
```

> Si no tienes Python, puedes usar cualquier servidor estático, por ejemplo:
> `npx serve` o la extensión **Live Server** de VS Code.

## Cómo usar la aplicación

1. Al abrir la página se cargan los primeros Personajes. Usa **"Cargar más"** para ver más.
2. Escribe un nombre o número en el buscador y presiona **"Buscar"**.
3. Haz clic en cualquier tarjeta para abrir su **detalle**.
4. Dentro del detalle, presiona **"Guardar en mi Colección"**.
5. Observa la **terminal del backend**: ahí aparecerá el mensaje de que el personaje fue guardado, junto con la lista actual.


Mensaje en la terminal del backend:

```
--------------------------------------------------------------------
[GUARDADO] Achilles | Películas: [Hercules (film)] | Atracciones: [Ninguna]
Personajes en memoria: 1
Lista actual: Achilles
--------------------------------------------------------------------
```

## Endpoints del backend

| Método | Ruta        | Descripción                                  |
|--------|-------------|----------------------------------------------|
| `POST` | `/disney`  | Guarda en memoria el personaje enviado.        |
| `GET`  | `/disney`  | Devuelve la lista de personajes guardados.      |

>Los datos se guardan **solo en memoria**: al reiniciar el servidor, la lista se vacía (no hay base de datos).

## Solución de problemas

**El backend muestra `El puerto 3000 está ocupado por otro proceso de Node.js`.**
Significa que ya hay otro servidor corriendo en ese puerto. Busca el proceso y ciérralo:


En Windows (PowerShell):
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force


En Linux / macOS:
kill -9 $(lsof -t -i:3000)



Luego vuelve a ejecutar node server.js.
El botón "Guardar" no hace nada.
Verifica que el backend esté corriendo en http://localhost:3000 o mapea correctamente la IP en tu app.js de acuerdo al servidor local utilizado.



```bash
lsof -nP -tiTCP:3000 -sTCP:LISTEN   # muestra el PID
kill <PID>                           # cierra el proceso
```

Luego vuelve a ejecutar `node server.js`.

**El botón "Guardar" no hace nada.**
Verifica que el backend esté corriendo en `http://localhost:3000` (primera terminal).
