import React, { useState, useEffect } from 'react'
import Admin from './pages/Admin'
import Owner from './pages/Owner'
import Tenant from './pages/Tenant'
import Manager from './pages/Manager'
import Dispute from './pages/Dispute'
import Login from './pages/Login'
import Register from './pages/Register'
import './index.css'

export default function App(){
  const [role, setRole] = useState('admin')
  const [currentUser, setCurrentUser] = useState(null)
  const [showRegister, setShowRegister] = useState(false)

  function normalizeRole(rawRole){
    const role = String(rawRole || '').trim().toUpperCase()
    const roleMap = {
      'ADMIN': 'admin',
      'PROPERTY_OWNER': 'owner',
      'OWNER': 'owner',
      'TENANT': 'tenant',
      'LEASE_MANAGER': 'manager',
      'MANAGER': 'manager',
      'DISPUTE_MANAGER': 'dispute',
      'DISPUTE': 'dispute'
    }
    return roleMap[role] || 'tenant'
  }

  useEffect(()=>{
    const u = localStorage.getItem('currentUser')
    if(u){
      const parsed = JSON.parse(u)
      setCurrentUser(parsed)
      setRole(normalizeRole(parsed.role))
    }
  },[])
  const sidebarMap = {
    admin: [
      {label:'Dashboard', target:'dashboard'},
      {label:'Users', target:'users'},
      {label:'Properties', target:'properties'},
      {label:'Lease Reports', target:'lease-reports'},
      {label:'Payments', target:'payments'},
      {label:'Disputes', target:'disputes'},
      {label:'Profile'},
      {label:'Logout'}
    ],
    owner: [
      {label:'Dashboard', target:'dashboard'},
      {label:'Add Property', target:'add-property'},
      {label:'My Properties', target:'my-properties'},
      {label:'Lease Details', target:'lease-details'},
      {label:'Logout'}
    ],
    tenant: [
      {label:'Dashboard', target:'dashboard'},
      {label:'Browse Properties', target:'browse-properties'},
      {label:'My Leases', target:'my-leases'},
      {label:'Pay Rent', target:'my-leases'},
      {label:'Payment History', target:'payment-history'},
      {label:'Raise Dispute', target:'raise-dispute'},
      {label:'Logout'}
    ],
    manager: [
      {label:'Dashboard', target:'dashboard'},
      {label:'Lease Requests', target:'lease-requests'},
      {label:'Approvals', target:'lease-requests'},
      {label:'Lease History', target:'lease-history'},
      {label:'Logout'}
    ],
    dispute: [
      {label:'Dashboard', target:'dashboard'},
      {label:'View Disputes', target:'view-disputes'},
      {label:'Resolve Disputes', target:'resolve-disputes'},
      {label:'Logout'}
    ]
  }

  function handleNav(item){
    if(item.label==='Logout'){
      if(window.confirm('Logout?')){
        localStorage.removeItem('currentUser')
        setCurrentUser(null)
        setRole('admin')
      }
      return
    }
    if(item.label==='Profile'){
      alert('Profile: user@example.com')
      return
    }
    if(item.target){
      const el = document.getElementById(item.target)
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'})
    }
  }

  if(!currentUser){
    return (
      <div className="centered">
        <div className="card panel">
          {!showRegister ? <Login onLogin={()=>{ const u=JSON.parse(localStorage.getItem('currentUser')); setCurrentUser(u); setRole(normalizeRole(u.role)) }} onSwitchToRegister={()=>setShowRegister(true)} /> : <Register onRegistered={()=>setShowRegister(false)} onSwitchToLogin={()=>setShowRegister(false)} />}
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">LeaseMgmt</div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:12,color:'#cbd5e1'}}>User</label>
          <div style={{marginTop:6}} className="muted">{currentUser.name} — {currentUser.email}</div>
        </div>
        <nav>
          <ul>
            {sidebarMap[role].map(item=> (
              <li key={item.label} style={{cursor:'pointer'}} onClick={()=>handleNav(item)}>{item.label}</li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="main">
        {role==='admin' && <Admin/>}
        {role==='owner' && <Owner/>}
        {role==='tenant' && <Tenant/>}
        {role==='manager' && <Manager/>}
        {role==='dispute' && <Dispute/>}
      </main>
    </div>
  )
}
