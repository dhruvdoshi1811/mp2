import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePokedex } from '../context/pokedexContext'
import type { DetailNavState } from '../types/pokemon'
import { formatName } from '../utils/format'
import styles from './GalleryPage.module.css'

type FilterKey = 'types' | 'regions'

export function GalleryPage() {
  const { data } = usePokedex()
  const location = useLocation()

  const [selected, setSelected] = useState<Record<FilterKey, string[]>>({ types: [], regions: [] })

  function toggle(key: FilterKey, value: string) {
    setSelected((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }))
  }

  function clearFilters() {
    setSelected({ types: [], regions: [] })
  }

  const { types: selectedTypes, regions: selectedRegions } = selected

  const results = useMemo(() => {
    if (!data) return []
    return data.pokemon.filter(
      (p) =>
        (selectedTypes.length === 0 || p.types.some((t) => selectedTypes.includes(t))) &&
        (selectedRegions.length === 0 || selectedRegions.includes(p.region)),
    )
  }, [data, selectedTypes, selectedRegions])

  if (!data) return null

  const navState: DetailNavState = { ids: results.map((p) => p.id), background: location }

  return (
    <section>
      <h2>Gallery</h2>

      <fieldset>
        <legend>Type</legend>
        {data.types.map((type) => (
          <label key={type}>
            <input
              type="checkbox"
              checked={selectedTypes.includes(type)}
              onChange={() => toggle('types', type)}
            />
            {formatName(type)}{' '}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Region</legend>
        {data.regions.map((region) => (
          <label key={region}>
            <input
              type="checkbox"
              checked={selectedRegions.includes(region)}
              onChange={() => toggle('regions', region)}
            />
            {formatName(region)}{' '}
          </label>
        ))}
      </fieldset>

      <p>
        {results.length} Pokémon{' '}
        {(selectedTypes.length > 0 || selectedRegions.length > 0) && (
          <button type="button" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </p>

      {results.length === 0 ? (
        <p>No Pokémon match these filters.</p>
      ) : (
        <ul className={styles.grid}>
          {results.map((p) => (
            <li key={p.id}>
              <Link to={`/pokemon/${p.id}`} state={navState}>
                <img src={p.image} alt={formatName(p.name)} width={150} height={150} loading="lazy" />
                <span>{formatName(p.name)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
