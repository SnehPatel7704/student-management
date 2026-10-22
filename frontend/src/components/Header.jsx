import { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  ChevronDown,
  LayoutDashboard,
  Users,
  BookOpen,
  Briefcase,
  Users2,
  CalendarCheck,
  Award,
  Library,
  Activity,
  ShieldCheck,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  X,
  RefreshCw,
  FileText,
  UserPlus,
  School,
  TrendingUp,
  BarChart3,
  PieChart,
  KeyRound,
  History,
  UserCheck,
  UserX,
  CalendarDays,
  BellRing,
  Database,
  LockKeyhole,
  SlidersHorizontal,
  Eye,
  Pencil,
  Trash2,
  ClipboardList
} from 'lucide-react';

/**
 * Development role list for quick role switching during testing
 */
const devRoles = ['super_admin', 'admin', 'director', 'head', 'teacher', 'student', 'parent', 'guest'];

const moduleResources = [
  { label: 'Student', plural: 'Students', key: 'students', view: 'Students', permission: 'students.read', manage: 'students.manage', icon: Users },
  { label: 'Instructor', plural: 'Instructors', key: 'instructors', view: 'Instructors', permission: 'instructors.read', manage: 'instructors.manage', icon: GraduationCap },
  { label: 'Course', plural: 'Courses', key: 'courses', view: 'Courses', permission: 'courses.read', manage: 'courses.manage', icon: BookOpen },
  { label: 'Internship', plural: 'Internships', key: 'internships', view: 'Internships', permission: 'internships.read', manage: 'internships.manage', icon: Briefcase },
  { label: 'Club', plural: 'Clubs', key: 'clubs', view: 'Clubs', permission: 'clubs.read', manage: 'clubs.manage', icon: Users2 },
  { label: 'Attendance record', plural: 'Attendance', key: 'attendance', view: 'Attendance', permission: 'attendance.read', manage: 'attendance.manage', icon: CalendarCheck },
  { label: 'Grade', plural: 'Grades', key: 'grades', view: 'Grades', permission: 'grades.read', manage: 'grades.manage', icon: Award },
  { label: 'Library book', plural: 'Library', key: 'library', view: 'Library', permission: 'library.read', manage: 'library.manage', icon: Library },
];

const moduleCrudOptions = moduleResources.flatMap((resource) => {
  const target = resource.view === 'Students' ? 'students-directory' : 'records-view';
  const manageAction = (verb, icon) => ({
    name: `${verb} ${resource.label}`,
    description: `Open ${resource.plural} so you can choose a record to ${verb.toLowerCase()}`,
    viewKey: resource.view,
    focusId: target,
    permission: resource.manage,
    icon,
  });

  return [
    { name: `View ${resource.label}`, description: `Open the ${resource.plural.toLowerCase()} list`, viewKey: resource.view, focusId: target, permission: resource.permission, icon: Eye, resourceKey: resource.key },
    { name: `${resource.label} Summary`, description: `Open the ${resource.plural.toLowerCase()} overview`, viewKey: resource.view, focusId: target, permission: resource.permission, icon: ClipboardList, resourceKey: resource.key },
    { name: `Add ${resource.label}`, description: `Open the form to create a ${resource.label.toLowerCase()}`, viewKey: resource.view, actionKey: `${resource.key}.create`, permission: resource.manage, icon: UserPlus, resourceKey: resource.key },
    manageAction('Edit', Pencil),
    manageAction('Delete', Trash2),
  ].map((option) => ({ ...option, resourceKey: resource.key }));
});

/**
 * Main Navigation Items with sub-options and action items for EVERY menu
 */
