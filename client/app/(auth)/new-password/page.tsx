import OnBoarding from '@/components/OnBoarding'
import { NewPasswordForm } from '../_components/NewPasswordForm'

const page = () => {
  return (
    <OnBoarding image="/new-password.gif" formComponent={<NewPasswordForm/>}/>
  )
}

export default page
