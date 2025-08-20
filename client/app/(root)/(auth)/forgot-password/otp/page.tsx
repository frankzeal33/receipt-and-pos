import Image from 'next/image'
import React from 'react'
import Link from 'next/link'
import { OtpForm } from '../../_components/OtpForm'

const page = () => {
  return (
    <div className='mycontainer w-full'>
      <div className='myflex flex-col-reverse md:flex-row justify-center gap-10 min-h-80 max-w-5xl mx-auto'>
        <div className='w-full h-full max-w-[500px]'>
          <Image src="/otp-light.gif" unoptimized alt='Register' width={500} height={500} className='dark:hidden'/>
          <Image src="/otp-dark.gif" unoptimized alt='Register' width={500} height={500}  className='hidden dark:block'/>
        </div>
        <div className='w-full border rounded-lg p-6'>
          <h1 className='font-semibold text-2xl mb-1'>One Time Password</h1>
          <OtpForm/>
        </div>
      </div>
    </div>
  )
}

export default page