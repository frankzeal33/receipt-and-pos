import React from 'react'

const DashboardSkeleton = () => {
  return (
    <div>
        <div className='flex gap-4 w-full'>
            <p className='font-medium h-[20vh] bg-muted w-full animate-pulse rounded-lg'></p>
            <p className='line-through h-[20vh] bg-muted w-full animate-pulse rounded-lg'></p>
            <p className='line-through h-[20vh] bg-muted w-full animate-pulse rounded-lg'></p>
        </div>
        <div className='mt-4'>
            <p className='font-medium h-[60vh] bg-muted w-full animate-pulse rounded-lg'></p>
        </div>
    </div>
  )
}

export default DashboardSkeleton