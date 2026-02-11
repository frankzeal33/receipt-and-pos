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
import AppPagination from '@/components/AppPagination'
import { useRouter, useSearchParams } from 'next/navigation'
import AddStaff from './_components/AddStaff'
import { StaffType } from '@/types/General'
import StaffMore from './_components/StaffMore'
import { formatEnums } from '@/utils/formatEnums'
import { ActiveStatus } from '@/components/ActiveStatus'

const Page = () => {
    
    const searchParams = useSearchParams()
    const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [staffs, setStaffs] = useState<StaffType[]>([])
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
        getStaffs()

    }, [page, pageSize, pageReady, totalPages])

    const getStaffs = async () => {
    
        try {
  
        setLoading(true)
        
        const response = await axiosClient.get(`/staffs/get-staffs?page=${page}&page_size=${pageSize}`)
        setStaffs(response.data?.result || [])
        setCount(response.data?.pagination?.totalCount || 0)
  
      } catch (error: any) {
        toast.error(error.response?.data?.message);
      } finally {
        setLoading(false)
      } 
    }
  


  return (
    <div className='my-container'>
        <Title title='Staffs'>
            <AddStaff getProducts={getStaffs}/>
        </Title>

        <div className='bg-light p-3 rounded-xl border w-full'>
            <div className='flex items-center gap-2 mb-4'>
                <p className="text-lg font-medium leading-none">Total Product ({count || 0})</p>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 w-full my-6">
                <SearchInput
                    placeholder="Search Staffs..."
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
                            <TableHead className="rounded-tl-lg capitalize">First Name</TableHead>
                            <TableHead className='capitalize'>Last Name</TableHead>
                            <TableHead className='capitalize'>Email</TableHead>
                            <TableHead className='capitalize'>Role</TableHead>
                            <TableHead className='capitalize'>Status</TableHead>
                            <TableHead className="rounded-tr-lg capitalize">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        {
                            staffs.length !== 0 &&
                                (
                                <TableBody>
                                    {staffs.map((staff, index) => (
                                    <TableRow key={staff?.id}>
                                        <TableCell className={`capitalize font-semibold`}>{ReduceTextLength(staff?.firstName, 30)}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{ReduceTextLength(staff?.lastName, 40)}</TableCell>
                                        <TableCell className={`font-semibold`}>{ReduceTextLength(staff?.email, 40)}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{formatEnums(staff?.role)}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{<ActiveStatus status={staff?.status}/>}</TableCell>
                                        <TableCell className='capitalize bg-muted/30'>
                                            <StaffMore staff={staff} getStaffs={getStaffs}/>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            )
                        }
                        
                    </Table>

                    {staffs.length === 0 &&
                        <div className='flex flex-col items-center justify-center min-h-[50vh] w-full'>
                            <NotFound imageStyle='size-14' title='No staffs found' desc='No staff have been added yet'/>
                        </div>
                    }

                    {
                        staffs.length !== 0 && !loading &&
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