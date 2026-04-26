// src/components/schedule/ScheduleCalendar.jsx

import { useState, useRef, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, MapPin, User, Book, Calendar as CalendarIcon, ChevronRight, List, Menu, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react'

export function ScheduleCalendar({ events, onEventClick, onDateSelect, loading }) {
    const calendarRef = useRef(null)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [selectedDayEvents, setSelectedDayEvents] = useState(null)
    const [isMobile, setIsMobile] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())

    // Check if mobile view
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const handleEventClick = (info) => {
        const event = events.find(e => e.id === parseInt(info.event.id))
        console.log('Event clicked:', event)
        setSelectedEvent(event)
    }

    const handleDateClick = (info) => {
        const selectedDate = info.date
        const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' })
        
        const dayEvents = events.filter(event => {
            const eventDate = new Date(event.start)
            return eventDate.toDateString() === selectedDate.toDateString()
        })
        
        if (dayEvents.length > 0) {
            setSelectedDayEvents({
                date: selectedDate,
                dayOfWeek: dayOfWeek,
                dateStr: selectedDate.toISOString(),
                events: dayEvents
            })
        } else if (onDateSelect) {
            onDateSelect({
                date: selectedDate,
                dayOfWeek: dayOfWeek,
                dateStr: selectedDate.toISOString()
            })
        }
    }

    const handleSlotSelect = (info) => {
        const startDate = info.start
        const endDate = info.end
        const dayOfWeek = startDate.toLocaleDateString('en-US', { weekday: 'long' })
        
        if (onDateSelect) {
            onDateSelect({
                date: startDate,
                dayOfWeek: dayOfWeek,
                dateStr: startDate.toISOString(),
                startTime: startDate,
                endTime: endDate
            })
        }
    }

    const handleDayHeaderClick = (date) => {
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
        
        const dayEvents = events.filter(event => {
            const eventDate = new Date(event.start)
            return eventDate.toDateString() === date.toDateString()
        })
        
        setSelectedDayEvents({
            date: date,
            dayOfWeek: dayOfWeek,
            dateStr: date.toISOString(),
            events: dayEvents
        })
    }

    const handlePrevWeek = () => {
        if (calendarRef.current) {
            calendarRef.current.getApi().prev()
        }
    }

    const handleNextWeek = () => {
        if (calendarRef.current) {
            calendarRef.current.getApi().next()
        }
    }

    const handleToday = () => {
        if (calendarRef.current) {
            calendarRef.current.getApi().today()
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 md:h-96">
                <div className="h-10 w-10 md:h-12 md:w-12 animate-spin rounded-full border-2 border-ccs-orange border-t-transparent" />
            </div>
        )
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl md:rounded-2xl border border-white/60 bg-white/80 p-3 md:p-4 shadow-lg shadow-orange-500/5 backdrop-blur-md"
            >
                {/* Mobile Header */}
                <div className="mb-3 md:mb-4">
                    <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between gap-3 md:gap-4">
                        <div>
                            <h2 className="text-base md:text-lg font-semibold text-ccs-ink">Weekly Schedule</h2>
                            <p className="text-xs md:text-sm text-ccs-muted hidden md:block">
                                Monday - Sunday | Click on any day header to view all schedules
                            </p>
                            <p className="text-xs md:text-sm text-ccs-muted block md:hidden">
                                Tap day header to view all schedules
                            </p>
                        </div>
                        
                        {/* Mobile Navigation */}
                        {isMobile && (
                            <div className="flex items-center justify-between gap-2">
                                <button
                                    onClick={handlePrevWeek}
                                    className="rounded-lg border border-white/60 bg-white/80 p-2 hover:bg-white transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={handleToday}
                                    className="rounded-lg border border-white/60 bg-white/80 px-3 py-2 text-xs font-medium hover:bg-white transition-colors"
                                >
                                    Today
                                </button>
                                <button
                                    onClick={handleNextWeek}
                                    className="rounded-lg border border-white/60 bg-white/80 p-2 hover:bg-white transition-colors"
                                >
                                    <ChevronRightIcon size={18} />
                                </button>
                            </div>
                        )}
                        
                        {/* Status Legend - Responsive Grid */}
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            <div className="flex items-center gap-1 md:gap-2 text-xs">
                                <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-[#FF6B00]" />
                                <span className="text-ccs-muted text-[10px] md:text-xs">Scheduled</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs">
                                <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-[#10B981]" />
                                <span className="text-ccs-muted text-[10px] md:text-xs">Ongoing</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs">
                                <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-[#6B7280]" />
                                <span className="text-ccs-muted text-[10px] md:text-xs">Completed</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs">
                                <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-[#EF4444]" />
                                <span className="text-ccs-muted text-[10px] md:text-xs">Cancelled</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar Container with Responsive Styles */}
                <div className="schedule-calendar-container">
                    <style jsx global>{`
                        /* Mobile Responsive Calendar Styles */
                        .schedule-calendar-container .fc {
                            font-size: ${isMobile ? '11px' : '14px'};
                        }
                        
                        .schedule-calendar-container .fc .fc-toolbar-title {
                            font-size: ${isMobile ? '14px' : '18px'} !important;
                            font-weight: 600 !important;
                        }
                        
                        .schedule-calendar-container .fc .fc-button {
                            padding: ${isMobile ? '4px 8px' : '6px 12px'} !important;
                            font-size: ${isMobile ? '11px' : '13px'} !important;
                            background-color: rgba(255, 255, 255, 0.8) !important;
                            border-color: rgba(255, 255, 255, 0.6) !important;
                            color: #1f2937 !important;
                        }
                        
                        .schedule-calendar-container .fc .fc-button-primary:not(:disabled):active,
                        .schedule-calendar-container .fc .fc-button-primary:not(:disabled).fc-button-active {
                            background-color: #FF6B00 !important;
                            border-color: #FF6B00 !important;
                            color: white !important;
                        }
                        
                        .schedule-calendar-container .fc .fc-col-header-cell {
                            padding: ${isMobile ? '4px 2px' : '8px 4px'} !important;
                        }
                        
                        .schedule-calendar-container .fc .fc-col-header-cell-cushion {
                            font-size: ${isMobile ? '10px' : '13px'} !important;
                            font-weight: 600 !important;
                            white-space: normal !important;
                            word-break: break-word !important;
                        }
                        
                        .schedule-calendar-container .fc .fc-timegrid-slot-label {
                            font-size: ${isMobile ? '9px' : '11px'} !important;
                        }
                        
                        .schedule-calendar-container .fc .fc-timegrid-event {
                            font-size: ${isMobile ? '9px' : '11px'} !important;
                            padding: ${isMobile ? '2px 3px' : '2px 4px'} !important;
                        }
                        
                        .schedule-calendar-container .fc .fc-event-title {
                            font-weight: 500 !important;
                            white-space: normal !important;
                            word-break: break-word !important;
                            line-height: 1.2 !important;
                        }
                        
                        /* Mobile day header adjustments */
                        @media (max-width: 768px) {
                            .schedule-calendar-container .fc .fc-col-header-cell-cushion {
                                display: flex !important;
                                flex-direction: column !important;
                                align-items: center !important;
                                gap: 2px !important;
                            }
                            
                            .schedule-calendar-container .fc .fc-day-header .fc-col-header-cell-cushion span {
                                display: block !important;
                                text-align: center !important;
                            }
                        }
                        
                        /* Hide some time slots on mobile for better readability */
                        @media (max-width: 768px) {
                            .schedule-calendar-container .fc .fc-timegrid-slot[data-time="07:00"],
                            .schedule-calendar-container .fc .fc-timegrid-slot[data-time="12:00"],
                            .schedule-calendar-container .fc .fc-timegrid-slot[data-time="17:00"],
                            .schedule-calendar-container .fc .fc-timegrid-slot[data-time="20:00"] {
                                display: none;
                            }
                        }
                        
                        .event-count-badge {
                            font-size: ${isMobile ? '9px' : '11px'} !important;
                            padding: ${isMobile ? '2px 5px' : '2px 8px'} !important;
                            margin-left: ${isMobile ? '4px' : '8px'} !important;
                        }
                        
                        .schedule-calendar-container .fc .fc-timegrid-now-indicator-line {
                            border-color: #FF6B00 !important;
                        }
                        
                        .schedule-calendar-container .fc .fc-timegrid-now-indicator-arrow {
                            border-color: #FF6B00 !important;
                        }
                    `}</style>

                    <FullCalendar
                        ref={calendarRef}
                        plugins={[timeGridPlugin, interactionPlugin]}
                        headerToolbar={isMobile ? false : {
                            left: 'prev,next today',
                            center: 'title',
                            right: 'timeGridWeek'
                        }}
                        initialView="timeGridWeek"
                        editable={false}
                        selectable={true}
                        selectMirror={true}
                        select={handleSlotSelect}
                        weekends={true}
                        events={events}
                        eventClick={handleEventClick}
                        dateClick={handleDateClick}
                        height="auto"
                        slotMinTime="08:00:00"
                        slotMaxTime="20:00:00"
                        allDaySlot={false}
                        slotDuration={isMobile ? "01:00:00" : "00:30:00"}
                        slotLabelInterval="01:00"
                        eventTimeFormat={{
                            hour: 'numeric',
                            minute: '2-digit',
                            meridiem: 'short'
                        }}
                        nowIndicator={true}
                        weekNumbers={false}
                        weekText="Week"
                        firstDay={1}
                        titleFormat={{ year: 'numeric', month: 'long' }}
                        dayHeaderFormat={isMobile ? { weekday: 'short', month: 'numeric', day: 'numeric' } : { weekday: 'long', month: 'numeric', day: 'numeric' }}
                        eventDisplay="block"
                        eventMaxStack={isMobile ? 2 : 3}
                        eventOverlap={true}
                        eventDidMount={(info) => {
                            const props = info.event.extendedProps
                            info.el.title = `${props?.course_name || 'N/A'}\nFaculty: ${props?.faculty_name || 'N/A'}\nRoom: ${props?.room_code || 'N/A'}\nTime: ${props?.time_slot || 'N/A'}`
                            
                            info.el.style.cursor = 'pointer'
                            info.el.style.borderRadius = '4px'
                            info.el.style.fontSize = isMobile ? '9px' : '11px'
                            info.el.style.padding = isMobile ? '2px 3px' : '2px 4px'
                            info.el.style.overflow = 'hidden'
                            info.el.style.textOverflow = 'ellipsis'
                            
                            const status = props?.status
                            if (status === 'ongoing') {
                                info.el.style.borderLeft = '3px solid #10B981'
                            } else if (status === 'completed') {
                                info.el.style.opacity = '0.7'
                            } else if (status === 'cancelled') {
                                info.el.style.textDecoration = 'line-through'
                            }
                        }}
                        dayHeaderDidMount={(info) => {
                            const headerEl = info.el
                            headerEl.style.cursor = 'pointer'
                            headerEl.style.transition = 'background-color 0.2s'
                            
                            headerEl.addEventListener('mouseenter', () => {
                                headerEl.style.backgroundColor = 'rgba(255, 107, 0, 0.1)'
                            })
                            headerEl.addEventListener('mouseleave', () => {
                                headerEl.style.backgroundColor = ''
                            })
                            
                            headerEl.addEventListener('click', (e) => {
                                e.stopPropagation()
                                handleDayHeaderClick(info.date)
                            })
                            
                            const dayEvents = events.filter(event => {
                                const eventDate = new Date(event.start)
                                return eventDate.toDateString() === info.date.toDateString()
                            })
                            
                            if (dayEvents.length > 0) {
                                const titleEl = headerEl.querySelector('.fc-col-header-cell-cushion')
                                if (titleEl && !titleEl.querySelector('.event-count-badge')) {
                                    const badge = document.createElement('span')
                                    badge.className = 'event-count-badge ml-2 inline-flex items-center justify-center rounded-full bg-ccs-orange font-medium text-white'
                                    badge.textContent = dayEvents.length
                                    badge.style.marginLeft = isMobile ? '4px' : '8px'
                                    badge.style.padding = isMobile ? '2px 5px' : '2px 8px'
                                    badge.style.fontSize = isMobile ? '9px' : '11px'
                                    titleEl.appendChild(badge)
                                }
                            }
                        }}
                        slotLabelDidMount={(info) => {
                            info.el.style.fontSize = isMobile ? '9px' : '11px'
                            info.el.style.fontWeight = '500'
                        }}
                    />
                </div>
                
                {/* Mobile Tips */}
                <div className="mt-3 md:mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
                    <div className="text-center text-[10px] md:text-xs text-ccs-muted">
                        <p className="hidden md:block"><strong>Tip:</strong> Click on any day header to view all schedules for that day</p>
                        <p className="block md:hidden"><strong>Tip:</strong> Tap day header to view all schedules</p>
                        <p className="mt-1">Tap time slot to add schedule | Tap schedule to view details</p>
                    </div>
                    {!isMobile && (
                        <button
                            onClick={() => onDateSelect({ dayOfWeek: 'Monday', date: new Date() })}
                            className="flex items-center gap-2 rounded-lg bg-ccs-orange px-4 py-2 text-sm text-white transition-colors hover:bg-orange-600 whitespace-nowrap"
                        >
                            <List size={16} />
                            Add Schedule
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Event Details Modal - Mobile Responsive */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50"
                            onClick={() => setSelectedEvent(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-[95%] max-w-md rounded-xl md:rounded-2xl bg-white p-4 md:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="absolute right-3 top-3 md:right-4 md:top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100"
                            >
                                <X size={isMobile ? 16 : 18} />
                            </button>
                            
                            <div className="mb-3 md:mb-4">
                                <div className="text-xs md:text-sm font-semibold uppercase tracking-wider text-ccs-orange">
                                    {selectedEvent.extendedProps?.course_code || selectedEvent.course_code || 'N/A'}
                                </div>
                                <h3 className="mt-1 text-base md:text-xl font-bold text-ccs-ink">
                                    {selectedEvent.title || selectedEvent.extendedProps?.course_name || 'N/A'}
                                </h3>
                            </div>

                            <div className="space-y-2 md:space-y-3">
                                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                                    <Clock size={isMobile ? 14 : 16} className="text-ccs-orange flex-shrink-0" />
                                    <span className="text-ccs-muted">Time:</span>
                                    <span className="font-medium text-ccs-ink">
                                        {selectedEvent.extendedProps?.day_of_week || 'N/A'} • {selectedEvent.extendedProps?.time_slot || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                                    <Book size={isMobile ? 14 : 16} className="text-ccs-orange flex-shrink-0" />
                                    <span className="text-ccs-muted">Course:</span>
                                    <span className="font-medium text-ccs-ink">
                                        {selectedEvent.extendedProps?.course_name || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                                    <Book size={isMobile ? 14 : 16} className="text-ccs-orange flex-shrink-0" />
                                    <span className="text-ccs-muted">Course Code:</span>
                                    <span className="font-medium text-ccs-ink font-mono">
                                        {selectedEvent.extendedProps?.course_code || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                                    <User size={isMobile ? 14 : 16} className="text-ccs-orange flex-shrink-0" />
                                    <span className="text-ccs-muted">Faculty:</span>
                                    <span className="font-medium text-ccs-ink">
                                        {selectedEvent.extendedProps?.faculty_name || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                                    <MapPin size={isMobile ? 14 : 16} className="text-ccs-orange flex-shrink-0" />
                                    <span className="text-ccs-muted">Room:</span>
                                    <span className="font-medium text-ccs-ink font-mono">
                                        {selectedEvent.extendedProps?.room_code || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                                    <CalendarIcon size={isMobile ? 14 : 16} className="text-ccs-orange flex-shrink-0" />
                                    <span className="text-ccs-muted">Semester:</span>
                                    <span className="font-medium text-ccs-ink">
                                        {selectedEvent.extendedProps?.semester || 'N/A'} Semester, {selectedEvent.extendedProps?.school_year || 'N/A'}
                                    </span>
                                </div>
                                {selectedEvent.extendedProps?.notes && (
                                    <div className="mt-2 md:mt-3 rounded-lg bg-gray-50 p-2 md:p-3">
                                        <p className="text-xs md:text-sm text-ccs-muted">{selectedEvent.extendedProps.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 md:mt-6">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                    selectedEvent.extendedProps?.status === 'scheduled' ? 'bg-orange-100 text-orange-700' :
                                    selectedEvent.extendedProps?.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                                    selectedEvent.extendedProps?.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {selectedEvent.extendedProps?.status?.toUpperCase() || 'SCHEDULED'}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Multiple Events Modal - Mobile Responsive */}
            <AnimatePresence>
                {selectedDayEvents && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50"
                            onClick={() => setSelectedDayEvents(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-[95%] max-w-2xl max-h-[85vh] md:max-h-[80vh] overflow-hidden rounded-xl md:rounded-2xl bg-white shadow-2xl"
                        >
                            <div className="sticky top-0 z-10 border-b bg-white p-3 md:p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base md:text-lg font-semibold text-ccs-ink">
                                            {selectedDayEvents.dayOfWeek}
                                        </h3>
                                        <p className="text-xs md:text-sm text-ccs-muted">
                                            {selectedDayEvents.date.toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-ccs-orange/10 px-2 py-0.5 text-xs font-medium text-ccs-orange">
                                            {selectedDayEvents.events.length}
                                        </span>
                                        <button
                                            onClick={() => setSelectedDayEvents(null)}
                                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
                                        >
                                            <X size={isMobile ? 16 : 18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-y-auto p-3 md:p-4" style={{ maxHeight: 'calc(85vh - 80px)' }}>
                                <div className="space-y-2 md:space-y-3">
                                    {selectedDayEvents.events
                                        .sort((a, b) => new Date(a.start) - new Date(b.start))
                                        .map((event, index) => (
                                            <motion.div
                                                key={event.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => {
                                                    setSelectedDayEvents(null)
                                                    setSelectedEvent(event)
                                                }}
                                                className="cursor-pointer rounded-lg border border-gray-200 bg-white p-3 md:p-4 transition-all hover:border-ccs-orange hover:shadow-md"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-1 md:gap-2">
                                                            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-ccs-orange">
                                                                {event.extendedProps?.course_code || 'N/A'}
                                                            </span>
                                                            <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] md:text-xs font-medium ${
                                                                event.extendedProps?.status === 'scheduled' ? 'bg-orange-100 text-orange-700' :
                                                                event.extendedProps?.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                                                                event.extendedProps?.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                                {event.extendedProps?.status?.toUpperCase() || 'SCHEDULED'}
                                                            </span>
                                                        </div>
                                                        <h4 className="mt-1 text-sm md:text-base font-semibold text-ccs-ink truncate">
                                                            {event.title || event.extendedProps?.course_name || 'N/A'}
                                                        </h4>
                                                        <div className="mt-1 md:mt-2 flex flex-wrap gap-2 md:gap-3 text-[10px] md:text-xs text-ccs-muted">
                                                            <div className="flex items-center gap-1">
                                                                <Clock size={isMobile ? 10 : 12} />
                                                                <span>{event.extendedProps?.time_slot || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <User size={isMobile ? 10 : 12} />
                                                                <span className="truncate">{event.extendedProps?.faculty_name || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <MapPin size={isMobile ? 10 : 12} />
                                                                <span>{event.extendedProps?.room_code || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                        {event.extendedProps?.notes && (
                                                            <p className="mt-1 md:mt-2 text-[10px] md:text-xs text-ccs-muted line-clamp-2">
                                                                {event.extendedProps.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <ChevronRight size={isMobile ? 14 : 16} className="mt-1 text-gray-400 flex-shrink-0" />
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>
                            </div>

                            <div className="sticky bottom-0 border-t bg-gray-50 p-3 md:p-4">
                                <button
                                    onClick={() => {
                                        setSelectedDayEvents(null)
                                        if (onDateSelect) {
                                            onDateSelect({
                                                date: selectedDayEvents.date,
                                                dayOfWeek: selectedDayEvents.dayOfWeek,
                                                dateStr: selectedDayEvents.dateStr
                                            })
                                        }
                                    }}
                                    className="w-full rounded-lg bg-ccs-orange px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-white transition hover:bg-ccs-orange/90"
                                >
                                    + Add New Schedule
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}