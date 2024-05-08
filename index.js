const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')
const express = require('express')

const app = express()

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')

app.use(express.json())

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)

const errorHandler = (error, request, response, next) => {
  if (error.name === 'SequelizeDatabaseError') {
    return response.status(400).send({ error: 'incorrect content' })
  } else if (error.name === 'SequelizeValidationError') {
    const errorMessage = error.message.split(': ')[1]
    return response.status(400).send({ error: errorMessage })
  }

  next(error)
}

app.use(errorHandler)

const start = async () => {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
