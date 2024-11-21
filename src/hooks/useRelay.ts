import { useEffect, useState } from 'react';
import { Filter, NostrEvent, Relay } from 'nostr-tools';

interface UseRelayParams {
  relayUrl: string | null;
  filters: Filter[];
  closeOnEose?: boolean;
}

export function useRelay({
  relayUrl,
  filters,
  closeOnEose = false,
}: UseRelayParams) {
  const [events, setEvents] = useState<NostrEvent[]>([]);
  const [relay, setRelay] = useState<Relay | null>(null);

  const clearEvents = () => {
    setEvents([]); // Clear the events
  };

  useEffect(() => {
    if (!relayUrl || !filters) {
      console.error('Relay URL or filters not provided');
      return;
    }

    let isMounted = true;

    const connectRelay = async () => {
      try {
        const relayInstance = await Relay.connect(relayUrl);
        console.log('Connected to relay:', relayInstance.url);
        setRelay(relayInstance);

        relayInstance.subscribe(filters, {
          onevent(event) {
            if (isMounted) {
              console.log('Event received:', event);
              setEvents((prevEvents) => [...prevEvents, event]);
            }
          },
          oneose() {
            if (closeOnEose) {
              relayInstance.close();
            }
          },
        });

        relayInstance.onclose = async () => {
          console.log('Relay closed');
          if (isMounted) {
            await connectRelay();
          }
        };
      } catch (error) {
        console.error('Error connecting to relay:', error);
      }
    };

    connectRelay();

    return () => {
      isMounted = false;
      relay?.close();
    };
  }, [relayUrl, filters, closeOnEose]);

  return { events, relay, clearEvents };
}
