export type Billing = "monthly" | "yearly"

export type PricingPlan = {
  id: number
  name: SubscriptionPlan
  desc: string
  bestValue: boolean
  prices: {
    monthly: number
    yearly: number
  }
  features: {
    feature: string
    available: boolean
  }[]
}

export type ProductType = {
  id: string;
  productName: string;
  productDesc: string;
  category: string;
  brand: string;
  image: string;
  price: string;
  quantity: number;
  status: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK";
  addedBy: string;
  role: string;
  currentlyEditedBy: string;
  editedRole: string;
  branchId: string | null;
  branch: branchType | null;
  createdAt: string;
  updatedAt: string;
}

export type OrderType = {
  id: string;
  companyId: string;
  branchId: string | null;
  sellerEmail: string;
  role: string;
  receiptNo: number;
  subtotal: string;
  discount: string;
  tax: string;
  totalAmount: string;
  paymentType: string;
  status: string;
  correctedWith: string | null;
  customerName: string;
  customerId: string | null;
  customerIdentifier: string | null;
  createdAt: string;
  updatedAt: string;
  saleItems: {
      id: string;
      saleId: string;
      productId: string;
      quantity: number;
      price: string;
      total: string;
      product: {
        productName: string;
      }
  }[]
}

export type ProductCardType = {
  id: string
  productName: string
  productDesc: string
  price: string
  category: string
  brand: string
  image: string
  handleClick: () => void
}

export type PaymentDialogProps = {
  total: number
  saleId?: string
  cart: CartItemType[]
  discount: string
  taxRate: string
  customer?: {
    customerName?: string
    customerId?: string
    customerIdentifier?: string
  }
}

type branchType = {
  name:      string;
  location:  string;
}

export enum Roles {
  CO_CEO = "CO_CEO",
  GENERAL_MANAGER = "GENERAL_MANAGER",
  GENERAL_ACCOUNTANT = "GENERAL_ACCOUNTANT",
  MANAGER = "MANAGER",
  ACCOUNTANT = "ACCOUNTANT",
  SALES_PERSON = "SALES_PERSON",
}

export enum ExpenseCategory {
  UTILITIES = "UTILITIES", 
  SUPPLIES = "SUPPLIES", 
  MAINTENANCE = "MAINTENANCE", 
  MARKETING = "MARKETING", 
  TAXES = "TAXES", 
  OTHER = "OTHER"
}

export enum ExpensePaymentType {
  CASH = "CASH", 
  CARD = "CARD", 
  BANK_TRANSFER = "BANK_TRANSFER", 
  OTHER = "OTHER"
}

export enum StaffStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

export type CartItemType = ProductType & { quantity: number };

export type productItemType = ProductType & { handleClick: () => void };

export type StaffType = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Roles;
  status: StaffStatus;
  branchId: string | null;
  branch: branchType | null;
  createdAt: string;
  updatedAt: string;
}

export type CustomerType = {
  id: string;
  branchId: string | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = {
  id: string;
  title: string;
  description: string;
  type: string;
  companyId: string;
  branchId: string | null;
  userId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

type invoiceItems = {
  id: string;
  invoiceId: string;
  itemAmount: string;
  itemQuantity: number;
  itemTitle: string;
  itemTotal: string;
  tax: string;
}

export type InvoiceType = {
  addedBy: string;
  addedByRole: string;
  branchId: string | null;
  companyId: string;
  createdAt: string;
  currency: string;
  customerAddress: string;
  customerEmail: string | null;
  customerName: string;
  customerPhone: string | null;
  date: string;
  discount: string;
  discountName: string | null;
  dueDate: string;
  editedBy: string | null;
  editedByRole: string | null;
  extraCharge: string;
  extraChargeName: string | null;
  id: string;
  invoiceItems: invoiceItems[]
  invoiceName: string;
  invoiceNumber: number;
  note: string | null;
  status: string;
  totalAmount: string;
  totalTaxAmount: string | null;
  updatedAt: string;
}

export type getInvoiceType = {
  id: string;
  invoiceName: string;
  totalAmount: string;
  extraCharge: string;
  extraChargeName: string | null;
  discount: string;
  discountName: string | null;
  paymentTerm: string | null;
  totalTaxAmount: string;
  status: "UNPAID" | "PAID";
  date: string;
  dueDate: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone: string;
  currency: string;
  invoiceNumber: number
  note: string | null;
  companyId: string;
  branchId: string | null;
  addedBy: string;
  addedByRole: string;
  editedBy: string | null;
  editedByRole: string | null;
  createdAt: string;
  updatedAt: string;
  invoiceItems: invoiceItems[]
}

export type expenseType = {
  id: string;
  title: string;
  description: string | null,
  category: string;
  amount: string;
  paymentType: string;
  expenseDate: string;
  companyId: string;
  recordedByEmail: string;
  recordedByRole: string;
  updatedByEmail: string | null,
  updatedByRole: string | null,
  branchId: string | null,
  createdAt: string;
  updatedAt: string;
}

export type HistoryType = {
  amount: number;
  billing: BillingCycle;
  channel: string;
  companyId: string;
  createdAt: string;
  currency: string;
  user: {
    email: string;
    role: string;
  }
  id: string;
  plan: SubscriptionPlan;
  reference: string;
  status: string;
  userId: string;
}

export type BillingCycle = "MONTHLY" | "YEARLY"
export type SubscriptionPlan = "FREE" | "BASIC" | "BUSINESS" | "ENTERPRISE"

export type SubscriptionType = {
  active: boolean
  billing: BillingCycle
  createdAt: string
  subscribedAt: string
  expiresAt: string
  plan: SubscriptionPlan
}

export type BranchType = {
  companyId: string;
  createdAt: string;
  id: string;
  location: string | null;
  name: string;
  updatedAt: string;
  status: StaffStatus
}