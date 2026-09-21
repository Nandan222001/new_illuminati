import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ContentProvider } from './context/ContentContext'
import { ToastProvider } from './context/ToastContext'
import { ConsentProvider } from './context/ConsentContext'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Route-level code splitting: each page becomes its own chunk so visitors
// only download the routes they actually visit. The shared shell (navbar,
// footer, providers) stays eager.
const Home = lazy(() => import('./pages/Home'))
const Archives = lazy(() => import('./pages/Archives'))
const ArchiveDetail = lazy(() => import('./pages/ArchiveDetail'))
const Rituals = lazy(() => import('./pages/Rituals'))
const NewOrder = lazy(() => import('./pages/NewOrder'))
const Videos = lazy(() => import('./pages/Videos'))
const VideoDetail = lazy(() => import('./pages/VideoDetail'))
const Visuals = lazy(() => import('./pages/Visuals'))
const Community = lazy(() => import('./pages/Community'))
const About = lazy(() => import('./pages/About'))
const Rules = lazy(() => import('./pages/Rules'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminRevenue = lazy(() => import('./pages/admin/Revenue'))
const AdminMembers = lazy(() => import('./pages/admin/Members'))
const AdminVideos = lazy(() => import('./pages/admin/VideosAdmin'))
const AdminImages = lazy(() => import('./pages/admin/ImagesAdmin'))
const AdminRituals = lazy(() => import('./pages/admin/RitualsAdmin'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

function RouteFallback() {
  return (
    <div className="page-loading">
      <div className="sigil-spinner" aria-label="Loading" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ConsentProvider>
        <AuthProvider>
          <ContentProvider>
            <Suspense fallback={<RouteFallback />}>
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
                <Route path="/rules" element={<Rules />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                {/* legacy hash anchors from the single-page version */}
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/symbols" element={<Navigate to="/visuals" replace />} />
                <Route path="/countdown" element={<Navigate to="/new-order" replace />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Admin console is its own app shell — no public site header/footer. */}
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="revenue" element={<AdminRevenue />} />
                <Route path="members" element={<AdminMembers />} />
                <Route path="videos" element={<AdminVideos />} />
                <Route path="images" element={<AdminImages />} />
                <Route path="rituals" element={<AdminRituals />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
            </Suspense>
          </ContentProvider>
        </AuthProvider>
        </ConsentProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
