import React, { useEffect, useState } from 'react'
import { getCounts, increment } from '../utils/counts'
import * as api from '../utils/api'

const PROPS_KEY = 'lease_properties'
const REQUESTS_KEY = 'lease_requests'
const LEASES_KEY = 'lease_leases'
const PAYMENTS_KEY = 'lease_payments'

function load(key){
  try{ return JSON.parse(localStorage.getItem(key) || '[]') }catch(e){return []}
}

function save(key, val){ localStorage.setItem(key, JSON.stringify(val)) }

const CURRENT_TENANT = 'You'

function normalizeLease(lease){
  const leaseStatus = lease.leaseStatus || lease.status || 'REQUESTED'
  const property = lease.property || {}
  const tenant = lease.tenant || {}
  return {
    id: lease.id,
    tenantId: tenant.id ?? lease.tenantId ?? null,
    tenantName: tenant.name || tenant.email || lease.tenantName || CURRENT_TENANT,
    propertyId: property.id ?? lease.propertyId ?? null,
    propertyTitle: property.propertyName || property.title || lease.propertyTitle || 'Unknown',
    rent: Number(lease.monthlyRentAmount ?? lease.rent ?? lease.rentAmount ?? property.monthlyRentAmount ?? 0),
    status: leaseStatus,
    createdAt: lease.createdAt || lease.created_at || new Date().toISOString(),
    duration: lease.duration || `${lease.leaseStartDate ? new Date(lease.leaseStartDate).toLocaleDateString() : 'N/A'} - ${lease.leaseEndDate ? new Date(lease.leaseEndDate).toLocaleDateString() : 'N/A'}`
  }
}

function normalizePayment(payment){
  const lease = payment.leaseAgreement || payment.lease || {}
  const paymentDate = payment.paymentDate || payment.date || payment.createdAt || payment.created_at || null
  const methodFromReference = typeof payment.referenceId === 'string' ? payment.referenceId.split('-PAY-')[0] : ''
  return {
    id: payment.id,
    leaseId: lease.id ?? payment.leaseId ?? null,
    amount: Number(payment.amount || 0),
    date: paymentDate,
    method: payment.paymentMethod || payment.method || methodFromReference || '-',
    status: payment.paymentStatus || payment.status || '-',
    month: payment.paymentMonth || payment.month || '-',
    referenceId: payment.referenceId || '-',
    tenant: payment.tenantName || payment.tenant || CURRENT_TENANT
  }
}

