const STORAGE_KEY = 'lease_counts'

const initialCounts = {
  users: 0,
  properties: 0,
  availableProperties: 0,
  leasedProperties: 0,
  activeLeases: 0,
  pendingRequests: 0,
  rejectedRequests: 0,
  payments: 0,
  overduePayments: 0,
  openDisputes: 0,
  monthlyIncome: 0,
  monthlyRevenue: 0
}

export function getCounts(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    if(!raw){
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCounts))
      return {...initialCounts}
    }
    const parsed = JSON.parse(raw)
    return Object.fromEntries(Object.entries({...initialCounts, ...parsed}).map(([key, value]) => [key, Math.max(0, Number(value) || 0)]))
  }catch(e){
    return {...initialCounts}
  }
}

export function saveCounts(counts){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(counts))
}

export function increment(key, by=1){
  const counts = getCounts()
  if(!(key in counts)) counts[key] = 0
  counts[key] = Math.max(0, (Number(counts[key]) || 0) + by)
  saveCounts(counts)
  return counts
}

export function setCount(key, value){
  const counts = getCounts()
  counts[key] = value
  saveCounts(counts)
  return counts
}