const mainNavMenus = [
  {
    name: 'Modules & Views',
    viewKey: 'Dashboard',
    icon: LayoutDashboard,
    dropdown: [
      {
        name: 'Dashboard Overview',
        description: 'Central KPIs, metrics & system health',
        viewKey: 'Dashboard',
        icon: LayoutDashboard,
      },
      ...moduleResources.map((resource) => {
        const viewOptions = {
          students: [
            { name: 'Browse by class', description: 'Open the class-grouped student directory', viewKey: 'StudentClasses', permission: resource.permission, icon: Users },
            { name: 'Students without class details', description: 'Open the unassigned student directory', viewKey: 'StudentClasses', actionKey: 'students.filter.unassigned', permission: resource.permission, icon: UserX },
          ],
          instructors: [
            { name: 'Browse by department and role', description: 'Open faculty directory grouped by department and designation', viewKey: 'Instructors', permission: resource.permission, icon: GraduationCap },
            { name: 'Faculty timetable', description: 'Open scheduled lectures for classes and faculty', viewKey: 'FacultyTimetable', permission: resource.permission, icon: CalendarDays },
          ],
          courses: [
            { name: 'Browse by department', description: 'Open the course catalog grouped by department', viewKey: 'Courses', permission: resource.permission, icon: BookOpen },
            { name: 'Class schedules', description: 'Open course sections, divisions, and lecture schedules', viewKey: 'CourseSchedules', permission: resource.permission, icon: CalendarDays },
          ],
          internships: [
            { name: 'Browse by company', description: 'Open internship opportunities grouped by employer', viewKey: 'Internships', permission: resource.permission, icon: Briefcase },
            { name: 'Applications', description: 'Open applicants and opportunity status', viewKey: 'InternshipApplications', permission: resource.permission, icon: ClipboardList },
          ],
          clubs: [
            { name: 'Browse by category', description: 'Open clubs grouped by activity category', viewKey: 'Clubs', permission: resource.permission, icon: Users2 },
            { name: 'Memberships', description: 'Open club coordinators and member lists', viewKey: 'ClubMemberships', permission: resource.permission, icon: UserCheck },
          ],
          attendance: [
            { name: 'Lecture attendance', description: 'Open a lecture roster and take attendance', viewKey: 'LectureAttendance', permission: resource.permission, icon: CalendarCheck },
            { name: 'Attendance history', description: 'Open records grouped by course and class', viewKey: 'Attendance', permission: resource.permission, icon: History },
          ],
          grades: [
            { name: 'Browse by course and class', description: 'Open results grouped by student, course, and examination', viewKey: 'Grades', permission: resource.permission, icon: Award },
            { name: 'Grade summaries', description: 'Open academic outcomes and grade distributions', viewKey: 'GradeSummary', permission: resource.permission, icon: BarChart3 },
          ],
          library: [
            { name: 'Browse by category', description: 'Open titles grouped by library subject category', viewKey: 'Library', permission: resource.permission, icon: Library },
            { name: 'Borrowing history', description: 'Open borrower records and return status', viewKey: 'BorrowingHistory', permission: resource.permission, icon: ClipboardList },
          ],
        };
        const actions = moduleCrudOptions
          .filter((item) => item.resourceKey === resource.key && !(resource.key === 'attendance' && item.actionKey === 'attendance.create'))
          .map((item) => ({ ...item, description: item.description }));
        if (resource.key === 'students') actions.push({ name: 'Import students', description: 'Import student records from CSV', viewKey: resource.view, actionKey: 'students.import', permission: 'students.manage', icon: FileText });
        if (resource.key === 'instructors') actions.push({ name: 'Add lecture to timetable', description: 'Assign a course lecture to a faculty member and class', viewKey: resource.view, actionKey: 'lectures.create', permission: 'courses.manage', icon: CalendarDays });
        return {
          name: resource.plural,
          description: `Open ${resource.plural.toLowerCase()} workflows`,
          viewKey: resource.view,
          icon: resource.icon,
          children: [...(viewOptions[resource.key] || []), ...actions],
        };
      }),
    ],
  },
  {
    name: 'Analytics',
    viewKey: 'Analytics',
    icon: Activity,
    dropdown: [
      {
        name: 'Analytics Overview',
        description: 'Comprehensive system reports & stats',
        viewKey: 'Analytics',
        focusId: 'analytics-overview',
        icon: Activity,
      },
      { name: 'Enrollment Trends', description: 'Jump to monthly enrollment chart', viewKey: 'Analytics', focusId: 'analytics-enrollment', icon: TrendingUp },
      { name: 'Course Distribution', description: 'Jump to course enrollment breakdown', viewKey: 'Analytics', focusId: 'analytics-courses', icon: BarChart3 },
      { name: 'Age Demographics', description: 'Jump to student age groups', viewKey: 'Analytics', focusId: 'analytics-demographics', icon: PieChart },
      { name: 'Student KPI Summary', description: 'Jump to analytics summary cards', viewKey: 'Analytics', focusId: 'analytics-overview', icon: Users },
      { name: 'Export Analytics Report', description: 'Analytics export is planned', permission: 'analytics.read', stage: 'development', icon: FileText },
      { name: 'Attendance Trends', description: 'Attendance analytics are planned', permission: 'analytics.read', stage: 'development', icon: CalendarCheck },
      { name: 'Grade Distribution', description: 'Grade analytics are planned', permission: 'analytics.read', stage: 'development', icon: Award },
      { name: 'Instructor Workload', description: 'Workload analytics are planned', permission: 'analytics.read', stage: 'development', icon: GraduationCap },
      { name: 'Internship Outcomes', description: 'Placement analytics are planned', permission: 'analytics.read', stage: 'development', icon: Briefcase },
      { name: 'Club Participation', description: 'Club analytics are planned', permission: 'analytics.read', stage: 'development', icon: Users2 },
    ],
  },
  {
    name: 'Users',
    viewKey: 'Users',
    icon: ShieldCheck,
    dropdown: [
      {
        name: 'All System Users',
        description: 'View & filter all registered accounts',
        viewKey: 'Users',
        focusId: 'user-account-list',
        icon: Users,
      },
      { name: 'Create Account', description: 'Jump to the existing account form', viewKey: 'Users', focusId: 'user-account-form', permission: 'users.manage', icon: UserPlus },
      { name: 'Edit Account', description: 'Open the account list and choose a role to edit', viewKey: 'Users', focusId: 'user-account-list', permission: 'users.manage', icon: Pencil },
      { name: 'Delete Account', description: 'Open the account list and choose an account to remove', viewKey: 'Users', focusId: 'user-account-list', permission: 'users.manage', icon: Trash2 },
      { name: 'Account Summary', description: 'Review account roles and active status', viewKey: 'Users', focusId: 'user-account-list', permission: 'users.manage', icon: ClipboardList },
      { name: 'Assign User Roles', description: 'Jump to role assignment controls', viewKey: 'Users', focusId: 'user-account-list', permission: 'users.manage', icon: KeyRound },
      { name: 'Review Account Status', description: 'Jump to active and disabled accounts', viewKey: 'Users', focusId: 'user-account-list', permission: 'users.manage', icon: UserCheck },
      { name: 'Remove an Account', description: 'Jump to account removal controls', viewKey: 'Users', focusId: 'user-account-list', permission: 'users.manage', icon: UserX },
      { name: 'Bulk User Import', description: 'Bulk account import is planned', permission: 'users.manage', stage: 'development', icon: FileText },
      { name: 'User Activity History', description: 'Audit history is planned', permission: 'users.manage', stage: 'development', icon: History },
      { name: 'Invite Users', description: 'Email invitations are planned', permission: 'users.manage', stage: 'development', icon: BellRing },
      { name: 'Access Review', description: 'Permission review tools are planned', permission: 'users.manage', stage: 'development', icon: ShieldCheck },
      { name: 'Account Recovery', description: 'Recovery workflow is planned', permission: 'users.manage', stage: 'development', icon: LockKeyhole },
      { name: 'User Directory Export', description: 'Directory export is planned', permission: 'users.manage', stage: 'development', icon: Database },
    ],
  },
  {
    name: 'Settings',
    viewKey: 'Portal',
    icon: Settings,
    dropdown: [
      {
        name: 'Student & Faculty Portal',
        description: 'Personalized dashboard & profile info',
        viewKey: 'Portal',
        focusId: 'portal-overview',
        icon: School,
      },
      { name: 'Refresh API Status', description: 'Check the backend and reload records', localAction: 'refresh', icon: RefreshCw },
      { name: 'View Notifications', description: 'Open current system notifications', localAction: 'notifications', icon: Bell },
      { name: 'Open Account Profile', description: 'View the signed-in account details', localAction: 'profile', icon: Users },
      { name: 'Sign Out', description: 'End the current session', localAction: 'signout', icon: LogOut },
      { name: 'Portal Overview', description: 'Jump to your portal summary', viewKey: 'Portal', focusId: 'portal-overview', permission: 'portal.read', icon: LayoutDashboard },
      { name: 'My Profile', description: 'View your linked campus profile', viewKey: 'Portal', focusId: 'portal-profile', permission: 'portal.read', icon: Users },
      { name: 'Academic Results', description: 'Jump to your grade records', viewKey: 'Portal', focusId: 'portal-grades', permission: 'portal.read', icon: Award },
      { name: 'Results Table', description: 'Jump to your academic results table', viewKey: 'Portal', focusId: 'portal-grades-table', permission: 'portal.read', icon: FileText },
      { name: 'Attendance History', description: 'Jump to your attendance records', viewKey: 'Portal', focusId: 'portal-attendance', permission: 'portal.read', icon: CalendarCheck },
      { name: 'Attendance Register', description: 'Jump to attendance history details', viewKey: 'Portal', focusId: 'portal-attendance-table', permission: 'portal.read', icon: CalendarDays },
      { name: 'Course Summary', description: 'View courses represented in your records', viewKey: 'Portal', focusId: 'portal-courses', permission: 'portal.read', icon: BookOpen },
      { name: 'Library Checkouts', description: 'Jump to your library checkout summary', viewKey: 'Portal', focusId: 'portal-library', permission: 'portal.read', icon: Library },
      { name: 'Portal Notifications', description: 'Portal notification preferences are planned', permission: 'portal.read', stage: 'development', icon: BellRing },
      { name: 'Profile Editing', description: 'Self-service profile editing is planned', permission: 'portal.read', stage: 'development', icon: UserPlus },
      { name: 'Course Schedule', description: 'Personal timetable is planned', permission: 'portal.read', stage: 'development', icon: CalendarDays },
      { name: 'Document Center', description: 'Student document access is planned', permission: 'portal.read', stage: 'development', icon: FileText },
      { name: 'Portal Preferences', description: 'Personal portal preferences are planned', permission: 'portal.read', stage: 'development', icon: SlidersHorizontal },
      { name: 'General Preferences', description: 'Preference settings are planned', permission: 'users.manage', stage: 'development', icon: SlidersHorizontal },
      { name: 'Academic Term Settings', description: 'Term configuration is planned', permission: 'courses.manage', stage: 'development', icon: CalendarDays },
      { name: 'Notification Settings', description: 'Notification preferences are planned', permission: 'users.manage', stage: 'development', icon: BellRing },
      { name: 'Database & Backups', description: 'Backup tools are planned', permission: 'users.manage', stage: 'development', icon: Database },
      { name: 'Security Settings', description: 'Security configuration is planned', permission: 'users.manage', stage: 'development', icon: LockKeyhole },
      { name: 'System Audit', description: 'System audit tools are planned', permission: 'users.manage', stage: 'development', icon: History },
      { name: 'Branding Preferences', description: 'Branding controls are planned', permission: 'users.manage', stage: 'development', icon: School },
      { name: 'Email Configuration', description: 'Email delivery setup is planned', permission: 'users.manage', stage: 'development', icon: BellRing },
      { name: 'Data Retention', description: 'Retention policies are planned', permission: 'users.manage', stage: 'development', icon: Database },
      { name: 'Integration Settings', description: 'External integrations are planned', permission: 'users.manage', stage: 'development', icon: SlidersHorizontal },
    ],
  },
];

