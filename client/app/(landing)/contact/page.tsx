import Banner from '../_components/Banner'
import Contact from '@/components/landing/Contact'

const page = () => {
  return (
    <section className='min-h-[85vh]'>
      <Banner title='Get in Touch' desc='Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis, quis.'/>
      <Contact/>
    </section>
  )
}

export default page