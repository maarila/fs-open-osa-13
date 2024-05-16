const router = require('express').Router()
const { Readinglist } = require('../models')
const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')

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

const readinglistFinder = async (req, res, next) => {
  req.readinglist = await Readinglist.findByPk(req.params.id)
  next()
}

router.post('/', async (req, res) => {
  try {
    const { blog_id, user_id } = req.body

    const readinglist = await Readinglist.create({
      blogId: blog_id,
      userId: user_id,
    })
    return res.json(readinglist)
  } catch (error) {
    return res.status(400).json({ error: 'invalid data' })
  }
})

router.put(
  '/:id',
  readinglistFinder,
  tokenExtractor,
  async (req, res, next) => {
    const currentSession = await Session.findOne({
      where: {
        session: req.token,
      },
    })

    if (!currentSession) {
      return res.status(401).json({ error: 'requires login' })
    }

    if (req.readinglist && req.body.read) {
      if (req.readinglist.userId === req.decodedToken.id) {
        req.readinglist.read = req.body.read
        await req.readinglist.save()
        res.json(req.readinglist)
      }
    } else {
      res.status(404).end()
    }
  }
)

module.exports = router
