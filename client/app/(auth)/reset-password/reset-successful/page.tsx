import OnBoarding from "@/components/OnBoarding"
import { ResetSuccessfulForm } from "../../_components/ResetSuccessfulForm"

export default function ResetSuccessful() {
  return (
    <OnBoarding image="/new-password.gif" formComponent={<ResetSuccessfulForm/>}/>
  )
}