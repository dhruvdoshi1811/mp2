import { matchPath, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DetailModal } from './pages/DetailModal'
import { GalleryPage } from './pages/GalleryPage'
import { ListPage } from './pages/ListPage'
import { NotFoundPage } from './pages/NotFoundPage'
import type { DetailNavState } from './types/pokemon'

function App() {
  const location = useLocation()
  const state = location.state as DetailNavState | null
  const isDetail = matchPath('/pokemon/:id', location.pathname) !== null

  const background = isDetail ? (state?.background ?? '/') : undefined

  return (
    <>
      <Routes location={background ?? location}>
        <Route element={<Layout />}>
          <Route index element={<ListPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>

      {isDetail && (
        <Routes>
          <Route path="pokemon/:id" element={<DetailModal />} />
        </Routes>
      )}
    </>
  )
}

export default App
