import AbstractUserProxy from '@storefront-api/platform-abstract/user'
import { multiStoreConfig } from './util'

class UserProxy extends AbstractUserProxy {
  public constructor (config, req) {
    const Magento1Client = require('magento1-vsbridge-client').Magento1Client;
    super(config, req)
    this.api = Magento1Client(multiStoreConfig(config.magento1.api, req));
  }
  public register (userData) {
    return this.api.user.create(userData)
  }
  public login (userData) {
    return this.api.user.login(userData)
  }
  public me (customerToken) {
    return this.api.user.me(customerToken)
  }
  public orderHistory (customerToken, page, pageSize) {
    return this.api.user.orderHistory(customerToken, page, pageSize)
  }
  public creditValue (customerToken) {
    return this.api.user.creditValue(customerToken)
  }
  public refillCredit (customerToken, creditCode) {
    return this.api.user.refillCredit(customerToken, creditCode)
  }
  public resetPassword (emailData) {
    return this.api.user.resetPassword(emailData)
  }
  public update (userData) {
    return this.api.user.update(userData)
  }
  public changePassword (passwordData) {
    return this.api.user.changePassword(passwordData)
  }
  public resetPasswordUsingResetToken (resetData) {
    return this.api.user.resetPasswordUsingResetToken(resetData)
  }
}

export default UserProxy
