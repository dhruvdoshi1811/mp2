import type { Location } from 'react-router-dom'

export interface NamedAPIResource {
  name: string
  url: string
}

export interface NamedAPIResourceList {
  count: number
  results: NamedAPIResource[]
}

export interface GenerationResponse {
  id: number
  main_region: NamedAPIResource
  pokemon_species: NamedAPIResource[]
}

export interface TypeResponse {
  name: string
  pokemon: { slot: number; pokemon: NamedAPIResource }[]
}

export interface PokemonResponse {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number | null
  types: { slot: number; type: NamedAPIResource }[]
  abilities: { is_hidden: boolean; ability: NamedAPIResource }[]
  stats: { base_stat: number; stat: NamedAPIResource }[]
}

export interface PokemonSummary {
  id: number
  name: string
  region: string
  generation: number
  types: string[]
  image: string
}

export interface PokemonDetail {
  id: number
  name: string
  heightM: number
  weightKg: number
  baseExperience: number | null
  types: string[]
  abilities: { name: string; hidden: boolean }[]
  stats: { name: string; value: number }[]
  image: string
}

export interface DetailNavState {
  ids: number[]
  background?: Location
}

export interface PokedexData {
  pokemon: PokemonSummary[]
  regions: string[]
  types: string[]
}
