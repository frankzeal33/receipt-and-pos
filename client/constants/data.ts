import { Calculator, ChartColumnBig, Clock, Computer, CreditCard, FileText, LifeBuoy, LockKeyhole, Mail, ReceiptText, ShieldCheck, ShipWheel } from 'lucide-react';
import { SiWhatsapp } from "react-icons/si";
import { LuMessageCircleQuestion } from "react-icons/lu";
import { HiOutlineLightBulb } from "react-icons/hi";
import { PricingPlan } from '@/types/General';

const quickLinks = [
    {
        link: "/study-past-questions",
        label: "Study Past Questions"
    },
    {
        link: "/take-an-Exam",
        label: "Take an Exam"
    },
    {
        link: "/exam-ranking",
        label: "Exam Ranking"
    },
    {
        link: "/news",
        label: "News"
    },
]

const aboutCompany = [
    {
        link: "/about",
        label: "About Us"
    },
    {
        link: "/contact-us",
        label: "Contact Us"
    },
    {
        link: "/dashboard",
        label: "Dashboard"
    }
]

const explore = [
    {
        link: "/privacy-policy",
        label: "Privacy Policy"
    },
    {
        link: "/terms-of-service",
        label: "Terms of Service"
    },
    {
        link: "/refund-policy",
        label: "Refund Policy"
    }
]

const features = [
    {
        id: 1,
        icon: Computer,
        title: "Point of Sales",
        desc: "Placeat quidem facere dicta modi? Pariatur exercitationem illum."
    },
    {
        id: 2,
        icon: ReceiptText,
        title: "Receipts",
        desc: "Placeat quidem facere dicta modi? Pariatur exercitationem illum."
    },
    {
        id: 3,
        icon: FileText,
        title: "Invoices",
        desc: "Placeat quidem facere dicta modi? Pariatur exercitationem illum."
    },
    {
        id: 4,
        icon: CreditCard,
        title: "Expenses",
        desc: "Placeat quidem facere dicta modi? Pariatur exercitationem illum."
    }
]

const whyChoose = [
    {
        id: 1,
        icon: Calculator,
        title: "Automatic Calculations",
        desc: "Built-in VAT (7.5%) and Withholding Tax calculations with automatic totals.",
        bg: "bg-purple-100",
        iconBg: "bg-purple-500"
    },
    {
        id: 2,
        icon: CreditCard,
        title: "Nigerian Bank Support",
        desc: "Pre-loaded with all major Nigerian banks for easy payment processing.",
        bg: "bg-pink-100",
        iconBg: "bg-pink-500"
    },
    {
        id: 3,
        icon: FileText,
        title: "PDF Generation",
        desc: "Professional PDF invoices formatted for Nigerian businesses with Naira symbol.",
        bg: "bg-blue-100",
        iconBg: "bg-blue-500"
    },
    {
        id: 4,
        icon: LockKeyhole,
        title: "Secure Sharing",
        desc: "Share invoices securely with clients using unique, password-protected links.",
        bg: "bg-amber-100",
        iconBg: "bg-amber-500"
    },
    {
        id: 5,
        icon: ShieldCheck,
        title: "CAC & TIN Support",
        desc: "Include CAC number and TIN on invoices for full Nigerian compliance.",
        bg: "bg-green-100",
        iconBg: "bg-green-500"
    },
    {
        id: 6,
        icon: ChartColumnBig,
        title: "Track Payments",
        desc: "Monitor payment status with draft, sent, paid, and overdue tracking.",
        bg: "bg-orange-100",
        iconBg: "bg-orange-500"
    }
]

const contact = [
    {
        id: 1,
        icon: Mail,
        title: "Email",
        value: "info@ripe.com",
        desc: "We typically respond within 24 hours",
        bg: "text-purple-500",
        iconBg: "bg-purple-100"
    },
    {
        id: 2,
        icon: SiWhatsapp,
        title: "WhatsApp",
        value: "+234 816 816 6109",
        desc: "Chat with us directly on WhatsApp",
        bg: "text-pink-500",
        iconBg: "bg-pink-100"
    },
    {
        id: 3,
        icon: Clock,
        title: "Support Hours",
        value: "Monday - Friday: 9:00 AM - 5:00 PM (WAT)",
        desc: "Weekend support may vary",
        bg: "text-green-500",
        iconBg: "bg-green-100"
    }
]

