import { apiStatus } from '@storefront-api/lib/util'
import { Router } from 'express'
import Logger from '@storefront-api/lib/logger'
const request = require('request')
const md5 = require('md5')

module.exports = ({ config, db }) => {
  let mcApi = Router();

  /**
   * Retrieve user subscription status
   */
  mcApi.get('/subscribe', (req, res) => {
    const email = req.query.email
    if (!email) {
      apiStatus(res, 'Invalid e-mail provided!', 400)
      return
    }
    return request({
      url: config.extensions.mailchimp.apiUrl + '/lists/' + config.extensions.mailchimp.listId + '/members/' + md5((email as string).toLowerCase()),
      method: 'GET',
      json: true,
      headers: { 'Authorization': 'apikey ' + config.extensions.mailchimp.apiKey }
    }, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        Logger.error(error, body)
        apiStatus(res, 'An error occured while accessing Mailchimp', 500)
      } else {
        apiStatus(res, body.status, 200)
      }
    })
  })

  /**
   * POST subscribe a user
   */
  mcApi.post('/subscribe', (req, res) => {
    let userData = req.body
    if (!userData.email) {
      apiStatus(res, 'Invalid e-mail provided!', 400)
      return
    }
    request({
      url: config.extensions.mailchimp.apiUrl + '/lists/' + config.extensions.mailchimp.listId,
      method: 'POST',
      headers: { 'Authorization': 'apikey ' + config.extensions.mailchimp.apiKey },
      json: true,
      body: { members: [ { email_address: userData.email, status: config.extensions.mailchimp.userStatus } ], 'update_existing': true }
    }, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        Logger.error(error, body)
        apiStatus(res, 'An error occured while accessing Mailchimp', 500)
      } else {
        apiStatus(res, body.status, 200)
      }
    })
  })

  /**
   * DELETE unsubscribe a user
   */
  mcApi.delete('/subscribe', (req, res) => {
    let userData = req.body
    if (!userData.email) {
      apiStatus(res, 'Invalid e-mail provided!', 400)
      return
    }

    let request = require('request');
    request({
      url: config.extensions.mailchimp.apiUrl + '/lists/' + config.extensions.mailchimp.listId,
      method: 'POST',
      headers: { 'Authorization': 'apikey ' + config.extensions.mailchimp.apiKey },
      json: true,
      body: { members: [ { email_address: userData.email, status: 'unsubscribed' } ], 'update_existing': true }
    }, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        Logger.error(error, body)
        apiStatus(res, 'An error occured while accessing Mailchimp', 500)
      } else {
        apiStatus(res, body.status, 200)
      }
    })
  })

  return mcApi
}
