export const CATEGORIES = [
  {
    name: '총무처',
    sub: ['비품영선비', '졸업축하비', '간식비']
  },
  {
    name: '교무처',
    sub: ['교재/인쇄비', '하계수련회', '리더운영비', '엘더운영비', '임원운영비', '반친목비']
  },
  {
    name: '예배처',
    sub: ['기도회', '새친구반 운영비', '특별행사비', '특강운영비', '동계수련회']
  },
  {
    name: '생지처',
    sub: ['임리찬 수련회', '찬양팀 운영비', '동기 모임비', '생일 축하비', 'SNS 운영비', '성경 아카데미']
  },
  {
    name: '기획처',
    sub: ['새내기 수련회', '새생명 축제', '군학원 선교비', '첨탑']
  }
]

export const ALL_SUB_CATEGORIES = CATEGORIES.flatMap(c => c.sub)

export function getMainCategory(sub) {
  for (const cat of CATEGORIES) {
    if (cat.sub.includes(sub)) return cat.name
  }
  return ''
}

export function getSortedSubCategories(favorites = []) {
  const favSet = new Set(favorites)
  const favItems = ALL_SUB_CATEGORIES
    .filter(s => favSet.has(s))
    .sort((a, b) => a.localeCompare(b, 'ko'))
  const nonFavItems = ALL_SUB_CATEGORIES
    .filter(s => !favSet.has(s))
    .sort((a, b) => a.localeCompare(b, 'ko'))
  return [...favItems, ...nonFavItems]
}
