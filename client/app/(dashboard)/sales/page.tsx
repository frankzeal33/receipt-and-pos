"use client"
import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
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
import { OrderType } from '@/types/General'
import AppPagination from '@/components/AppPagination'
import { useRouter, useSearchParams } from 'next/navigation'
import displayCurrency from '@/utils/displayCurrency'
import OrderMore from './_components/OrderMore'
import { SaleStatus } from '@/components/SaleStatus'

const Page = () => {
    
    const searchParams = useSearchParams()
    const router = useRouter()

  const [loadingProducts, setLoadingProducts] = useState(true)
  const [orders, setOrders] = useState<OrderType[]>([])
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
        getOrders()

    }, [page, pageSize, pageReady, totalPages])

    const getOrders = async () => {
    
        try {
  
        setLoadingProducts(true)
        
        const response = await axiosClient.get(`/sales/get-sales?page=${page}&page_size=${pageSize}`)
        setOrders(response.data?.result || [])
        setCount(response.data?.pagination?.totalCount || 0)
  
      } catch (error: any) {
        toast.error(error.response?.data?.message);
      } finally {
        setLoadingProducts(false)
      } 
    }

  return (
    <div className='my-container'>
        <Title title='Sales' />

        <div className='bg-light p-3 rounded-xl border w-full'>
            <div className='flex items-center gap-2 mb-4'>
                <p className="text-lg font-medium leading-none">Total Sale ({count || 0})</p>
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

            {loadingProducts ? (
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
                                <TableHead className="rounded-tl-lg capitalize">Receipt No</TableHead>
                                <TableHead className='capitalize'>Customer Name</TableHead>
                                <TableHead className='capitalize'>Discount</TableHead>
                                <TableHead className='capitalize'>Tax</TableHead>
                                <TableHead className='capitalize'>Total Amount</TableHead>
                                <TableHead className="capitalize">Status</TableHead>
                                <TableHead className="capitalize">Date Added</TableHead>
                                <TableHead className="rounded-tr-lg capitalize">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        {
                            orders.length !== 0 &&
                                (
                                <TableBody>
                                    {orders.map((order, index) => (
                                    <TableRow key={order?.id}>
                                        <TableCell className={`capitalize font-semibold`}>{order?.receiptNo}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{ReduceTextLength(order?.customerName, 40)}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{displayCurrency(Number(order?.discount), "NGN")}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{displayCurrency(Number(order?.tax), "NGN")}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{displayCurrency(Number(order?.totalAmount), "NGN")}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}><SaleStatus status={order?.status}/></TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{format(new Date(order?.createdAt), "dd MMM yyyy hh:mm a")}</TableCell>
                                        <TableCell className='capitalize bg-muted/30'>
                                            <OrderMore order={order} getOrders={getOrders}/>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            )
                        }
                        
                    </Table>

                    {orders.length === 0 &&
                        <div className='flex flex-col items-center justify-center min-h-[50vh] w-full'>
                            <NotFound imageStyle='size-14' title='No sales found' desc='No sales have been added yet'/>
                        </div>
                    }

                    {
                        orders.length !== 0 && !loadingProducts &&
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