import { formatEnums } from '@/utils/formatEnums';

export const ActiveStatus = ({status, otherStyles}: {status: string; otherStyles?: string}) => {
  return (
    <h3 className={`${otherStyles} rounded-md px-2 font-medium py-0.5 w-fit ${status === "ACTIVE" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}>{formatEnums(status)}</h3>
  )
}
