import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, localISOString, compressImage } from '../db'
import { getSortedSubCategories, getMainCategory } from '../data/categories'

export default function Register() {
  const [photoData, setPhotoData] = useState(null)
  const [name, setName] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [item, setItem] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
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

  const reset = () => {
    setPhotoData(null)
    setName('')
    setSubCategory('')
    setAmount('')
    setItem('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!photoData || !name.trim() || !subCategory || !amount || !item.trim()) return
    setLoading(true)
    try {
      await db.records.add({
        photoData,
        name: name.trim(),
        subCategory,
        mainCategory: getMainCategory(subCategory),
        amount: Number(amount),
        item: item.trim(),
        createdAt: localISOString()
      })
      reset()
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  const isValid = photoData && name.trim() && subCategory && amount && item.trim()

  return (
    <div className="p-4" style={{ paddingBottom: '6rem' }}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Photo upload */}
        <div
          onClick={() => fileRef.current.click()}
          className="w-full h-52 rounded-2xl overflow-hidden bg-white border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer active:opacity-80 shadow-sm"
        >
          {photoData ? (
            <img src={photoData} className="w-full h-full object-cover" alt="preview" />
          ) : (
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-medium">사진 추가</p>
              <p className="text-xs text-gray-300 mt-0.5">필수</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhoto}
        />

        {/* Name */}
        <input
          type="text"
          placeholder="이름 *"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-sm"
        />

        {/* Category dropdown */}
        <select
          value={subCategory}
          onChange={e => setSubCategory(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-sm"
        >
          <option value="">분류 선택 *</option>
          {favorites.length > 0 && (
            <>
              <option disabled>── 즐겨찾기 ──</option>
              {favorites
                .slice()
                .sort((a, b) => a.localeCompare(b, 'ko'))
                .map(s => (
                  <option key={`fav-${s}`} value={s}>⭐ {s}</option>
                ))}
              <option disabled>── 전체 ──</option>
            </>
          )}
          {sorted
            .filter(s => !favSet.has(s))
            .map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
        </select>

        {/* Amount */}
        <input
          type="number"
          placeholder="금액 (원) *"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          inputMode="numeric"
          pattern="[0-9]*"
          min="0"
          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-sm"
        />

        {/* Item */}
        <input
          type="text"
          placeholder="항목 *"
          value={item}
          onChange={e => setItem(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-sm"
        />

        <button
          type="submit"
          disabled={!isValid || loading}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all shadow ${
            isValid && !loading
              ? done
                ? 'bg-green-500 text-white'
                : 'bg-blue-600 text-white active:bg-blue-700'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          {loading ? '등록 중...' : done ? '✓ 등록 완료!' : '등록하기'}
        </button>
      </form>

      <div className='mt-5 font-bold'>
        <p>* 조하빈 때문에 만들게 된 앱입니다</p>
        <p>* 그렇게 됐다</p>
      </div>
    </div>
  )
}
