import React from 'react'

const Banner = ({title, desc}: {title: string, desc: string}) => {
  return (
    <section className='p-8 min-h-56 text-center flex flex-col gap-2 items-center justify-center bg-green-100 dark:bg-muted'>
      <h1 className='font-bold text-5xl text-center'>{title}</h1>
      <p className='text-xl text-center'>{desc}</p>
    </section>
  )
}

export default Banner