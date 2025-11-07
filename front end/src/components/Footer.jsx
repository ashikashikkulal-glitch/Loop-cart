import React, { useState } from 'react'
import axios from 'axios'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')

  const subscribe = async () => {
    if (!email) return setMsg('Enter your email')
    const res = await axios.post('http://localhost:5000/api/subscribe', { email })
    setMsg(res.data.message)
  }

  return (
    <footer id="contact" className="bg-dark text-light text-center py-5 mt-5">
      <div className="container">
        <h4 className="mb-3">Join Our Newsletter</h4>
        <div className="d-flex justify-content-center mb-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="form-control w-50 me-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn btn-primary" onClick={subscribe}>Subscribe</button>
        </div>
        <p className="text-success">{msg}</p>
        <hr className="bg-light" />
        <p className="mb-0">© 2025 LoopCart. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
