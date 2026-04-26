import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/axios'
import { 
  Users, DoorOpen, BookOpen, Calendar, TrendingUp, Award, CheckCircle, 
  AlertCircle, GraduationCap, UserCheck, Layers, FileText, UserPlus, 
  Building2, LayoutGrid, Clock, Sparkles, ChevronRight, BarChart3,
  School, BookMarked, Presentation, ClipboardList, Settings2, Search
} from 'lucide-react'

const cardClass =
  'group rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-6 shadow-md shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-ccs-orange/50 hover:shadow-lg hover:shadow-ccs-orange/10'

const cardIconClass = (color) => {
  const colors = {
    orange: 'from-orange-500 to-orange-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
    pink: 'from-pink-500 to-pink-600',
    teal: 'from-teal-500 to-teal-600'
  }
  return `rounded-xl bg-gradient-to-br ${colors[color]} p-2.5 shadow-lg transition-transform duration-300 group-hover:scale-110`
}

export function DashboardPage() {
  const { user, hasRole, isAuthenticated } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    totalCourses: 0,
    totalSchedules: 0,
    activeSchedules: 0,
    completedSchedules: 0,
    totalFaculties: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  const isSecretary = hasRole('secretary')
  const isAdminOrDean = hasRole('admin', 'dean')

  // Ensure token is set before fetching
  useEffect(() => {
    const token = localStorage.getItem('ccs_auth_token')
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
    }
    if (isAuthenticated) {
      fetchDashboardStats()
    }
  }, [isAuthenticated])

  const fetchDashboardStats = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('ccs_auth_token')
      if (!token) {
        console.error('No token found')
        return
      }
      
      api.defaults.headers.common.Authorization = `Bearer ${token}`
      
      // Fetch based on role permissions
      let studentsCountRes = { data: { total: 0, data: [] } }
      let roomsRes = { data: [] }
      let coursesRes = { data: [] }
      let facultiesRes = { data: [] }
      let schedulesRes = { data: { schedules: [] } }
      
      // Secretary can access students and rooms
      if (isSecretary) {
        try {
          studentsCountRes = await api.get('/students?per_page=10000')
          roomsRes = await api.get('/rooms')
        } catch (e) {
          console.log('Secretary access restricted for some data')
        }
      }
      
      // Admin/Dean can access all data
      if (isAdminOrDean) {
        try {
          const [students, rooms, courses, faculties, schedules] = await Promise.all([
            api.get('/students?per_page=10000'),
            api.get('/rooms'),
            api.get('/courses'),
            api.get('/faculties'),
            api.get('/schedules')
          ])
          studentsCountRes = students
          roomsRes = rooms
          coursesRes = courses
          facultiesRes = faculties
          schedulesRes = schedules
        } catch (e) {
          console.log('Error fetching admin data')
        }
      }

      const totalStudents = studentsCountRes.data?.total || studentsCountRes.data?.data?.length || studentsCountRes.data?.length || 0
      
      const rooms = roomsRes.data || []
      const courses = coursesRes.data || []
      const faculties = facultiesRes.data || []
      const schedules = schedulesRes.data?.schedules || schedulesRes.data || []

      // Map schedules to include course code, course name, and room code from relationships
      const mappedSchedules = schedules.map(schedule => ({
        ...schedule,
        course_code: schedule.course?.code || schedule.course?.course_code || schedule.course_code || 'N/A',
        course_name: schedule.course?.title || schedule.course?.course_name || schedule.course_name || 'N/A',
        room_code: schedule.room?.code || schedule.room?.room_code || schedule.room_code || 'N/A',
        faculty_name: schedule.faculty?.name || schedule.faculty_name || 'N/A'
      }))

      const activeSchedules = schedules.filter(s => s.status === 'scheduled' || s.status === 'ongoing').length
      const completedSchedules = schedules.filter(s => s.status === 'completed').length

      // Get recent schedules (last 5) with mapped data
      const recentActivity = mappedSchedules.slice(0, 5)

      setStats({
        totalStudents: totalStudents,
        totalRooms: rooms.length,
        totalCourses: courses.length,
        totalFaculties: faculties.length,
        totalSchedules: schedules.length,
        activeSchedules: activeSchedules,
        completedSchedules: completedSchedules,
        recentActivity: recentActivity
      })
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      if (error.response?.status === 401) {
        console.log('Authentication failed - token may be invalid')
      }
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, suffix = '' }) => {
    const colorStyles = {
      blue: 'border-blue-200 bg-blue-50 text-blue-600',
      green: 'border-green-200 bg-green-50 text-green-600',
      indigo: 'border-indigo-200 bg-indigo-50 text-indigo-600',
      purple: 'border-purple-200 bg-purple-50 text-purple-600'
    }
    const style = colorStyles[color] || colorStyles.blue
    
    return (
      <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-5 shadow-md shadow-gray-200/50 transition-all duration-200 hover:scale-105 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ccs-muted">{title}</p>
            <p className="mt-1 text-2xl font-bold text-ccs-ink">
              {loading ? (
                <span className="inline-block h-8 w-16 animate-pulse rounded bg-gray-200"></span>
              ) : (
                `${value}${suffix}`
              )}
            </p>
          </div>
          <div className={`rounded-xl border-2 ${style.split(' ')[0]} ${style.split(' ')[1]} p-3`}>
            <Icon className={`h-6 w-6 ${style.split(' ')[2]}`} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ccs-ink">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-2 text-ccs-muted">
          You are signed in as <span className="font-semibold capitalize text-ccs-orange">{user?.role}</span>
          . Here's what's happening in your CCS department today.
        </p>
      </div>

      {/* Analytics Dashboard - Real Data */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-ccs-orange" />
            <h2 className="text-lg font-semibold text-ccs-ink">Analytics Overview</h2>
          </div>
          <button
            onClick={fetchDashboardStats}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-ccs-orange transition-colors hover:bg-orange-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Students" 
            value={stats.totalStudents} 
            icon={Users} 
            color="blue"
          />
          {isAdminOrDean && (
            <StatCard 
              title="Total Courses" 
              value={stats.totalCourses} 
              icon={BookOpen} 
              color="green"
            />
          )}
          {isAdminOrDean && (
            <StatCard 
              title="Total Faculty" 
              value={stats.totalFaculties} 
              icon={UserCheck} 
              color="indigo"
            />
          )}
          <StatCard 
            title="Total Rooms" 
            value={stats.totalRooms} 
            icon={DoorOpen} 
            color="purple"
          />
        </div>
      </div>

      {/* Schedule Statistics - Only for Admin/Dean */}
      {isAdminOrDean && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4 shadow-md transition-all hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border-2 border-orange-200 bg-orange-100 p-2">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-ccs-muted">Total Schedules</p>
                <p className="text-xl font-bold text-ccs-ink">
                  {loading ? (
                    <span className="inline-block h-6 w-12 animate-pulse rounded bg-gray-200"></span>
                  ) : (
                    stats.totalSchedules
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-4 shadow-md transition-all hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border-2 border-green-200 bg-green-100 p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-ccs-muted">Active Schedules</p>
                <p className="text-xl font-bold text-ccs-ink">
                  {loading ? (
                    <span className="inline-block h-6 w-12 animate-pulse rounded bg-gray-200"></span>
                  ) : (
                    stats.activeSchedules
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-md transition-all hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border-2 border-blue-200 bg-blue-100 p-2">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-ccs-muted">Completed Schedules</p>
                <p className="text-xl font-bold text-ccs-ink">
                  {loading ? (
                    <span className="inline-block h-6 w-12 animate-pulse rounded bg-gray-200"></span>
                  ) : (
                    stats.completedSchedules
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secretary Specific Stats */}
      {isSecretary && (
        <div className="mt-6 rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white p-4 shadow-md transition-all hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border-2 border-teal-200 bg-teal-100 p-2">
              <GraduationCap className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-ccs-muted">Your Access</p>
              <p className="text-sm text-teal-700">
                You have access to Student Management, Section Management, and Room Management modules.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Section - Only for Admin/Dean */}
      {isAdminOrDean && !loading && stats.recentActivity.length > 0 && (
        <div className="mt-8 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-6 shadow-md">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-ccs-orange" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ccs-muted">
              Recent Schedule Activity
            </h3>
          </div>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium text-ccs-ink">
                    {activity.course_code}
                  </p>
                  <p className="text-xs text-ccs-muted">
                    {activity.faculty_name} • {activity.room_code}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ccs-muted">{activity.day_of_week}</p>
                  <p className="text-xs font-medium text-ccs-orange">
                    {activity.start_time?.substring(0, 5)} - {activity.end_time?.substring(0, 5)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Modules */}
      <div className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-ccs-orange" />
          <h2 className="text-lg font-semibold text-ccs-ink">Quick Access Modules</h2>
        </div>
        
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Student Management - Secretary */}
          {hasRole('secretary') && (
            <Link to="/students" className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <div className={cardIconClass('blue')}>
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-ccs-ink group-hover:text-ccs-orange">
                      Student Management
                    </h2>
                  </div>
                  <p className="text-sm text-ccs-muted">
                    Complete CRUD operations for student profiles, enrollment records, and academic information.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 border border-blue-200">
                      <UserPlus size={10} /> Add Students
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 border border-blue-200">
                      <FileText size={10} /> View Records
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 border border-blue-200">
                      <Settings2 size={10} /> Manage
                    </span>
                  </div>
                </div>
                <ChevronRight className="mt-2 h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-ccs-orange" />
              </div>
            </Link>
          )}

          {/* Section Management - Admin, Dean, Secretary */}
          {hasRole('admin', 'dean', 'secretary') && (
            <Link to="/academics/sections" className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <div className={cardIconClass('orange')}>
                      <Layers className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-ccs-ink group-hover:text-ccs-orange">
                      Section Management
                    </h2>
                  </div>
                  <p className="text-sm text-ccs-muted">
                    Create and manage class sections, assign students to sections, and track enrollment statistics.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-700 border border-orange-200">
                      <LayoutGrid size={10} /> Create Sections
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-700 border border-orange-200">
                      <UserPlus size={10} /> Assign Students
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-700 border border-orange-200">
                      <BarChart3 size={10} /> Track Enrollment
                    </span>
                  </div>
                </div>
                <ChevronRight className="mt-2 h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-ccs-orange" />
              </div>
            </Link>
          )}

          {/* Schedule Management - Admin, Dean */}
          {hasRole('admin', 'dean') && (
            <Link to="/academics/schedules" className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <div className={cardIconClass('green')}>
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-ccs-ink group-hover:text-ccs-orange">
                      Schedule Management
                    </h2>
                  </div>
                  <p className="text-sm text-ccs-muted">
                    Interactive calendar and table views with conflict detection and faculty room assignment.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 border border-green-200">
                      <Calendar size={10} /> Calendar View
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 border border-green-200">
                      <AlertCircle size={10} /> Conflict Detection
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 border border-green-200">
                      <Clock size={10} /> Time Slots
                    </span>
                  </div>
                </div>
                <ChevronRight className="mt-2 h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-ccs-orange" />
              </div>
            </Link>
          )}

          {/* Student Directory & PDF - Admin, Dean */}
          {hasRole('admin', 'dean') && (
            <Link to="/academics/students" className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <div className={cardIconClass('purple')}>
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-ccs-ink group-hover:text-ccs-orange">
                      Student Directory & PDF
                    </h2>
                  </div>
                  <p className="text-sm text-ccs-muted">
                    Searchable student directory with multiple view options and PDF export functionality.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700 border border-purple-200">
                      <Users size={10} /> Student List
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700 border border-purple-200">
                      <FileText size={10} /> Export PDF
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700 border border-purple-200">
                      <Search size={10} /> Search
                    </span>
                  </div>
                </div>
                <ChevronRight className="mt-2 h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-ccs-orange" />
              </div>
            </Link>
          )}

          {/* Faculty Management - Admin, Dean */}
          {hasRole('admin', 'dean') && (
            <Link to="/academics/faculty" className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <div className={cardIconClass('indigo')}>
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-ccs-ink group-hover:text-ccs-orange">
                      Faculty Management
                    </h2>
                  </div>
                  <p className="text-sm text-ccs-muted">
                    Manage faculty profiles, assign courses, and track faculty schedules and availability.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 border border-indigo-200">
                      <UserPlus size={10} /> Add Faculty
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 border border-indigo-200">
                      <BookMarked size={10} /> Assign Courses
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 border border-indigo-200">
                      <Calendar size={10} /> Schedule
                    </span>
                  </div>
                </div>
                <ChevronRight className="mt-2 h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-ccs-orange" />
              </div>
            </Link>
          )}

          {/* Course Management - Admin, Dean */}
          {hasRole('admin', 'dean') && (
            <Link to="/academics/courses" className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <div className={cardIconClass('pink')}>
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-ccs-ink group-hover:text-ccs-orange">
                      Course Management
                    </h2>
                  </div>
                  <p className="text-sm text-ccs-muted">
                    Complete CRUD operations for BSIT and BSCS courses including prerequisites and syllabi.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-xs text-pink-700 border border-pink-200">
                      <BookMarked size={10} /> Create Courses
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-xs text-pink-700 border border-pink-200">
                      <ClipboardList size={10} /> Syllabi
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-xs text-pink-700 border border-pink-200">
                      <TrendingUp size={10} /> Prerequisites
                    </span>
                  </div>
                </div>
                <ChevronRight className="mt-2 h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-ccs-orange" />
              </div>
            </Link>
          )}

          {/* Room Management - Admin, Dean, Secretary */}
          {hasRole('admin', 'dean', 'secretary') && (
            <Link to="/academics/rooms" className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <div className={cardIconClass('teal')}>
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-ccs-ink group-hover:text-ccs-orange">
                      Room Management
                    </h2>
                  </div>
                  <p className="text-sm text-ccs-muted">
                    Manage classrooms, laboratories, and facilities with capacity tracking and availability.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-700 border border-teal-200">
                      <DoorOpen size={10} /> Add Rooms
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-700 border border-teal-200">
                      <School size={10} /> Facilities
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-700 border border-teal-200">
                      <BarChart3 size={10} /> Capacity
                    </span>
                  </div>
                </div>
                <ChevronRight className="mt-2 h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-ccs-orange" />
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* RBAC Overview */}
      <div className="mt-8 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Settings2 className="h-5 w-5 text-ccs-orange" />
          <h2 className="text-lg font-semibold text-ccs-ink">RBAC Overview</h2>
        </div>
        <ul className="mt-3 space-y-2">
          <li className="flex items-start gap-2">
            <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-ccs-orange"></div>
            <span><span className="font-medium text-ccs-orange">Admin & Dean:</span> Student directory (read-only) + PDF; faculty, courses, rooms, sections CRUD.</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-ccs-orange"></div>
            <span><span className="font-medium text-ccs-orange">Secretary:</span> Student management CRUD + section management + room CRUD only.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}