import Image from 'next/image'
import React from 'react'

const Logo = ({w, h}: {w: number, h: number}) => {
  return (
    <div className='flex items-center justify-start gap-1'>
      <Image src="/logo.png" width={w} height={h} alt='RIPE'/>
      <span className='font-extrabold font-mono text-3xl'>RI<span className='text-green'>PE</span></span>
    </div>
  )
}

export default Logo