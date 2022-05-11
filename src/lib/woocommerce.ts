import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api'

export const wooApi = new WooCommerceRestApi({
  url: process.env.SHOP_BASE_URL ?? '',
  consumerKey: process.env.WOO_CONSUMER_KEY ?? '',
  consumerSecret: process.env.WOO_CONSUMER_SECRET ?? '',
  version: 'wc/v3',
})

export default wooApi
