import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Student, Class, Staff, Assessment, CollectionAssessment, ClassStaffAssignment, Subject } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the appropriate logo URL based on the category
 * @param category - The category: 'tahfidh', 'integrated', or 'talim'
 * @returns The logo URL for the category
 */
export function getLogoByCategory(category: 'tahfidh' | 'integrated' | 'talim'): string {
  switch (category) {
    case 'integrated':
      return '/Integraed logo.jpeg'
    case 'tahfidh':
    case 'talim':
      return '/Talim and Tahfidh logo.jpeg'
    default:
      return '/Tanzil Logo.jpeg' // fallback
  }
}

/**
 * Filters students based on admission number codes according to their category
 * TPP214 = Tahfidh, TPP215 = Integrated, TPP216 = Talim
 */
export function filterStudentsByCategory(students: Student[], category: "tahfidh" | "integrated" | "talim"): Student[] {
  const prefixMap = {
    tahfidh: "TPP214",
    integrated: "TPP215", 
    talim: "TPP216"
  }
  
  const prefix = prefixMap[category]
  return students.filter(student => student.admissionNumber.startsWith(prefix))
}

/**
 * Gets the category from a student's admission number
 */
export function getCategoryFromAdmissionNumber(admissionNumber: string): "tahfidh" | "integrated" | "talim" | null {
  if (admissionNumber.startsWith("TPP214")) return "tahfidh"
  if (admissionNumber.startsWith("TPP215")) return "integrated"
  if (admissionNumber.startsWith("TPP216")) return "talim"
  return null
}

/**
 * Filters students for staff based on their assigned classes and category
 * Staff can only see students from their assigned category/class
 */
export function filterStudentsForStaff(students: Student[], assignedClasses: Class[], staffData: Staff | null): Student[] {
  if (!staffData) return []
  
  // Get unique categories from assigned classes
  const assignedCategories = new Set(assignedClasses.map(c => c.category))
  
  // Filter students by category based on admission number codes
  let filteredStudents: Student[] = []
  
  assignedCategories.forEach(category => {
    const categoryStudents = filterStudentsByCategory(students, category)
    // Further filter by class names that the staff is assigned to
    const classStudents = categoryStudents.filter(student => 
      assignedClasses.some(assignedClass => assignedClass.className === student.className)
    )
    filteredStudents.push(...classStudents)
  })
  
  return filteredStudents.filter(student => student.status === "active")
}

/**
 * Generates collection assessments from individual assessments for main class teachers
 */
export function generateCollectionAssessments(
  assessments: Assessment[], 
  students: Student[], 
  className: string, 
  term: string
): CollectionAssessment[] {
  const classStudents = students.filter(s => s.className === className)
  const classAssessments = assessments.filter(a => 
    classStudents.some(s => s.id === a.studentId) && a.term === term
  )

  const studentPerformanceMap = new Map<string, {
    studentId: string
    studentName: string
    admissionNumber: string
    subjectMarks: { [subjectName: string]: number }
    totalMarks: number
    obtainedMarks: number
  }>()

  // Calculate performance for each student
  classStudents.forEach(student => {
    const studentAssessments = classAssessments.filter(a => a.studentId === student.id)
    // Only include students who have at least one assessment for this term/type
    if (studentAssessments.length === 0) {
      return // skip this student
    }
    const subjectMarks: { [subjectName: string]: number } = {}
    let obtainedMarks = 0

    studentAssessments.forEach(assessment => {
      // Sum marks for each subject
      if (subjectMarks[assessment.subject]) {
        subjectMarks[assessment.subject] += assessment.marksObtained
      } else {
        subjectMarks[assessment.subject] = assessment.marksObtained
      }
      // Only sum obtained marks for total
      obtainedMarks += assessment.marksObtained
    })
    // Set totalMarks to obtainedMarks for collection assessment
    const totalMarks = obtainedMarks

    studentPerformanceMap.set(student.id, {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      subjectMarks,
      totalMarks,
      obtainedMarks
    })
  })

  // Convert to array and sort by total marks (highest to lowest)
  const performanceArray = Array.from(studentPerformanceMap.values())
    .sort((a, b) => b.totalMarks - a.totalMarks)

  // Add rank and convert to CollectionAssessment format
  return performanceArray.map((performance, index) => ({
    id: `collection_${Date.now()}_${index}`,
    studentId: performance.studentId,
    studentName: performance.studentName,
    admissionNumber: performance.admissionNumber,
    className,
    term,
    subjectMarks: performance.subjectMarks,
    totalMarks: performance.totalMarks,
    rank: index + 1,
    totalStudents: performanceArray.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }))
}

