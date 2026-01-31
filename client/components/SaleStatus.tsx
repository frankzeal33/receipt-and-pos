import { formatEnums } from '@/utils/formatEnums';
import React from 'react'

export const SaleStatus = ({status, otherStyles}: {status: string; otherStyles?: string}) => {
  return (
    <span className={`${otherStyles} px-3 py-1 rounded-md ${status === 'PAID' ? 'bg-green-500/10 text-green-700' : status === 'CORRECTED' ? 'bg-yellow-500/10 text-yellow-700' : 'bg-red-500/10 text-red-700'}`}>{formatEnums(status)}</span>
  )
}
