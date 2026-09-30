import { AppShell, RequireAuth } from '@/components/AppShell'
import { HomeDashboard } from '@/components/home/HomeDashboard'

export default function Page() {
  return (
    <AppShell fill>
      <RequireAuth>
        <HomeDashboard />
      </RequireAuth>
    </AppShell>
  )
}
