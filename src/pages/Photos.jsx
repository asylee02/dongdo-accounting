import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import EditModal from '../components/EditModal'

export default function Photos() {
  const [editRecord, setEditRecord] = useState(null)
  const [imageView, setImageView] = useState(null)

  const records = useLiveQuery(
    () => db.records.orderBy('createdAt').reverse().toArray(),
    []
  ) || []

  // Group by date (YYYY-MM-DD)
  const grouped = {}
  for (const r of records) {
    const date = r.createdAt.slice(0, 10)
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(r)
  }
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const handleDelete = async (id) => {
    if (!window.confirm('이 내역을 삭제하시겠습니까?')) return
    await db.records.delete(id)
  }

  // iOS에서는 fullscreen view로 열어 꾹 눌러 저장
  const handlePhotoView = (photoData) => {
    setImageView(photoData)
  }

  const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-')
    const days = ['일', '월', '화', '수', '목', '금', '토']
    const day = new Date(`${dateStr}T00:00:00`).getDay()
    return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일 (${days[day]})`
  }

  const fmt = n => n.toLocaleString('ko-KR')

  return (
    <div className="p-4" style={{ paddingBottom: '6rem' }}>
      {dates.length === 0 && (
        <div className="text-center text-gray-400 py-16">
          <svg className="w-16 h-16 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>등록된 사진이 없습니다</p>
        </div>
      )}

      {dates.map(date => (
        <div key={date} className="mb-6">
          <p className="text-xs font-bold text-gray-500 mb-2 px-1">{formatDate(date)}</p>
          <div className="space-y-3">
            {grouped[date].map(record => (
              <div key={record.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                {/* Photo */}
                <div
                  className="w-full h-48 bg-gray-100 cursor-pointer active:opacity-90"
                  onClick={() => handlePhotoView(record.photoData)}
                >
                  <img
                    src={record.photoData}
                    className="w-full h-full object-cover"
                    alt={record.name}
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="p-3.5">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-gray-800 mr-2">{record.name}</span>
                      <span className="inline-block text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        {record.subCategory}
                      </span>
                    </div>
                    <span className="font-bold text-blue-600 ml-2 shrink-0">{fmt(record.amount)}원</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{record.item}</p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePhotoView(record.photoData)}
                      className="flex-1 py-2 text-sm bg-gray-100 text-gray-600 rounded-xl font-medium active:bg-gray-200"
                    >
                      사진 보기
                    </button>
                    <button
                      onClick={() => setEditRecord(record)}
                      className="flex-1 py-2 text-sm bg-blue-50 text-blue-600 rounded-xl font-medium active:bg-blue-100"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="flex-1 py-2 text-sm bg-red-50 text-red-500 rounded-xl font-medium active:bg-red-100"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Edit modal */}
      {editRecord && (
        <EditModal record={editRecord} onClose={() => setEditRecord(null)} />
      )}

      {/* Fullscreen image viewer */}
      {imageView && (
        <div
          className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center"
          onClick={() => setImageView(null)}
        >
          <img
            src={imageView}
            className="max-w-full max-h-full object-contain"
            alt="fullscreen"
          />
          <div className="absolute top-14 left-0 right-0 flex justify-center">
            <span className="text-white text-sm bg-black/50 px-4 py-2 rounded-full">
              꾹 눌러서 사진 저장 · 탭하면 닫힘
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
