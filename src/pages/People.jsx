import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export default function People() {
  const [expanded, setExpanded] = useState(null)

  const records = useLiveQuery(() => db.records.toArray(), []) || []

  const byPerson = {}
  for (const r of records) {
    if (!byPerson[r.name]) byPerson[r.name] = []
    byPerson[r.name].push(r)
  }

  const people = Object.entries(byPerson)
    .map(([name, recs]) => ({
      name,
      total: recs.reduce((s, r) => s + r.amount, 0),
      records: recs.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }))
    .sort((a, b) => b.total - a.total)

  const grandTotal = records.reduce((s, r) => s + r.amount, 0)
  const fmt = n => n.toLocaleString('ko-KR')

  const avatarColor = (name) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-green-100 text-green-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700',
      'bg-teal-100 text-teal-700'
    ]
    let hash = 0
    for (const c of name) hash = (hash + c.charCodeAt(0)) % colors.length
    return colors[hash]
  }

  return (
    <div className="p-4" style={{ paddingBottom: '6rem' }}>
      {records.length === 0 && (
        <div className="text-center text-gray-400 py-16">
          <svg className="w-16 h-16 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>등록된 내역이 없습니다</p>
        </div>
      )}

      {/* Grand total */}
      {records.length > 0 && (
        <div className="bg-blue-600 text-white rounded-2xl p-4 mb-4 text-center shadow-md">
          <p className="text-sm opacity-80 mb-1">전체 총합</p>
          <p className="text-2xl font-bold">{fmt(grandTotal)}원</p>
          <p className="text-sm opacity-70 mt-0.5">{people.length}명 · {records.length}건</p>
        </div>
      )}

      <div className="space-y-3">
        {people.map(person => (
          <div key={person.name} className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <button
              className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50"
              onClick={() => setExpanded(expanded === person.name ? null : person.name)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${avatarColor(person.name)}`}>
                  {person.name[0]}
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">{person.name}</p>
                  <p className="text-xs text-gray-400">{person.records.length}건</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-600">{fmt(person.total)}원</span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expanded === person.name ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {expanded === person.name && (
              <div className="border-t border-gray-100">
                {person.records.map((r, i) => (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between px-4 py-3 ${
                      i < person.records.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm text-gray-800 font-medium">{r.item}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {r.subCategory} · {r.createdAt.slice(0, 10)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 ml-2">{fmt(r.amount)}원</span>
                  </div>
                ))}
                {/* Person subtotal */}
                <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-t border-blue-100">
                  <span className="text-sm font-bold text-blue-700">합계</span>
                  <span className="text-sm font-bold text-blue-700">{fmt(person.total)}원</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
