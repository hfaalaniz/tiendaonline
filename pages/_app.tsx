import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Footer from '../components/Footer'
import StoreHeader from '../components/StoreHeader'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isAdmin = router.pathname.startsWith('/admin')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <StoreHeader />
      <div style={{ flex: 1 }}>
        <Component {...pageProps} />
      </div>
      {!isAdmin && <Footer />}
    </div>
  )
}
