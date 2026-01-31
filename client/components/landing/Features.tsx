import GridHead from './GridHead';
import Card from './Card';
import { Gem } from 'lucide-react';
import { features } from '@/constants/data';

const Features = () => {
  return (
    <section className="mycontainer w-full py-20 bg-green-100 dark:bg-background">
        <div className="grid grid-cols-[40%_54%] items-center gap-[6%]">
            <div>
                <div className='rounded-xl overflow-hidden'>
                    <img src="/feature.jpg" className='w-full'/>
                </div>
            </div>
            <div>
                <GridHead icon={<Gem size={25} />} title="Features"/>
                <p className='text-lg mb-12'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos reiciendis vitae neque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Magnam ratione alias cum rerum saepe magni vitae aliquam placeat enim aut?</p>
                <div className="grid grid-cols-2 gap-10">
                    {
                        features.map(({id, icon: Icon, title, desc}) => {
                            return (
                                <Card className="rounded-[0_3rem_0_3rem] relative border border-green px-6 pb-6 pt-10" key={id}>
                                    <span className="absolute -top-6 left-6 bg-green size-12 rounded-md flex items-center justify-center"><Icon size={25} className='text-white' /></span>
                                    <h4 className='text-xl font-bold'>{title}</h4>
                                    <small className='text-base'>{desc}</small>
                                </Card>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    </section>
  );
}

export default Features;