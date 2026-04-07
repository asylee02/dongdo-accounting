import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, compressImage } from '../db'
import { getSortedSubCategories, getMainCategory } from '../data/categories'

export default function EditModal({ record, onClose }) {
  const [photoData, setPhotoData] = useState(record.photoData)
  const [name, setName] = useState(record.name)
  const [subCategory, setSubCategory] = useState(record.subCategory)
  const [amount, setAmount] = useState(String(record.amount))
  const [item, setItem] = useState(record.item)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const favorites = useLiveQuery(
    () => db.favorites.toArray().then(fs => fs.map(f => f.subCategory)),
    []
  ) || []

  const sorted = getSortedSubCategories(favorites)
  const favSet = new Set(favorites)

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const compressed = await compressImage(file)
    setPhotoData(compressed)
  }

  const handleSave = async () => {
    if (!name.trim() || !subCategory || !amount || !item.trim()) return
    setLoading(true)
    try {
      await db.records.update(record.id, {
        photoData,
        name: name.trim(),
        subCategory,
        mainCategory: getMainCategory(subCategory),
        amount: Number(amount),
        item: item.trim()
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">내역 수정</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xl font-light">
            ×
          </button>
        </div>

        <div className="space-y-3">
          {/* Photo */}
          <div
            onClick={() => fileRef.current.click()}
            className="w-full h-40 rounded-2xl overflow-hidden bg-gray-100 cursor-pointer active:opacity-80"
          >
            <img src={photoData} className="w-full h-full object-cover" alt="preview" />
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />

          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />

          <select
            value={subCategory}
            onChange={e => setSubCategory(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          >
            {favorites.length > 0 && (
              <>
                <option disabled>── 즐겨찾기 ──</option>
                {favorites.sort((a, b) => a.localeCompare(b, 'ko')).map(s => (
                  <option key={`fav-${s}`} value={s}>⭐ {s}</option>
                ))}
                <option disabled>── 전체 ──</option>
              </>
            )}
            {sorted.filter(s => !favSet.has(s)).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="금액 (원)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            inputMode="numeric"
            pattern="[0-9]*"
            min="0"
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />

          <input
            type="text"
            placeholder="항목"
            value={item}
            onChange={e => setItem(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />

          <button
            onClick={handleSave}
            disabled={loading || !name.trim() || !subCategory || !amount || !item.trim()}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-base disabled:opacity-50 active:bg-blue-700"
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
