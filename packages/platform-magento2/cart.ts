import AbstractCartProxy from '@storefront-api/platform-abstract/cart'
import { multiStoreConfig } from './util'

class CartProxy extends AbstractCartProxy {
  public constructor (config, req) {
    const Magento2Client = require('magento2-rest-client').Magento2Client;
    super(config, req)
    this.api = Magento2Client(multiStoreConfig(config.magento2.api, req));
  }

  public create (customerToken) {
    return this.api.cart.create(customerToken)
  }

  public update (customerToken, cartId, cartItem) {
    return this.api.cart.update(customerToken, cartId, cartItem)
  }

  public delete (customerToken, cartId, cartItem) {
    return this.api.cart.delete(customerToken, cartId, cartItem)
  }

  public pull (customerToken, cartId, params) {
    return this.api.cart.pull(customerToken, cartId, params)
  }

  public totals (customerToken, cartId, params) {
    return this.api.cart.totals(customerToken, cartId, params)
  }

  public getShippingMethods (customerToken, cartId, address) {
    return this.api.cart.shippingMethods(customerToken, cartId, address)
  }

  public getPaymentMethods (customerToken, cartId) {
    return this.api.cart.paymentMethods(customerToken, cartId)
  }

  public setShippingInformation (customerToken, cartId, address) {
    return this.api.cart.shippingInformation(customerToken, cartId, address)
  }

  public collectTotals (customerToken, cartId, shippingMethod) {
    return this.api.cart.collectTotals(customerToken, cartId, shippingMethod)
  }

  public applyCoupon (customerToken, cartId, coupon) {
    return this.api.cart.applyCoupon(customerToken, cartId, coupon)
  }

  public deleteCoupon (customerToken, cartId) {
    return this.api.cart.deleteCoupon(customerToken, cartId)
  }

  public getCoupon (customerToken, cartId) {
    return this.api.cart.getCoupon(customerToken, cartId)
  }
}

export default CartProxy
