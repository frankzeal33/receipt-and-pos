"use client"
import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { axiosClient } from '@/GlobalApi'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ReduceTextLength from '@/utils/ReduceTextLength'
import Title from '@/components/Title'
import { SearchInput } from '@/components/SearchInput'
import TableSkeleton from '@/components/TableSkeleton'
import NotFound from '@/components/NotFound'
import { InvoiceType } from '@/types/General'
import AppPagination from '@/components/AppPagination'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link';
import displayCurrency from '@/utils/displayCurrency'
import { formatEnums } from '@/utils/formatEnums'
import { InvoiceStatus } from '@/components/InvoiceStatus'
import InvoiceMore from './_components/InvoiceMore'

const Page = () => {
    
    const searchParams = useSearchParams()
    const router = useRouter()

  const [loadingInvoices, setLoadingInvoices] = useState(true)
  const [invoices, setInvoices] = useState<InvoiceType[]>([])
  const [count, setCount] = useState(0)
   const tableList = new Array(8).fill(null)
    
    const initialPage = Number(searchParams.get("page")) || 1;
    const [page, setPage] = useState(initialPage)
    const [pageSize, setPageSize] = useState(10)
    const totalPages = Math.ceil(count / pageSize)
    const [pageReady, setPageReady] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search) // safer
        if (page > 1) {
            params.set("page", page.toString())
        } else {
            params.delete("page")
        }
        router.replace(`?${params.toString()}`)
        setPageReady(true)
    }, [page, router])
    
    useEffect(() => {
        if (!pageReady) return

        // clamp invalid pages BEFORE fetching
        if (page < 1) {
            setPage(1)
            return
        }

        if (totalPages > 0 && page > totalPages) {
            setPage(totalPages)
            toast.error(`Page ${page} does not exist. Showing page ${totalPages} instead.`)
            return
        }

        // only fetch if page is valid
        getInvoices()

    }, [page, pageSize, pageReady, totalPages])

    const getInvoices = async () => {
    
        try {
  
        setLoadingInvoices(true)
        
        const response = await axiosClient.get(`/staffs/get-invoices?page=${page}&page_size=${pageSize}`)
        setInvoices(response.data?.result || [])
        setCount(response.data?.pagination?.totalCount || 0)
  
      } catch (error: any) {
        toast.error(error.response?.data?.message);
      } finally {
        setLoadingInvoices(false)
      } 
    }

  return (
    <div className='my-container'>
        <Title title='Invoices'>
            <Link href="/invoices/add" passHref>
                <Button variant="primary">Add Invoice</Button>
            </Link>
        </Title>

        <div className='bg-light p-3 rounded-xl border w-full'>
            <div className='flex items-center gap-2 mb-4'>
                <p className="text-lg font-medium leading-none">Total Invoice ({count || 0})</p>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 w-full my-6">
                <SearchInput
                    placeholder="Search Products..."
                    className='w-full lg:w-96'
                />

                <div className='flex flex-row gap-2'>
                    <Select>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                            <SelectLabel>Fruits</SelectLabel>
                            <SelectItem value="apple">Apple</SelectItem>
                            <SelectItem value="banana">Banana</SelectItem>
                            <SelectItem value="blueberry">Blueberry</SelectItem>
                            <SelectItem value="grapes">Grapes</SelectItem>
                            <SelectItem value="pineapple">Pineapple</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    
                    <Select>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All Brands" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                            <SelectLabel>Fruits</SelectLabel>
                            <SelectItem value="apple">Apple</SelectItem>
                            <SelectItem value="banana">Banana</SelectItem>
                            <SelectItem value="blueberry">Blueberry</SelectItem>
                            <SelectItem value="grapes">Grapes</SelectItem>
                            <SelectItem value="pineapple">Pineapple</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loadingInvoices ? (
                <div className="mt-8">
                    <div className='w-full h-[58vh] bg-light rounded-sm flex'>
                        <div className='grid w-full gap-2'>
                            {tableList.map((_, index) => (
                                <TableSkeleton key={index}/>
                            ))}
                        </div>
                    </div>
                </div> 
            ) : (
                <div className="w-full min-h-[58vh] flex flex-col items-center justify-between overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted">
                            <TableHead className="rounded-tl-lg capitalize">Invoice No</TableHead>
                            <TableHead className='capitalize'>Client Name</TableHead>
                            <TableHead className='capitalize'>Total Amount</TableHead>
                            <TableHead className='capitalize'>Due Date</TableHead>
                            <TableHead className='capitalize'>Status</TableHead>
                            <TableHead className="rounded-tr-lg capitalize">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        {
                            invoices.length !== 0 &&
                                (
                                <TableBody>
                                    {invoices.map((invoice, index) => (
                                    <TableRow key={invoice?.id}>
                                        <TableCell className={`capitalize font-semibold`}>{invoice?.invoiceNumber}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{ReduceTextLength(invoice?.customerName, 40)}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{displayCurrency(Number(invoice?.totalAmount))}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{format(new Date(invoice?.dueDate), "MMM dd, yyyy")}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}><InvoiceStatus status={invoice?.status}/></TableCell>
                                        <TableCell className='capitalize bg-muted/30'>
                                            <InvoiceMore invoice={invoice} getInvoices={getInvoices}/>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            )
                        }
                        
                    </Table>

                    {invoices.length === 0 &&
                        <div className='flex flex-col items-center justify-center min-h-[50vh] w-full'>
                            <NotFound imageStyle='size-14' title='No invoices found' desc='No invoices have been added yet'/>
                        </div>
                    }

                    {
                        invoices.length !== 0 && !loadingInvoices &&
                        (
                            <div className='flex gap-2 items-center justify-between w-full my-10 mb-2'>
                                
                                <div className='flex items-center mx-auto justify-between'>
                                    {/* Your list of products */}
                                    <AppPagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={(p) => setPage(p)}
                                    />
                                </div>

                            </div>
                        )
                    }
                </div>
            )}
        </div>
       
    </div>
  )
}

export default Page