// axiosClient.ts
import axios from "axios"

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
})

export { axiosClient }
