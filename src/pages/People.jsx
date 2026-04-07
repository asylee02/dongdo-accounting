import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export default function People() {
  const [expanded, setExpanded] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState('전체')

  const records = useLiveQuery(() => db.records.toArray(), []) || []

  // 존재하는 월 목록 (최신순)
  const months = useMemo(() => {
    const set = new Set(records.map(r => r.createdAt.slice(0, 7)))
    return ['전체', ...[...set].sort((a, b) => b.localeCompare(a))]
  }, [records])

  // 선택된 월에 맞게 필터링
  const filtered = selectedMonth === '전체'
    ? records
    : records.filter(r => r.createdAt.startsWith(selectedMonth))

  const byPerson = {}
  for (const r of filtered) {
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

  const grandTotal = filtered.reduce((s, r) => s + r.amount, 0)
  const fmt = n => n.toLocaleString('ko-KR')

  const fmtMonth = m => {
    if (m === '전체') return '전체'
    const [y, mo] = m.split('-')
    return `${y}년 ${parseInt(mo)}월`
  }

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

      {/* 월별 필터 탭 */}
      {records.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-4 px-4 scrollbar-hide">
          {months.map(m => (
            <button
              key={m}
              onClick={() => { setSelectedMonth(m); setExpanded(null) }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedMonth === m
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {fmtMonth(m)}
            </button>
          ))}
        </div>
      )}

      {records.length === 0 && (
        <div className="text-center text-gray-400 py-16">
          <svg className="w-16 h-16 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>등록된 내역이 없습니다</p>
        </div>
      )}

      {records.length > 0 && filtered.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <p className="text-sm">{fmtMonth(selectedMonth)}에 내역이 없습니다</p>
        </div>
      )}

      {/* Grand total */}
      {records.length > 0 && (
        <div className="bg-blue-600 text-white rounded-2xl p-4 mb-4 text-center shadow-md">
          <p className="text-sm opacity-80 mb-1">{selectedMonth === '전체' ? '전체 총합' : `${fmtMonth(selectedMonth)} 총합`}</p>
          <p className="text-2xl font-bold">{fmt(grandTotal)}원</p>
          <p className="text-sm opacity-70 mt-0.5">{people.length}명 · {filtered.length}건</p>
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
