import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { CATEGORIES } from '../data/categories'

export default function Stats() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const monthStr = `${year}-${String(month).padStart(2, '0')}`

  const records = useLiveQuery(
    () => db.records.filter(r => r.createdAt.startsWith(monthStr)).toArray(),
    [monthStr]
  ) || []

  const prev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const next = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const byMain = {}
  const bySub = {}
  for (const r of records) {
    byMain[r.mainCategory] = (byMain[r.mainCategory] || 0) + r.amount
    bySub[r.subCategory] = (bySub[r.subCategory] || 0) + r.amount
  }

  const grandTotal = records.reduce((s, r) => s + r.amount, 0)
  const fmt = n => n.toLocaleString('ko-KR')

  return (
    <div className="p-4" style={{ paddingBottom: '6rem' }}>
      {/* Month picker */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prev}
          className="w-11 h-11 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 active:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-bold text-gray-800">{year}년 {month}월</h2>
        <button
          onClick={next}
          className="w-11 h-11 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 active:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Grand total card */}
      <div className="bg-blue-600 text-white rounded-2xl p-5 mb-4 text-center shadow-md">
        <p className="text-sm opacity-80 mb-1">이달 총 지출</p>
        <p className="text-3xl font-bold">{fmt(grandTotal)}원</p>
        <p className="text-sm opacity-70 mt-1">{records.length}건</p>
      </div>

      {/* Category breakdown */}
      <div className="space-y-3">
        {CATEGORIES.map(cat => {
          const catTotal = byMain[cat.name] || 0
          return (
            <div key={cat.name} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="font-bold text-gray-700 text-sm">{cat.name}</span>
                <span className={`font-bold text-sm ${catTotal > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                  {catTotal > 0 ? `${fmt(catTotal)}원` : '-'}
                </span>
              </div>
              {/* Sub items */}
              {cat.sub.map((sub, i) => {
                const subTotal = bySub[sub] || 0
                return (
                  <div
                    key={sub}
                    className={`flex items-center justify-between px-4 py-2.5 ${
                      i < cat.sub.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    <span className="text-gray-600 text-sm">{sub}</span>
                    <span className={`text-sm ${subTotal > 0 ? 'font-semibold text-gray-800' : 'text-gray-300'}`}>
                      {subTotal > 0 ? `${fmt(subTotal)}원` : '-'}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {records.length === 0 && (
        <div className="text-center text-gray-400 py-16">
          <svg className="w-16 h-16 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>이달 등록된 내역이 없습니다</p>
        </div>
      )}
    </div>
  )
}
