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
import AddProduct from './_components/AddProduct'
import { ProductType } from '@/types/General'
import ProductMore from './_components/ProductMore'
import AppPagination from '@/components/AppPagination'
import { useRouter, useSearchParams } from 'next/navigation'

const Page = () => {
    
    const searchParams = useSearchParams()
    const router = useRouter()

  const [loadingProducts, setLoadingProducts] = useState(true)
  const [products, setProducts] = useState<ProductType[]>([])
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
        getProducts()

    }, [page, pageSize, pageReady, totalPages])

    const getProducts = async () => {
    
        try {
  
        setLoadingProducts(true)
        
        const response = await axiosClient.get(`/sales/get-products?page=${page}&page_size=${pageSize}`)
        setProducts(response.data?.result || [])
        setCount(response.data?.pagination?.totalCount || 0)
  
      } catch (error: any) {
        toast.error(error.response?.data?.message);
      } finally {
        setLoadingProducts(false)
      } 
    }
  


  return (
    <div className='my-container'>
        <Title title='Products'>
            <AddProduct getProducts={getProducts}/>
        </Title>

        <div className='bg-light p-3 rounded-xl border w-full'>
            <div className='flex items-center gap-2 mb-4'>
                <p className="text-lg font-medium leading-none">Total Product ({count || 0})</p>
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
                            <TableHead className="rounded-tl-lg capitalize">Product Name</TableHead>
                            <TableHead className='capitalize'>Desc</TableHead>
                            <TableHead className='capitalize'>Price</TableHead>
                            <TableHead className='capitalize'>Qty</TableHead>
                            <TableHead className='capitalize'>Category</TableHead>
                            <TableHead className="capitalize">Brand</TableHead>
                            <TableHead className="rounded-tr-lg capitalize">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        {
                            products.length !== 0 &&
                                (
                                <TableBody>
                                    {products.map((product, index) => (
                                    <TableRow key={product?.id}>
                                        <TableCell className={`capitalize font-semibold`}>{ReduceTextLength(product?.productName, 30)}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{ReduceTextLength(product?.productDesc, 40)}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{ReduceTextLength(product?.price, 20)}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{ReduceTextLength(product?.quantity.toString(), 20)}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{ReduceTextLength(product?.category, 20)}</TableCell>
                                        <TableCell className={`capitalize font-semibold`}>{ReduceTextLength(product?.brand, 20)}</TableCell>
                                        <TableCell className='capitalize bg-muted/30'>
                                            <ProductMore product={product} getProducts={getProducts}/>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            )
                        }
                        
                    </Table>

                    {products.length === 0 &&
                        <div className='flex flex-col items-center justify-center min-h-[50vh] w-full'>
                            <NotFound imageStyle='size-14' title='No products found' desc='No product have been added yet'/>
                        </div>
                    }

                    {
                        products.length !== 0 && !loadingProducts &&
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