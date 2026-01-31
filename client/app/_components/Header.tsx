import { DarkMode } from '@/app/_components/DarkMode'
import Logo from '@/app/_components/Logo'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import Navigation from './Navigation'
import Marquee from "react-fast-marquee";

const Header = () => {
  return (
   <>
      <div className='bg-green w-full myflex justify-between gap-6 pl-4 md:pl-8 py-2'>
        <div className='myflex gap-2'>
          <p className='text-white whitespace-nowrap'>Mobile app coming soon</p>
          <Link href="#" className='font-semibold myflex gap-1 text-white underline'>
            <span>Download</span>
            <Download size={16}/>
          </Link>
        </div>
        {/* <X className='text-white' size={18}/> */}
        <div>
          <Marquee className='text-white font-mono' speed={100} gradient={false} pauseOnHover={true}>
            <span className='ml-2'/>Powered with AI-driven insights, detailed sales analysis reports, automated invoice reminder emails, and intelligent invoice auto-filling.
          </Marquee>
        </div>
      </div>
     <header className='bg-background sticky top-0 px-[1rem] md:px-[2rem] border-b w-full h-[4rem] flex items-center justify-between z-10'>
      <div className='myflex gap-6'>
        <Link href="/">
          <div>
            <Logo w={40} h={40}/>
          </div>
        </Link>
        <Navigation/>
      </div>
      <div className='myflex gap-2'>
        <Link href="/register"><Button variant="primary">Get Started</Button></Link>
        <Link href="/login"><Button>Login</Button></Link>
        <DarkMode/>
      </div>
    </header>
   </>
  )
}

export default Header