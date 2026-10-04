import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ContentProvider } from './context/ContentContext'
import { ToastProvider } from './context/ToastContext'
import { ConsentProvider } from './context/ConsentContext'
import { SiteSettingsProvider } from './context/SiteSettingsContext'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import SeoManager from './components/SeoManager'
import LanguagePreference from './components/LanguagePreference'

const Home = lazy(() => import('./pages/Home.jsx'))
const Archives = lazy(() => import('./pages/Archives.jsx'))
const ArchiveDetail = lazy(() => import('./pages/ArchiveDetail.jsx'))
const Rituals = lazy(() => import('./pages/Rituals.jsx'))
const NewOrder = lazy(() => import('./pages/NewOrder.jsx'))
const Videos = lazy(() => import('./pages/Videos.jsx'))
const VideoDetail = lazy(() => import('./pages/VideoDetail.jsx'))
const Visuals = lazy(() => import('./pages/Visuals.jsx'))
const Community = lazy(() => import('./pages/Community.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Rules = lazy(() => import('./pages/Rules.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'))
const AdminRevenue = lazy(() => import('./pages/admin/Revenue.jsx'))
const AdminMembers = lazy(() => import('./pages/admin/Members.jsx'))
const AdminVideos = lazy(() => import('./pages/admin/VideosAdmin.jsx'))
const AdminImages = lazy(() => import('./pages/admin/ImagesAdmin.jsx'))
const AdminRituals = lazy(() => import('./pages/admin/RitualsAdmin.jsx'))
const AdminSettings = lazy(() => import('./pages/admin/Settings.jsx'))
const AdminBooks = lazy(() => import('./pages/admin/BooksAdmin.jsx'))
const AdminArchives = lazy(() => import('./pages/admin/ArchivesAdmin.jsx'))
const AdminMessages = lazy(() => import('./pages/admin/Messages.jsx'))

function RouteLoading() {
  return <div className="page-loading"><div className="sigil-spinner" aria-label="Loading" /></div>
}

export function AppRoutes() {
  return (
    <>
      <SeoManager />
      <Suspense fallback={<RouteLoading />}>
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
            {/* Legacy route aliases from the single-page version. */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/symbols" element={<Navigate to="/visuals" replace />} />
            <Route path="/countdown" element={<Navigate to="/new-order" replace />} />
            <Route path="/new-world-order" element={<Navigate to="/new-order" replace />} />
            <Route path="/library" element={<Navigate to="/archives#library" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin console is its own shell without public site navigation. */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="revenue" element={<AdminRevenue />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="images" element={<AdminImages />} />
            <Route path="rituals" element={<AdminRituals />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="archives" element={<AdminArchives />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ConsentProvider>
          <AuthProvider>
            <ContentProvider>
              <SiteSettingsProvider>
                <LanguagePreference />
                <AppRoutes />
              </SiteSettingsProvider>
            </ContentProvider>
          </AuthProvider>
        </ConsentProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
