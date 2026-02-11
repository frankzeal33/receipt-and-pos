const PricingSkeleton = () => {

  return (
    <div className='flex gap-4 w-full'>
        <p className='font-medium h-[80vh] bg-muted w-full animate-pulse rounded-lg'></p>
        <p className='line-through h-[80vh] bg-muted w-full animate-pulse rounded-lg'></p>
        <p className='line-through h-[80vh] bg-muted w-full animate-pulse rounded-lg'></p>
        <p className='line-through h-[80vh] bg-muted w-full animate-pulse rounded-lg'></p>
    </div>
  )
}

export default PricingSkeleton