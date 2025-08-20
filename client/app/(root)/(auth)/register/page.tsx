import Image from 'next/image'
import React from 'react'
import { RegisterForm } from '../_components/RegisterForm'
import Link from 'next/link'

const page = () => {
  return (
    <div className='mycontainer w-full'>
      <div className='myflex flex-col-reverse md:flex-row justify-center gap-10 min-h-80 max-w-5xl mx-auto'>
        <div className='w-full h-full max-w-[500px]'>
          <Image src="/register-light.gif" unoptimized alt='Register' width={500} height={500} className='dark:hidden'/>
          <Image src="/register-dark.gif" unoptimized alt='Register' width={500} height={500}  className='hidden dark:block'/>
        </div>
        <div className='w-full border rounded-lg p-6'>
          <h1 className='font-semibold text-2xl mb-1'>Register for an Account</h1>
          <RegisterForm/>
          <p className='font-medium mt-1'>Already have an Account? <Link href={"/login"} className='text-green hover:underline'>Login</Link></p>
        </div>
      </div>
    </div>
  )
}

export default page