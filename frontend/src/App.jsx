import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AppLayout } from './components/layout/AppLayout'
import { StudentAppLayout } from './components/layout/StudentAppLayout'
import { RoleRoute } from './components/layout/RoleRoute'
import { CoursesPage } from './pages/CoursesPage'
import { DashboardPage } from './pages/DashboardPage'
import { FacultyPage } from './pages/FacultyPage'
import { LoginPage } from './pages/LoginPage'
import { RoomsPage } from './pages/RoomsPage'
import { StudentDirectoryPage } from './pages/StudentDirectoryPage'
import { StudentsPage } from './pages/StudentsPage'
import { SchedulingPage } from './pages/SchedulingPage'
import { SectionsPage } from './pages/SectionsPage'
import { CurriculumPage } from './pages/CurriculumPage'
import { EventsPage } from './pages/EventsPage'
import { StudentHomePage } from './pages/StudentHomePage'
import { StudentEventsPage } from './pages/StudentEventsPage'
import { StudentManageAccountPage } from './pages/StudentManageAccountPage'
import UsersPage from './pages/UsersPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-ccs-orange border-t-transparent" />
      </div>
    )
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (user?.role === 'student') {
    return <Navigate to="/student" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/student"
        element={
          <RoleRoute allow={['student']}>
            <StudentAppLayout />
          </RoleRoute>
        }
      >
        <Route index element={<StudentHomePage />} />
        <Route path="events" element={<StudentEventsPage />} />
        <Route path="account" element={<StudentManageAccountPage />} />
      </Route>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
            path="users"
            element={
                <RoleRoute allow={['admin']}>
                    <UsersPage />
                </RoleRoute>
            }
        />
        <Route
          path="students"
          element={
            <RoleRoute allow={['secretary']}>
              <StudentsPage />
            </RoleRoute>
          }
        />
        <Route
          path="academics/students"
          element={
            <RoleRoute allow={['admin', 'dean']}>
              <StudentDirectoryPage />
            </RoleRoute>
          }
        />
        <Route
            path="academics/schedules"
            element={
                <RoleRoute allow={['admin', 'dean']}>
                    <SchedulingPage />
                </RoleRoute>
            }
        />
        <Route
            path="academics/sections"
            element={
                <RoleRoute allow={['admin', 'dean', 'secretary']}>
                    <SectionsPage />
                </RoleRoute>
            }
        />
        <Route
          path="academics/rooms"
          element={
            <RoleRoute allow={['admin', 'dean', 'secretary']}>
              <RoomsPage />
            </RoleRoute>
          }
        />
        <Route
          path="academics/courses"
          element={
            <RoleRoute allow={['admin', 'dean']}>
              <CoursesPage />
            </RoleRoute>
          }
        />
        <Route
          path="academics/curriculum"
          element={
            <RoleRoute allow={['admin', 'dean', 'secretary']}>
              <CurriculumPage />
            </RoleRoute>
          }
        />
        <Route
          path="academics/events"
          element={
            <RoleRoute allow={['admin', 'dean', 'secretary']}>
              <EventsPage />
            </RoleRoute>
          }
        />
        <Route
          path="academics/faculty"
          element={
            <RoleRoute allow={['admin', 'dean']}>
              <FacultyPage />
            </RoleRoute>
          }
        />
        <Route path="reports/students" element={<Navigate to="/academics/students" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
