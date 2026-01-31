import OnBoarding from '@/components/OnBoarding'
import { LoginForm } from '../_components/LoginForm'

const page = () => {
  return (
     <OnBoarding image="/receipt2.gif" formComponent={<LoginForm/>}/>
  )
}

export default page