mainNavMenus
  .filter((menu) => menu.name !== 'Modules & Views')
  .forEach((menu) => {
    const actions = menu.dropdown;
    const groupName = menu.name === 'Analytics'
      ? 'Reports & Insights'
      : menu.name === 'Users'
        ? 'Accounts & Roles'
        : 'Portal & System Settings';
    menu.dropdown = [{
      name: groupName,
      description: `Open ${menu.name.toLowerCase()} options`,
      icon: menu.icon,
      children: actions,
    }];
  });

/**
 * React Header Component
 * Integrates application view changing (onChange), health indicators, notifications, user details,
 * and multi-level hover/click dropdown sub-menus for every header item.
 */
export default function Header({
  activeView,
  onChange,
  health = { status: 'ok', database: 'connected' },
  apiStatus,
  user = { name: 'Sneh Patel', role: 'admin', email: 'admin@campusdesk.edu' },
  onRefresh,
  onSignOut,
  onLogout,
  onRoleChange,
  views = [],
  permissions = [],
  onAction,
  developmentOptions = { departments: [], students: [], instructors: [] },
}) {
  // Active desktop dropdown menu name
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [developmentRole, setDevelopmentRole] = useState(user.role);
  const [developmentDepartment, setDevelopmentDepartment] = useState(user.department || '');
  const [developmentStudent, setDevelopmentStudent] = useState(user.student?._id || user.student || '');
  const [developmentInstructor, setDevelopmentInstructor] = useState(user.instructor?._id || user.instructor || '');

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileMenus, setExpandedMobileMenus] = useState({});
  const [expandedNestedMenus, setExpandedNestedMenus] = useState({});

  // Utility popover states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Header reference for click-outside auto close
  const headerRef = useRef(null);
  const closeDropdownTimerRef = useRef(null);

  // Derive API & DB health status
  const currentHealthStatus = apiStatus || (health.status === 'ok' ? 'connected' : health.status === 'checking' ? 'checking' : 'error');
  const hasPermission = (permission) => permissions.includes('*') || permissions.includes(permission);
  const dashboardView = 'Dashboard'
  const filterNavigationItems = (items) => items
    .filter((item) => !item.permission || hasPermission(item.permission))
    .map((item) => ({ ...item, children: item.children ? filterNavigationItems(item.children) : undefined }))
    .filter((item) => {
      if (item.children) return item.children.length > 0;
      if (item.stage === 'development') return true;
      return item.viewKey === 'Dashboard' || !item.viewKey || !views.length || views.includes(item.viewKey);
    });
  const visibleMenus = mainNavMenus
    .map((menu) => ({ ...menu, dropdown: filterNavigationItems(menu.dropdown) }))
    .filter((menu) => menu.dropdown.length > 0);

  // Click-outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        window.clearTimeout(closeDropdownTimerRef.current);
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
        setShowNotifications(false);
        setShowProfile(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.clearTimeout(closeDropdownTimerRef.current);
    };
  }, []);

  // Handle item click and trigger view change if provided
  const handleItemClick = (viewKey, actionKey, focusId) => {
    if (actionKey) {
      const findAction = (items) => items.find((item) => item.actionKey === actionKey)
        || items.map((item) => findAction(item.children || [])).find(Boolean);
      const action = findAction(mainNavMenus.flatMap((menu) => menu.dropdown));
      if (!action || !hasPermission(action.permission)) return;
    }
    if (onChange && viewKey) {
      onChange(viewKey);
    }
    if (actionKey && onAction) {
      onAction(actionKey);
    }
    if (focusId && onAction) {
      onAction(`focus:${focusId}`);
    }
    window.clearTimeout(closeDropdownTimerRef.current);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    setShowProfile(false);
  };

  const handleSubmenuClick = (item) => {
    if (!item.localAction) {
      handleItemClick(item.viewKey, item.actionKey, item.focusId);
      return;
    }

    window.clearTimeout(closeDropdownTimerRef.current);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);

    if (item.localAction === 'refresh') {
      onRefresh?.();
      setShowNotifications(false);
      setShowProfile(false);
    } else if (item.localAction === 'notifications') {
      setShowNotifications(true);
      setShowProfile(false);
    } else if (item.localAction === 'profile') {
      setShowProfile(true);
      setShowNotifications(false);
    } else if (item.localAction === 'signout') {
      setShowProfile(false);
      handleLogoutAction?.();
    }
  };

  // Toggle mobile menu accordion expansion
  const toggleMobileAccordion = (menuName) => {
    setExpandedMobileMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const toggleNestedAccordion = (itemPath) => {
    setExpandedNestedMenus((current) => ({ ...current, [itemPath]: !current[itemPath] }));
  };

  const openDesktopMenu = (menuName) => {
    window.clearTimeout(closeDropdownTimerRef.current);
    setActiveDropdown(menuName);
  };

  const scheduleDesktopMenuClose = () => {
    window.clearTimeout(closeDropdownTimerRef.current);
    closeDropdownTimerRef.current = window.setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const renderNavigationItems = (items, parentPath, depth = 0) => items.map((item) => {
    const itemPath = `${parentPath}/${item.name}`;
    const ItemIcon = item.icon || ClipboardList;
    const isExpanded = Boolean(expandedNestedMenus[itemPath]);
    if (item.children) {
      return (
        <div className="space-y-1" key={itemPath}>
          <button
            type="button"
            aria-expanded={isExpanded}
            onClick={() => toggleNestedAccordion(itemPath)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
            style={{ paddingLeft: `${12 + depth * 12}px` }}
          >
            <ItemIcon aria-hidden="true" className="shrink-0 text-cyan-800" size={16} />
            <span className="min-w-0 flex-1">{item.name}</span>
            <ChevronDown className={`shrink-0 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} size={15} />
          </button>
          {isExpanded && (
            <div className="ml-3 space-y-1 border-l border-slate-200 py-1 pl-2">
              {renderNavigationItems(item.children, itemPath, depth + 1)}
            </div>
          )}
        </div>
      );
    }

    const isActive = item.viewKey === 'Dashboard'
      ? activeView === dashboardView
      : activeView === item.viewKey && item.viewKey;
    return (
      <button
        key={itemPath}
        type="button"
        disabled={item.stage === 'development'}
        onClick={() => handleSubmenuClick(item)}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
          item.stage === 'development'
            ? 'cursor-not-allowed opacity-60'
            : isActive
              ? 'bg-cyan-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
        style={{ paddingLeft: `${12 + depth * 12}px` }}
      >
        <ItemIcon aria-hidden="true" className="shrink-0" size={15} />
        <span className="min-w-0 flex-1">{item.name}</span>
        {item.stage === 'development' && <span className="text-[8px] font-bold uppercase text-amber-700">In development</span>}
      </button>
    );
  });

  const handleLogoutAction = onSignOut || onLogout;
  const applyDevelopmentContext = async () => {
    setSwitchingRole(true);
    try {
      await onRoleChange(developmentRole, {
        department: developmentDepartment,
        student: developmentStudent,
        instructor: developmentInstructor,
      });
    } finally {
      setSwitchingRole(false);
    }
  };
  const renderDevelopmentControls = (compact = false) => (
    <div className={`flex ${compact ? 'flex-col items-stretch' : 'items-center'} gap-2`}>
      <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
        <span>Test role</span>
        <select aria-label="Development test role" className="h-8 rounded-lg border border-cyan-200 bg-cyan-50 px-2 text-[10px] font-semibold capitalize text-cyan-900" onChange={(event) => setDevelopmentRole(event.target.value)} value={developmentRole}>
          {devRoles.map((role) => <option className="capitalize" key={role} value={role}>{role.replaceAll('_', ' ')}</option>)}
        </select>
      </label>
      {['head', 'director'].includes(developmentRole) && <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
        <span>Department</span>
        <select aria-label="Development department scope" className="h-8 max-w-48 rounded-lg border border-cyan-200 bg-white px-2 text-[10px]" onChange={(event) => setDevelopmentDepartment(event.target.value)} value={developmentDepartment}>
          <option value="">Choose department</option>
          {developmentOptions.departments.map((department) => <option key={department} value={department}>{department}</option>)}
        </select>
      </label>}
      {['student', 'parent'].includes(developmentRole) && <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
        <span>Student</span>
        <select aria-label="Development linked student" className="h-8 max-w-48 rounded-lg border border-cyan-200 bg-white px-2 text-[10px]" onChange={(event) => setDevelopmentStudent(event.target.value)} value={developmentStudent}>
          <option value="">Choose student</option>
          {developmentOptions.students.map((student) => <option key={student._id} value={student._id}>{student.name} · {student.department}</option>)}
        </select>
      </label>}
      {developmentRole === 'teacher' && <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
        <span>Faculty</span>
        <select aria-label="Development linked faculty" className="h-8 max-w-48 rounded-lg border border-cyan-200 bg-white px-2 text-[10px]" onChange={(event) => setDevelopmentInstructor(event.target.value)} value={developmentInstructor}>
          <option value="">Choose instructor</option>
          {developmentOptions.instructors.map((instructor) => <option key={instructor._id} value={instructor._id}>{instructor.name} · {instructor.department}</option>)}
        </select>
      </label>}
      <button className="h-8 rounded-lg bg-cyan-900 px-3 text-[10px] font-bold text-white disabled:opacity-50" disabled={switchingRole} onClick={applyDevelopmentContext} type="button">{switchingRole ? 'Applying…' : 'Apply role'}</button>
    </div>
  );

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          {/* Left Section: Brand Logo & Title */}
          <button
            type="button"
            onClick={() => handleItemClick('Dashboard')}
            className="flex shrink-0 items-center gap-2.5 border-0 bg-transparent p-0 text-left text-slate-900 no-underline transition hover:opacity-90"
            aria-label="Campusdesk Dashboard Home"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-cyan-900 text-lime-300">
              <GraduationCap size={20} strokeWidth={2} />
            </span>
            <span className="font-['Manrope'] text-base font-extrabold tracking-tight">
              campus<span className="font-bold text-cyan-800">desk</span>
            </span>
          </button>

          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="campusdesk-navigation"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Desktop navigation is grouped with the brand and aligned to the left. */}
          <nav className="hidden items-center gap-1 xl:flex">
          {visibleMenus.map((menu) => {
            const MenuIcon = menu.icon;
            const isOpen = activeDropdown === menu.name;
            const isMenuDirectlyActive = menu.dropdown.some((item) =>
              item.viewKey === 'Dashboard' ? activeView === dashboardView : item.viewKey === activeView
            );

            return (
              <div
                key={menu.name}
                className="relative"
                onMouseEnter={() => openDesktopMenu(menu.name)}
                onMouseLeave={scheduleDesktopMenuClose}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (isOpen) {
                      window.clearTimeout(closeDropdownTimerRef.current);
                      setActiveDropdown(null);
                    } else {
                      openDesktopMenu(menu.name);
                    }
                  }}
                  aria-expanded={isOpen}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                    isOpen || isMenuDirectlyActive
                      ? 'bg-cyan-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <MenuIcon size={16} className={isOpen || isMenuDirectlyActive ? 'text-lime-300' : 'text-slate-500'} />
                  <span>{menu.name}</span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-lime-300' : isMenuDirectlyActive ? 'text-lime-300' : 'text-slate-400'
                    }`}
                  />
                </button>

                {/* Sub-Menu Dropdown Panel */}
                {isOpen && (
                  <div
                    className="absolute left-0 top-full z-50 w-[320px] pt-2 sm:w-[360px]"
                    onMouseEnter={() => openDesktopMenu(menu.name)}
                    onMouseLeave={scheduleDesktopMenuClose}
                  >
                    <div className="rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-slate-900/10 animate-in fade-in zoom-in-95 duration-150">
                      <div className="mb-2 flex items-center justify-between border-b border-slate-100 px-3 pb-1 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {menu.name} Actions
                        </span>
                        <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-medium text-cyan-800">
                          {menu.dropdown.length} Options
                        </span>
                      </div>

                      <div className="max-h-[min(70vh,560px)] space-y-1 overflow-y-auto pr-1">
                        {renderNavigationItems(menu.dropdown, menu.name)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </nav>
        </div>

        {/* Right Section: Utility Tools, API Indicator, User Profile & Mobile Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Dev Role Switcher */}
          {import.meta.env?.DEV && user?.devUser && onRoleChange && (
            <div className="hidden rounded-lg border border-cyan-200 bg-cyan-50/80 p-1.5 lg:block">
              {renderDevelopmentControls()}
            </div>
          )}

          {/* API Health Status Indicator */}
          <button
            type="button"
            onClick={onRefresh}
            title="Click to refresh system API connection"
            className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <span
              className={`size-2 rounded-full ${
                currentHealthStatus === 'connected' || currentHealthStatus === 'ok'
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : currentHealthStatus === 'checking'
                  ? 'animate-pulse bg-amber-400'
                  : 'bg-rose-500'
              }`}
            />
            <span>
              API{' '}
              {currentHealthStatus === 'connected' || currentHealthStatus === 'ok'
                ? 'Connected'
                : currentHealthStatus === 'checking'
                ? 'Checking...'
                : 'Unavailable'}
            </span>
            <RefreshCw size={12} className={`text-slate-400 ${currentHealthStatus === 'checking' ? 'animate-spin' : ''}`} />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              aria-label="System Notifications"
              aria-expanded={showNotifications}
              onClick={() => {
                setShowNotifications((prev) => !prev);
                setShowProfile(false);
                setActiveDropdown(null);
              }}
              className="relative grid size-9 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
            >
              <Bell size={19} />
              {(currentHealthStatus === 'error' || currentHealthStatus === 'unavailable') && (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-white bg-rose-500" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full">
                    System Alert
                  </span>
                </div>
                <div className="mt-3 text-xs leading-relaxed text-slate-600">
                  {currentHealthStatus === 'connected' || currentHealthStatus === 'ok'
                    ? 'All database and backend services are operational.'
                    : currentHealthStatus === 'checking'
                    ? 'Checking system connection status...'
                    : 'Backend API service is currently unreachable. Please refresh or verify server status.'}
                </div>
              </div>
            )}
          </div>

          <span className="hidden h-6 w-px bg-slate-200 sm:block" />

          {/* User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              aria-expanded={showProfile}
              onClick={() => {
                setShowProfile((prev) => !prev);
                setShowNotifications(false);
                setActiveDropdown(null);
              }}
              className="flex items-center gap-2 rounded-lg p-1.5 text-left transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
            >
              <span className="grid size-8 place-items-center rounded-full bg-cyan-900 text-xs font-bold text-lime-300 shadow-sm">
                {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
              </span>
              <span className="hidden sm:block">
                <span className="block text-xs font-bold leading-tight text-slate-900">{user?.name || 'Sneh Patel'}</span>
                <span className="block text-[10px] font-semibold leading-tight text-cyan-800 capitalize">
                  {user?.role ? user.role.replaceAll('_', ' ') : 'Administrator'}
                </span>
              </span>
              <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in duration-150">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <span className="grid size-10 place-items-center rounded-full bg-cyan-900 text-sm font-bold text-lime-300">
                    {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Sneh Patel'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@campusdesk.edu'}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded-md capitalize">
                      {user?.role ? user.role.replaceAll('_', ' ') : 'Administrator'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <button
                    type="button"
                    onClick={() => handleItemClick('Portal')}
                    className="w-full flex items-center gap-2 text-xs font-medium text-slate-700 px-2 py-2 rounded-lg hover:bg-slate-50 text-left cursor-pointer"
                  >
                    <HelpCircle size={15} className="text-slate-400" />
                    <span>User Portal View</span>
                  </button>
                  {handleLogoutAction && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfile(false);
                        handleLogoutAction();
                      }}
                      className="w-full flex items-center gap-2 text-xs font-semibold text-rose-600 px-2 py-2 rounded-lg hover:bg-rose-50 transition text-left cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Responsive Accordion Drawer Menu */}
      {isMobileMenuOpen && (
        <div id="campusdesk-navigation" className="absolute left-3 top-[72px] z-50 max-h-[calc(100dvh-80px)] w-[min(420px,calc(100vw-24px))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl animate-in slide-in-from-top-2 duration-200 sm:left-6 lg:left-8">
          <div className="space-y-3">
            {visibleMenus.map((menu) => {
              const MenuIcon = menu.icon;
              const isExpanded = !!expandedMobileMenus[menu.name];

              return (
                <div key={menu.name} className="border-b border-slate-100 pb-2">
                  <button
                    type="button"
                    onClick={() => toggleMobileAccordion(menu.name)}
                    className="flex items-center justify-between w-full rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <MenuIcon size={18} className="text-cyan-800" />
                      <span>{menu.name}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-500 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Mobile Accordion Sub-Menu Items */}
                  {isExpanded && (
                    <div className="mt-2 ml-2 space-y-1 border-l-2 border-cyan-800/20 pl-3">
                      {renderNavigationItems(menu.dropdown, menu.name)}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mobile Footer Utility Info & Sign Out */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                <span>API Status:</span>
                <span
                  className={`font-semibold ${
                    currentHealthStatus === 'connected' || currentHealthStatus === 'ok'
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {currentHealthStatus === 'connected' || currentHealthStatus === 'ok' ? 'Connected' : 'Unavailable'}
                </span>
              </div>
              {import.meta.env?.DEV && user?.devUser && onRoleChange && (
                <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-cyan-900">Development role context</p>
                  {renderDevelopmentControls(true)}
                </div>
              )}
              {handleLogoutAction && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogoutAction();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs py-2.5 hover:bg-rose-100 transition cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
