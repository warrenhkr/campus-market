import type { SVGProps } from 'react'

export type ServerIconProps = SVGProps<SVGSVGElement> & {
  size?: number
}

function IconBase({ size = 16, children, ...props }: ServerIconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function SearchIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16L21 21" />
    </IconBase>
  )
}

export function GraduationCapIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3L3 7.5L12 12L21 7.5L12 3Z" />
      <path d="M7 9.5V15c0 2 2.2 4 5 4s5-2 5-4V9.5" />
      <path d="M21 7.5V15" />
    </IconBase>
  )
}

export function UsersIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
      <circle cx="10" cy="7" r="3" />
      <path d="M22 19v-1a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  )
}

export function ShoppingCartIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="18" cy="19" r="1.5" />
      <path d="M3 4h2l2.5 10.2A2 2 0 0 0 9.4 15h7.7a2 2 0 0 0 2-1.6L21 7H7" />
    </IconBase>
  )
}

export function HeartIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21s-7.5-4.35-9.5-8.33C1.1 10.1 2.7 5 7.2 5a4.2 4.2 0 0 1 4.8 2.8A4.2 4.2 0 0 1 16.8 5c4.5 0 6.1 5.1 4.7 7.67C19.5 16.65 12 21 12 21Z" />
    </IconBase>
  )
}

export function PackageIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 2l8 4.5v11L12 22l-8-4.5v-11L12 2Z" />
      <path d="M12 2v20" />
      <path d="M4 6.5L12 11l8-4.5" />
    </IconBase>
  )
}

export function ArrowRightIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </IconBase>
  )
}

export function StarIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 2.5l2.8 5.7 6.3.9-4.5 4.4 1.1 6.3-5.7-3-5.7 3 1.1-6.3L2.9 9.1l6.3-.9L12 2.5Z" />
    </IconBase>
  )
}

export function ClockIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  )
}

export function CheckCircleIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </IconBase>
  )
}

export function XCircleIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6" />
      <path d="M9 9l6 6" />
    </IconBase>
  )
}

export function PlusIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconBase>
  )
}

export function TrendingUpIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 16l7-7 4 4 7-9" />
      <path d="M15 4h5v5" />
    </IconBase>
  )
}

export function StoreIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 9.5L12 4l8 5.5" />
      <path d="M5 10v9h14v-9" />
      <path d="M9 19v-6h6v6" />
    </IconBase>
  )
}

export function AlertTriangleIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4l9 16H3L12 4Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </IconBase>
  )
}

export function ArrowLeftIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </IconBase>
  )
}

export function Settings2Icon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V20a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8L5.3 8a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 18.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H20a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" />
    </IconBase>
  )
}

export function EditIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </IconBase>
  )
}

export function HeadphonesIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 12a8 8 0 0 1 16 0" />
      <rect x="2" y="12" width="4" height="7" rx="2" />
      <rect x="18" y="12" width="4" height="7" rx="2" />
    </IconBase>
  )
}

export function MailIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </IconBase>
  )
}

export function MessageCircleIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </IconBase>
  )
}

export function TruckIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 7h11v8H3z" />
      <path d="M14 10h3l4 4v1h-7z" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="17.5" cy="17.5" r="1.5" />
    </IconBase>
  )
}

export function CalendarIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
    </IconBase>
  )
}

export function BanknoteIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <rect x="2" y="7" width="20" height="12" rx="2" />
      <path d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M4 11h16" />
    </IconBase>
  )
}

export function CheckIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12.5l4.2 4.2L19 2.8" />
    </IconBase>
  )
}

export function EyeIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  )
}

export function EyeOffIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A2 2 0 0 0 13.4 13.4" />
      <path d="M9.9 5.5A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-4.5 5.8" />
      <path d="M6.1 6.1A17.2 17.2 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 4.1-.9" />
    </IconBase>
  )
}

export function UserIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </IconBase>
  )
}

export function Trash2Icon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </IconBase>
  )
}

export function MinusIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" />
    </IconBase>
  )
}

export function HomeIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </IconBase>
  )
}

export function BellIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </IconBase>
  )
}

export function ShieldIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3Z" />
      <path d="M9.5 12.5l1.8 1.8 3.2-4.3" />
    </IconBase>
  )
}

export function ZapIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M13 2L4 13h6l-1 9 9-11h-6l1-9Z" />
    </IconBase>
  )
}

export function UploadIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M4 18v2h16v-2" />
    </IconBase>
  )
}

export function XIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </IconBase>
  )
}

export function Loader2Icon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.9 4.9l2.8 2.8" />
      <path d="M16.3 16.3l2.8 2.8" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.9 19.1l2.8-2.8" />
      <path d="M16.3 7.7l2.8-2.8" />
    </IconBase>
  )
}

export function ChevronLeftIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M15 18l-6-6 6-6" />
    </IconBase>
  )
}

export function ChevronRightIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 18l6-6-6-6" />
    </IconBase>
  )
}

export function ShieldCheckIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3Z" />
      <path d="M9.5 12.5l1.8 1.8 3.5-4.3" />
    </IconBase>
  )
}

export function DownloadIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4v10" />
      <path d="M7 19l5 5 5-5" />
      <path d="M5 20h14" />
    </IconBase>
  )
}

export function FileSpreadsheetIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h2" />
      <path d="M14 13h2" />
      <path d="M8 17h2" />
      <path d="M14 17h2" />
    </IconBase>
  )
}

