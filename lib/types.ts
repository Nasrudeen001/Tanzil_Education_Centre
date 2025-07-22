export interface User {
  id: string
  username: string
  password: string
  role: "admin" | "staff" | "student"
  createdAt: string
}

export interface Staff {
  id: string
  userId: string
  staffId: string
  firstName: string
  lastName: string
  nationalId: string
  email: string
  phone: string
  gender: "Male" | "Female"
  category: "teaching" | "non_teaching"
  subject?: string
  classAssigned?: string
  hireDate: string
  status: "active" | "inactive"
  createdAt: string
}

export interface Student {
  id: string
  userId: string
  admissionNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: "Male" | "Female"
  parentName: string
  parentPhone: string
  parentEmail: string
  category: "tahfidh" | "integrated" | "talim"
  className: string
  admissionDate: string
  status: "active" | "inactive"
  createdAt: string
}

export interface Class {
  id: string
  className: string
  teacherId?: string // Main class teacher/incharge
  category: "tahfidh" | "integrated" | "talim"
  academicYear: string
  createdAt: string
}

export interface Subject {
  id: string
  subjectName: string
  classId: string
  teacherId: string // Staff assigned to teach this subject
  maximumMarks: number
  term: string
  openingDate?: string
  closingDate?: string
  createdAt: string
}

export interface CommentRange {
  id: string
  minMarks: number
  maxMarks: number
  comment: string
  staffId: string
  classId: string
  createdAt: string
}

export interface Fee {
  id: string
  studentId: string
  term: string
  totalBilled: number
  totalPaid: number
  balance: number
  status: "pending" | "partial" | "paid" | "overpayment"
  createdAt: string
}

export interface FeePayment {
  id: string
  feeId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  referenceNumber: string
  notes: string
  createdAt: string
  status?: "pending" | "confirmed" | "failed"
}

export interface Announcement {
  id: string
  title: string
  content: string
  targetAudience:
    | "all"
    | "staff"
    | "students"
    | "tahfidh"
    | "integrated"
    | "talim"
    | "teaching_staff"
    | "non_teaching_staff"
  priority: "low" | "normal" | "high" | "urgent"
  createdBy: string
  isActive: boolean
  createdAt: string
}

export interface Assessment {
  id: string
  studentId: string
  subjectId: string
  term: string
  className: string
  subject: string
  assessmentType: string
  totalMarks: number
  marksObtained: number
  grade: string
  comment: string
  remarks: string
  assessmentDate: string
  createdBy: string
  createdAt: string
  updatedAt: string
  finalized?: boolean // true if finalized
  finalizedAt?: string // timestamp
  finalizedBy?: string // staffId who finalized
  unfinalizedBy?: string // staffId who unfinalized (for audit)
}

export interface IdCounter {
  teachingStaff: number
  nonTeachingStaff: number
  tahfidhStudent: number
  integratedStudent: number
  talimStudent: number
}

export interface ClassTermDates {
  id: string
  classId: string
  term: string
  openingDate: string
  closingDate: string
  createdBy: string // staff id
  createdAt: string
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  className: string;
  category: "tahfidh" | "integrated" | "talim";
  assignmentType: "link";
  linkUrl: string;
  maxGrade?: number;
  createdBy: string; // staff id
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  submissionType: "link";
  linkUrl: string;
  submittedAt: string;
  status: "submitted";
}

export interface AssignmentFeedback {
  id: string
  submissionId: string
  assignmentId: string
  studentId: string
  staffId: string
  grade: number
  maxGrade: number
  feedback: string
  gradedAt: string
}

export interface OfficialDocument {
  id: string
  title: string
  description?: string
  documentType: "policy" | "form" | "guideline" | "procedure" | "certificate" | "report" | "other"
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  uploadedBy: string // admin id
  isActive: boolean
  downloadCount: number
  createdAt: string
  updatedAt: string
}

// New interface for class-staff assignments
export interface ClassStaffAssignment {
  id: string
  classId: string
  staffId: string
  role: "incharge" | "subject_teacher" // incharge is the main teacher, subject_teacher teaches specific subjects
  assignedAt: string
  createdAt: string
}

// New interface for Collection Assessment (Main Class Teacher View)
export interface CollectionAssessment {
  id: string
  studentId: string
  studentName: string
  admissionNumber: string
  className: string
  term: string
  subjectMarks: { [subjectName: string]: number } // Individual subject marks
  totalMarks: number
  rank: number
  totalStudents: number
  createdAt: string
  updatedAt: string
}

// New interface for My Assessment (Subject Teacher View)
export interface MyAssessment {
  id: string
  studentId: string
  studentName: string
  admissionNumber: string
  className: string
  subjectId: string
  subjectName: string
  term: string
  assessmentType: string
  marksObtained: number
  totalMarks: number
  grade: string
  remarks: string
  assessmentDate: string
  createdBy: string
  createdAt: string
  updatedAt: string
  finalized?: boolean // true if finalized
  finalizedAt?: string // timestamp
  finalizedBy?: string // staffId who finalized
  unfinalizedBy?: string // staffId who unfinalized (for audit)
}

export interface AcademicCommentRange {
  id: string;
  classId: string;
  minAverage: number;
  maxAverage: number;
  classTeacherComment: string;
  principalComment: string;
  createdBy: string; // staff id
  createdAt: string;
}
