import axios from 'axios'
import type {
  GenerationResponse,
  NamedAPIResourceList,
  PokedexData,
  PokemonDetail,
  PokemonResponse,
  PokemonSummary,
  TypeResponse,
} from '../types/pokemon'

export const MAX_POKEMON_ID = 1025
const GENERATION_COUNT = 9

const CACHE_KEY = 'pokedex-cache-v1'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

const api = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 15000,
})

export function idFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean)
  return Number(parts[parts.length - 1])
}

const SPRITES_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'

export function artworkUrl(id: number): string {
  return `${SPRITES_BASE}/other/official-artwork/${id}.png`
}

export function spriteUrl(id: number): string {
  return `${SPRITES_BASE}/${id}.png`
}

function readCache(): PokedexData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { savedAt, data } = JSON.parse(raw) as { savedAt: number; data: PokedexData }
    if (Date.now() - savedAt > CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function writeCache(data: PokedexData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }))
  } catch {
  }
}

export async function fetchPokedex(): Promise<PokedexData> {
  const cached = readCache()
  if (cached) return cached

  const generationIds = Array.from({ length: GENERATION_COUNT }, (_, i) => i + 1)

  const [listRes, generationResponses, typeListRes] = await Promise.all([
    api.get<NamedAPIResourceList>('/pokemon', { params: { limit: MAX_POKEMON_ID } }),
    Promise.all(generationIds.map((g) => api.get<GenerationResponse>(`/generation/${g}`))),
    api.get<NamedAPIResourceList>('/type', { params: { limit: 100 } }),
  ])

  const typeResponses = await Promise.all(
    typeListRes.data.results.map((t) => api.get<TypeResponse>(`/type/${t.name}`)),
  )

  const regionById = new Map<number, { region: string; generation: number }>()
  const regions: string[] = []
  for (const { data: gen } of generationResponses.sort((a, b) => a.data.id - b.data.id)) {
    regions.push(gen.main_region.name)
    for (const species of gen.pokemon_species) {
      regionById.set(idFromUrl(species.url), {
        region: gen.main_region.name,
        generation: gen.id,
      })
    }
  }

  const typesById = new Map<number, { slot: number; name: string }[]>()
  const types: string[] = []
  for (const { data: type } of typeResponses) {
    let hasAny = false
    for (const entry of type.pokemon) {
      const id = idFromUrl(entry.pokemon.url)
      if (id > MAX_POKEMON_ID) continue
      hasAny = true
      const list = typesById.get(id) ?? []
      list.push({ slot: entry.slot, name: type.name })
      typesById.set(id, list)
    }
    if (hasAny) types.push(type.name)
  }

  const pokemon: PokemonSummary[] = listRes.data.results
    .map((p) => {
      const id = idFromUrl(p.url)
      const regionInfo = regionById.get(id)
      return {
        id,
        name: p.name,
        region: regionInfo?.region ?? 'unknown',
        generation: regionInfo?.generation ?? 0,
        types: (typesById.get(id) ?? []).sort((a, b) => a.slot - b.slot).map((t) => t.name),
        image: artworkUrl(id),
      }
    })
    .filter((p) => p.id <= MAX_POKEMON_ID)

  const data: PokedexData = { pokemon, regions, types }
  writeCache(data)
  return data
}

const detailCache = new Map<number, PokemonDetail>()

export async function fetchPokemonDetail(id: number): Promise<PokemonDetail> {
  const cached = detailCache.get(id)
  if (cached) return cached

  const { data } = await api.get<PokemonResponse>(`/pokemon/${id}`)
  const detail: PokemonDetail = {
    id: data.id,
    name: data.name,
    heightM: data.height / 10,
    weightKg: data.weight / 10,
    baseExperience: data.base_experience,
    types: [...data.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    abilities: data.abilities.map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
    stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    image: artworkUrl(data.id),
  }
  detailCache.set(id, detail)
  return detail
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 404) return 'Pokémon not found.'
    if (err.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
    if (!err.response) return 'Could not reach PokeAPI. Check your connection.'
    return `PokeAPI returned an error (${err.response.status}).`
  }
  return 'Something went wrong.'
}
