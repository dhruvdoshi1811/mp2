export function formatName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function formatId(id: number): string {
  return `#${String(id).padStart(4, '0')}`
}
