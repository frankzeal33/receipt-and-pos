import React from 'react'

const TableSkeleton = () => {

    const arrayList = new Array(6).fill(null)

  return (
    <div className='flex gap-3 w-full'>
        <p className='font-medium p-1 bg-muted w-full animate-pulse rounded-md'></p>
        <p className='line-through p-1 bg-muted w-full animate-pulse rounded-md'></p>
        <p className='line-through p-1 bg-muted w-full animate-pulse rounded-md'></p>
        <p className='line-through p-1 bg-muted w-full animate-pulse rounded-md'></p>
        <p className='line-through p-1 bg-muted w-full animate-pulse rounded-md'></p>
    </div>
  )
}

export default TableSkeleton