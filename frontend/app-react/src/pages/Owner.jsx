import React, { useEffect, useState } from 'react'
import { getCounts, increment, setCount } from '../utils/counts'
import * as api from '../utils/api'

const PROPS_KEY = 'lease_properties'

function loadProperties(){
  try{ return JSON.parse(localStorage.getItem(PROPS_KEY) || '[]') }catch(e){return []}
}

function saveProperties(list){
  localStorage.setItem(PROPS_KEY, JSON.stringify(list))
}

export default function Owner(){
  const [counts, setCounts] = useState(getCounts())
  const [properties, setProperties] = useState([])
  const [owners, setOwners] = useState([])
  const [ownerId, setOwnerId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formType, setFormType] = useState('Apartment')
  const [formLocation, setFormLocation] = useState('')
  const [formRent, setFormRent] = useState('')

  useEffect(()=>{
    setCounts(getCounts())
    api.getProperties().then(list=>{
      setProperties(list||[])
    }).catch(()=>{
      setProperties(loadProperties())
    })
    api.getUsers().then(list=>{
      const ownersList = (list||[]).filter(u=> u.role === 'PROPERTY_OWNER')
      setOwners(ownersList)
      // default to first owner or current user if they are an owner
      const raw = localStorage.getItem('currentUser')
      const cur = raw? JSON.parse(raw): null
      if(cur && (cur.role === 'PROPERTY_OWNER' || cur.role === 'OWNER')){
        setOwnerId(cur.id)
      } else if(ownersList.length>0 && !ownerId) setOwnerId(ownersList[0].id)
    }).catch(()=>{})
  },[])

  function addProperty(){
    // show inline form instead of using prompt()
    setFormTitle('')
    setFormType('Apartment')
    setFormLocation('')
    setFormRent('')
    setShowAddForm(true)
  }

  async function submitAddProperty(){
    try{
      if(!formTitle) return alert('Enter property title')
      const rent = Number(formRent || 0)
      const p = { propertyName: formTitle, propertyType: formType, monthlyRentAmount: rent, availabilityStatus: 'AVAILABLE', location: formLocation }
      if(ownerId) p.owner = { id: ownerId }
      console.log('Adding property, payload:', p)
      const created = await api.addProperty(p)
      console.log('Add property response:', created)
      const next = [...properties, created]
      setProperties(next)
      increment('properties',1)
      increment('availableProperties',1)
      setCounts(getCounts())
      setShowAddForm(false)
      alert('Property added successfully')
    }catch(err){
      console.error('Failed to add property', err)
      const msg = err && err.message ? err.message : String(err)
      alert('Failed to add property: ' + msg + '\nCheck browser console for more details.')
    }
  }

  function cancelAddProperty(){ setShowAddForm(false) }

  function editProperty(id){
    const p = properties.find(x=>x.id===id)
    if(!p) return
    const currentStatus = p.availabilityStatus || 'AVAILABLE'
    const status = prompt('Status (AVAILABLE/LEASED)', currentStatus) || currentStatus
    const rent = Number(prompt('Rent', String(p.monthlyRentAmount || 0)) || p.monthlyRentAmount)
    const updated = { ...p, availabilityStatus: status, monthlyRentAmount: rent }
    api.updateProperty(id, updated).then(saved=>{
      const next = properties.map(x=> x.id===id? saved: x)
      setProperties(next)
      // recompute counts for owner
      recomputeCounts(next)
    }).catch(err=>{
      alert('Failed to update property: '+err.message)
    })
  }

  function removeProperty(id){
    if(!confirm('Remove property?')) return
    // backend has no delete API; remove locally
    const p = properties.find(x=>x.id===id)
    const next = properties.filter(x=>x.id!==id)
    setProperties(next)
    increment('properties', -1)
    if(p?.availabilityStatus==='AVAILABLE') increment('availableProperties', -1)
    if(p?.availabilityStatus==='LEASED'){
      increment('leasedProperties', -1)
      increment('activeLeases', -1)
      increment('monthlyRevenue', - (p.monthlyRentAmount||0))
    }
    setCounts(getCounts())
  }

  function recomputeCounts(props){
    const myProps = ownerId ? props.filter(p=> p.owner && p.owner.id===ownerId) : props
    const computed = getCounts()
    computed.properties = myProps.length
    computed.availableProperties = myProps.filter(p=>p.availabilityStatus==='AVAILABLE').length
    computed.leasedProperties = myProps.filter(p=>p.availabilityStatus==='LEASED').length
    computed.monthlyRevenue = myProps.reduce((s,p)=> s + (Number(p.monthlyRentAmount)||0), 0)
    setCount('properties', computed.properties)
    setCount('availableProperties', computed.availableProperties)
    setCount('leasedProperties', computed.leasedProperties)
    setCount('monthlyRevenue', computed.monthlyRevenue)
    setCounts(computed)
  }

  useEffect(()=>{
    // recompute counts whenever owner or properties change
    recomputeCounts(properties)
  },[ownerId, properties])

  return (
    <div>
      <h1 id="dashboard">Property Owner Dashboard</h1>
      <div style={{marginBottom:12}}>
        <label style={{fontSize:12,color:'#cbd5e1'}}>Owner</label>
        <div>
          <select value={ownerId||''} onChange={e=>setOwnerId(Number(e.target.value))} style={{width:220, marginTop:6}}>
            <option value="">-- select owner --</option>
            {owners.map(o=> <option key={o.id} value={o.id}>{o.name || o.email}</option>)}
          </select>
        </div>
      </div>
      <div className="cards">
        <div className="card"><div className="title">Total Properties</div><div className="value">{counts.properties}</div></div>
        <div className="card"><div className="title">Available Properties</div><div className="value">{counts.availableProperties}</div></div>
        <div className="card"><div className="title">Leased Properties</div><div className="value">{counts.leasedProperties}</div></div>
        <div className="card"><div className="title">Monthly Revenue</div><div className="value">${counts.monthlyRevenue}</div></div>
      </div>

      <section id="add-property" className="section">
        <h3>Add Property</h3>
        <button className="btn" onClick={addProperty}>Add Property</button>
        {showAddForm && (
          <div style={{marginTop:12, padding:12, border:'1px solid #e6e6e6', maxWidth:520, background:'#fff'}}>
            <div style={{display:'grid', gap:8}}>
              <div>
                <label style={{display:'block',marginBottom:6}}>Title</label>
                <input value={formTitle} onChange={e=>setFormTitle(e.target.value)} style={{width:'100%'}} />
              </div>
              <div>
                <label style={{display:'block',marginBottom:6}}>Type</label>
                <input value={formType} onChange={e=>setFormType(e.target.value)} style={{width:'100%'}} />
              </div>
              <div>
                <label style={{display:'block',marginBottom:6}}>Location</label>
                <input value={formLocation} onChange={e=>setFormLocation(e.target.value)} style={{width:'100%'}} />
              </div>
              <div>
                <label style={{display:'block',marginBottom:6}}>Monthly Rent</label>
                <input type="number" value={formRent} onChange={e=>setFormRent(e.target.value)} style={{width:'100%'}} />
              </div>
              <div>
                <button className="btn" onClick={submitAddProperty}>Submit</button>
                <button className="btn" style={{marginLeft:8}} onClick={cancelAddProperty}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section id="my-properties" className="section">
        <h3>View / Edit Properties</h3>
        <table className="table" style={{marginTop:12}}>
          <thead><tr><th>Property</th><th>Location</th><th>Type</th><th>Rent</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {properties.filter(p=> !ownerId || (p.owner && p.owner.id===ownerId)).map(p=> (
              <tr key={p.id}><td>{p.propertyName}</td><td>{p.location||'-'}</td><td>{p.propertyType}</td><td>${p.monthlyRentAmount}</td><td>{p.availabilityStatus}</td><td><button className="btn" onClick={()=>editProperty(p.id)}>Edit</button> <button style={{marginLeft:8}} onClick={()=>removeProperty(p.id)}>Remove</button></td></tr>
            ))}
            {properties.filter(p=> !ownerId || (p.owner && p.owner.id===ownerId)).length===0 && <tr><td colSpan={6} className="muted">No properties yet.</td></tr>}
          </tbody>
        </table>
      </section>

      <section id="property-status" className="section">
        <h3>Property Status</h3>
        <p className="muted">Status, occupancy and basic health.</p>
      </section>

      <section id="lease-details" className="section">
        <h3>Lease Details</h3>
        <p className="muted">View lease summaries for leased properties.</p>
      </section>
    </div>
  )
}
