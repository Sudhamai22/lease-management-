// Simple SPA routing and mock data for role-based dashboards
const state = {
  role: null,
  data: {
    users: 128,
    properties: 42,
    activeLeases: 29,
    pendingRequests: 4,
    payments: 512,
    disputesOpen: 3,
    propertiesList: [
      { id:1, title:'Maple Apartment', type:'Apartment', rent:1200, status:'Leased' },
      { id:2, title:'Oak House', type:'House', rent:2200, status:'Available' },
      { id:3, title:'Pine Studio', type:'Studio', rent:850, status:'Leased' }
    ],
    leases: [
      {tenant:'Alice', property:'Maple Apartment', duration:'12m', status:'Active'},
      {tenant:'Bob', property:'Pine Studio', duration:'6m', status:'Active'}
    ],
    disputes: [
      {id:1, title:'Noise complaint', status:'Open'},
      {id:2, title:'Repair delay', status:'Under Review'}
    ]
  }
}

const $ = sel => document.querySelector(sel)
const $$ = sel => Array.from(document.querySelectorAll(sel))

function init(){
  $('#loginBtn').addEventListener('click', doLogin)
  $('#roleSelect').value = 'admin'
  $('#logout').addEventListener('click', logout)
  $$('.sidebar li').forEach(li=>li.addEventListener('click', navClick))
}

function doLogin(){
  const role = $('#roleSelect').value
  state.role = role
  $('#roleLabel').textContent = `Role: ${role}`
  $('#sidebar').classList.remove('hidden')
  showView('dashboard')
  renderDashboard()
}

function logout(){
  state.role = null
  $('#roleLabel').textContent = ''
  $('#sidebar').classList.add('hidden')
  showOnly('loginView')
}

function navClick(e){
  const route = e.currentTarget.dataset.route
  showView(route)
}

function showOnly(id){
  $$('.view').forEach(v=>v.classList.add('hidden'))
  $(`#${id}`).classList.remove('hidden')
}

function showView(route){
  // map route -> view id
  const map = {dashboard:'dashboardView',properties:'propertiesView',leases:'leasesView',payments:'paymentsView',disputes:'disputesView',profile:'profileView'}
  showOnly(map[route]||'dashboardView')
  // highlight menu
  $$('.sidebar li').forEach(li=>li.classList.toggle('active', li.dataset.route===route))
  // render specific view
  if(route==='dashboard') renderDashboard()
  if(route==='properties') renderProperties()
  if(route==='leases') renderLeases()
  if(route==='payments') renderPayments()
  if(route==='disputes') renderDisputes()
}

function renderDashboard(){
  const root = $('#dashboardView')
  root.innerHTML = ''
  const role = state.role
  const d = state.data

  // Build top cards depending on role
  const cards = document.createElement('div')
  cards.className='cards'

  if(role==='admin'){
    cards.append(card('Total Users', d.users))
    cards.append(card('Total Properties', d.properties))
    cards.append(card('Active Leases', d.activeLeases))
    cards.append(card('Pending Lease Requests', d.pendingRequests))
    cards.append(card('Total Payments', d.payments))
    cards.append(card('Open Disputes', d.disputesOpen))

    root.append(cards)
    root.append(section('User Management','Manage users and roles.'))
    root.append(section('Property Monitoring','Overview of properties and health.'))
    root.append(section('Lease Reports','Reports and analytics for leases.'))
    root.append(section('Payment Reports','Payments summary and exports.'))
    root.append(section('Dispute Tracking','Track disputes and resolution status.'))
  }

  if(role==='owner'){
    cards.append(card('Total Properties', d.properties))
    cards.append(card('Available Properties', d.propertiesList.filter(p=>p.status==='Available').length))
    cards.append(card('Leased Properties', d.propertiesList.filter(p=>p.status!=='Available').length))
    cards.append(card('Monthly Income', '$' + (d.propertiesList.reduce((s,p)=>s+p.rent,0)).toFixed(2)))
    root.append(cards)
    const sec = section('Property List','Manage your properties')
    const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Add Property'; btn.onclick=addProperty
    sec.appendChild(btn)
    sec.append(renderPropertiesTable())
    root.append(sec)
  }

  if(role==='tenant'){
    cards.append(card('Active Leases', d.activeLeases))
    cards.append(card('Pending Requests', d.pendingRequests))
    cards.append(card('Monthly Rent Due', '$1200'))
    cards.append(card('Penalty Amount', '$0'))
    root.append(cards)
    root.append(section('Browse Properties','Find properties and request leases.'))
    root.append(section('My Leases','View and manage your leases.'))
    root.append(section('Pay Rent','Make payments and view history.'))
  }

  if(role==='manager'){
    cards.append(card('Pending Requests', d.pendingRequests))
    cards.append(card('Approved Leases', d.activeLeases))
    cards.append(card('Rejected Requests', 2))
    root.append(cards)
    root.append(section('View Lease Requests','Review pending requests and approve/reject.'))
    root.append(renderLeasesTable())
  }

  if(role==='dispute'){
    cards.append(card('Open Disputes', d.disputes.filter(x=>x.status==='Open').length))
    cards.append(card('Under Review', d.disputes.filter(x=>x.status==='Under Review').length))
    cards.append(card('Resolved', 5))
    root.append(cards)
    root.append(section('View Disputes','Update status and resolve issues.'))
    root.append(renderDisputesTable())
  }
}

