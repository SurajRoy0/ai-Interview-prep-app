import { createStore } from 'zustand'
import type { PlanConfig } from '@repo/db'

export type AppStoreState = {
  sidebarOpen: boolean
  planConfig: PlanConfig | null
  totalCredits: number
}

export type AppStoreActions = {
  setSidebarOpen: (open: boolean) => void
  setPlanConfig: (config: PlanConfig) => void
  setTotalCredits: (credits: number) => void
}

export type AppStore = AppStoreState & AppStoreActions

export const defaultInitState: AppStoreState = {
  sidebarOpen: true,
  planConfig: null,
  totalCredits: 0,
}

export const createAppStore = (
  initState: AppStoreState = defaultInitState,
) => {
  return createStore<AppStore>()((set) => ({
    ...initState,
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    setPlanConfig: (planConfig) => set({ planConfig }),
    setTotalCredits: (totalCredits) => set({ totalCredits }),
  }))
}
