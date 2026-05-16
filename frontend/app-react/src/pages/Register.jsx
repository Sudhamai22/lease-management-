import React, { useState } from 'react'
import * as api from '../utils/api'

export default function Register({onRegistered, onSwitchToLogin}){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [role, setRole] = useState('TENANT')

  function submit(){
    if(!name||!email||!password) return alert('Name, email and password required')
    const payload = { name, email, password, phoneNumber, role }
    api.authRegister(payload).then(res=>{
      alert('Registered: '+res.message)
      onRegistered && onRegistered()
    }).catch(err=> alert('Register failed: '+err.message))
  }

  return (
    <div style={{maxWidth:420}}>
      <h2>Register</h2>
      <div style={{marginBottom:8}}>
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} style={{width:'100%'}} />
      </div>
      <div style={{marginBottom:8}}>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%'}} />
      </div>
      <div style={{marginBottom:8}}>
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%'}} />
      </div>
      <div style={{marginBottom:8}}>
        <label>Phone</label>
        <input value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} style={{width:'100%'}} />
      </div>
      <div style={{marginBottom:8}}>
        <label>Role</label>
        <select value={role} onChange={e=>setRole(e.target.value)} style={{width:'100%'}}>
          <option value="TENANT">Tenant</option>
          <option value="PROPERTY_OWNER">Property Owner</option>
          <option value="LEASE_MANAGER">Lease Manager</option>
          <option value="DISPUTE_MANAGER">Dispute Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <div>
        <button className="btn" onClick={submit}>Create account</button>
        <button style={{marginLeft:8}} className="btn" onClick={onSwitchToLogin}>Back to Login</button>
      </div>
    </div>
  )
}
