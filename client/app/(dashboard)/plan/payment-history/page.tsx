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
import Title from '@/components/Title'
import { SearchInput } from '@/components/SearchInput'
import TableSkeleton from '@/components/TableSkeleton'
import NotFound from '@/components/NotFound'
import { HistoryType } from '@/types/General'
import AppPagination from '@/components/AppPagination'
import { useRouter, useSearchParams } from 'next/navigation'
import displayCurrency from '@/utils/displayCurrency'
import HistoryMore from './_components/HistoryMore'
import { formatEnums } from '@/utils/formatEnums'
import { PaymentStatus } from '@/components/PaymentStatus'

const Page = () => {
    
  const searchParams = useSearchParams()
  const router = useRouter()

  const [loadingHistory, setLoadingHistory] = useState(true)
  const [histories, setHistories] = useState<HistoryType[]>([])
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
        getHistories()

    }, [page, pageSize, pageReady, totalPages])

    const getHistories = async () => {
    
        try {
  
        setLoadingHistory(true)
        
        const response = await axiosClient.get(`/payment/payment-history?status=SUCCESSFUL&page=${page}&page_size=${pageSize}`)
        setHistories(response.data?.result || [])
        setCount(response.data?.pagination?.totalCount || 0)
  
      } catch (error: any) {
        toast.error(error.response?.data?.message);
      } finally {
        setLoadingHistory(false)
      } 
    }

  return (
    <div className='my-container'>
        <Title title='Payment History'/>

        <div className='bg-light p-3 rounded-xl border w-full'>
            <div className='flex items-center gap-2 mb-4'>
                <p className="text-lg font-medium leading-none">Total History ({count || 0})</p>
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

            {loadingHistory ? (
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
                          <TableHead className="rounded-tl-lg capitalize">Payment Reference</TableHead>
                          <TableHead className='capitalize'>Plan</TableHead>
                          <TableHead className='capitalize'>Billing</TableHead>
                          <TableHead className='capitalize'>Channel</TableHead>
                          <TableHead className='capitalize'>Amount</TableHead>
                          <TableHead className='capitalize'>Payment Status</TableHead>
                          <TableHead className="capitalize">Date Added</TableHead>
                          <TableHead className="rounded-tr-lg capitalize">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        {
                            history.length !== 0 &&
                                (
                                <TableBody>
                                    {histories.map((history, index) => (
                                    <TableRow key={history?.id}>
                                        <TableCell className={`capitalize font-semibold`}>{history?.reference}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{formatEnums(history?.plan)}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{formatEnums(history?.billing)}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{history?.channel}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{displayCurrency(Number(history?.amount), "NGN")}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}><PaymentStatus status={history?.status}/></TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{format(new Date(history?.createdAt), "dd MMM yyyy hh:mm a")}</TableCell>
                                        <TableCell className='capitalize bg-muted/30'>
                                            <HistoryMore history={history} getHistories={getHistories}/>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            )
                        }
                        
                    </Table>

                    {histories.length === 0 &&
                        <div className='flex flex-col items-center justify-center min-h-[50vh] w-full'>
                            <NotFound imageStyle='size-14' title='No payments found' desc='No payment have been added yet'/>
                        </div>
                    }

                    {
                        histories.length !== 0 && !loadingHistory &&
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