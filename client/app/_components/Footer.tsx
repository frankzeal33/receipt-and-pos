import React from 'react'
import Logo from './Logo'
import Link from 'next/link'
import { aboutCompany, explore, quickLinks } from '@/constants/data'
import { Newsletter } from './Newsletter'
import { Facebook, Instagram, Twitter } from 'lucide-react'

const Footer = () => {
  return (
    <footer>
        <div className='mycontainer border-t grid md:grid-cols-2 lg:grid-cols-5 gap-8 py-20'>
            <div className='col-span-2'>
                <Link href="/">
                    <div>
                        <Logo w={150} h={50}/>
                    </div>
                </Link>
                <h3 className='font-bold mt-2'>Subscribe to our newsletter</h3>
                <p className='pb-4'>Stay updated on new releases and features, guides, and case studies and many more.</p>
                <Newsletter/>
                <div className='myflex gap-3'>
                    <Link href={"/"}>
                        <Facebook/>
                    </Link>
                    <Link href={"/"}>
                        <Twitter/>
                    </Link>
                    <Link href={"/"}>
                        <Instagram/>
                    </Link>
                </div>
            </div>
            <div>
                <nav>
                    <h3 className='font-bold mb-4'>Quick Links</h3>
                    <ul className='flex flex-col space-y-2'>
                        {quickLinks.map((item, index) => (
                            <Link key={index} href={item.link}><li>{item.label}</li></Link>
                        ))}
                    </ul>
                </nav>
            </div>
            <div>
                <nav>
                    <h3 className='font-bold mb-4'>About Us</h3>
                    <ul className='flex flex-col space-y-2'>
                        {aboutCompany.map((item, index) => (
                            <Link key={index} href={item.link}><li>{item.label}</li></Link>
                        ))}
                    </ul>
                </nav>
            </div>
            <div>
                <nav>
                    <h3 className='font-bold mb-4'>Explore</h3>
                    <ul className='flex flex-col space-y-2'>
                        {explore.map((item, index) => (
                            <Link key={index} href={item.link}><li>{item.label}</li></Link>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
        <p className='text-center font-semibold bg-[#09090b] dark:border-t px-[1rem] py-2 text-white'>&copy; {new Date().getFullYear()}, Built by <Link className='text-green' href={"/"}>Zeal Tech Sprint,</Link> All Right Reserved.</p>
    </footer>
  )
}

export default Footer