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
import ReduceTextLength from '@/utils/ReduceTextLength'
import Title from '@/components/Title'
import { SearchInput } from '@/components/SearchInput'
import TableSkeleton from '@/components/TableSkeleton'
import NotFound from '@/components/NotFound'
import AppPagination from '@/components/AppPagination'
import { useRouter, useSearchParams } from 'next/navigation'
import AddStaff from './_components/AddExpense'
import { expenseType } from '@/types/General'
import StaffMore from './_components/ExpenseMore'
import { formatEnums } from '@/utils/formatEnums'
import displayCurrency from '@/utils/displayCurrency'
import ExpenseMore from './_components/ExpenseMore'

const Page = () => {
    
  const searchParams = useSearchParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState<expenseType[]>([])
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
        getExpenses()

    }, [page, pageSize, pageReady, totalPages])

    const getExpenses = async () => {
    
        try {
  
        setLoading(true)
        
        const response = await axiosClient.get(`/staffs/get-expenses?page=${page}&page_size=${pageSize}`)
        setExpenses(response.data?.result || [])
        setCount(response.data?.pagination?.totalCount || 0)
  
      } catch (error: any) {
        toast.error(error.response?.data?.message);
      } finally {
        setLoading(false)
      } 
    }
  


  return (
    <div className='my-container'>
        <Title title='Expenses'>
          <AddStaff getProducts={getExpenses}/>
        </Title>

        <div className='bg-light p-3 rounded-xl border w-full'>
            <div className='flex items-center gap-2 mb-4'>
                <p className="text-lg font-medium leading-none">Total ({count || 0})</p>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 w-full my-6">
                <SearchInput
                    placeholder="Search Expenses..."
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

            {loading ? (
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
                            <TableHead className="rounded-tl-lg capitalize">Title</TableHead>
                            <TableHead className='capitalize'>Desc</TableHead>
                            <TableHead className='capitalize'>Category</TableHead>
                            <TableHead className='capitalize'>Amount</TableHead>
                            <TableHead className='capitalize'>Payment Type</TableHead>
                            <TableHead className="rounded-tr-lg capitalize">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        {
                            expenses.length !== 0 &&
                                (
                                <TableBody>
                                    {expenses.map((expenses, index) => (
                                    <TableRow key={expenses?.id}>
                                        <TableCell className={`capitalize font-semibold`}>{ReduceTextLength(expenses?.title, 30)}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{ReduceTextLength(expenses?.description as string, 40) || "-----"}</TableCell>
                                        <TableCell className={`font-semibold`}>{formatEnums(expenses?.category)}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{displayCurrency(Number(expenses?.amount), "NGN")}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{formatEnums(expenses?.paymentType)}</TableCell>
                                        <TableCell className='capitalize bg-muted/30'>
                                          <ExpenseMore expense={expenses} getExpenses={getExpenses}/>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            )
                        }
                        
                    </Table>

                    {expenses.length === 0 &&
                        <div className='flex flex-col items-center justify-center min-h-[50vh] w-full'>
                            <NotFound imageStyle='size-14' title='No expenses found' desc='No expense have been added yet'/>
                        </div>
                    }

                    {
                        expenses.length !== 0 && !loading &&
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