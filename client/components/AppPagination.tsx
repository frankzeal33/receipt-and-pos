import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function AppPagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1)
  }

  // Generate page numbers (simple version, you can make it smarter later)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
     <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handlePrevious()
            }}
          />
        </PaginationItem>

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              isActive={page === currentPage}
              onClick={(e) => {
                e.preventDefault()
                onPageChange(page)
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {totalPages > 5 && <PaginationItem><PaginationEllipsis /></PaginationItem>}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handleNext()
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
