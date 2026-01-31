import React, { ReactElement } from 'react'

const Title = ({title, children}: {title: string; children?: ReactElement}) => {
  return (
    <div className='w-full mb-4 flex flex-col md:flex-row md:items-end gap-4 justify-between'>
        <div>
          <h1 className='text-2xl font-semibold'>{title}</h1>
        </div>
        <div>
          {children}
        </div>
    </div>
  )
}

export default Title