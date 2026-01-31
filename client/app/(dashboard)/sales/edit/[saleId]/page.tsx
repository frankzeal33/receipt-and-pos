"use client"
import { SearchInput } from '@/components/SearchInput'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CustomersDropdown } from '@/components/CustomersDropdown'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Barcode, ChevronLeft, ChevronRight, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import displayCurrency from '@/utils/displayCurrency'
import { PaymentDialog } from '@/components/dialogs/PaymentDialog'
import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { CartItemType, ProductType } from '@/types/General'
import { axiosClient } from '@/GlobalApi'
import { toast } from 'react-toastify'
import SkeletonFull from '@/components/SkeletonFull'
import { CardBox } from '@/components/CardBox'
import { useParams } from 'next/navigation'
import { EditPaymentDialog } from '@/components/dialogs/EditPaymentDialog'

const page = () => {

  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [count, setCount] = useState(0)
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSale, setLoadingSale] = useState(true);
  const list = new Array(3).fill(null)
  const [discount, setDiscount] = useState("");
  const [tax, setTax] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState({
    customerName: "", 
    customerId: "", 
    customerIdentifier: ""
  })

  const { saleId } = useParams<{ saleId: string }>()

  useEffect(() => {
    if (!saleId) return
    getSale()
  }, [saleId])

  const getSale = async () => {
    try {
      
      setLoadingSale(true)
      
      const response = await axiosClient.get(`/sales/get-sale/${saleId}`)
     
      const saleItems = response.data?.result?.saleItems || []

      const transformedCart = saleItems.map((item: any) => ({
        id: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      }))

      setCart(transformedCart)

    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoadingSale(false)
    }
  }

  // Add product or increase quantity
  const handleAddToCart = (product: ProductType) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Increase quantity
  const handleIncrease = (id: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrease quantity but never below 1
  const handleDecrease = (id: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
          : item
      )
    );
  };

  // Remove item directly
  const handleRemove = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear entire cart
  const handleClear = () => {
    setCart([]);
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.price) * (item.quantity === 0 ? 1 : item.quantity),
    0
  );

  const discountAmount = (subtotal * Number(discount)) / 100;
  const taxAmount = (subtotal * Number(tax)) / 100;
  const total = subtotal + taxAmount - discountAmount;

  useEffect(() => {
    getProducts()
  }, [])

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
    <div>
      <div className="grid grid-cols-[2fr_1fr] gap-4 w-full">
        <div className="rounded-lg bg-sidebar p-1 flex flex-col h-[calc(100vh-80px)] overflow-hidden">
          <div className="w-full flex flex-row justify-between items-center gap-2 pb-1">
            <div className='w-full flex flex-row gap-1'>
              <CustomersDropdown/>
              <div>
                <Button variant="outline" size="icon" className="size-9">
                  <Plus />
                </Button>
              </div>
            </div>
            <div className='flex flex-row items-center gap-1'>
              <Button variant="outline" size="sm">
                Held (20)
              </Button>
              <Button variant="primary" size="sm">
                <Barcode /> Scan
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-background rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              {cart.length !== 0 && (
                 <TableBody>
                  {cart.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDecrease(item.id)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            -
                          </button>

                          <Input
                            type="number"
                            min="1"
                            value={item.quantity === 0 ? "" : item.quantity}
                            onChange={(e) => {
                              const val = e.target.value;

                              // allow empty input while typing
                              if (val === "") {
                                setCart((prev) =>
                                  prev.map((i) =>
                                    i.id === item.id ? { ...i, quantity: 0 } : i
                                  )
                                );
                                return;
                              }

                              const newQty = Number(val);
                              setCart((prev) =>
                                prev.map((i) =>
                                  i.id === item.id
                                    ? { ...i, quantity: newQty > 0 ? newQty : 1 }
                                    : i
                                )
                              );
                            }}
                            onBlur={() => {
                              // if left empty, reset to 1
                              setCart((prev) =>
                                prev.map((i) =>
                                  i.id === item.id
                                    ? { ...i, quantity: i.quantity > 0 ? i.quantity : 1 }
                                    : i
                                )
                              );
                            }}
                            className="w-14 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />

                          <button
                            onClick={() => handleIncrease(item.id)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>{displayCurrency(Number(item.price), "NGN")}</TableCell>
                      <TableCell>{displayCurrency(Number((Number(item.price) * (item.quantity === 0 ? 1 : item.quantity))), "NGN")}</TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => handleRemove(item.id)}
                          className='p-1'
                        >
                          <Trash2 size={18} className="text-red-500 hover:text-red-600"/>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
            </Table>
             {cart.length === 0 && (
                <div className='flex flex-col items-center justify-center w-full h-[calc(100%-50px)]'>
                  <div className={`flex flex-col items-center justify-center max-w-96 text-center`}>
                    <ShoppingCart size={30} className='text-muted-foreground'/>
                    <h1 className='text-base font-semibold text-muted-foreground'>Cart is empty</h1>
                    <p className='text-muted-foreground text-sm'>Add/Search a product to start an order</p>
                  </div>
                </div>
              )
            }
          </div>
          
           {cart.length !== 0 && (
            <div className="w-full bg-sidebar pt-4 flex flex-col gap-2">
              <div className='w-full flex flex-row gap-4 items-end justify-between'>
                <div className='flex flex-col gap-2'>
                  <div className='flex flex-row items-center gap-1'>
                    <ShoppingCart size={16}/>
                    <h2 className='leading-none text-base'>({cart.length} items)</h2>
                  </div>
                  <div className='gap-1 flex flex-row'>
                    <Input type="number" placeholder="0.0" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                    <div className='flex flex-col gap-1'>
                      <h2 className='leading-none'>Discount (%)</h2>
                      <p className='text-[10px] leading-none'>In Percentage</p>
                    </div>
                  </div>
                  <div className='gap-1 flex flex-row'>
                    <Input type="number" placeholder="0.0" value={tax} onChange={(e) => setTax(e.target.value)} className="w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                    <div className='flex flex-col gap-1'>
                      <h2 className='leading-none'>Tax (%)</h2>
                      <p className='text-[10px] leading-none'>In Percentage</p>
                    </div>        
                  </div>
                </div>
                <div className='flex flex-col gap-2 items-end'>
                  <div className='flex flex-row gap-6 px-4 items-end'>
                    <div className='flex flex-col gap-2 items-end'>
                      <div className='flex flex-col gap-1 items-end'>
                        <p className='text-xs leading-none'>Sub Total</p>
                        <h2 className='leading-none text-lg font-semibold'>{displayCurrency(Number(subtotal.toFixed(2)), "NGN")}</h2>
                      </div>
                      <div className='flex flex-col gap-1 items-end'>
                        <p className='text-xs leading-none'>Tax</p>
                        <h2 className='leading-none text-lg font-semibold'>{displayCurrency(taxAmount, "NGN")}</h2>
                      </div>
                    </div>
                    <div className='flex flex-col gap-2 items-end'>
                      <div className='flex flex-col gap-1 items-end'>
                        <p className='text-xs leading-none'>Discount</p>
                        <h2 className='leading-none text-lg font-semibold text-red-600'>-{displayCurrency(discountAmount, "NGN")}</h2>
                      </div>
                      <div className='flex flex-col gap-1 items-end'>
                        <p className='text-xs leading-none'>Total</p>
                        <h2 className='leading-none text-lg font-semibold text-green'>{displayCurrency(total, "NGN")}</h2>
                      </div>
                    </div>
                  </div>
                  <div className='flex flex-row gap-1 items-center'>
                    <Button onClick={handleClear} type="button" className="bg-red-600" >
                      Clear
                    </Button>
                    <Button variant="outline">
                      Hold
                    </Button>
                    <EditPaymentDialog
                      saleId={saleId}
                      total={total}
                      cart={cart}
                      discount={discount}
                      taxRate={tax}
                      customer={{
                        customerId: selectedCustomer?.customerId,
                        customerName: selectedCustomer?.customerName,
                        customerIdentifier: selectedCustomer?.customerIdentifier,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
           )}
        </div>
        <div className="rounded-lg bg-sidebar p-1 flex flex-col h-[calc(100vh-80px)] overflow-hidden">
          <div className="w-full flex flex-col pb-1 gap-2">
            <div className='w-full flex flex-row gap-2'>
              <div className="relative w-full">
                {/* Search input */}
                <Command className="shadow-none">
                  <SearchInput
                    className='w-full h-full'
                    inputValue={query}
                    inputOnChange={(e) => setQuery(e.target.value)}
                    placeholder="Search Products..."
                  /> 
                </Command>

                {/* Floating results */}
                {query.length > 0 && (
                  <div className="absolute top-full mt-1 w-full rounded-md border bg-popover shadow-lg z-50">
                    <Command shouldFilter={false}>
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Products">
                          <CommandItem onSelect={() => setQuery("")}>
                            Bread
                          </CommandItem>
                          <CommandItem onSelect={() => setQuery("")}>
                            Butter
                          </CommandItem>
                          <CommandItem onSelect={() => setQuery("")}>
                            Milk
                          </CommandItem>
                          <CommandItem onSelect={() => setQuery("")}>
                            Cheese
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>
            </div>
            <div className='w-full flex flex-row gap-2'>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Brand" />
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

          <div className="flex-1 overflow-auto bg-background rounded-md">
            {loadingProducts ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 p-2">
                {list.map((_, index) => (
                  <SkeletonFull key={index}/>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 p-2">
                {products.map((product: ProductType) => (
                  <CardBox key={product.id} id={product.id} productName={product.productName} productDesc={product.productDesc} price={product.price} category={product.category} brand={product.brand} image={"/image-placeholder-light.svg"}  handleClick={() => handleAddToCart(product)}/>
                ))}
              </div>
            )}
          </div>

          <div className="w-full bg-sidebar pt-4 flex flex-col gap-2">
            <div className='w-full flex flex-row gap-4 items-end justify-between'>
              <div className='flex flex-col gap-2'>
                <Button type="submit">
                  Recent Orders
                </Button>
              </div>
              <div className='flex items-center justify-between'>
                  <button
                    className='px-1'
                    disabled={page <= 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <Button variant={'outline'}>{page}</Button>
                  <button
                      className='px-1'
                      disabled={page >= Math.ceil(count / pageSize)}
                      onClick={() => setPage(prev => prev + 1)}
                  >
                      <ChevronRight size={20} />
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page