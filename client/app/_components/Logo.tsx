import Image from 'next/image'
import React from 'react'

const Logo = ({w, h}: {w: number, h: number}) => {
  return (
    <div>
        <Image src="/waja.png" width={w} height={h} alt='WAJA'/>
    </div>
  )
}

export default Logo