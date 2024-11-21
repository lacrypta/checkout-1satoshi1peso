import { Filter, Relay } from 'nostr-tools';

interface GenerateRelayParams {
  relayUrl: string | null;
  filters: Filter[];
  closeOnEose?: boolean;
  onEventCallback: (event: any) => void;
}

async function generateRelay(
  params: GenerateRelayParams
): Promise<Relay | undefined> {
  const { relayUrl, filters, closeOnEose = false, onEventCallback } = params;

  if (!relayUrl) {
    console.error('No relay URL provided');
    return;
  }

  let relay: Relay | undefined;

  const connectRelay = async () => {
    try {
      relay = await Relay.connect(relayUrl);
      console.log('Connected to relay:', relay.url);

      // Subscribe to relay
      relay.subscribe(filters, {
        onevent(event) {
          console.log('Event received:', event);
          onEventCallback(event);
        },
      });

      // On close handler
      relay.onclose = async () => {
        console.log('Relay closed, attempting to reconnect...');
        await connectRelay(); // Attempt to reconnect
      };
    } catch (error) {
      console.error('Error connecting to relay:', error);
      setTimeout(connectRelay, 5000); // Retry after 5 seconds
    }
  };

  await connectRelay(); // Initial connection

  return relay;
}

export { generateRelay };
