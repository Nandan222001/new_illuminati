import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ContentProvider } from './context/ContentContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Archives from './pages/Archives'
import ArchiveDetail from './pages/ArchiveDetail'
import Rituals from './pages/Rituals'
import NewOrder from './pages/NewOrder'
import Videos from './pages/Videos'
import VideoDetail from './pages/VideoDetail'
import Visuals from './pages/Visuals'
import Community from './pages/Community'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ContentProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/archives" element={<Archives />} />
                <Route path="/archives/:slug" element={<ArchiveDetail />} />
                <Route path="/rituals" element={<Rituals />} />
                <Route path="/new-order" element={<NewOrder />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/videos/:slug" element={<VideoDetail />} />
                <Route path="/visuals" element={<Visuals />} />
                <Route path="/community" element={<Community />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
                {/* legacy hash anchors from the single-page version */}
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/symbols" element={<Navigate to="/visuals" replace />} />
                <Route path="/countdown" element={<Navigate to="/new-order" replace />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </ContentProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
