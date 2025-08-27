import { useRef, useEffect } from 'react'

export function useClickOutside(callback) {
  const ref = useRef(null)
  
  useEffect(() => {
    const click = ({ target }) => {
      if (target && ref.current && !ref.current.contains(target)) {
        callback()
      }
    }
    document.addEventListener('mousedown', click)
    
    return () => {
      document.removeEventListener('mousedown', click)
    }
  }, [])
  return ref
}
