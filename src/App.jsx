import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import Welcome from './pages/Welcome.jsx'
import Marketplace from './pages/Marketplace.jsx'
import Dashboard from './pages/Dashboard.jsx'
import VendorProfile from './pages/VendorProfile.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vendor/:vendorId" element={<VendorProfile />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
