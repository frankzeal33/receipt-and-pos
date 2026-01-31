import OnBoarding from "@/components/OnBoarding"
import { RegisterForm } from "../_components/RegisterForm"

export default function RegisterPage() {
  return (
    <OnBoarding image="/receipt1.gif" formComponent={<RegisterForm/>}/>
  )
}