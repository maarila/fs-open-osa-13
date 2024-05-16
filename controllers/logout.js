const jwt = require('jsonwebtoken')
const router = require('express').Router()
const { SECRET } = require('../util/config')
const Session = require('../models/session')

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
      req.token = authorization.substring(7)
    } catch (error) {
      console.log(error)
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

router.delete('/', tokenExtractor, async (req, res) => {
  const currentSession = await Session.findOne({
    where: {
      session: req.token,
    },
  })

  if (currentSession) {
    currentSession.destroy()
    res.status(204).end()
  } else {
    res.status(403).end()
  }
})

module.exports = router
