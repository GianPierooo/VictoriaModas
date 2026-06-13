import AnnouncementBanner from './AnnouncementBanner.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import PageTransition from '../motion/PageTransition.jsx'

export default function Layout({ children, fullWidth = false }) {
  return (
    <>
      <AnnouncementBanner />
      <Header />
      <PageTransition className={`min-h-screen ${fullWidth ? 'pt-0' : 'pt-28'}`}>
        {children}
      </PageTransition>
      <Footer />
    </>
  )
}

