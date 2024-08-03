const express = require('express') // require -> commonJS
const crypto = require('node:crypto')

const movies = require('./movies.json') // importar el json

const { validateMovie, validatePartialMovie } = require('./schemas/movies.js')

const app = express() // Crea un nuevo servidor
app.disable('x-powered-by') // Desactiva la cabecera 'X-Power

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://127.0.0.1:5500',
  'https://movies.com'

]

// Métodos normales GET/HEAD/POST
// Métodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight
// OPTIONS

app.use(express.json()) // Middleware que permite parsear el cuerpo de las peticiones en JSON

app.get('/movies', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin) // Permitir el acceso desde cualquier orig
  }
  const { genre } = req.query // obtener los parámetros de la query string
  if (genre) {
    const filteredMovies = movies.filter(
      // movie => movie.genre.includes(genre) // No aprecia las mayúsculas
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()) // Aprecia las mayúsculas
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => { // path-to-regexp se puede usar
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)

  res.status(404).send('No se encontró el película')
})

// En base de datos
app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  if (result.error) {
    // 422 Unprocesable Entity
    return res.status(422).json({ error: JSON.parse(result.error.message) })
  }
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }
  // Esto no sería REST, porque estamos añadiendo una nueva película al final del array
  // añadiendo al estado de aplicación en memoria

  movies.push(newMovie)
  res.status(201).json(newMovie) // actualizar la caché del cliente
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (result.error) {
    // 422 Unprocesable Entity
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex < 0) return res.status(404).json({ message: 'No se encontró la película' })
  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }
  // En base de datos
  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin) // Permitir el acceso desde cualquier orig
  }
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex < 0) return res.status(404).json({ message: 'No se encontró la película' })
  movies.splice(movieIndex, 1)
  return res.json({ message: 'Película eliminada' })
})

app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin) // Permitir el acceso desde cualquier orig
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS')
  }
  res.sendStatus(200)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
