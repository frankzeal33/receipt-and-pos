import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'

const GetStarted = () => {
  return (
    <section className='mycontainer m-8 bg-[#09090b] rounded-3xl dark:bg-muted'>
      <div className='text-center grid gap-6'>
        <h1 className='text-white font-bold text-5xl'>Ready to streamline your business operations?</h1>
        <p className='text-white text-center mx-auto text-xl max-w-[800px]'>With improved accuracy, simplified financial tracking, and visualized weekly, monthly, and yearly reports with data visualization and AI-powered analysis & insights. An all in one powerful system.</p>
        <Link href={'/register'}>
          <Button className="h-12 text-base font-medium min-w-32 hover:border" variant="primary">
            Get Started
          </Button>
        </Link>
      </div>
    </section>
  )
}

export default GetStarted