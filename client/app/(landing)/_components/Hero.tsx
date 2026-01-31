import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Hero = () => {
  return (
    <div className="mycontainer w-full">
        <div className="w-full myflex flex-col justify-center pt-4 max-w-5xl mx-auto">
            <div className="rounded-full myflex font-medium gap-1 text-sm h-auto p-2 bg-muted max-w-80">
                <div className="p-2 h-5 shrink-0 myflex text-xs justify-center text-background bg-primary rounded-full">
                Smart
                </div>
                All in One Management System
                <ChevronRight className="w-4 h-4" />
            </div>

            <div className="myflex flex-col mt-5 text-center">
                <h1 className="text-6xl font-black">
                <p>RECEIPTS, INVOICES, EXPENSES,</p>
                <p>
                    <span className="bg-gradient-to-r from-green via-green-400 to-green bg-clip-text text-transparent animate-sparkle">
                     AND POS,
                    </span>
                    {"  "}
                    Point of Sales!
                </p>
                </h1>
                <p className="block text-xl mt-3 font-medium max-w-4xl">
                    A complete solution for managing receipts, invoices, expenses, and point of sales. Designed to streamline business operations, improve accuracy, and simplify financial tracking, All in one powerful system.
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
                            Demo
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Hero