// Use explicit backend URL for dev to avoid missing Vite proxy configuration
const API_BASE = 'http://localhost:8082/api'

async function request(path, opts){
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  })
  if(!res.ok) throw new Error(await res.text())
  return res.status===204? null : res.json()
}

export function getProperties(){ return request('/properties', { method: 'GET' }) }
export function addProperty(prop){ return request('/properties', { method: 'POST', body: JSON.stringify(prop) }) }
export function updateProperty(id, prop){ return request(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(prop) }) }

export function getLeases(){ return request('/leases', { method: 'GET' }) }
export function requestLease(lease){ return request('/leases/request', { method: 'POST', body: JSON.stringify(lease) }) }
export function approveLease(id, body){ return request(`/leases/${id}/approve`, { method: 'PUT', body: body? JSON.stringify(body): undefined }) }

export function getPayments(leaseId){ return request(`/payments${leaseId?('?leaseId='+leaseId):''}`, { method: 'GET' }) }
export function getPaymentsByTenant(tenantId){ return request(`/payments${tenantId?('?tenantId='+tenantId):''}`, { method: 'GET' }) }
export function makePayment(payment){ return request('/payments', { method: 'POST', body: JSON.stringify(payment) }) }

export function getDisputes(){ return request('/disputes', { method: 'GET' }) }
export function raiseDispute(d){ return request('/disputes', { method: 'POST', body: JSON.stringify(d) }) }
export function resolveDispute(id){ return request(`/disputes/${id}/resolve`, { method: 'PUT' }) }
export function reviewDispute(id, body){ return request(`/disputes/${id}/review`, { method: 'PUT', body: body? JSON.stringify(body): undefined }) }

export function getUsers(){ return request('/users', { method: 'GET' }) }
export function createUser(u){ return request('/users', { method: 'POST', body: JSON.stringify(u) }) }

export function authRegister(req){ return request('/auth/register', { method: 'POST', body: JSON.stringify(req) }) }
export function authLogin(req){ return request('/auth/login', { method: 'POST', body: JSON.stringify(req) }) }

export default { getProperties, addProperty, getLeases, requestLease, approveLease, getPayments, getPaymentsByTenant, makePayment, getDisputes, raiseDispute, resolveDispute, getUsers, createUser }
