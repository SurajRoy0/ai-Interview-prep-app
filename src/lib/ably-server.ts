import * as Ably from 'ably';

let ablyClient: Ably.Rest | null = null;

export function getAblyServerClient() {
  if (!ablyClient) {
    if (!process.env.ABLY_API_KEY) {
      console.warn("ABLY_API_KEY is not set. Realtime features will not work.");
      // We don't throw an error yet, to allow the app to boot without it
      // but creating tokens will fail.
      return null;
    }
    
    ablyClient = new Ably.Rest({
      key: process.env.ABLY_API_KEY,
    });
  }
  return ablyClient;
}

/**
 * Creates a short-lived token for a specific client to subscribe to an interview channel.
 */
export async function createAblyToken(clientId: string) {
  const client = getAblyServerClient();
  if (!client) {
    throw new Error("Ably client not configured");
  }
  
  return client.auth.createTokenRequest({ clientId });
}
