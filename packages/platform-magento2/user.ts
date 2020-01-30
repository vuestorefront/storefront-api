import AbstractUserProxy from '@storefront-api/platform-abstract/user'
import { multiStoreConfig } from './util'
import Logger from '@storefront-api/lib/logger'

class UserProxy extends AbstractUserProxy {
  public constructor (config, req) {
    const Magento2Client = require('magento2-rest-client').Magento2Client;
    super(config, req)
    this.api = Magento2Client(multiStoreConfig(config.magento2.api, req));
  }

  public register (userData) {
    return this.api.customers.create(userData)
  }

  public login (userData) {
    return this.api.customers.token(userData)
  }

  public me (requestToken) {
    Logger.info(this.api.customers.me(requestToken));

    return this.api.customers.me(requestToken)
  }
  public orderHistory (requestToken, pageSize = 20, currentPage = 1) {
    return this.api.customers.orderHistory(requestToken, pageSize, currentPage)
  }
  public resetPassword (emailData) {
    return this.api.customers.resetPassword(emailData)
  }

  public update (userData) {
    return this.api.customers.update(userData)
  }

  public changePassword (passwordData) {
    return this.api.customers.changePassword(passwordData)
  }

  public resetPasswordUsingResetToken (resetData) {
    return this.api.customers.resetPasswordUsingResetToken(resetData)
  }
}

export default UserProxy
