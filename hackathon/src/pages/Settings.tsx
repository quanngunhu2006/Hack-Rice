import { useAuth0 } from '@auth0/auth0-react'
import { Button } from '@/components/ui/button'

function Settings() {
  const { logout } = useAuth0()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Button variant="outline" onClick={() => logout({ logoutParams: { returnTo: `${window.location.origin}/` } })}>
        Log out
      </Button>
    </div>
  )
}

export default Settings


