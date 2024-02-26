const express = require("express");
const crypto = require("node:crypto");
const movies = require("./movies.json");
const { validateMovie, validatePartialMovie } = require("./schemas/movies");
const cors = require("cors");

const app = express();
app.disable("x-powered-by");

app.use(express.json()); // Para poder acceder al objeto req.body
// app.use(cors()) Pone todo con asterisco (Cualquier dominio puede acceder a mi recurso)
app.unsubscribe(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        "http://localhost:8080",
        "http://localhost:1234",
      ];
      if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        return callback(null, true);
      }
      if (!origin) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

// CORS PRE-FLIGHT: Para métodos como PUT, DELETE, PATCH (complejos)
// Requiere una petición OPTIONS para saber si el servidor acepta la petición

const ACCEPTED_ORIGINS = [
  "http://localhost:8080",
  "https://myapp.com",
  "http://localhost:1234",
];

// Todos los recursos que sean movies se identifican con /movies
// Endpoint: Path donde tenemos un recurso
app.get("/movies", (req, res) => {
  const origin = req.header("origin");
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    // No siemre manda el origin el navegador
    // Cuando la petición es del origin, no manda la petición
    res.header("Access-Control-Allow-Origin", origin);
  }
  const { genre } = req.query;
  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filteredMovies);
  }
  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id === id);

  if (movie) return res.json(movie);
  res.status(404).json({ error: "Movie not found" });
});

app.post("/movies", (req, res) => {
  const result = validateMovie(req.body); // Si lo que envía el cliente no es válido, result.error tendrá un mensaje de error y si es válido, devolverá un objeto con la información del body

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data,
  };
  // Esto no sería REST, porque estamos gaurdando el estado de
  // la aplicación en memoria
  movies.push(newMovie);

  res.status(201).json(newMovie); // actualizar la caché del cliente
});

app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex < 0) return res.status(404).json({ error: "Movie not found" });

  movies.splice(movieIndex, 1);

  return res.status(204).json({ message: "Movie deleted" });
});

app.patch("/movies/:id", (req, res) => {
  const { id } = req.params;
  const result = validatePartialMovie(req.body);

  if (!result.success) {
    res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex < 0) return res.status(404).json({ error: "Movie not found" });

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  };

  return res.json(updateMovie);
});

app.options("/movies/:id", (req, res) => {
  const origin = req.header("origin");
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    // No siemre manda el origin el navegador
    // Cuando la petición es del origin, no manda la petición
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
  }
  res.send();
});

const PORT = process.env.PORT ?? 1234; // Lo primero sirve para asignar el puerto que nos da el hosting

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// POST: Crear un nuevo recurso/elemento en el servidor
// PUT: Actualizar totalmente un elemento existente o crearlo si no existe
// PATCH: Actualizar parcialmente un elemento existente

// ! CORS: Restringe si ese recurso puede ser accedido por un dominio distinto al que está alojado
// Solución: Agregar el header Access-Control-Allow-Origin: * en la respuesta del servidor
