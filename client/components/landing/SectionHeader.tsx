import React from 'react'

export const SectionHeader = ({badge, title, desc}: {badge: string, title: string, desc: string}) => {
  return (
    <div className='mb-10 mx-auto max-w-5xl'>
      <div className='grid gap-2 text-center'>
        <h3 className='px-4 py-1 rounded-full mx-auto font-bold bg-green-100 text-green w-fit'>{badge}</h3>
        <h1 className='text-center text-4xl font-black'>{title}</h1>
        <p className='text-center font-medium text-lg'>{desc}</p>
      </div>
    </div>
  )
}
