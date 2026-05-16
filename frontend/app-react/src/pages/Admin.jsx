import React, { useEffect, useState } from 'react'
import { getCounts, setCount } from '../utils/counts'
import * as api from '../utils/api'

export default function Admin(){
  const [counts, setCountsState] = useState(getCounts())

  useEffect(()=>{
    // fetch data from backend and compute counts; fallback to local counts
    Promise.allSettled([
      api.getUsers(),
      api.getProperties(),
      api.getLeases(),
      api.getPayments(),
      api.getDisputes()
    ]).then(results=>{
      const [usersR, propsR, leasesR, paymentsR, disputesR] = results
      if(usersR.status==='fulfilled' && propsR.status==='fulfilled' && leasesR.status==='fulfilled' && paymentsR.status==='fulfilled' && disputesR.status==='fulfilled'){
        const users = usersR.value || []
        const props = propsR.value || []
        const leases = leasesR.value || []
        const payments = paymentsR.value || []
        const disputes = disputesR.value || []

        const computed = {
          users: users.length,
          properties: props.length,
          availableProperties: props.filter(p=>p.availabilityStatus==='AVAILABLE').length,
          leasedProperties: props.filter(p=>p.availabilityStatus==='LEASED').length,
          activeLeases: leases.filter(l=>l.leaseStatus==='ACTIVE').length,
          pendingRequests: leases.filter(l=>l.leaseStatus==='REQUESTED').length,
          rejectedRequests: leases.filter(l=>l.leaseStatus==='REJECTED').length || 0,
          payments: payments.length,
          overduePayments: payments.filter(p=>p.paymentStatus==='OVERDUE').length,
          openDisputes: disputes.filter(d=>d.disputeStatus==='OPEN').length,
          monthlyIncome: 0,
          monthlyRevenue: leases.reduce((s,l)=>s + (Number(l.monthlyRentAmount)||0), 0)
        }
        setCounts(computed)
        setCountsState(computed)
        return
      }
      // fallback
      setCountsState(getCounts())
    }).catch(()=> setCountsState(getCounts()))
  },[])

  return (
    <div>
      <h1 id="dashboard">Admin Dashboard</h1>
      <div className="cards">
        <div className="card"><div className="title">Total Users</div><div className="value">{counts.users}</div></div>
        <div className="card"><div className="title">Total Properties</div><div className="value">{counts.properties}</div></div>
        <div className="card"><div className="title">Active Leases</div><div className="value">{counts.activeLeases}</div></div>
        <div className="card"><div className="title">Pending Lease Requests</div><div className="value">{counts.pendingRequests}</div></div>
        <div className="card"><div className="title">Total Payments</div><div className="value">{counts.payments}</div></div>
        <div className="card"><div className="title">Overdue Payments</div><div className="value">{counts.overduePayments}</div></div>
        <div className="card"><div className="title">Open Disputes</div><div className="value">{counts.openDisputes}</div></div>
      </div>

      

      <section id="users" className="section">
        <h3>User Management</h3>
        <p className="muted">Manage users and roles, invite and deactivate accounts.</p>
      </section>
      <section id="properties" className="section">
        <h3>Property Monitoring</h3>
        <p className="muted">Overview of properties health, occupancy and alerts.</p>
      </section>
      <section id="lease-reports" className="section">
        <h3>Lease Reports</h3>
        <p className="muted">Reports and analytics for leases.</p>
      </section>
      <section id="payments" className="section">
        <h3>Payment Reports</h3>
        <p className="muted">Payments summary, overdue accounts and exports.</p>
      </section>
      <section id="disputes" className="section">
        <h3>Dispute Tracking</h3>
        <p className="muted">Track disputes, assign reviewers and update status.</p>
      </section>
    </div>
  )
}