function card(title, value){
  const el = document.createElement('div'); el.className='card'
  el.innerHTML = `<div class="title">${title}</div><div class="value">${value}</div>`
  return el
}

function section(title, desc){
  const s = document.createElement('div'); s.className='section'
  s.innerHTML = `<h3>${title}</h3><p class="muted">${desc}</p>`
  return s
}

function renderProperties(){
  const root = $('#propertiesView')
  root.innerHTML=''
  root.append(section('Properties','List of properties in the system'))
  root.append(renderPropertiesTable())
}

function renderPropertiesTable(){
  const tableWrap = document.createElement('div')
  const tbl = document.createElement('table'); tbl.className='table'
  tbl.innerHTML = `<thead><tr><th>Property</th><th>Type</th><th>Rent</th><th>Status</th><th>Actions</th></tr></thead>`
  const tbody = document.createElement('tbody')
  state.data.propertiesList.forEach(p=>{
    const tr = document.createElement('tr')
    tr.innerHTML = `<td>${p.title}</td><td>${p.type}</td><td>$${p.rent}</td><td>${p.status}</td><td><button class="btn" data-id="${p.id}">Edit</button></td>`
    tbody.appendChild(tr)
  })
  tbl.appendChild(tbody)
  tableWrap.appendChild(tbl)
  tableWrap.querySelectorAll('button').forEach(b=>b.addEventListener('click',e=>editProperty(e.target.dataset.id)))
  return tableWrap
}

function addProperty(){
  const title = prompt('Property title')
  if(!title) return
  state.data.propertiesList.push({id:Date.now(), title, type:'Unknown', rent:0, status:'Available'})
  renderDashboard()
}

function editProperty(id){
  const p = state.data.propertiesList.find(x=>x.id==id)
  if(!p) return alert('Property not found')
  const title = prompt('Title', p.title)
  if(title) p.title = title
  renderDashboard()
}

function renderLeases(){
  const root = $('#leasesView')
  root.innerHTML=''
  root.append(section('Lease Agreements','All lease agreements'))
  root.append(renderLeasesTable())
}

function renderLeasesTable(){
  const wrap = document.createElement('div')
  const tbl = document.createElement('table'); tbl.className='table'
  tbl.innerHTML = `<thead><tr><th>Tenant</th><th>Property</th><th>Duration</th><th>Status</th></tr></thead>`
  const tbody = document.createElement('tbody')
  state.data.leases.forEach(l=>{
    const tr = document.createElement('tr')
    tr.innerHTML = `<td>${l.tenant}</td><td>${l.property}</td><td>${l.duration}</td><td>${l.status}</td>`
    tbody.appendChild(tr)
  })
  tbl.appendChild(tbody)
  wrap.appendChild(tbl)
  return wrap
}

function renderPayments(){
  const root = $('#paymentsView')
  root.innerHTML=''
  root.append(section('Payments','Payment reports and history'))
  const p = document.createElement('div'); p.className='section'; p.innerHTML='<p class="muted">No live payments in mock mode.</p>'
  root.append(p)
}

function renderDisputes(){
  const root = $('#disputesView')
  root.innerHTML=''
  root.append(section('Disputes','Dispute tracking and resolution'))
  root.append(renderDisputesTable())
}

function renderDisputesTable(){
  const wrap = document.createElement('div')
  const tbl = document.createElement('table'); tbl.className='table'
  tbl.innerHTML = `<thead><tr><th>Title</th><th>Status</th><th>Actions</th></tr></thead>`
  const tbody = document.createElement('tbody')
  state.data.disputes.forEach(d=>{
    const tr = document.createElement('tr')
    tr.innerHTML = `<td>${d.title}</td><td>${d.status}</td><td><button class="btn" data-id="${d.id}">Update</button></td>`
    tbody.appendChild(tr)
  })
  tbl.appendChild(tbody)
  wrap.appendChild(tbl)
  wrap.querySelectorAll('button').forEach(b=>b.addEventListener('click',e=>updateDispute(e.target.dataset.id)))
  return wrap
}

function updateDispute(id){
  const d = state.data.disputes.find(x=>x.id==id)
  if(!d) return
  const s = prompt('Status', d.status)
  if(s) d.status = s
  renderDashboard()
}

init()

