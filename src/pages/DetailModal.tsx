import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { fetchPokemonDetail, getErrorMessage, MAX_POKEMON_ID } from '../api/pokeapi'
import { usePokedex } from '../context/pokedexContext'
import type { DetailNavState, PokemonDetail } from '../types/pokemon'
import { formatId, formatName } from '../utils/format'
import styles from './DetailModal.module.css'

type DetailResult = { id: number; detail?: PokemonDetail; error?: string }

export function DetailModal() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as DetailNavState | null
  const { data } = usePokedex()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const id = Number(params.id)
  const validId = Number.isInteger(id) && id >= 1 && id <= MAX_POKEMON_ID

  const allIds = data?.pokemon.map((p) => p.id) ?? []
  const ids = state?.ids?.includes(id) ? state.ids : allIds
  const index = ids.indexOf(id)
  const prevId = index >= 0 ? ids[(index - 1 + ids.length) % ids.length] : undefined
  const nextId = index >= 0 ? ids[(index + 1) % ids.length] : undefined

  function goTo(targetId: number | undefined) {
    if (targetId === undefined) return
    navigate(`/pokemon/${targetId}`, { replace: true, state: { ...state, ids } })
  }

  function close() {
    if (state?.background) navigate(-1)
    else navigate('/', { replace: true })
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goTo(prevId)
      if (e.key === 'ArrowRight') goTo(nextId)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const [result, setResult] = useState<DetailResult | null>(null)

  useEffect(() => {
    if (!validId) return
    let cancelled = false
    fetchPokemonDetail(id)
      .then((detail) => {
        if (!cancelled) setResult({ id, detail })
      })
      .catch((err: unknown) => {
        if (!cancelled) setResult({ id, error: getErrorMessage(err) })
      })
    return () => {
      cancelled = true
    }
  }, [id, validId])

  const current = result?.id === id ? result : null
  const detail = current?.detail
  const summary = data?.pokemon.find((p) => p.id === id)
  const region = summary?.region

  const primaryType = detail?.types[0] ?? summary?.types[0]
  const dialogClass = [styles.dialog, primaryType && styles[primaryType]].filter(Boolean).join(' ')

  return (
    <dialog
      ref={dialogRef}
      className={dialogClass}
      aria-label={detail ? formatName(detail.name) : 'Pokémon details'}
      onCancel={(e) => {
        e.preventDefault()
        close()
      }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return
        const box = e.currentTarget.getBoundingClientRect()
        const outside =
          e.clientX < box.left ||
          e.clientX > box.right ||
          e.clientY < box.top ||
          e.clientY > box.bottom
        if (outside) close()
      }}
    >
      <button type="button" onClick={close} aria-label="Close" className={styles.close}>
        ✕ Close
      </button>

      {!validId && <p>No Pokémon with ID “{params.id}”.</p>}
      {validId && current?.error && <p>{current.error}</p>}
      {validId && !current && <p>Loading…</p>}

      {detail && (
        <article>
          <h2>
            {formatId(detail.id)} {formatName(detail.name)}
          </h2>
          <img src={detail.image} alt={formatName(detail.name)} width={200} height={200} />

          <dl>
            <div>
              <dt>Types</dt>
              <dd>{detail.types.map(formatName).join(' / ')}</dd>
            </div>
            {region && (
              <div>
                <dt>Region</dt>
                <dd>{formatName(region)}</dd>
              </div>
            )}
            <div>
              <dt>Height</dt>
              <dd>{detail.heightM} m</dd>
            </div>
            <div>
              <dt>Weight</dt>
              <dd>{detail.weightKg} kg</dd>
            </div>
            <div>
              <dt>Base experience</dt>
              <dd>{detail.baseExperience ?? 'Unknown'}</dd>
            </div>
            <div>
              <dt>Abilities</dt>
              <dd>
                {detail.abilities
                  .map((a) => formatName(a.name) + (a.hidden ? ' (hidden)' : ''))
                  .join(', ')}
              </dd>
            </div>
          </dl>

          <h3>Base stats</h3>
          <ul>
            {detail.stats.map((s) => (
              <li key={s.name}>
                {formatName(s.name)}: {s.value}
              </li>
            ))}
          </ul>
        </article>
      )}

      <nav aria-label="Browse Pokémon">
        <button type="button" onClick={() => goTo(prevId)} disabled={prevId === undefined}>
          ← Previous
        </button>{' '}
        {index >= 0 && (
          <span>
            {index + 1} of {ids.length}
          </span>
        )}{' '}
        <button type="button" onClick={() => goTo(nextId)} disabled={nextId === undefined}>
          Next →
        </button>
      </nav>
    </dialog>
  )
}
