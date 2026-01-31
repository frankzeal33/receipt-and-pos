import React from 'react'
import { SectionHeader } from './SectionHeader'
import { Calculator } from 'lucide-react'
import { whyChoose } from '@/constants/data'

const WhyChoose = () => {
  return (
    <section className='mycontainer'>
        <SectionHeader badge="RIPE" title='Why Choose RIPE?' desc='Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sequi et hic sed ex quis nemo eum, numquam consequatur recusandae iste praesentium ratione sapiente aliquid dolore! Minima, incidunt. Asperiores, ducimus magni? Beatae at corrupti magni officiis iste incidunt, quis ratione quo harum et natus! Expedita voluptas repudiandae incidunt tempora dolores voluptate.'/>
        <div className='grid grid-cols-3 gap-8'>
            {whyChoose.map(({ id, icon: Icon, title, desc, bg, iconBg }) => (
                <div key={id}  className={`p-8 rounded-xl grid gap-3 dark:bg-muted ${bg}`}>
                    <span className={`size-12 flex items-center justify-center rounded-lg ${iconBg}`}>
                        <Icon color='white' />
                    </span>
                    <h2 className='font-bold text-2xl'>{title}</h2>
                    <p>{desc}</p>
                </div>
            ))}
        </div>
    </section>
  )
}

export default WhyChoose