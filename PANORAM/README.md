Panoram: Sistema de Recomendación de Películas
Panoram es una aplicación web Full-Stack (MERN) que funciona como una plataforma social de recomendación de películas. Los usuarios pueden registrarse, calificar películas, gestionar amigos y recibir recomendaciones personalizadas basadas en 5 algoritmos diferentes.

🚀 Características Principales
Autenticación de Usuarios: Registro y Login seguros con JSON Web Tokens (JWT).

Gestión Social: Buscar, agregar y eliminar amigos.

Interacciones: Calificar películas (1-10 estrellas), marcar como vistas y favoritas.

Perfil de Usuario: Pestañas para "Mis Listas" (Vistas/Favoritas) y "Amigos".

Búsqueda Dual: Búsqueda en tiempo real de películas (en Navbar) y usuarios (en Perfil).

5 Algoritmos de Recomendación:

Por Amigos: Películas que tus amigos amaron (y tú no has visto).

Por Género: Películas de tus géneros más calificados.

Por Director: Películas de los directores de tus películas favoritas.

Por Actor: Películas con los actores de tus películas favoritas.

Espacio Común (Demográfico): Películas populares en tu mismo rango de edad y género.

🛠️ Stack Tecnológico
Frontend: React, React Router, Axios, CSS Puro.

Backend: Node.js, Express, MongoDB (Driver Nativo), JSON Web Tokens (JWT), bcrypt.js.

API Externa: The Movie Database (TMDB) para poblar la base de datos de películas.

📦 Instalación y Puesta en Marcha
El proyecto está dividido en dos carpetas: panoram-api (el backend) y panoram-front (el frontend).

Prerrequisitos
Node.js (v18 o superior)

Una cuenta de MongoDB Atlas (para la URI de conexión)

Una clave de API de The Movie Database (TMDB)

1. Backend (panoram-api)
Navega a la carpeta del backend:

Bash

cd panoram-api
Instala las dependencias:

Bash

npm install
Crea un archivo .env en la raíz de panoram-api y añade tus claves:

Fragmento de código

# Tu cadena de conexión de MongoDB Atlas
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>...

# Una clave secreta larga para firmar los tokens JWT
JWT_SECRET=tu_clave_secreta_aqui

# Tu clave de API de TMDB (necesaria para los scripts)
TMDB_API_KEY=tu_clave_de_tmdb_aqui
Inicia el servidor de backend:

Bash

npm run dev
El servidor estará corriendo en http://localhost:5001.

2. Frontend (panoram-front)
Abre otra terminal y navega a la carpeta del frontend:

Bash

cd panoram-front
Instala las dependencias:

Bash

npm install
Inicia el servidor de desarrollo de Vite:

Bash

npm run dev
La aplicación estará disponible en http://localhost:5173.

3. Poblar la Base de Datos (¡Paso Crítico!)
La aplicación no funcionará sin películas en la base de datos. Debes correr los scripts de la carpeta panoram-api.

Paso A: Poblar Películas: (Ejecuta tu script poblarDB.js)

Bash

# En la terminal del backend
node poblarDB.js
Paso B: Enriquecer Películas: (Ejecuta el script enrichMovies.js para añadir actores/directores)

Bash

# En la terminal del backend
node enrichMovies.js
📖 API Endpoints (Resumen)
El backend expone la siguiente API REST:

Autenticación y Usuarios (/api/users)
POST /register: Crea un nuevo usuario (requiere username, email, password, gender, birthdate).

POST /login: Autentica un usuario y devuelve un token JWT.

GET /myprofile: (Requiere Token) Obtiene el perfil y la lista de amigos del usuario logeado.

GET /search?q=<termino>: (Requiere Token) Busca usuarios por username.

POST /addfriend: (Requiere Token) Añade un amigo por ID.

POST /removefriend: (Requiere Token) Elimina un amigo por ID.

Películas e Interacciones (/api/movies y /api/interact)
GET /api/movies/popular: Devuelve las 20 películas más populares.

GET /api/movies/search?query=<termino>: Busca películas por título.

GET /api/movies/:id: Devuelve los detalles de una sola película (incl. director y actores).

POST /api/interact: (Requiere Token) Crea o actualiza una interacción (rating, hasWatched, isFavorite).

GET /api/interact/:movieId: (Requiere Token) Obtiene la interacción de un usuario con una película.

GET /api/interact/lists/favorites: (Requiere Token) Devuelve la lista de películas favoritas del usuario.

GET /api/interact/lists/watched: (Requiere Token) Devuelve la lista de películas vistas del usuario.

Recomendaciones (/api/recommend)
Todas requieren token.

GET /friends: Recomendaciones basadas en amigos.

GET /genre: Recomendaciones basadas en el género favorito del usuario.

GET /demographic: Recomendaciones basadas en el grupo de edad y género del usuario.

GET /director: Recomendaciones basadas en los directores favoritos del usuario.

GET /actor: Recomendaciones basadas en los actores favoritos del usuario.