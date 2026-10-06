import { createContext, useContext } from 'react'
import type { PokedexData } from '../types/pokemon'

export interface PokedexContextValue {
  data: PokedexData | null
  loading: boolean
  error: string | null
  retry: () => void
}

export const PokedexContext = createContext<PokedexContextValue | null>(null)

export function usePokedex(): PokedexContextValue {
  const value = useContext(PokedexContext)
  if (!value) throw new Error('usePokedex must be used inside <PokedexProvider>')
  return value
}
