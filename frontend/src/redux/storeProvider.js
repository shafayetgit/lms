'use client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { makeStore } from './store'
import CPageLoader from '@/components/ui/CPageLoader'

// Module-level singleton — safe for Next.js client components
let storeInstance = null
export function getStore() {
  if (!storeInstance) {
    storeInstance = makeStore()
  }
  return storeInstance
}

export default function StoreProvider({ children }) {
  const { store, persistor } = getStore()

  return (
    <Provider store={store}>
      <PersistGate loading={<CPageLoader />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}