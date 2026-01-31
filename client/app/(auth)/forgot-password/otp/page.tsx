import OnBoarding from "@/components/OnBoarding"
import { RecoveryOTPForm } from "../../_components/RecoveryOTPForm"

export default function RecoveryLink() {
  return (
    <OnBoarding image="/otp.gif" formComponent={<RecoveryOTPForm/>}/>
  )
}