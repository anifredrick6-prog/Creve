import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import Welcome from './pages/Welcome.jsx'
import Marketplace from './pages/Marketplace.jsx'
import Dashboard from './pages/Dashboard.jsx'
import VendorProfile from './pages/VendorProfile.jsx'
import Messages from './pages/Messages.jsx'
import Conversation from './pages/Conversation.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import EditProfile from './pages/EditProfile.jsx'
import Upgrade from './pages/Upgrade.jsx'
import StoryViewer from './pages/StoryViewer.jsx'
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
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:otherId" element={<Conversation />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/stories/:vendorId" element={<StoryViewer />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
