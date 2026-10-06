import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { spriteUrl } from '../api/pokeapi'
import { usePokedex } from '../context/pokedexContext'
import type { DetailNavState, PokemonSummary } from '../types/pokemon'
import { formatId, formatName } from '../utils/format'
import styles from './ListPage.module.css'

type SortKey = 'id' | 'name'
type SortOrder = 'asc' | 'desc'

function compare(a: PokemonSummary, b: PokemonSummary, key: SortKey, order: SortOrder): number {
  const dir = order === 'asc' ? 1 : -1
  if (key === 'id') return (a.id - b.id) * dir
  return a.name.localeCompare(b.name) * dir
}

export function ListPage() {
  const { data } = usePokedex()
  const location = useLocation()

  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const results = useMemo(() => {
    if (!data) return []
    const normalized = query.trim().toLowerCase().replace(/\s+/g, '-')
    return data.pokemon
      .filter((p) => p.name.includes(normalized))
      .sort((a, b) => compare(a, b, sortKey, sortOrder))
  }, [data, query, sortKey, sortOrder])

  const navState: DetailNavState = { ids: results.map((p) => p.id), background: location }

  return (
    <section className={styles.page}>
      <h2>Search</h2>

      <div className={styles.controls}>
        <label>
          Search:{' '}
          <input
            type="search"
            placeholder="e.g. pikachu"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>{' '}
        <label>
          Sort by:{' '}
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="id">ID</option>
            <option value="name">Name</option>
          </select>
        </label>{' '}
        <label>
          Order:{' '}
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </div>

      <p>
        {results.length} {results.length === 1 ? 'result' : 'results'}
      </p>

      {results.length === 0 ? (
        <p>No Pokémon match “{query}”.</p>
      ) : (
        <ul className={styles.list}>
          {results.map((p) => (
            <li key={p.id}>
              <Link to={`/pokemon/${p.id}`} state={navState} className={styles.item}>
                <img src={spriteUrl(p.id)} alt="" width={64} height={64} loading="lazy" />
                <span className={styles.name}>
                  {formatId(p.id)} {formatName(p.name)}
                </span>
                <span className={styles.info}>
                  {formatName(p.region)} · {p.types.map(formatName).join(' / ')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