/**
 * Determines if a staff member is a main class teacher (incharge) for a specific class
 * Checks both ClassStaffAssignment (incharge role) and Class.teacherId assignment
 */
export function isMainClassTeacher(
  staffId: string, 
  classId: string, 
  classStaffAssignments: ClassStaffAssignment[],
  allClasses?: Class[]
): boolean {
  // Check if staff is assigned as incharge via ClassStaffAssignment
  const isIncharge = classStaffAssignments.some(assignment => 
    assignment.staffId === staffId && 
    assignment.classId === classId && 
    assignment.role === "incharge"
  )
  
  if (isIncharge) return true
  
  // Check if staff is assigned as main teacher via Class.teacherId
  if (allClasses) {
    const classItem = allClasses.find(c => c.id === classId)
    if (classItem && classItem.teacherId === staffId) {
      return true
    }
  }
  
  return false
}

/**
 * Gets the subjects that a staff member teaches in a specific class
 */
export function getStaffSubjectsInClass(staffId: string, classId: string, subjects: Subject[]): Subject[] {
  return subjects.filter(subject => 
    subject.teacherId === staffId && subject.classId === classId
  )
}

/**
 * Computes average collection assessments for a class across all terms
 */
export function generateAverageCollectionAssessments(
  assessments: Assessment[],
  students: Student[],
  className: string,
  assessmentTypes: string[]
): CollectionAssessment[] {
  const classStudents = students.filter(s => s.className === className)
  // Filter assessments for the class and all assessment types
  const classAssessments = assessments.filter(a =>
    classStudents.some(s => s.id === a.studentId) && assessmentTypes.includes(a.assessmentType)
  )

  const studentPerformanceMap = new Map<string, {
    studentId: string
    studentName: string
    admissionNumber: string
    subjectMarks: { [subjectName: string]: number }
    totalMarks: number
    obtainedMarks: number
  }>()

  // Calculate average for each student
  classStudents.forEach(student => {
    const studentAssessments = classAssessments.filter(a => a.studentId === student.id)
    if (studentAssessments.length === 0) {
      return // skip this student
    }
    const subjectMarks: { [subjectName: string]: number } = {}
    // For each subject, calculate average as described
    const subjects = Array.from(new Set(studentAssessments.map(a => a.subject)))
    subjects.forEach(subject => {
      const subjectAssessments = studentAssessments.filter(a => a.subject === subject)
      const sum = subjectAssessments.reduce((acc, a) => acc + a.marksObtained, 0)
      const count = subjectAssessments.length
      subjectMarks[subject] = count > 0 ? Number((sum / count).toFixed(2)) : 0
    })
    // Total marks is now the sum of the average marks for all subjects
    const totalAvgMarks = Object.values(subjectMarks).reduce((acc, avg) => acc + avg, 0)
    studentPerformanceMap.set(student.id, {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      subjectMarks,
      totalMarks: Number(totalAvgMarks.toFixed(2)),
      obtainedMarks: Number(totalAvgMarks.toFixed(2))
    })
  })

  // Convert to array and sort by total marks (highest to lowest)
  const performanceArray = Array.from(studentPerformanceMap.values())
    .sort((a, b) => b.totalMarks - a.totalMarks)

  // Add rank and convert to CollectionAssessment format
  return performanceArray.map((performance, index) => ({
    id: `collection_avg_${Date.now()}_${index}`,
    studentId: performance.studentId,
    studentName: performance.studentName,
    admissionNumber: performance.admissionNumber,
    className,
    term: 'Average',
    subjectMarks: performance.subjectMarks,
    totalMarks: performance.totalMarks,
    rank: index + 1,
    totalStudents: performanceArray.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }))
}
