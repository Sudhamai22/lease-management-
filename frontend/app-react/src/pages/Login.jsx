import React, { useState } from 'react'
import * as api from '../utils/api'

export default function Login({onLogin, onSwitchToRegister}){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function submit(){
    api.authLogin({ email, password }).then(res=>{
      localStorage.setItem('currentUser', JSON.stringify({ id: res.userId, name: res.name, email: res.email, role: res.role, phoneNumber: res.phoneNumber }))
      onLogin && onLogin()
    }).catch(err=> alert('Login failed: '+err.message))
  }

  return (
    <div style={{maxWidth:420}}>
      <h2>Login</h2>
      <div style={{marginBottom:8}}>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%'}} />
      </div>
      <div style={{marginBottom:8}}>
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%'}} />
      </div>
      <div>
        <button className="btn" onClick={submit}>Login</button>
        <button style={{marginLeft:8}} className="btn" onClick={onSwitchToRegister}>Register</button>
      </div>
    </div>
  )
}
