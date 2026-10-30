import Footer from '../Footer.jsx'
import Navbar from '../Navbar.jsx'

export default function AuthLayout({ children, maxWidth = 'max-w-xl' }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[62vh] bg-cream px-4 py-10 sm:px-8 sm:py-14">
        <div className={`mx-auto ${maxWidth}`}>{children}</div>
      </main>
      <Footer />
    </>
  )
}
