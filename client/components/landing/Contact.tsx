"use client"
import React, { useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '../ui/button'
import { contact, inquireMore } from '@/constants/data'

const Contact = () => {

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        subject: '',
        message: ''
    })

  return (
    <section className='py-16 px-24'>
        <div className='grid grid-cols-2 gap-10'>
            <div className='flex flex-col gap-6'>
                <h1 className='font-bold text-3xl'>Contact Information</h1>
                <p className='text-lg'>Have questions about RIPE? Need support or want to provide feedback? We'd love to hear from you.</p>
                <div className='grid gap-4'>
                    {contact.map(({id, title, value, icon: Icon, desc, bg, iconBg}) => (
                        <div key={id} className='flex flex-row gap-3 items-start'>
                            <span className={`size-12 flex items-center justify-center rounded-lg ${iconBg} dark:bg-muted`}>
                                <Icon className={bg} size={25} />
                            </span>
                            <div className='-mt-1'>
                                <h2 className={`font-bold text-lg`}>{title}</h2>
                                <h4 className={`text-lg ${bg}`}>{value}</h4>
                                <p>{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <form action="">
                    <Card>
                        <CardHeader>
                            <CardTitle className='font-bold text-3xl'>Send Us a Message</CardTitle>
                            <CardDescription className='text-lg'>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="fullname">Full Name</Label>
                                    <Input id="fullname" value={form.fullName} onChange={(e: any) => setForm({ ...form, fullName: e.target.value})} placeholder="John Doe"/>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value})} placeholder="john@gmail.com"/>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" value={form.subject} onChange={(e: any) => setForm({ ...form, subject: e.target.value})} placeholder="How can we help you?"/>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="message" className='text-accent-foreground'>Message</Label>
                                    <Textarea value={form.message} onChange={(e: any) => setForm({ ...form, message: e.target.value})} placeholder="Tell us more..." className='resize-none h-20 scrollbar-rounded' />
                                </div>
                                <div>
                                    <Button variant="primary">Send Message</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
        <div className='grid grid-cols-3 gap-8 pt-12'>
            {inquireMore.map(({id, title, icon: Icon, desc, bg, iconBg}) => (
                <div key={id} className={`p-6 rounded-lg text-center grid gap-2 ${bg} dark:bg-muted`}>
                    <span className={`size-12 flex mx-auto items-center justify-center rounded-lg ${iconBg}`}>
                        <Icon className="text-white" size={25} />
                    </span>
                    <h2 className='font-bold text-center text-xl'>{title}</h2>
                    <p className='text-center'>{desc}</p>
                </div>
            ))}
        </div>
    </section>
  )
}

export default Contact