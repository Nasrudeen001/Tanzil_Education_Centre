import type {
  User,
  Staff,
  Student,
  Class,
  Fee,
  Announcement,
  Assessment,
  Subject,
  CommentRange,
  IdCounter,
  ClassTermDates,
  FeePayment,
  Assignment,
  AssignmentFeedback,
  OfficialDocument,
  ClassStaffAssignment,
  CollectionAssessment,
  MyAssessment,
  AcademicCommentRange,
} from "./types"

// Storage keys
const STORAGE_KEYS = {
  USERS: "schoolmanagementsystem_users",
  STAFF: "schoolmanagementsystem_staff",
  STUDENTS: "schoolmanagementsystem_students",
  CLASSES: "schoolmanagementsystem_classes",
  SUBJECTS: "schoolmanagementsystem_subjects",
  COMMENT_RANGES: "schoolmanagementsystem_comment_ranges",
  FEES: "schoolmanagementsystem_fees",
  FEE_PAYMENTS: "schoolmanagementsystem_fee_payments",
  ANNOUNCEMENTS: "schoolmanagementsystem_announcements",
  ASSESSMENTS: "schoolmanagementsystem_assessments",
  ID_COUNTERS: "schoolmanagementsystem_id_counters",
  CURRENT_USER: "schoolmanagementsystem_current_user",
  CLASS_TERM_DATES: "schoolmanagementsystem_class_term_dates",
  ASSIGNMENTS: "schoolmanagementsystem_assignments",
  ASSIGNMENT_FEEDBACK: "schoolmanagementsystem_assignment_feedback",
  OFFICIAL_DOCUMENTS: "schoolmanagementsystem_official_documents",
  CLASS_STAFF_ASSIGNMENTS: "schoolmanagementsystem_class_staff_assignments",
  COLLECTION_ASSESSMENTS: "schoolmanagementsystem_collection_assessments",
  MY_ASSESSMENTS: "schoolmanagementsystem_my_assessments",
  ACADEMIC_COMMENT_RANGES: "schoolmanagementsystem_academic_comment_ranges",
}

// Generic storage functions
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

// Initialize default data
export function initializeDefaultData() {
  // Initialize admin user
  const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, [])
  if (users.length === 0) {
    const adminUser: User = {
      id: "1",
      username: "tanzileducationcenter@gmail.com",
      password: "Markaz_001",
      role: "admin",
      createdAt: new Date().toISOString(),
    }
    setToStorage(STORAGE_KEYS.USERS, [adminUser])
  }

  // Initialize ID counters
  const counters = getFromStorage<IdCounter>(STORAGE_KEYS.ID_COUNTERS, {
    teachingStaff: 0,
    nonTeachingStaff: 0,
    tahfidhStudent: 0,
    integratedStudent: 0,
    talimStudent: 0,
  })
  setToStorage(STORAGE_KEYS.ID_COUNTERS, counters)

  // Initialize default classes with new format
  const classes = getFromStorage<Class[]>(STORAGE_KEYS.CLASSES, [])
  if (classes.length === 0) {
    const currentYear = new Date().getFullYear().toString()
    const defaultClasses: Class[] = [
      {
        id: "1",
        className: "Grade 1",
        category: "tahfidh",
        academicYear: currentYear,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        className: "Grade 2",
        category: "tahfidh",
        academicYear: currentYear,
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        className: "Grade 1",
        category: "integrated",
        academicYear: currentYear,
        createdAt: new Date().toISOString(),
      },
      {
        id: "4",
        className: "Grade 2",
        category: "integrated",
        academicYear: currentYear,
        createdAt: new Date().toISOString(),
      },
      {
        id: "5",
        className: "Grade 1",
        category: "talim",
        academicYear: currentYear,
        createdAt: new Date().toISOString(),
      },
      {
        id: "6",
        className: "Grade 2",
        category: "talim",
        academicYear: currentYear,
        createdAt: new Date().toISOString(),
      },
    ]
    setToStorage(STORAGE_KEYS.CLASSES, defaultClasses)
  }
}

// User management
export function getCurrentUser(): User | null {
  return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null)
}

export function setCurrentUser(user: User | null): void {
  setToStorage(STORAGE_KEYS.CURRENT_USER, user)
}

