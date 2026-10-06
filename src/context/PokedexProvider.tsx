import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchPokedex, getErrorMessage } from '../api/pokeapi'
import type { PokedexData } from '../types/pokemon'
import { PokedexContext } from './pokedexContext'

export function PokedexProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PokedexData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    fetchPokedex()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err))
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = useCallback(() => {
    setError(null)
    setAttempt((n) => n + 1)
  }, [])

  const value = useMemo(
    () => ({ data, loading: !data && !error, error, retry }),
    [data, error, retry],
  )

  return <PokedexContext.Provider value={value}>{children}</PokedexContext.Provider>
}
