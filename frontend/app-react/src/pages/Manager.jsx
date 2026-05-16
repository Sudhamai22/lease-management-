import React, { useEffect, useState } from 'react'
import { getCounts, increment } from '../utils/counts'
import * as api from '../utils/api'

const REQ_KEY = 'lease_requests'
const LEASES_KEY = 'lease_leases'
const PROPS_KEY = 'lease_properties'

function load(key){
  try{ return JSON.parse(localStorage.getItem(key) || '[]') }catch(e){return []}
}

function save(key,val){ localStorage.setItem(key, JSON.stringify(val)) }

function userLabel(user){
  if(!user) return 'Unknown'
  if(typeof user === 'string') return user
  return user.name || user.email || `User ${user.id || ''}`.trim()
}

function propertyLabel(property){
  if(!property) return 'Unknown'
  if(typeof property === 'string') return property
  return property.propertyName || property.title || `Property ${property.id || ''}`.trim()
}

function toRowLease(lease){
  return {
    id: lease.id,
    tenant: userLabel(lease.tenant),
    propertyTitle: propertyLabel(lease.property),
    createdAt: lease.createdAt || lease.created_at,
    status: lease.leaseStatus || lease.status || 'REQUESTED',
    duration: lease.duration || `${lease.leaseStartDate ? new Date(lease.leaseStartDate).toLocaleDateString() : 'N/A'} - ${lease.leaseEndDate ? new Date(lease.leaseEndDate).toLocaleDateString() : 'N/A'}`
  }
}

export default function Manager(){
  const [counts, setCounts] = useState(getCounts())
  const [requests, setRequests] = useState([])
  const [leases, setLeases] = useState([])
  const [properties, setProperties] = useState([])

  useEffect(()=>{
    setCounts(getCounts())
    api.getLeases().then(list=>{
      const normalized = (list||[]).map(toRowLease)
      setLeases(normalized)
      // requests are leases with status REQUESTED
      setRequests(normalized.filter(l=> l.status === 'REQUESTED'))
    }).catch(()=>{
      setLeases(load(LEASES_KEY))
      setRequests(load(REQ_KEY))
    })
    api.getProperties().then(list=> setProperties(list||[])).catch(()=> setProperties(load(PROPS_KEY)))
  },[])

  const pendingRequestsCount = requests.length
  const approvedLeasesCount = leases.filter(l=> l.status === 'APPROVED' || l.status === 'ACTIVE').length
  const rejectedRequestsCount = leases.filter(l=> l.status === 'REJECTED').length

  function approve(reqId){
    const raw = localStorage.getItem('currentUser')
    const cur = raw? JSON.parse(raw) : null
    const body = {}
    if(cur && cur.id) body.approvedBy = { id: cur.id }
    api.approveLease(reqId, body).then(updated=>{
      // refresh leases and requests
      api.getLeases().then(list=>{
        const normalized = (list||[]).map(toRowLease)
        setLeases(normalized)
        setRequests(normalized.filter(l=> l.status === 'REQUESTED'))
      })
    }).catch(err=> alert('Failed to approve lease: '+err.message))
  }

  function reject(reqId){
    if(!confirm('Reject this request?')) return
    const nextReq = requests.filter(r=>r.id!==reqId)
    setRequests(nextReq); save(REQ_KEY, nextReq)
    increment('rejectedRequests', 1)
  }

  return (
    <div>
      <h1 id="dashboard">Lease Manager Dashboard</h1>
      <div className="cards">
        <div className="card"><div className="title">Pending Lease Requests</div><div className="value">{pendingRequestsCount}</div></div>
        <div className="card"><div className="title">Approved Leases</div><div className="value">{approvedLeasesCount}</div></div>
        <div className="card"><div className="title">Rejected Leases</div><div className="value">{rejectedRequestsCount}</div></div>
      </div>

      <section id="lease-requests" className="section">
        <h3>View Lease Requests</h3>
        <table className="table">
          <thead><tr><th>Tenant</th><th>Property</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {requests.map(r=> (
              <tr key={r.id}><td>{r.tenant}</td><td>{r.propertyTitle}</td><td>{new Date(r.createdAt).toLocaleString()}</td><td>{r.status}</td><td><button className="btn" onClick={()=>approve(r.id)}>Approve</button> <button style={{marginLeft:8}} onClick={()=>reject(r.id)}>Reject</button></td></tr>
            ))}
            {requests.length===0 && <tr><td colSpan={5} className="muted">No pending requests.</td></tr>}
          </tbody>
        </table>
      </section>

      <section id="lease-history" className="section">
        <h3>Lease History</h3>
        <table className="table">
          <thead><tr><th>Tenant</th><th>Property</th><th>Duration</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>
            {leases.map(l=> (
              <tr key={l.id}><td>{l.tenant}</td><td>{l.propertyTitle}</td><td>{l.duration}</td><td>{l.status}</td><td>{l.createdAt ? new Date(l.createdAt).toLocaleString() : '-'}</td></tr>
            ))}
            {leases.length===0 && <tr><td colSpan={5} className="muted">No leases yet.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  )
}
