'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'

import {
  type AppStore,
  createAppStore,
  type AppStoreState,
} from '@/store/app-store'

export type AppStoreApi = ReturnType<typeof createAppStore>

export const AppStoreContext = createContext<AppStoreApi | undefined>(
  undefined,
)

export interface AppStoreProviderProps {
  children: ReactNode
  initialState?: Partial<AppStoreState>
}

export const AppStoreProvider = ({
  children,
  initialState,
}: AppStoreProviderProps) => {
  const storeRef = useRef<AppStoreApi>(null)
  if (!storeRef.current) {
    storeRef.current = createAppStore({
      sidebarOpen: initialState?.sidebarOpen ?? true,
      planConfig: initialState?.planConfig ?? null,
      totalCredits: initialState?.totalCredits ?? 0,
    })
  }

  return (
    <AppStoreContext.Provider value={storeRef.current}>
      {children}
    </AppStoreContext.Provider>
  )
}

export const useAppStore = <T,>(
  selector: (store: AppStore) => T,
): T => {
  const appStoreContext = useContext(AppStoreContext)

  if (!appStoreContext) {
    throw new Error(`useAppStore must be used within AppStoreProvider`)
  }

  return useStore(appStoreContext, selector)
}
