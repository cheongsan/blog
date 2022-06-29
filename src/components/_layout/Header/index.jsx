import { useRef } from 'react'
import Link from 'next/link'
import CONFIG from '@/blog.config'
import NavBar from './NavBar'

const Header = ({ fullWidth }) => {
  const navRef = useRef(null)
  return (
    <>
      <div
        className={`sticky-nav m-auto w-full h-6 flex flex-row justify-between items-center mb-2 md:mb-6 py-8 bg-opacity-60 max-w-6xl px-4 ${
          fullWidth && 'px-4 md:px-24'
        }`}
        id="sticky-nav"
        ref={navRef}
      >
        <Link href="/">
          <a aria-label={CONFIG.blog.title}>
            <div className="flex items-center">
              <div className="ml-2 text-black dark:text-white header-name">
                {CONFIG.blog.title}
              </div>
            </div>
          </a>
        </Link>

        <NavBar />
      </div>
    </>
  )
}

export default Header
