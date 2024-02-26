const z = require("zod");

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be a string",
    required_error: "Movie title is required",
  }),
  year: z.number().int().min(1900).max(2026),
  genre: z.array(
    z.enum([
      "Action",
      "Adventure",
      "Comedy",
      "Drama",
      "Fantasy",
      "Horror",
      "Mystery",
      "Thriller",
      "Western",
      "Sci-Fi",
      "Animation",
      "Documentary",
      "Family",
      "Music",
      "Romance",
      "War",
      "Crime",
      "History",
      "TV Movie",
      "Foreign",
      "Reality",
      "News",
      "Talk",
      "Soap",
      "War & Politics",
      "Sci-Fi & Fantasy",
      "Kids",
      "Action & Adventure",
      "War & Politics",
      "Western",
    ]),
    {
      invalid_type_error: "Genre must be a string",
      required_error: "Genre is required",
    }
  ),
  director: z.string(),
  duration: z.number().int().positive(),
  poster: z.string().url({
    message: "Poster must be a valid URL",
  }),
  rate: z.number().min(0).max(10).default(5),
});

function validateMovie(object) {
  return movieSchema.safeParse(object);
}

function validatePartialMovie(object) {
  return movieSchema.partial().safeParse(object); // Hace que las propiedades del schema las haga opcionales
  // De modo que si no están en el objeto, no se validan. Pero si están, se validan
}

module.exports = {
  validateMovie,
  validatePartialMovie
};
