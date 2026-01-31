import Image from 'next/image'
import React from 'react'

const Video = () => {
  return (
    <section className='px-4 pb-12'>
        <div className="w-full relative max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-full h-[400px] bg-gradient-to-r from-primary to-green-600 rounded-full blur-3xl opacity-40 z-0" />
            <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-xl shadow-lg bg-background">
                <div className="relative w-full h-full rounded-md">
                    <Image src="/dashboard.png" alt="Resume Dashboard" width={1500} height={1500} className="object-contain w-full h-full rounded-md"/>
                </div>
            </div>
        </div>
    </section>
  )
}

export default Video