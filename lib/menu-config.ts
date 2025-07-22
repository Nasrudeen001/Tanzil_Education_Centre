import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  DollarSign, 
  Bell, 
  User, 
  Pen,
  FileText,
  FolderOpen
} from "lucide-react"

export interface MenuItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export const getMenuItems = (role: string, category?: string): MenuItem[] => {
  switch (role) {
    case "admin":
      return [
        { title: "Dashboard", href: "/portal/admin", icon: BookOpen },
        { title: "Staff Management", href: "/portal/admin/staff", icon: Users },
        { title: "Student Management", href: "/portal/admin/students", icon: GraduationCap },
        { title: "Class Management", href: "/portal/admin/classes", icon: BookOpen },
        { title: "Academics", href: "/portal/admin/academics", icon: Pen },
        { title: "Fee Management", href: "/portal/admin/fees", icon: DollarSign },
        { title: "Announcements", href: "/portal/admin/announcements", icon: Bell },
        { title: "Assignments", href: "/portal/admin/assignments", icon: FileText },
        { title: "Profile", href: "/portal/admin/profile", icon: User },
      ]

    case "staff":
      if (category === "non_teaching") {
        return [
          { title: "Dashboard", href: "/portal/staff", icon: BookOpen },
          { title: "Documents", href: "/portal/staff/documents", icon: FolderOpen },
          { title: "Profile", href: "/portal/staff/profile", icon: User },
        ]
      }
      return [
        { title: "Dashboard", href: "/portal/staff", icon: BookOpen },
        { title: "My Classes", href: "/portal/staff/classes", icon: Users },
        { title: "My Subjects", href: "/portal/staff/subjects", icon: BookOpen },
        { title: "Students", href: "/portal/staff/students", icon: GraduationCap },
        { title: "Assessments", href: "/portal/staff/assessments", icon: BookOpen },
        { title: "Assignments", href: "/portal/staff/assignments", icon: FileText },
        { title: "Profile", href: "/portal/staff/profile", icon: User },
      ]

    case "student":
      return [
        { title: "Dashboard", href: "/portal/student", icon: BookOpen },
        { title: "Academic Records", href: "/portal/student/academics", icon: FileText },
        { title: "Fee Status", href: "/portal/student/fees", icon: DollarSign },
        { title: "Assignments", href: "/portal/student/assignments", icon: FileText },
        { title: "Profile", href: "/portal/student/profile", icon: User },
      ]

    default:
      return []
  }
} 