const router = require('express').Router()
const { User, Blog, Session } = require('../models')
const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')
const { Op } = require('sequelize')

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

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  next()
}

router.get('/', async (req, res) => {
  let where = {}

  if (req.query.search) {
    where = {
      [Op.or]: [
        {
          title: {
            [Op.iLike]: `%${req.query.search}%`,
          },
        },
        {
          author: {
            [Op.iLike]: `%${req.query.search}%`,
          },
        },
      ],
    }
  }

  const blogs = await Blog.findAll({
    include: {
      model: User,
    },
    where,
    order: [['likes', 'DESC']],
  })
  res.json(blogs)
})

router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    const currentSession = await Session.findOne({
      where: {
        session: req.token,
      },
    })

    if (!currentSession) {
      return res.status(401).json({ error: 'requires login' })
    }

    const user = await User.findByPk(req.decodedToken.id)

    const blog = await Blog.create({
      ...req.body,
      userId: user.id,
      date: new Date(),
    })
    return res.json(blog)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', blogFinder, tokenExtractor, async (req, res) => {
  const currentSession = await Session.findOne({
    where: {
      session: req.token,
    },
  })

  if (!currentSession) {
    return res.status(401).json({ error: 'requires login' })
  }

  if (req.blog) {
    if (req.blog.userId === req.decodedToken.id) {
      await req.blog.destroy()
      res.status(204).end()
    } else {
      res.status(403).end()
    }
  }
})

router.put('/:id', blogFinder, async (req, res, next) => {
  try {
    if (req.blog && req.body.likes) {
      req.blog.likes = req.body.likes
      await req.blog.save()
      res.json(req.blog)
    } else {
      res.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

module.exports = router
