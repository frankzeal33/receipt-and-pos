import OnBoarding from "@/components/OnBoarding"
import { ForgotPasswordForm } from "../_components/ForgotPasswordForm"

export default function ResetPassword() {
  return (
    <OnBoarding image="/forgot-password.gif" formComponent={<ForgotPasswordForm/>}/>
  )
}