export default function Tenant(){
  const [counts, setCounts] = useState(getCounts())
  const [properties, setProperties] = useState([])
  const [search, setSearch] = useState('')
  const [requests, setRequests] = useState(load(REQUESTS_KEY))
  const [leases, setLeases] = useState(load(LEASES_KEY))
  const [payments, setPayments] = useState(load(PAYMENTS_KEY))
  const [users, setUsers] = useState([])
  const [selectedPaymentLeaseId, setSelectedPaymentLeaseId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CARD')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [showLeaseForm, setShowLeaseForm] = useState(false)
  const [formProperty, setFormProperty] = useState(null)
  const [formStartDate, setFormStartDate] = useState('')
  const [formDurationMonths, setFormDurationMonths] = useState(12)
  const [formEndDate, setFormEndDate] = useState('')
  const [formMonthlyRent, setFormMonthlyRent] = useState('')
  const [formSecurityDeposit, setFormSecurityDeposit] = useState('')
  const [newDisputeTitle, setNewDisputeTitle] = useState('')
  const [newDisputeDesc, setNewDisputeDesc] = useState('')
  const [newDisputeLeaseId, setNewDisputeLeaseId] = useState('')

  const rawUser = localStorage.getItem('currentUser')
  const currentUser = rawUser? JSON.parse(rawUser) : null

  useEffect(()=>{
    setCounts(getCounts())
    api.getProperties().then(list=> setProperties(list||[])).catch(()=> setProperties(load(PROPS_KEY)))
    setLeases(load(LEASES_KEY))
    setPayments(load(PAYMENTS_KEY))
    // load leases from server and derive requests for this tenant
    api.getLeases().then(list=>{
      const normalized = (list||load(LEASES_KEY)).map(normalizeLease)
      setLeases(normalized)
      const myReqs = normalized.filter(l=> l.status==='REQUESTED' && l.tenantId === (currentUser?.id))
      setRequests(myReqs)
    }).catch(()=>{})

    if(currentUser && currentUser.id){
      api.getPaymentsByTenant(currentUser.id).then(list=> setPayments((list||load(PAYMENTS_KEY)).map(normalizePayment))).catch(()=> setPayments(load(PAYMENTS_KEY)))
    }else{
      api.getPayments().then(list=> setPayments((list||load(PAYMENTS_KEY)).map(normalizePayment))).catch(()=> setPayments(load(PAYMENTS_KEY)))
    }
    api.getUsers().then(list=> setUsers(list||[])).catch(()=>{})
  },[])

  function requestLease(prop){
    // open lease request form for tenant to fill details
    setFormProperty(prop)
    setFormMonthlyRent(String(prop.monthlyRentAmount || ''))
    setFormSecurityDeposit('')
    setFormStartDate('')
    setFormDurationMonths(12)
    setFormEndDate('')
    setShowLeaseForm(true)
    return
  }

  function computeEndDate(start, months){
    try{
      const s = new Date(start)
      s.setMonth(s.getMonth() + Number(months))
      return s.toISOString().slice(0,10)
    }catch(e){return ''}
  }

  function submitLeaseRequest(){
    const rawUser = localStorage.getItem('currentUser')
    const currentUser = rawUser? JSON.parse(rawUser) : null
    if(!formProperty) return alert('Property missing')
    if(!formStartDate) return alert('Enter start date')
    const end = formEndDate || computeEndDate(formStartDate, formDurationMonths)
    const lease = {
      property: { id: formProperty.id },
      tenant: currentUser? { id: currentUser.id } : null,
      leaseStartDate: formStartDate,
      leaseEndDate: end,
      monthlyRentAmount: Number(formMonthlyRent || formProperty.monthlyRentAmount || 0),
      securityDeposit: Number(formSecurityDeposit || 0)
    }
    api.requestLease(lease).then(created=>{
      setShowLeaseForm(false)
      // refresh leases from server
      api.getLeases().then(list=>{
        const normalized = (list||load(LEASES_KEY)).map(normalizeLease)
        setLeases(normalized)
        const myReqs = normalized.filter(l=> l.status==='REQUESTED' && l.tenantId === (currentUser?.id))
        setRequests(myReqs)
        save(LEASES_KEY, normalized)
      }).catch(()=>{})
      increment('pendingRequests',1)
      setCounts(getCounts())
      alert('Lease request submitted')
    }).catch(err=> {
      const errMsg = err.response?.data?.message || err.message || String(err)
      alert('Failed to request lease: '+errMsg)
    })
  }

  function cancelRequest(id){
    if(!confirm('Cancel request?')) return
    const next = requests.filter(r=>r.id!==id)
    setRequests(next); save(REQUESTS_KEY, next)
    increment('pendingRequests', -1)
    setCounts(getCounts())
  }

  function payRent(lease){
    const amount = Number(paymentAmount || lease.rent || 0)
    if(!amount) return
    const paymentDate = new Date().toISOString().slice(0, 10)
    const paymentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    const payload = {
      leaseAgreement: { id: lease.id },
      amount,
      paymentDate,
      paymentMonth,
      paymentStatus: 'PAID',
      penaltyAmount: 0,
      referenceId: `${paymentMethod}-PAY-${Date.now()}`
    }
    api.makePayment(payload).then(created=>{
      const p = {
        id: created.id || Date.now(),
        leaseId: lease.id,
        tenant: currentUser?.name || CURRENT_TENANT,
        amount,
        date: created.createdAt || new Date().toISOString(),
        method: paymentMethod,
        status: 'PAID',
        month: paymentMonth,
        referenceId: `${paymentMethod}-PAY-${Date.now()}`
      }
      const next = [...payments, p]
      setPayments(next); save(PAYMENTS_KEY, next)
      increment('payments',1)
      setCounts(getCounts())
      setSelectedPaymentLeaseId('')
      setPaymentAmount('')
      alert('Payment recorded')
    }).catch(err=>{
      alert('Failed to record payment: '+(err.message||err))
    })
  }

  function submitPayment(){
    const lease = myLeases.find(l=>String(l.id)===String(selectedPaymentLeaseId))
    if(!lease) return alert('Select a lease to pay')
    payRent(lease)
  }

  function startRaiseForLease(lease){
    setNewDisputeLeaseId(lease?.id || '')
    window.location.hash = '#raise-dispute'
  }

  function submitDispute(){
    if(!newDisputeTitle) return alert('Enter a title')
    const payload = {
      leaseAgreement: newDisputeLeaseId? { id: Number(newDisputeLeaseId) } : null,
      disputeReason: newDisputeTitle + (newDisputeDesc? '\n' + newDisputeDesc : ''),
      disputeStatus: 'OPEN',
      raisedBy: currentUser? { id: currentUser.id } : null
    }
    api.raiseDispute(payload).then(created=>{
      setNewDisputeTitle('')
      setNewDisputeDesc('')
      setNewDisputeLeaseId('')
      increment('openDisputes',1)
      setCounts(getCounts())
      alert('Dispute submitted')
    }).catch(err=>{
      alert('Failed to raise dispute: '+(err.message||err))
    })
  }

  // compute rent due as sum of lease rents for this tenant
  const myLeases = leases.filter(l=> l.tenantId === (currentUser?.id) && (l.status==='APPROVED' || l.status==='ACTIVE' || l.status==='Active'))
  const myAllLeases = leases.filter(l=> l.tenantId === (currentUser?.id)) // includes REQUESTED, APPROVED, ACTIVE
  const hasActiveLease = myAllLeases.length > 0 // tenant has any pending, approved, or active lease
  
  const rentDue = myLeases.reduce((s,l)=>s+(Number(l.rent)||0),0)
  const penalty = payments.filter(p=>p.amount<0).reduce((s,p)=>s+Math.abs(p.amount),0)
  const paymentsForUser = payments.filter(p => {
    if(!p) return false
    if(p.leaseId && myLeases.some(l=>String(l.id) === String(p.leaseId))) return true
    if(currentUser && (p.tenant === currentUser.name || p.tenant === currentUser.email)) return true
    if(p.tenant === CURRENT_TENANT) return true
    return false
  })

  return (
    <div>
      <h1 id="dashboard">Tenant Dashboard</h1>
      <div className="cards">
        <div className="card"><div className="title">Active Leases</div><div className="value">{myLeases.length}</div></div>
        <div className="card"><div className="title">Pending Lease Requests</div><div className="value">{requests.length}</div></div>
        <div className="card"><div className="title">Rent Due Amount</div><div className="value">${rentDue}</div></div>
        <div className="card"><div className="title">Penalty Amount</div><div className="value">${penalty}</div></div>
      </div>

      <section id="browse-properties" className="section">
        <h3>Browse Properties</h3>
        {hasActiveLease && <div style={{marginBottom:12, padding:12, background:'#fff3cd', border:'1px solid #ffc107', borderRadius:4, color:'#856404'}}>
          ⚠️ You already have an active or pending lease. Complete or cancel it before requesting a new one.
        </div>}
        <div style={{marginBottom:8}}>
          <input placeholder="Search by name, location, type" value={search} onChange={e=>setSearch(e.target.value)} style={{width:320}} disabled={hasActiveLease} />
        </div>
        <table className="table">
          <thead><tr><th>Property</th><th>Type</th><th>Rent</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {properties.filter(p=> (p.availabilityStatus==='Available' || p.availabilityStatus==='AVAILABLE') && (p.propertyName?.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase()) || p.propertyType?.toLowerCase().includes(search.toLowerCase()) ) ).map(p=> {
              const isRequested = requests.some(r => Number(r.propertyId) === Number(p.id))
              const label = isRequested ? 'Lease Pending' : 'Request Lease'
              const disabled = hasActiveLease || isRequested
              return (
                <tr key={p.id}><td>{p.propertyName}</td><td>{p.propertyType}</td><td>${p.monthlyRentAmount}</td><td>{p.availabilityStatus}</td><td><button className="btn" onClick={()=>requestLease(p)} disabled={disabled}>{label}</button></td></tr>
              )
            })}
            {properties.filter(p=> (p.availabilityStatus==='Available' || p.availabilityStatus==='AVAILABLE') && (p.propertyName?.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase()) || p.propertyType?.toLowerCase().includes(search.toLowerCase()) ) ).length===0 && <tr><td colSpan={5} className="muted">No available properties.</td></tr>}
          </tbody>
        </table>
      </section>

      {showLeaseForm && (
        <section id="lease-request-form" className="section" style={{background:'#fff',padding:12,border:'1px solid #eee',maxWidth:720}}>
          <h3>Lease Request Details</h3>
          <p className="muted">Security deposit is captured during lease agreement creation because it is a mandatory part of lease terms and is validated before approval.</p>
          <div style={{display:'grid',gap:8,maxWidth:520}}>
            <div>
              <label style={{display:'block',marginBottom:6}}>Property</label>
              <div>{formProperty ? formProperty.propertyName || formProperty.title : '-'}</div>
            </div>
            <div>
              <label style={{display:'block',marginBottom:6}}>Start Date</label>
              <input type="date" value={formStartDate} onChange={e=>{ setFormStartDate(e.target.value); setFormEndDate(computeEndDate(e.target.value, formDurationMonths)) }} />
            </div>
            <div>
              <label style={{display:'block',marginBottom:6}}>Duration (months)</label>
              <input type="number" min="1" value={formDurationMonths} onChange={e=>{ setFormDurationMonths(Number(e.target.value)); setFormEndDate(computeEndDate(formStartDate, Number(e.target.value))) }} />
            </div>
            <div>
              <label style={{display:'block',marginBottom:6}}>End Date</label>
              <input type="date" value={formEndDate} onChange={e=>setFormEndDate(e.target.value)} />
            </div>
            <div>
              <label style={{display:'block',marginBottom:6}}>Monthly Rent</label>
              <input type="number" value={formMonthlyRent} onChange={e=>setFormMonthlyRent(e.target.value)} />
            </div>
            <div>
              <label style={{display:'block',marginBottom:6}}>Security Deposit</label>
              <input type="number" value={formSecurityDeposit} onChange={e=>setFormSecurityDeposit(e.target.value)} />
            </div>
            <div>
              <label style={{display:'block',marginBottom:6}}>Terms & Conditions (optional)</label>
              <textarea placeholder="Any special terms..." style={{width:'100%',height:80}} />
            </div>
            <div>
              <button className="btn" onClick={submitLeaseRequest}>Submit Request</button>
              <button className="btn" style={{marginLeft:8}} onClick={()=>setShowLeaseForm(false)}>Cancel</button>
            </div>
          </div>
        </section>
      )}

      <section id="pending-requests" className="section">
        <h3>Pending Lease Requests</h3>
        <table className="table">
          <thead><tr><th>Property</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {requests.map(r=> (
              <tr key={r.id}><td>{r.propertyTitle}</td><td>{r.createdAt? new Date(r.createdAt).toLocaleString() : '-'}</td><td>{r.status}</td><td>{r.status==='REQUESTED'?<button className="btn" onClick={()=>cancelRequest(r.id)}>Cancel</button>:null}</td></tr>
            ))}
            {requests.length===0 && <tr><td colSpan={4} className="muted">No requests.</td></tr>}
          </tbody>
        </table>
      </section>

      <section id="my-leases" className="section">
        <h3>Active Leases</h3>
        <table className="table">
          <thead><tr><th>Property</th><th>Duration</th><th>Rent</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {myLeases.map(l=> (
              <tr key={l.id}><td>{l.propertyTitle}</td><td>{l.duration||'N/A'}</td><td>${l.rent}</td><td>{l.status}</td><td><button className="btn" onClick={()=>{ setSelectedPaymentLeaseId(String(l.id)); setPaymentAmount(String(l.rent || '')); window.location.hash = '#make-payment'; }}>Pay Rent</button> <button style={{marginLeft:8}} onClick={()=>startRaiseForLease(l)}>Raise Dispute</button></td></tr>
            ))}
            {myLeases.length===0 && <tr><td colSpan={5} className="muted">No active leases.</td></tr>}
          </tbody>
        </table>
      </section>

      <section id="make-payment" className="section">
        <h3>Make Payment</h3>
        <div style={{display:'grid', gap:8, maxWidth:420}}>
          <div>
            <label style={{display:'block',marginBottom:6}}>Lease</label>
            <select value={selectedPaymentLeaseId} onChange={e=>{
              setSelectedPaymentLeaseId(e.target.value)
              const lease = myLeases.find(l=>String(l.id)===String(e.target.value))
              setPaymentAmount(lease ? String(lease.rent || '') : '')
            }} style={{width:'100%'}}>
              <option value="">-- select a lease --</option>
              {myLeases.map(l=> <option key={l.id} value={l.id}>{l.id} - {l.propertyTitle}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:'block',marginBottom:6}}>Payment Method</label>
            <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} style={{width:'100%'}}>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          <div>
            <label style={{display:'block',marginBottom:6}}>Amount</label>
            <input type="number" min="1" value={paymentAmount} onChange={e=>setPaymentAmount(e.target.value)} style={{width:'100%'}} />
          </div>
          <div>
            <button className="btn" onClick={submitPayment}>Pay Now</button>
          </div>
        </div>
      </section>

      <section id="payment-history" className="section">
        <h3>Payment History</h3>
        <table className="table">
          <thead><tr><th>Date</th><th>Amount</th><th>Lease</th><th>Method</th><th>Status</th><th>Month</th><th>Reference</th></tr></thead>
          <tbody>
            {paymentsForUser.map(p=> (
              <tr key={p.id}><td>{p.date ? new Date(p.date).toLocaleString() : '-'}</td><td>${p.amount}</td><td>{p.leaseId || '-'}</td><td>{p.method || '-'}</td><td>{p.status || '-'}</td><td>{p.month || '-'}</td><td>{p.referenceId || '-'}</td></tr>
            ))}
            {paymentsForUser.length===0 && <tr><td colSpan={7} className="muted">No payments yet.</td></tr>}
          </tbody>
        </table>
      </section>

      <section id="raise-dispute" className="section">
        <h3>Raise Dispute</h3>
        <div style={{marginBottom:8}}>
          <label style={{display:'block',marginBottom:6}}>Lease (optional)</label>
          <select value={newDisputeLeaseId} onChange={e=>setNewDisputeLeaseId(e.target.value)} style={{width:320}}>
            <option value="">-- none --</option>
            {leases.map(l=> <option key={l.id} value={l.id}>{l.id} - {l.propertyTitle || l.property?.propertyName || 'Lease'}</option>)}
          </select>
        </div>
        <div style={{marginBottom:8}}>
          <label style={{display:'block',marginBottom:6}}>Title</label>
          <input value={newDisputeTitle} onChange={e=>setNewDisputeTitle(e.target.value)} style={{width:320}} />
        </div>
        <div style={{marginBottom:8}}>
          <label style={{display:'block',marginBottom:6}}>Description</label>
          <textarea value={newDisputeDesc} onChange={e=>setNewDisputeDesc(e.target.value)} style={{width:320, height:100}} />
        </div>
        <div>
          <button className="btn" onClick={submitDispute}>Submit Dispute</button>
        </div>
      </section>

      <section id="view-lease-status" className="section">
        <h3>View Lease Status</h3>
        <p className="muted">Lease statuses shown in the Active Leases and Pending Requests sections.</p>
      </section>
    </div>
  )
}
