const express = require('express')

const router = express.Router()

const { Client } = require('@elastic/elasticsearch')
const elasticClient = new Client({ node: 'http://localhost:9200' })

router.use((req, res, next) => {
  elasticClient.index({
    index: 'logs',
    body: {
      url: req.url,
      method: req.method
    }
  })
    .catch(err => {
      console.log(err)
    })

  next()
})

router.post('/products', (request, response) => {

  elasticClient.index({
    index: 'products',
    body: request.body
  })
    .then(res => {
      return response.status(200).json({
        msg: 'Product indexed'
      })
    })
    .catch(err => {
      console.log('Error: ', err)
      return response.status(500).json({
        msg: 'Error',
        err
      })
    })
})

router.get('/products', (request, response) => {
  let query = {
    index: 'products',
    q: `*${request.query.product ? request.query.product : ''}*`
  }
  
  elasticClient.search(query)
    .then(res => {
      return response.status(200).json({
        product: res.body.hits
      })
    })
    .catch(err => {
      return response.status(500).json({
        msg: 'Error not found',
        err
      })
    })
})

router.get('/products/:id', (request, response) => {
  let query = {
    index: 'products',
    id: request.params.id
  }
  elasticClient.get(query)
    .then(res => {
      if (!res) return response.status(404).json({ product: res })

      return response.status(200).json({
        product: res
      })
    })
    .catch(err => {
      return response.status(500).json({
        msg: 'Error not found',
        err
      })
    })
})

router.put('/products/:id', (request, response) => {
  elasticClient.update({
    index: 'products',
    id: request.params.id,
    body: {
      doc: request.body
    }
  })
    .then(res => {
      return response.status(200).json({
        msg: 'Product updated'
      })
    })
    .catch(err => {
      return response.status(500).json({
        msg: 'error',
        err
      })
    })
})

router.delete('/products/:id', (request, response) => {
  elasticClient.delete({
    index: 'products',
    id: request.params.id
  })
    .then(res => {
      return response.status(200).json({
        msg: 'Product deleted'
      })
    })
    .catch(err => {
      return response.status(500).json({
        msg: 'Error',
        err
      })
    })
})

module.exports = router