const inquireMore = [
    {
        id: 1,
        icon: LifeBuoy,
        title: "Technical Support",
        desc: "Having technical issues? We're here to help you resolve any problems quickly.",
        bg: "bg-purple-100",
        iconBg: "bg-purple-500"
    },
    {
        id: 2,
        icon: LuMessageCircleQuestion,
        title: "General Inquiries",
        desc: "Questions about features, pricing, or how Khan Invoice works? Ask us anything.",
        bg: "bg-pink-100",
        iconBg: "bg-pink-500"
    },
    {
        id: 3,
        icon: HiOutlineLightBulb,
        title: "Feature Requests",
        desc: "Have an idea for improving Khan Invoice? We'd love to hear your suggestions.",
        bg: "bg-green-100",
        iconBg: "bg-green-500"
    }
]

const pricing: PricingPlan[] = [
    {
        id: 1,
        name: 'FREE',
        desc: 'This package is perfect for beginners who need constant help',
        prices: {
            monthly: 0.00,
            yearly: 0.00,
        },
        bestValue: false,
        features: [
            {feature: 'First Feature', available: true},
            {feature: 'Second Feature', available: true},
            {feature: 'Third Feature', available: true},
            {feature: 'Fourth Feature', available: true},
            {feature: 'Fifth Feature', available: true},
            {feature: 'Fifth Feature Plus', available: false},
            {feature: 'Sixth Feature', available: false},
            {feature: 'Seventh Feature', available: false},
            {feature: 'Seventh Feature Plus', available: false},
            {feature: 'Eighth Feature', available: false},
            {feature: 'Ninth Feature', available: false},
            {feature: 'Tenth Feature', available: false},
            {feature: 'Eleventh Feature', available: false}
        ]
    },
    {
        id: 2,
        name: 'BASIC',
        desc: 'This is the perfect package for beginners who are getting started',
        prices: {
            monthly: 29.99,
            yearly: 299.99,
        },
        bestValue: false,
        features: [
            {feature: 'First Feature', available: true},
            {feature: 'Second Feature', available: true},
            {feature: 'Third Feature', available: true},
            {feature: 'Fourth Feature', available: true},
            {feature: 'Fifth Feature', available: true},
            {feature: 'Fifth Feature Plus', available: true},
            {feature: 'Sixth Feature', available: true},
            {feature: 'Seventh Feature', available: true},
            {feature: 'Seventh Feature Plus', available: true},
            {feature: 'Eighth Feature', available: false},
            {feature: 'Ninth Feature', available: false},
            {feature: 'Tenth Feature', available: false},
            {feature: 'Eleventh Feature', available: false}
        ]
    },
    {
        id: 3,
        name: 'BUSINESS',
        desc: 'This package is perfect for busy people who need home service',
        prices: {
            monthly: 29.99,
            yearly: 299.99,
        },
        bestValue: true,
        features: [
            {feature: 'First Feature', available: true},
            {feature: 'Second Feature', available: true},
            {feature: 'Third Feature', available: true},
            {feature: 'Fourth Feature', available: true},
            {feature: 'Fifth Feature', available: true},
            {feature: 'Fifth Feature Plus', available: true},
            {feature: 'Sixth Feature', available: true},
            {feature: 'Seventh Feature', available: true},
            {feature: 'Seventh Feature Plus', available: true},
            {feature: 'Eighth Feature', available: true},
            {feature: 'Ninth Feature', available: true},
            {feature: 'Tenth Feature', available: true},
            {feature: 'Eleventh Feature', available: true}
        ]
    },
    {
        id: 4,
        name: 'ENTERPRISE',
        desc: 'This package is perfect for busy people who need home service',
        prices: {
            monthly: 29.99,
            yearly: 299.99,
        },
        bestValue: false,
        features: [
            {feature: 'First Feature', available: true},
            {feature: 'Second Feature', available: true},
            {feature: 'Third Feature', available: true},
            {feature: 'Fourth Feature', available: true},
            {feature: 'Fifth Feature', available: true},
            {feature: 'Fifth Feature Plus', available: true},
            {feature: 'Sixth Feature', available: true},
            {feature: 'Seventh Feature', available: true},
            {feature: 'Seventh Feature Plus', available: true},
            {feature: 'Eighth Feature', available: true},
            {feature: 'Ninth Feature', available: true},
            {feature: 'Tenth Feature', available: true},
            {feature: 'Eleventh Feature', available: true}
        ]
    }
]

export { quickLinks, aboutCompany, explore, features, whyChoose, contact, inquireMore, pricing}