export function FileTextIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
      <path d="M14 2v6h6" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </IconBase>
  )
}

export function LayoutGridIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="4" rx="1" />
      <rect x="14" y="11" width="7" height="10" rx="1" />
      <rect x="3" y="12" width="7" height="9" rx="1" />
    </IconBase>
  )
}

export function ListIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 6h12" />
      <path d="M8 12h12" />
      <path d="M8 18h12" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </IconBase>
  )
}

export function MoreVerticalIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </IconBase>
  )
}

export function PencilIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </IconBase>
  )
}

export function LayoutDashboardIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="4" rx="1" />
      <rect x="14" y="11" width="7" height="10" rx="1" />
      <rect x="3" y="12" width="7" height="9" rx="1" />
    </IconBase>
  )
}

export function MoreHorizontalIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </IconBase>
  )
}

export function CheckCircle2Icon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </IconBase>
  )
}

export function Share2Icon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M9 11l7-5" />
      <path d="M9 13l7 5" />
    </IconBase>
  )
}

export function PaletteIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 2a10 10 0 0 0-10 10c0 4.4 3.6 8 8 8a2.5 2.5 0 0 0 2.5-2.5c0-.4-.1-.7-.3-1.1A2.5 2.5 0 0 1 12 14h-1a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v.5" />
      <circle cx="6.5" cy="9.5" r="1" />
      <circle cx="9.5" cy="6.5" r="1" />
      <circle cx="13.5" cy="6.5" r="1" />
    </IconBase>
  )
}

export function ChevronDownIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 9 6 6 6-6" />
    </IconBase>
  )
}

export function ChevronUpIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="m18 15-6-6-6 6" />
    </IconBase>
  )
}

export function GripVerticalIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="19" r="1" />
    </IconBase>
  )
}

export function MoonIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </IconBase>
  )
}

export function SunIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.9 4.9 1.4 1.4" />
      <path d="m17.7 17.7 1.4 1.4" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m4.9 19.1 1.4-1.4" />
      <path d="m17.7 6.3 1.4-1.4" />
    </IconBase>
  )
}

export function LinkIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 13a5 5 0 0 0 7.1 0l2.8-2.8a5 5 0 1 0-7.1-7.1L11 4" />
      <path d="M14 11a5 5 0 0 0-7.1 0L4.1 13.8A5 5 0 1 0 11.2 20.9L13 19" />
    </IconBase>
  )
}

export function PhoneIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-1.5 2.2l-1.2.3a16 16 0 0 0 6.5 6.5l.3-1.2a2 2 0 0 1 2.2-1.5l3 .5A2 2 0 0 1 22 16.9Z" />
    </IconBase>
  )
}

export function CreditCardIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M2 10h20" />
    </IconBase>
  )
}

export function ShoppingBagIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 9h12v11H6z" />
      <path d="M9 6V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 16h6" />
    </IconBase>
  )
}

export function RefreshCwIcon(props: ServerIconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </IconBase>
  )
}

export const ArrowLeft = ArrowLeftIcon
export const ArrowRight = ArrowRightIcon
export const Store = StoreIcon
export const Package = PackageIcon
export const Star = StarIcon
export const ShoppingCart = ShoppingCartIcon
export const CheckCircle = CheckCircleIcon
export const Clock = ClockIcon
export const Truck = TruckIcon
export const XCircle = XCircleIcon
export const Plus = PlusIcon
export const TrendingUp = TrendingUpIcon
export const Calendar = CalendarIcon
export const Banknote = BanknoteIcon
export const Users = UsersIcon
export const GraduationCap = GraduationCapIcon
export const Search = SearchIcon
export const Heart = HeartIcon
export const Settings2 = Settings2Icon
export const Edit = EditIcon
export const Headphones = HeadphonesIcon
export const Mail = MailIcon
export const MessageCircle = MessageCircleIcon
export const Eye = EyeIcon
export const EyeOff = EyeOffIcon
export const User = UserIcon
export const Save = CheckIcon
export const Trash2 = Trash2Icon
export const Minus = MinusIcon
export const Home = HomeIcon
export const Bell = BellIcon
export const Shield = ShieldIcon
export const Zap = ZapIcon
export const Check = CheckIcon
export const Upload = UploadIcon
export const X = XIcon
export const Loader2 = Loader2Icon
export const ChevronLeft = ChevronLeftIcon
export const ChevronRight = ChevronRightIcon
export const ShieldCheck = ShieldCheckIcon
export const Download = DownloadIcon
export const FileSpreadsheet = FileSpreadsheetIcon
export const FileText = FileTextIcon
export const LayoutGrid = LayoutGridIcon
export const List = ListIcon
export const MoreVertical = MoreVerticalIcon
export const Pencil = PencilIcon
export const LayoutDashboard = LayoutDashboardIcon
export const MoreHorizontal = MoreHorizontalIcon
export const CheckCircle2 = CheckCircle2Icon
export const Share2 = Share2Icon
export const Palette = PaletteIcon
export const ChevronDown = ChevronDownIcon
export const ChevronUp = ChevronUpIcon
export const GripVertical = GripVerticalIcon
export const Moon = MoonIcon
export const Sun = SunIcon
export const Link = LinkIcon
export const Phone = PhoneIcon
export const CreditCard = CreditCardIcon
export const ShoppingBag = ShoppingBagIcon
export const RefreshCw = RefreshCwIcon
