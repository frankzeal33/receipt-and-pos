import OnBoarding from '@/components/OnBoarding'
import { RecoveryLinkForm } from '../_components/RecoveryLinkForm'

const page = () => {
  return (
    <OnBoarding image="/link.gif" formComponent={<RecoveryLinkForm/>}/>
  )
}

export default page
