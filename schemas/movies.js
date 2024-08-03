const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  director: z.string(),
  duration: z.number().int().positive(),
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Musical', 'Romance', 'Sci-Fi']),
    {
      required_error: 'Movie genre is required',
      invalid_type_error: 'Movie genre must be an array of enum genre'
    }
  ),
  poster: z.string().url({
    message: 'Movie poster must be a valid URL'
  }),
  rate: z.number().min(0).max(10).default(0)
})

function validateMovie (object) {
  return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
