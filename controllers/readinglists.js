const router = require('express').Router()
const { Readinglist } = require('../models')
const sequelize = require('sequelize')

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

module.exports = router
