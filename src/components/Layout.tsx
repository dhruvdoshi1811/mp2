import { Link, NavLink, Outlet } from 'react-router-dom'
import { usePokedex } from '../context/pokedexContext'
import styles from './Layout.module.css'

export function Layout() {
  const { loading, error, retry } = usePokedex()

  return (
    <>
      <header className={styles.navbar}>
        <h1 className={styles.logo}>
          <Link to="/">Pokédex</Link>
        </h1>
        <nav className={styles.links}>
          <NavLink to="/" end>
            Search
          </NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
        </nav>
      </header>

      <main>
        {loading && <p>Loading Pokédex…</p>}
        {error && (
          <div>
            <p>{error}</p>
            <button type="button" onClick={retry}>
              Try again
            </button>
          </div>
        )}
        {!loading && !error && <Outlet />}
      </main>
    </>
  )
}
