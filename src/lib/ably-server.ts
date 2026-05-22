import Ably from 'ably'

// We initialize the REST client, not the Realtime client on the server.
export const ablyServer = new Ably.Rest({
  key: process.env.ABLY_API_KEY || 'placeholder_key',
})
