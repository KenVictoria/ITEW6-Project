import { Outlet } from 'react-router-dom'
import { StudentSidebar } from './StudentSidebar'

export function StudentAppLayout() {
  return (
    <div className="flex min-h-screen bg-white">
      <StudentSidebar />
      <main className="relative flex flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,107,0,0.08),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(255,107,0,0.05),transparent_40%)]" />
        <div className="relative flex-1 overflow-y-auto p-4 pt-16 sm:p-6 md:p-10 md:pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}