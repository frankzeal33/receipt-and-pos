import { Button } from '@/components/ui/button'
import { ChevronRight, Video } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Hero = () => {
  return (
    <div className=" w-full min-h-screen">
        <div className="w-full myflex flex-col justify-center py-8 max-w-5xl mx-auto">
            <div className="rounded-full myflex font-medium gap-1 text-sm h-auto p-2 bg-muted max-w-80">
                <div className="p-2 h-5 shrink-0 myflex text-xs justify-center text-background bg-primary rounded-full">
                New
                </div>
                Get Well Prepared For These Exams
                <ChevronRight className="w-4 h-4" />
            </div>

            <div className="myflex flex-col mt-5 text-center">
                <h1 className="text-6xl font-black">
                <p>WAEC , JAMB, NECO, GCE, IELTS</p>
                <p>
                    <span className="bg-gradient-to-r from-green via-green-400 to-green bg-clip-text text-transparent animate-sparkle">
                    Past Questions,
                    </span>
                    {"  "}
                    Test and Learning!
                </p>
                </h1>
                <p className="block text-xl mt-3 font-medium max-w-4xl">
                    Thoughtfully compiled to aid your preparation and enhance your understanding of the subjects. This resource is designed to familiarize you with the structure, style, and scope of questions typically asked in examinations, providing valuable practice and insight into key topics.
                </p>
                <br />
                <div className="flex items-center gap-2">
                    <Link href={'/register'}>
                        <Button className="h-12 text-base font-medium min-w-32" variant="primary">
                        Get Started
                        </Button>
                    </Link>
                    <Link href={'/register'}>
                        <Button className="h-12 border-primary text-primary text-base font-medium min-w-32" variant="outline">
                        CBT
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
        <div className="w-full relative max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-full h-[400px] bg-gradient-to-r from-primary to-green-600 rounded-full blur-3xl opacity-40 z-0" />
            <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-xl shadow-lg bg-background">
                <div className="relative w-full h-full rounded-md">
                    <Image src="/dashboard.png" alt="Resume Dashboard" width={1500} height={1500} className="object-contain w-full h-full rounded-md"/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Hero