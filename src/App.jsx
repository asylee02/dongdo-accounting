import { useState } from 'react'
import BottomNav from './components/BottomNav'
import Register from './pages/Register'
import Stats from './pages/Stats'
import Photos from './pages/Photos'
import People from './pages/People'
import Settings from './pages/Settings'

export default function App() {
  const [page, setPage] = useState('register')

  const titles = {
    register: '회계 등록',
    stats: '월별 통계',
    photos: '사진 / 분류',
    people: '인물별 금액',
    settings: '즐겨찾기 설정'
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-100">
      <header className="bg-blue-600 text-white px-4 pt-12 pb-4 shadow-md sticky top-0 z-10">
        <h1 className="text-lg font-bold text-center tracking-wide">{titles[page]}</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        {page === 'register' && <Register />}
        {page === 'stats' && <Stats />}
        {page === 'photos' && <Photos />}
        {page === 'people' && <People />}
        {page === 'settings' && <Settings />}
      </main>

      <BottomNav page={page} setPage={setPage} />
    </div>
  )
}
