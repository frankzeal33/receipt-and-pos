import OnBoarding from '@/components/OnBoarding'
import { VerifyRecoveryLink } from '../../_components/VerifyRecoveryLink'

const page = () => {
  return (
    <OnBoarding image="/link.gif" formComponent={<VerifyRecoveryLink/>}/>
  )
}

export default page
