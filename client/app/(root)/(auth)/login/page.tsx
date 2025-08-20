import Image from 'next/image'
import React from 'react'
import { LoginForm } from '../_components/LoginForm'
import Link from 'next/link'

const page = () => {
  return (
    <div className='mycontainer w-full'>
      <div className='myflex flex-col-reverse md:flex-row justify-center gap-10 min-h-80 max-w-5xl mx-auto'>
        <div className='w-full h-full max-w-[500px]'>
          <Image src="/login-light.gif" unoptimized alt='Register' width={500} height={500} className='dark:hidden'/>
          <Image src="/login-dark.gif" unoptimized alt='Register' width={500} height={500}  className='hidden dark:block'/>
        </div>
        <div className='w-full border rounded-lg p-6'>
          <h1 className='font-semibold text-2xl mb-1'>Login to your Account</h1>
          <LoginForm/>
          <p className='font-medium mt-1'>Don't have an Account? <Link href={"/register"} className='text-green hover:underline'>Register</Link></p>
        </div>
      </div>
    </div>
  )
}

export default page