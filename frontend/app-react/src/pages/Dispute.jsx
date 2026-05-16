import React, { useEffect, useState } from 'react'
import { getCounts, setCount } from '../utils/counts'
import * as api from '../utils/api'

export default function Dispute(){
  const [counts, setCountsState] = useState(getCounts())
  const [disputes, setDisputes] = useState([])
  const [reviewingId, setReviewingId] = useState(null)
  const [reviewRemarks, setReviewRemarks] = useState('')
  

  useEffect(()=>{
    setCountsState(getCounts())
    api.getDisputes().then(list=> setDisputes(list||[])).catch(()=> setDisputes([]))
  },[])

  function refresh(){
    api.getDisputes().then(list=>{
      setDisputes(list||[])
      const openCount = (list||[]).filter(d=> d.disputeStatus==='OPEN').length
      setCount('openDisputes', openCount)
      setCountsState(getCounts())
    }).catch(()=>{})
  }


  function resolveDispute(id){
    if(!confirm('Mark dispute as Resolved?')) return
    api.resolveDispute(id).then(()=> refresh()).catch(err=> alert('Failed: '+err.message))
  }

  function reviewDispute(id){
    // open review form instead of immediate action
    setReviewingId(id)
    setReviewRemarks('')
  }

  function submitReview(){
    if(!reviewingId) return
    const raw = localStorage.getItem('currentUser')
    const cur = raw? JSON.parse(raw) : null
    const body = { resolutionRemarks: reviewRemarks }
    if(cur && cur.id) body.resolvedBy = { id: cur.id }

    api.reviewDispute(reviewingId, body).then(()=>{
      setReviewingId(null)
      setReviewRemarks('')
      refresh()
    }).catch(err=> alert('Failed to submit review: '+(err.message||err)))
  }

  function cancelReview(){ setReviewingId(null); setReviewRemarks('') }

  return (
    <div>
      <h1 id="dashboard">Dispute Manager Dashboard</h1>
      <div className="cards">
        <div className="card"><div className="title">Open Disputes</div><div className="value">{disputes.filter(d=>d.disputeStatus==='OPEN').length}</div></div>
        <div className="card"><div className="title">Under Review</div><div className="value">{disputes.filter(d=>d.disputeStatus==='UNDER_REVIEW').length}</div></div>
        <div className="card"><div className="title">Resolved</div><div className="value">{disputes.filter(d=>d.disputeStatus==='RESOLVED').length}</div></div>
      </div>

      <section id="view-disputes" className="section">
        <h3>View Disputes</h3>
        <table className="table">
          <thead><tr><th>Reason</th><th>Status</th><th>Lease</th><th>Raised By</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {disputes.map(d=> (
              <tr key={d.id}>
                <td>{d.disputeReason}</td>
                <td>{d.disputeStatus}</td>
                <td>{d.leaseAgreement?.id || '-'}</td>
                <td>{d.raisedBy?.name || d.raisedBy?.email || '-'}</td>
                <td>{d.createdAt? new Date(d.createdAt).toLocaleString(): '-'}</td>
                  <td>{d.disputeStatus==='OPEN'?<button className="btn" onClick={()=>reviewDispute(d.id)}>Review</button>: d.disputeStatus==='UNDER_REVIEW'?<button className="btn" onClick={()=>resolveDispute(d.id)}>Resolve</button>:<span className="muted">Resolved</span>}</td>
              </tr>
            ))}
            {disputes.length===0 && <tr><td colSpan={6} className="muted">No disputes.</td></tr>}
          </tbody>
        </table>
      </section>

        {reviewingId && (
          <section id="review-form" style={{marginTop:16, padding:12, border:'1px solid #ddd', maxWidth:720}}>
            <h3>Review Dispute #{reviewingId}</h3>
            <div style={{marginBottom:8}}>
              <label style={{display:'block',marginBottom:6}}>Remarks</label>
              <textarea value={reviewRemarks} onChange={e=>setReviewRemarks(e.target.value)} style={{width:'100%',height:120}} />
            </div>
            <div>
              <button className="btn" onClick={submitReview}>Submit Review</button>
              <button className="btn" style={{marginLeft:8}} onClick={cancelReview}>Cancel</button>
            </div>
          </section>
        )}


    </div>
  )
}
