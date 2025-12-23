import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import Page from './page';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Configure QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Create sessionStorage persister for tab-lifetime persistence
const sessionStoragePersister = createSyncStoragePersister({
  storage: window.sessionStorage,
  key: 'FOUNDRY_CHATBOT_CACHE',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: sessionStoragePersister }}
    >
      <Page />
    </PersistQueryClientProvider>
  </StrictMode>,
)
