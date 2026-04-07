import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { ALL_SUB_CATEGORIES } from '../data/categories'

export default function Settings() {
  const favorites = useLiveQuery(
    () => db.favorites.toArray().then(fs => fs.map(f => ({ id: f.id, sub: f.subCategory }))),
    []
  ) || []

  const favMap = Object.fromEntries(favorites.map(f => [f.sub, f.id]))
  const favSubs = new Set(Object.keys(favMap))

  const toggle = async (sub) => {
    if (favSubs.has(sub)) {
      await db.favorites.delete(favMap[sub])
    } else {
      await db.favorites.add({ subCategory: sub })
    }
  }

  const sorted = [...ALL_SUB_CATEGORIES].sort((a, b) => a.localeCompare(b, 'ko'))

  return (
    <div className="p-4" style={{ paddingBottom: '6rem' }}>
      <p className="text-sm text-gray-500 mb-4 px-1">
        자주 쓰는 분류에 별표를 누르면 등록 화면 드롭다운 상단에 고정됩니다.
      </p>

      {/* Selected count */}
      {favSubs.size > 0 && (
        <div className="mb-3 px-1">
          <span className="text-xs text-blue-600 font-semibold">{favSubs.size}개 즐겨찾기 중</span>
        </div>
      )}

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        {sorted.map((sub, i) => {
          const isFav = favSubs.has(sub)
          return (
            <button
              key={sub}
              onClick={() => toggle(sub)}
              className={`w-full flex items-center justify-between px-4 py-4 active:bg-gray-50 ${
                i < sorted.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <span className={`text-base ${isFav ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                {sub}
              </span>
              <svg
                viewBox="0 0 24 24"
                className={`w-6 h-6 transition-colors ${isFav ? 'text-yellow-400' : 'text-gray-200'}`}
                fill="currentColor"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          )
        })}
      </div>
    </div>
  )
}
