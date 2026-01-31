import OnBoarding from '@/components/OnBoarding'
import { VerifyEmailOTPForm } from '../_components/VerifyEmailOTPForm'

const page = () => {
  return (
    <OnBoarding image="/otp.gif" formComponent={<VerifyEmailOTPForm/>}/>
  )
}

export default page
