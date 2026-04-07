import Dexie from 'dexie'

export const db = new Dexie('dongdo-accounting')

db.version(1).stores({
  records: '++id, name, subCategory, mainCategory, amount, createdAt',
  favorites: '++id, &subCategory'
})

/** 로컬 시간 기준 ISO 문자열 (타임존 문제 없이 날짜 필터링용) */
export function localISOString() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now - offset).toISOString().slice(0, -1)
}

/** 이미지를 최대 1200px, JPEG 80% 품질로 압축 */
export function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 1200
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width)
            width = MAX
          } else {
            width = Math.round((width * MAX) / height)
            height = MAX
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}