export function authenticateUser(username: string, password: string): User | null {
  const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, [])
  const user = users.find((u) => u.username === username && u.password === password)
  
  if (!user) return null
  
  // Check if user is staff or student and verify their status
  if (user.role === "staff") {
    const allStaff = getFromStorage<Staff[]>(STORAGE_KEYS.STAFF, [])
    const staffMember = allStaff.find((s) => s.userId === user.id)
    if (!staffMember || staffMember.status === "inactive") {
      return null // Return null if staff is inactive or not found
    }
  } else if (user.role === "student") {
    const allStudents = getFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, [])
    const student = allStudents.find((s) => s.userId === user.id)
    if (!student || student.status === "inactive") {
      return null // Return null if student is inactive or not found
    }
  }
  
  return user
}

// ID generation functions
export function generateStaffId(category: "teaching" | "non_teaching"): string {
  const counters = getFromStorage<IdCounter>(STORAGE_KEYS.ID_COUNTERS, {
    teachingStaff: 0,
    nonTeachingStaff: 0,
    tahfidhStudent: 0,
    integratedStudent: 0,
    talimStudent: 0,
  })

  const prefix = category === "teaching" ? "TSP124" : "TSP125"
  const counterKey = category === "teaching" ? "teachingStaff" : "nonTeachingStaff"

  counters[counterKey]++
  setToStorage(STORAGE_KEYS.ID_COUNTERS, counters)

  const paddedCounter = counters[counterKey].toString().padStart(4, "0")
  return `${prefix}/${paddedCounter}`
}

export function generateAdmissionNumber(category: "tahfidh" | "integrated" | "talim"): string {
  const counters = getFromStorage<IdCounter>(STORAGE_KEYS.ID_COUNTERS, {
    teachingStaff: 0,
    nonTeachingStaff: 0,
    tahfidhStudent: 0,
    integratedStudent: 0,
    talimStudent: 0,
  })

  let prefix = ""
  let counterKey: keyof IdCounter

  switch (category) {
    case "tahfidh":
      prefix = "TPP214"
      counterKey = "tahfidhStudent"
      break
    case "integrated":
      prefix = "TPP215"
      counterKey = "integratedStudent"
      break
    case "talim":
      prefix = "TPP216"
      counterKey = "talimStudent"
      break
  }

  counters[counterKey]++
  setToStorage(STORAGE_KEYS.ID_COUNTERS, counters)

  const paddedCounter = counters[counterKey].toString().padStart(4, "0")
  return `${prefix}/${paddedCounter}`
}

