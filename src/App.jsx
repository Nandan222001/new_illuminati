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
import PaidRoute from './components/PaidRoute'
import CatalogueRoute from './components/CatalogueRoute'
import SeoManager from './components/SeoManager'
import LanguagePreference from './components/LanguagePreference'

const Home = lazy(() => import('./pages/Home.jsx'))
const Archives = lazy(() => import('./pages/Archives.jsx'))
const ArchiveDetail = lazy(() => import('./pages/ArchiveDetail.jsx'))
const Rituals = lazy(() => import('./pages/Rituals.jsx'))
const Stories = lazy(() => import('./pages/Stories.jsx'))
const StoryDetail = lazy(() => import('./pages/Stories.jsx').then((pages) => ({ default: pages.StoryDetail })))
const ArchiveCatalogue = lazy(() => import('./pages/Catalogue.jsx').then((pages) => ({ default: pages.ArchiveCatalogue })))
const ArchivePreview = lazy(() => import('./pages/Catalogue.jsx').then((pages) => ({ default: pages.ArchivePreview })))
const SymbolCatalogue = lazy(() => import('./pages/Catalogue.jsx').then((pages) => ({ default: pages.SymbolCatalogue })))
const VideoCatalogue = lazy(() => import('./pages/Catalogue.jsx').then((pages) => ({ default: pages.VideoCatalogue })))
const VideoPreview = lazy(() => import('./pages/Catalogue.jsx').then((pages) => ({ default: pages.VideoPreview })))
const Videos = lazy(() => import('./pages/Videos.jsx'))
const VideoDetail = lazy(() => import('./pages/VideoDetail.jsx'))
const Visuals = lazy(() => import('./pages/Visuals.jsx'))
const Community = lazy(() => import('./pages/Community.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Privacy = lazy(() => import('./pages/Privacy.jsx'))
const Rules = lazy(() => import('./pages/Rules.jsx'))
const Why999 = lazy(() => import('./pages/Why999.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const Store = lazy(() => import('./pages/Store.jsx'))
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
const AdminStore = lazy(() => import('./pages/admin/StoreAdmin.jsx'))

function RouteLoading() {
  return <div className="page-loading"><div className="sigil-spinner" aria-label="Loading" /></div>
}

export function AppRoutes() {
  return (
    <>
      <SeoManager />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          {/* Standalone one-book sale page: one card, no header, no footer, no gate. */}
          <Route path="/book" element={<Store />} />

          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:slug" element={<StoryDetail />} />
            <Route path="/new-order" element={<StoryDetail />} />
            <Route path="/archives" element={<CatalogueRoute preview={<ArchiveCatalogue />}><Archives /></CatalogueRoute>} />
            <Route path="/archives/:slug" element={<CatalogueRoute preview={<ArchivePreview />}><ArchiveDetail /></CatalogueRoute>} />
            <Route path="/videos" element={<CatalogueRoute preview={<VideoCatalogue />}><Videos /></CatalogueRoute>} />
            <Route path="/videos/:slug" element={<CatalogueRoute preview={<VideoPreview />}><VideoDetail /></CatalogueRoute>} />
            <Route path="/visuals" element={<CatalogueRoute preview={<SymbolCatalogue />}><Visuals /></CatalogueRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/why-999" element={<Why999 />} />
            {/* Legacy route aliases from the single-page version. */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/symbols" element={<Navigate to="/visuals" replace />} />
            <Route path="/countdown" element={<Navigate to="/new-order" replace />} />
            <Route path="/new-world-order" element={<Navigate to="/new-order" replace />} />
            <Route path="/library" element={<Navigate to="/archives#library" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Preserve the age/terms gate for account and member experiences. */}
          <Route element={<Layout requiresConsent />}>
            <Route path="/rituals" element={<PaidRoute><Rituals /></PaidRoute>} />
            <Route path="/community" element={<PaidRoute><Community /></PaidRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
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
            <Route path="book" element={<AdminStore />} />
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
