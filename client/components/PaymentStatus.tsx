import { formatEnums } from '@/utils/formatEnums';

export const PaymentStatus = ({status, otherStyles}: {status: string; otherStyles?: string}) => {
  return (
    <span className={`${otherStyles} px-3 py-1 rounded-md ${status === 'SUCCESSFUL' ? 'bg-green-500/10 text-green-700' : status === 'FAILED' ? 'bg-red-500/10 text-red-700' : 'bg-yellow-500/10 text-yellow-700'}`}>{formatEnums(status)}</span>
  )
}