// Data access functions
export const storage = {
  users: {
    getAll: () => getFromStorage<User[]>(STORAGE_KEYS.USERS, []),
    save: (users: User[]) => setToStorage(STORAGE_KEYS.USERS, users),
    add: (user: User) => {
      const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, [])
      users.push(user)
      setToStorage(STORAGE_KEYS.USERS, users)
    },
    update: (id: string, updates: Partial<User>) => {
      const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, [])
      const index = users.findIndex((u) => u.id === id)
      if (index !== -1) {
        users[index] = { ...users[index], ...updates }
        setToStorage(STORAGE_KEYS.USERS, users)
      }
    },
    delete: (id: string) => {
      const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, [])
      const filtered = users.filter((u) => u.id !== id)
      setToStorage(STORAGE_KEYS.USERS, filtered)
    },
  },
  staff: {
    getAll: () => getFromStorage<Staff[]>(STORAGE_KEYS.STAFF, []),
    save: (staff: Staff[]) => setToStorage(STORAGE_KEYS.STAFF, staff),
    add: (staff: Staff) => {
      const allStaff = getFromStorage<Staff[]>(STORAGE_KEYS.STAFF, [])
      allStaff.push(staff)
      setToStorage(STORAGE_KEYS.STAFF, allStaff)
    },
    update: (id: string, updates: Partial<Staff>) => {
      const allStaff = getFromStorage<Staff[]>(STORAGE_KEYS.STAFF, [])
      const index = allStaff.findIndex((s) => s.id === id)
      if (index !== -1) {
        allStaff[index] = { ...allStaff[index], ...updates }
        setToStorage(STORAGE_KEYS.STAFF, allStaff)
      }
    },
    delete: (id: string) => {
      const allStaff = getFromStorage<Staff[]>(STORAGE_KEYS.STAFF, [])
      const staffToDelete = allStaff.find((s) => s.id === id)
      const filtered = allStaff.filter((s) => s.id !== id)
      setToStorage(STORAGE_KEYS.STAFF, filtered)
      // Reset counter if no staff left in this category
      if (staffToDelete) {
        const category = staffToDelete.category
        const stillExists = filtered.some((s) => s.category === category)
        if (!stillExists) {
          const counters = getFromStorage<IdCounter>(STORAGE_KEYS.ID_COUNTERS, {
            teachingStaff: 0,
            nonTeachingStaff: 0,
            tahfidhStudent: 0,
            integratedStudent: 0,
            talimStudent: 0,
          })
          if (category === "teaching") counters.teachingStaff = 0
          if (category === "non_teaching") counters.nonTeachingStaff = 0
          setToStorage(STORAGE_KEYS.ID_COUNTERS, counters)
        }
      }
    },
  },
  students: {
    getAll: () => getFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, []),
    save: (students: Student[]) => setToStorage(STORAGE_KEYS.STUDENTS, students),
    add: (student: Student) => {
      const students = getFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, [])
      students.push(student)
      setToStorage(STORAGE_KEYS.STUDENTS, students)
    },
    update: (id: string, updates: Partial<Student>) => {
      const students = getFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, [])
      const index = students.findIndex((s) => s.id === id)
      if (index !== -1) {
        students[index] = { ...students[index], ...updates }
        setToStorage(STORAGE_KEYS.STUDENTS, students)
      }
    },
    delete: (id: string) => {
      const students = getFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, [])
      const studentToDelete = students.find((s) => s.id === id)
      const filtered = students.filter((s) => s.id !== id)
      setToStorage(STORAGE_KEYS.STUDENTS, filtered)
      // Reset counter if no students left in this category
      if (studentToDelete) {
        const category = studentToDelete.category
        const stillExists = filtered.some((s) => s.category === category)
        if (!stillExists) {
          const counters = getFromStorage<IdCounter>(STORAGE_KEYS.ID_COUNTERS, {
            teachingStaff: 0,
            nonTeachingStaff: 0,
            tahfidhStudent: 0,
            integratedStudent: 0,
            talimStudent: 0,
          })
          if (category === "tahfidh") counters.tahfidhStudent = 0
          if (category === "integrated") counters.integratedStudent = 0
          if (category === "talim") counters.talimStudent = 0
          setToStorage(STORAGE_KEYS.ID_COUNTERS, counters)
        }
      }
    },
  },
  classes: {
    getAll: () => getFromStorage<Class[]>(STORAGE_KEYS.CLASSES, []),
    save: (classes: Class[]) => setToStorage(STORAGE_KEYS.CLASSES, classes),
    add: (classItem: Class) => {
      const classes = getFromStorage<Class[]>(STORAGE_KEYS.CLASSES, [])
      classes.push(classItem)
      setToStorage(STORAGE_KEYS.CLASSES, classes)
    },
    update: (id: string, updates: Partial<Class>) => {
      const classes = getFromStorage<Class[]>(STORAGE_KEYS.CLASSES, [])
      const index = classes.findIndex((c) => c.id === id)
      if (index !== -1) {
        classes[index] = { ...classes[index], ...updates }
        setToStorage(STORAGE_KEYS.CLASSES, classes)
      }
    },
    delete: (id: string) => {
      const classes = getFromStorage<Class[]>(STORAGE_KEYS.CLASSES, [])
      const filtered = classes.filter((c) => c.id !== id)
      setToStorage(STORAGE_KEYS.CLASSES, filtered)
    },
  },
  subjects: {
    getAll: () => getFromStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, []),
    save: (subjects: Subject[]) => setToStorage(STORAGE_KEYS.SUBJECTS, subjects),
    add: (subject: Subject) => {
      const subjects = getFromStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, [])
      subjects.push(subject)
      setToStorage(STORAGE_KEYS.SUBJECTS, subjects)
    },
    update: (id: string, updates: Partial<Subject>) => {
      const subjects = getFromStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, [])
      const index = subjects.findIndex((s) => s.id === id)
      if (index !== -1) {
        subjects[index] = { ...subjects[index], ...updates }
        setToStorage(STORAGE_KEYS.SUBJECTS, subjects)
      }
    },
    delete: (id: string) => {
      const subjects = getFromStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, [])
      const filtered = subjects.filter((s) => s.id !== id)
      setToStorage(STORAGE_KEYS.SUBJECTS, filtered)
    },
  },
  commentRanges: {
    getAll: () => getFromStorage<CommentRange[]>(STORAGE_KEYS.COMMENT_RANGES, []),
    save: (ranges: CommentRange[]) => setToStorage(STORAGE_KEYS.COMMENT_RANGES, ranges),
    add: (range: CommentRange) => {
      const ranges = getFromStorage<CommentRange[]>(STORAGE_KEYS.COMMENT_RANGES, [])
      ranges.push(range)
      setToStorage(STORAGE_KEYS.COMMENT_RANGES, ranges)
    },
    update: (id: string, updates: Partial<CommentRange>) => {
      const ranges = getFromStorage<CommentRange[]>(STORAGE_KEYS.COMMENT_RANGES, [])
      const index = ranges.findIndex((r) => r.id === id)
      if (index !== -1) {
        ranges[index] = { ...ranges[index], ...updates }
        setToStorage(STORAGE_KEYS.COMMENT_RANGES, ranges)
      }
    },
    delete: (id: string) => {
      const ranges = getFromStorage<CommentRange[]>(STORAGE_KEYS.COMMENT_RANGES, [])
      const filtered = ranges.filter((r) => r.id !== id)
      setToStorage(STORAGE_KEYS.COMMENT_RANGES, filtered)
    },
  },
  fees: {
    getAll: () => getFromStorage<Fee[]>(STORAGE_KEYS.FEES, []),
    save: (fees: Fee[]) => setToStorage(STORAGE_KEYS.FEES, fees),
    add: (fee: Fee) => {
      const fees = getFromStorage<Fee[]>(STORAGE_KEYS.FEES, [])
      fees.push(fee)
      setToStorage(STORAGE_KEYS.FEES, fees)
    },
    update: (id: string, updates: Partial<Fee>) => {
      const fees = getFromStorage<Fee[]>(STORAGE_KEYS.FEES, [])
      const index = fees.findIndex((f) => f.id === id)
      if (index !== -1) {
        fees[index] = { ...fees[index], ...updates }
        setToStorage(STORAGE_KEYS.FEES, fees)
      }
    },
    delete: (id: string) => {
      const fees = getFromStorage<Fee[]>(STORAGE_KEYS.FEES, [])
      const filtered = fees.filter((f) => f.id !== id)
      setToStorage(STORAGE_KEYS.FEES, filtered)
    },
  },
  feePayments: {
    getAll: () => getFromStorage<FeePayment[]>(STORAGE_KEYS.FEE_PAYMENTS, []),
    save: (payments: FeePayment[]) => setToStorage(STORAGE_KEYS.FEE_PAYMENTS, payments),
    add: (payment: FeePayment) => {
      const payments = getFromStorage<FeePayment[]>(STORAGE_KEYS.FEE_PAYMENTS, [])
      payments.push(payment)
      setToStorage(STORAGE_KEYS.FEE_PAYMENTS, payments)
    },
    update: (id: string, updates: Partial<FeePayment>) => {
      const payments = getFromStorage<FeePayment[]>(STORAGE_KEYS.FEE_PAYMENTS, [])
      const index = payments.findIndex((p) => p.id === id)
      if (index !== -1) {
        payments[index] = { ...payments[index], ...updates }
        setToStorage(STORAGE_KEYS.FEE_PAYMENTS, payments)
      }
    },
    delete: (id: string) => {
      const payments = getFromStorage<FeePayment[]>(STORAGE_KEYS.FEE_PAYMENTS, [])
      const filtered = payments.filter((p) => p.id !== id)
      setToStorage(STORAGE_KEYS.FEE_PAYMENTS, filtered)
    },
  },
  announcements: {
    getAll: () => getFromStorage<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []),
    save: (announcements: Announcement[]) => setToStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements),
    add: (announcement: Announcement) => {
      const announcements = getFromStorage<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, [])
      announcements.push(announcement)
      setToStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements)
    },
    update: (id: string, updates: Partial<Announcement>) => {
      const announcements = getFromStorage<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, [])
      const index = announcements.findIndex((a) => a.id === id)
      if (index !== -1) {
        announcements[index] = { ...announcements[index], ...updates }
        setToStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements)
      }
    },
    delete: (id: string) => {
      const announcements = getFromStorage<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, [])
      const filtered = announcements.filter((a) => a.id !== id)
      setToStorage(STORAGE_KEYS.ANNOUNCEMENTS, filtered)
    },
  },
  assessments: {
    getAll: () => getFromStorage<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, []),
    save: (assessments: Assessment[]) => setToStorage(STORAGE_KEYS.ASSESSMENTS, assessments),
    add: (assessment: Assessment) => {
      const assessments = getFromStorage<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, [])
      assessments.push(assessment)
      setToStorage(STORAGE_KEYS.ASSESSMENTS, assessments)
    },
    update: (id: string, updates: Partial<Assessment>) => {
      const assessments = getFromStorage<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, [])
      const index = assessments.findIndex((a) => a.id === id)
      if (index !== -1) {
        assessments[index] = { ...assessments[index], ...updates }
        setToStorage(STORAGE_KEYS.ASSESSMENTS, assessments)
      }
    },
    delete: (id: string) => {
      const assessments = getFromStorage<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, [])
      const filtered = assessments.filter((a) => a.id !== id)
      setToStorage(STORAGE_KEYS.ASSESSMENTS, filtered)
    },
    deleteAllForStudentAssessment: (studentId: string, subjectId: string, assessmentType: string) => {
      const assessments = getFromStorage<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, [])
      const filtered = assessments.filter((a) => !(a.studentId === studentId && a.subjectId === subjectId && a.assessmentType === assessmentType))
      setToStorage(STORAGE_KEYS.ASSESSMENTS, filtered)
    },
    finalize: (className: string, subjectId: string, assessmentType: string, teacherId: string) => {
      const assessments = getFromStorage<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, [])
      const now = new Date().toISOString()
      const updated = assessments.map(a =>
        a.className === className && a.subjectId === subjectId && a.assessmentType === assessmentType && a.createdBy === teacherId
          ? { ...a, finalized: true, finalizedAt: now, finalizedBy: teacherId, unfinalizedBy: undefined }
          : a
      )
      setToStorage(STORAGE_KEYS.ASSESSMENTS, updated)
    },
    unfinalize: (className: string, subjectId: string, assessmentType: string, teacherId: string, unfinalizedBy: string) => {
      const assessments = getFromStorage<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, [])
      const updated = assessments.map(a =>
        a.className === className && a.subjectId === subjectId && a.assessmentType === assessmentType && a.createdBy === teacherId
          ? { ...a, finalized: false, finalizedAt: undefined, finalizedBy: undefined, unfinalizedBy }
          : a
      )
      setToStorage(STORAGE_KEYS.ASSESSMENTS, updated)
    },
  },
  classTermDates: {
    getAll: () => getFromStorage<ClassTermDates[]>(STORAGE_KEYS.CLASS_TERM_DATES, []),
    save: (dates: ClassTermDates[]) => setToStorage(STORAGE_KEYS.CLASS_TERM_DATES, dates),
    add: (date: ClassTermDates) => {
      const dates = getFromStorage<ClassTermDates[]>(STORAGE_KEYS.CLASS_TERM_DATES, [])
      dates.push(date)
      setToStorage(STORAGE_KEYS.CLASS_TERM_DATES, dates)
    },
    update: (id: string, updates: Partial<ClassTermDates>) => {
      const dates = getFromStorage<ClassTermDates[]>(STORAGE_KEYS.CLASS_TERM_DATES, [])
      const index = dates.findIndex((d) => d.id === id)
      if (index !== -1) {
        dates[index] = { ...dates[index], ...updates }
        setToStorage(STORAGE_KEYS.CLASS_TERM_DATES, dates)
      }
    },
    delete: (id: string) => {
      const dates = getFromStorage<ClassTermDates[]>(STORAGE_KEYS.CLASS_TERM_DATES, [])
      const filtered = dates.filter((d) => d.id !== id)
      setToStorage(STORAGE_KEYS.CLASS_TERM_DATES, filtered)
    },
  },
  assignments: {
    getAll: () => getFromStorage<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []),
    save: (assignments: Assignment[]) => setToStorage(STORAGE_KEYS.ASSIGNMENTS, assignments),
    add: (assignment: Assignment) => {
      const assignments = getFromStorage<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, [])
      assignments.push(assignment)
      setToStorage(STORAGE_KEYS.ASSIGNMENTS, assignments)
    },
    update: (id: string, updates: Partial<Assignment>) => {
      const assignments = getFromStorage<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, [])
      const index = assignments.findIndex((a) => a.id === id)
      if (index !== -1) {
        assignments[index] = { ...assignments[index], ...updates }
        setToStorage(STORAGE_KEYS.ASSIGNMENTS, assignments)
      }
    },
    delete: (id: string) => {
      const assignments = getFromStorage<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, [])
      const filtered = assignments.filter((a) => a.id !== id)
      setToStorage(STORAGE_KEYS.ASSIGNMENTS, filtered)
    },
  },
  assignmentFeedback: {
    getAll: () => getFromStorage<AssignmentFeedback[]>(STORAGE_KEYS.ASSIGNMENT_FEEDBACK, []),
    save: (feedback: AssignmentFeedback[]) => setToStorage(STORAGE_KEYS.ASSIGNMENT_FEEDBACK, feedback),
    add: (feedback: AssignmentFeedback) => {
      const allFeedback = getFromStorage<AssignmentFeedback[]>(STORAGE_KEYS.ASSIGNMENT_FEEDBACK, [])
      allFeedback.push(feedback)
      setToStorage(STORAGE_KEYS.ASSIGNMENT_FEEDBACK, allFeedback)
    },
    update: (id: string, updates: Partial<AssignmentFeedback>) => {
      const allFeedback = getFromStorage<AssignmentFeedback[]>(STORAGE_KEYS.ASSIGNMENT_FEEDBACK, [])
      const index = allFeedback.findIndex((f) => f.id === id)
      if (index !== -1) {
        allFeedback[index] = { ...allFeedback[index], ...updates }
        setToStorage(STORAGE_KEYS.ASSIGNMENT_FEEDBACK, allFeedback)
      }
    },
    delete: (id: string) => {
      const allFeedback = getFromStorage<AssignmentFeedback[]>(STORAGE_KEYS.ASSIGNMENT_FEEDBACK, [])
      const filtered = allFeedback.filter((f) => f.id !== id)
      setToStorage(STORAGE_KEYS.ASSIGNMENT_FEEDBACK, filtered)
    },
  },
  documents: {
    getAll: () => getFromStorage<OfficialDocument[]>(STORAGE_KEYS.OFFICIAL_DOCUMENTS, []),
    save: (documents: OfficialDocument[]) => setToStorage(STORAGE_KEYS.OFFICIAL_DOCUMENTS, documents),
    add: (document: OfficialDocument) => {
      const documents = getFromStorage<OfficialDocument[]>(STORAGE_KEYS.OFFICIAL_DOCUMENTS, [])
      documents.push(document)
      setToStorage(STORAGE_KEYS.OFFICIAL_DOCUMENTS, documents)
    },
    update: (id: string, updates: Partial<OfficialDocument>) => {
      const documents = getFromStorage<OfficialDocument[]>(STORAGE_KEYS.OFFICIAL_DOCUMENTS, [])
      const index = documents.findIndex((d) => d.id === id)
      if (index !== -1) {
        documents[index] = { ...documents[index], ...updates }
        setToStorage(STORAGE_KEYS.OFFICIAL_DOCUMENTS, documents)
      }
    },
    delete: (id: string) => {
      const documents = getFromStorage<OfficialDocument[]>(STORAGE_KEYS.OFFICIAL_DOCUMENTS, [])
      const filtered = documents.filter((d) => d.id !== id)
      setToStorage(STORAGE_KEYS.OFFICIAL_DOCUMENTS, filtered)
    },
    incrementDownloadCount: (id: string) => {
      const documents = getFromStorage<OfficialDocument[]>(STORAGE_KEYS.OFFICIAL_DOCUMENTS, [])
      const index = documents.findIndex((d) => d.id === id)
      if (index !== -1) {
        documents[index].downloadCount++
        setToStorage(STORAGE_KEYS.OFFICIAL_DOCUMENTS, documents)
      }
    },
  },
  classStaffAssignments: {
    getAll: () => getFromStorage<ClassStaffAssignment[]>(STORAGE_KEYS.CLASS_STAFF_ASSIGNMENTS, []),
    save: (assignments: ClassStaffAssignment[]) => setToStorage(STORAGE_KEYS.CLASS_STAFF_ASSIGNMENTS, assignments),
    add: (assignment: ClassStaffAssignment) => {
      const assignments = getFromStorage<ClassStaffAssignment[]>(STORAGE_KEYS.CLASS_STAFF_ASSIGNMENTS, [])
      assignments.push(assignment)
      setToStorage(STORAGE_KEYS.CLASS_STAFF_ASSIGNMENTS, assignments)
    },
    update: (id: string, updates: Partial<ClassStaffAssignment>) => {
      const assignments = getFromStorage<ClassStaffAssignment[]>(STORAGE_KEYS.CLASS_STAFF_ASSIGNMENTS, [])
      const index = assignments.findIndex((a) => a.id === id)
      if (index !== -1) {
        assignments[index] = { ...assignments[index], ...updates }
        setToStorage(STORAGE_KEYS.CLASS_STAFF_ASSIGNMENTS, assignments)
      }
    },
    delete: (id: string) => {
      const assignments = getFromStorage<ClassStaffAssignment[]>(STORAGE_KEYS.CLASS_STAFF_ASSIGNMENTS, [])
      const filtered = assignments.filter((a) => a.id !== id)
      setToStorage(STORAGE_KEYS.CLASS_STAFF_ASSIGNMENTS, filtered)
    },
    getByClassId: (classId: string) => {
      const assignments = getFromStorage<ClassStaffAssignment[]>(STORAGE_KEYS.CLASS_STAFF_ASSIGNMENTS, [])
      return assignments.filter((a) => a.classId === classId)
    },
    getByStaffId: (staffId: string) => {
      const assignments = getFromStorage<ClassStaffAssignment[]>(STORAGE_KEYS.CLASS_STAFF_ASSIGNMENTS, [])
      return assignments.filter((a) => a.staffId === staffId)
    },
    getInchargeByClassId: (classId: string) => {
      const assignments = getFromStorage<ClassStaffAssignment[]>(STORAGE_KEYS.CLASS_STAFF_ASSIGNMENTS, [])
      return assignments.find((a) => a.classId === classId && a.role === "incharge")
    },
  },
  collectionAssessments: {
    getAll: () => getFromStorage<CollectionAssessment[]>(STORAGE_KEYS.COLLECTION_ASSESSMENTS, []),
    save: (assessments: CollectionAssessment[]) => setToStorage(STORAGE_KEYS.COLLECTION_ASSESSMENTS, assessments),
    add: (assessment: CollectionAssessment) => {
      const assessments = getFromStorage<CollectionAssessment[]>(STORAGE_KEYS.COLLECTION_ASSESSMENTS, [])
      assessments.push(assessment)
      setToStorage(STORAGE_KEYS.COLLECTION_ASSESSMENTS, assessments)
    },
    update: (id: string, updates: Partial<CollectionAssessment>) => {
      const assessments = getFromStorage<CollectionAssessment[]>(STORAGE_KEYS.COLLECTION_ASSESSMENTS, [])
      const index = assessments.findIndex((a) => a.id === id)
      if (index !== -1) {
        assessments[index] = { ...assessments[index], ...updates }
        setToStorage(STORAGE_KEYS.COLLECTION_ASSESSMENTS, assessments)
      }
    },
    delete: (id: string) => {
      const assessments = getFromStorage<CollectionAssessment[]>(STORAGE_KEYS.COLLECTION_ASSESSMENTS, [])
      const filtered = assessments.filter((a) => a.id !== id)
      setToStorage(STORAGE_KEYS.COLLECTION_ASSESSMENTS, filtered)
    },
    getByClassAndTerm: (className: string, term: string) => {
      const assessments = getFromStorage<CollectionAssessment[]>(STORAGE_KEYS.COLLECTION_ASSESSMENTS, [])
      return assessments.filter((a) => a.className === className && a.term === term)
    },
  },
  myAssessments: {
    getAll: () => getFromStorage<MyAssessment[]>(STORAGE_KEYS.MY_ASSESSMENTS, []),
    save: (assessments: MyAssessment[]) => setToStorage(STORAGE_KEYS.MY_ASSESSMENTS, assessments),
    add: (assessment: MyAssessment) => {
      const assessments = getFromStorage<MyAssessment[]>(STORAGE_KEYS.MY_ASSESSMENTS, [])
      assessments.push(assessment)
      setToStorage(STORAGE_KEYS.MY_ASSESSMENTS, assessments)
    },
    update: (id: string, updates: Partial<MyAssessment>) => {
      const assessments = getFromStorage<MyAssessment[]>(STORAGE_KEYS.MY_ASSESSMENTS, [])
      const index = assessments.findIndex((a) => a.id === id)
      if (index !== -1) {
        assessments[index] = { ...assessments[index], ...updates }
        setToStorage(STORAGE_KEYS.MY_ASSESSMENTS, assessments)
      }
    },
    delete: (id: string) => {
      const assessments = getFromStorage<MyAssessment[]>(STORAGE_KEYS.MY_ASSESSMENTS, [])
      const filtered = assessments.filter((a) => a.id !== id)
      setToStorage(STORAGE_KEYS.MY_ASSESSMENTS, filtered)
    },
    getByTeacher: (teacherId: string) => {
      const assessments = getFromStorage<MyAssessment[]>(STORAGE_KEYS.MY_ASSESSMENTS, [])
      return assessments.filter((a) => a.createdBy === teacherId)
    },
    getByClassAndTerm: (className: string, term: string, teacherId: string) => {
      const assessments = getFromStorage<MyAssessment[]>(STORAGE_KEYS.MY_ASSESSMENTS, [])
      return assessments.filter((a) => a.className === className && a.term === term && a.createdBy === teacherId)
    },
    deleteAllForStudentAssessment: (studentId: string, subjectId: string, assessmentType: string) => {
      const assessments = getFromStorage<MyAssessment[]>(STORAGE_KEYS.MY_ASSESSMENTS, [])
      const filtered = assessments.filter((a) => !(a.studentId === studentId && a.subjectId === subjectId && a.assessmentType === assessmentType))
      setToStorage(STORAGE_KEYS.MY_ASSESSMENTS, filtered)
    },
    finalize: (className: string, subjectId: string, assessmentType: string, teacherId: string) => {
      const assessments = getFromStorage<MyAssessment[]>(STORAGE_KEYS.MY_ASSESSMENTS, [])
      const now = new Date().toISOString()
      const updated = assessments.map(a =>
        a.className === className && a.subjectId === subjectId && a.assessmentType === assessmentType && a.createdBy === teacherId
          ? { ...a, finalized: true, finalizedAt: now, finalizedBy: teacherId, unfinalizedBy: undefined }
          : a
      )
      setToStorage(STORAGE_KEYS.MY_ASSESSMENTS, updated)
    },
    unfinalize: (className: string, subjectId: string, assessmentType: string, teacherId: string, unfinalizedBy: string) => {
      const assessments = getFromStorage<MyAssessment[]>(STORAGE_KEYS.MY_ASSESSMENTS, [])
      const updated = assessments.map(a =>
        a.className === className && a.subjectId === subjectId && a.assessmentType === assessmentType && a.createdBy === teacherId
          ? { ...a, finalized: false, finalizedAt: undefined, finalizedBy: undefined, unfinalizedBy }
          : a
      )
      setToStorage(STORAGE_KEYS.MY_ASSESSMENTS, updated)
    },
  },
  academicCommentRanges: {
    getAll: () => getFromStorage<AcademicCommentRange[]>(STORAGE_KEYS.ACADEMIC_COMMENT_RANGES, []),
    save: (ranges: AcademicCommentRange[]) => setToStorage(STORAGE_KEYS.ACADEMIC_COMMENT_RANGES, ranges),
    add: (range: AcademicCommentRange) => {
      const ranges = getFromStorage<AcademicCommentRange[]>(STORAGE_KEYS.ACADEMIC_COMMENT_RANGES, [])
      ranges.push(range)
      setToStorage(STORAGE_KEYS.ACADEMIC_COMMENT_RANGES, ranges)
    },
    update: (id: string, updates: Partial<AcademicCommentRange>) => {
      const ranges = getFromStorage<AcademicCommentRange[]>(STORAGE_KEYS.ACADEMIC_COMMENT_RANGES, [])
      const index = ranges.findIndex((r) => r.id === id)
      if (index !== -1) {
        ranges[index] = { ...ranges[index], ...updates }
        setToStorage(STORAGE_KEYS.ACADEMIC_COMMENT_RANGES, ranges)
      }
    },
    delete: (id: string) => {
      const ranges = getFromStorage<AcademicCommentRange[]>(STORAGE_KEYS.ACADEMIC_COMMENT_RANGES, [])
      const filtered = ranges.filter((r) => r.id !== id)
      setToStorage(STORAGE_KEYS.ACADEMIC_COMMENT_RANGES, filtered)
    },
  },
}
