import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

export default function SecretLogo() {
  const router = useRouter()
  const [count, setCount] = useState(0)
  const [hint, setHint] = useState('')
  const resetRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (resetRef.current) clearTimeout(resetRef.current)
    }
  }, [])

  const handleClick = () => {
    const next = count + 1
    setCount(next)
    if (next >= 7) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('shop-admin-access', 'true')
      }
      setCount(0)
      router.push('/admin')
    }
  }

  return (
    <button className="secret-logo-target" onClick={handleClick} aria-label="Acceso secreto de administrador" />
  )
}
