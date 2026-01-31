import Banner from '../_components/Banner'
import About from '@/components/landing/About'

const page = () => {
  return (
    <section className='min-h-[85vh]'>
      <Banner title='About RIPE' desc='Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis, quis.'/>
      <About/>
    </section>
  )
}

export default page