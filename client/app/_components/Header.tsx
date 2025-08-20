import { DarkMode } from '@/app/_components/DarkMode'
import Logo from '@/app/_components/Logo'
import { Navigation } from '@/app/_components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, X } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
   <>
      <div className='bg-green w-full myflex justify-between gap-3 px-[1rem] md:px-[2rem] py-2'>
        <div className='myflex gap-2'>
          <p className='text-white'>Mobile app coming soon</p>
          <Link href="#" className='font-semibold myflex gap-1 text-white underline'>
            <span>Download</span>
            <Download size={16}/>
          </Link>
        </div>
        <X className='text-white' size={18}/>
      </div>
     <header className='bg-background sticky top-0 px-[1rem] md:px-[2rem] border-b w-full h-[4rem] flex items-center justify-between z-10'>
      <div className='myflex gap-3'>
        <Link href="/">
          <div>
            <Logo w={150} h={50}/>
          </div>
        </Link>
        <Navigation/>
      </div>
      <div className='myflex gap-2'>
        <Input placeholder='Search Documentations...' readOnly className='cursor-pointer'/>
        <Link href="/login"><Button variant="primary">Login</Button></Link>
        <DarkMode/>
      </div>
    </header>
   </>
  )
}

export default Header