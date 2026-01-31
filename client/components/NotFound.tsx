import Image from 'next/image'
import React from 'react'
import { Button } from './ui/button'

type EmptyProps ={
    image?: string 
    title: string; 
    desc: string;
    imageStyle?: string;
    showButton?: boolean; 
    otherStyles?: string;
    buttonTitle?: string;
    handleClick?: () => void
}

const NotFound = ({image, title, desc, showButton, buttonTitle, imageStyle, otherStyles, handleClick}: EmptyProps) => {
  return (
    <div className={`flex flex-col gap-1 items-center justify-center max-w-96 text-center ${otherStyles}`}>
      <Image src={image ? image : '/empty.png'} alt="" width={100} height={100} className={`${imageStyle}`}/>
      <h1 className='text-lg font-semibold'>{title}</h1>
      <p className='text-muted-foreground text-sm'>{desc}</p>
      {showButton && 
          <Button onClick={handleClick}>{buttonTitle}</Button>
      }
    </div>
  )
}

export default NotFound