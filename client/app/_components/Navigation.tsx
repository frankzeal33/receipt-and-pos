import Link from 'next/link'
import React from 'react'

const Navigation = () => {
  return (
    <nav>
      <ul className='flex items-center justify-center gap-8'>
        <li className='font-medium'>
          <Link href={"/about"}>About</Link>
        </li>
        <li className='font-medium'>
          <Link href={"/pricing"}>Pricing</Link>
        </li>
        <li className='font-medium'>
          <Link href={"/how-to-use"}>How to use</Link>
        </li>
        <li className='font-medium'>
          <Link href={"/contact"}>Contact</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation