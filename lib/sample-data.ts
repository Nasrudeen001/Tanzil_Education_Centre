import { storage, generateStaffId, generateAdmissionNumber } from "./storage"
import type { User, Staff, Student, Fee } from "./types"

export function createSampleData() {
  // Check if sample data already exists
  const existingStaff = storage.staff.getAll()
  const existingStudents = storage.students.getAll()

  if (existingStaff.length > 0 || existingStudents.length > 0) {
    return // Sample data already exists
  }

  // Create sample staff with new fields
  const sampleStaff = [
    {
      firstName: "Ahmed",
      lastName: "Hassan",
      nationalId: "12345678",
      email: "ahmed.hassan@school.edu",
      phone: "+1234567890",
      gender: "Male" as const,
      category: "teaching" as const,
      subject: "Islamic Studies",
      classAssigned: "",
      hireDate: "2024-01-15",
    },
    {
      firstName: "Fatima",
      lastName: "Ali",
      nationalId: "87654321",
      email: "fatima.ali@school.edu",
      phone: "+1234567891",
      gender: "Female" as const,
      category: "teaching" as const,
      subject: "Arabic Language",
      classAssigned: "",
      hireDate: "2024-02-01",
    },
    {
      firstName: "Omar",
      lastName: "Khan",
      nationalId: "11223344",
      email: "omar.khan@school.edu",
      phone: "+1234567892",
      gender: "Male" as const,
      category: "non_teaching" as const,
      subject: "",
      classAssigned: "",
      hireDate: "2024-01-10",
    },
  ]

  sampleStaff.forEach((staffData, index) => {
    const staffId = generateStaffId(staffData.category)
    const userId = `staff_${Date.now()}_${index}`

    // Create user account
    const newUser: User = {
      id: userId,
      username: staffId,
      password: staffId,
      role: "staff",
      createdAt: new Date().toISOString(),
    }
    storage.users.add(newUser)

    // Create staff record
    const newStaff: Staff = {
      id: `staff_record_${Date.now()}_${index}`,
      userId,
      staffId,
      ...staffData,
      status: "active",
      createdAt: new Date().toISOString(),
    }
    storage.staff.add(newStaff)
  })

  // Create sample students with updated fields (no student phone/email)
  const sampleStudents = [
    {
      firstName: "Yusuf",
      lastName: "Ibrahim",
      dateOfBirth: "2010-05-15",
      gender: "Male" as const,
      parentName: "Ibrahim Ahmed",
      parentPhone: "+1234567894",
      parentEmail: "ibrahim.ahmed@parent.com",
      category: "tahfidh" as const,
      className: "Grade 1",
      admissionDate: "2024-03-01",
    },
    {
      firstName: "Aisha",
      lastName: "Mohamed",
      dateOfBirth: "2011-08-22",
      gender: "Female" as const,
      parentName: "Mohamed Ali",
      parentPhone: "+1234567896",
      parentEmail: "mohamed.ali@parent.com",
      category: "integrated" as const,
      className: "Grade 1",
      admissionDate: "2024-03-05",
    },
    {
      firstName: "Zaid",
      lastName: "Abdullah",
      dateOfBirth: "2012-12-10",
      gender: "Male" as const,
      parentName: "Abdullah Hassan",
      parentPhone: "+1234567898",
      parentEmail: "abdullah.hassan@parent.com",
      category: "talim" as const,
      className: "Grade 1",
      admissionDate: "2024-03-10",
    },
  ]

  sampleStudents.forEach((studentData, index) => {
    const admissionNumber = generateAdmissionNumber(studentData.category)
    const userId = `student_${Date.now()}_${index}`

    // Create user account
    const newUser: User = {
      id: userId,
      username: admissionNumber,
      password: admissionNumber,
      role: "student",
      createdAt: new Date().toISOString(),
    }
    storage.users.add(newUser)

    // Create student record
    const newStudent: Student = {
      id: `student_record_${Date.now()}_${index}`,
      userId,
      admissionNumber,
      ...studentData,
      status: "active",
      createdAt: new Date().toISOString(),
    }
    storage.students.add(newStudent)

    // Create multiple fee records for different terms/periods based on category
    const currentYear = new Date().getFullYear()
    
    if (studentData.category === "integrated") {
      // Integrated students have terms
      const terms = [`Term 1/${currentYear}`, `Term 2/${currentYear}`, `Term 3/${currentYear}`]
      terms.forEach((term, termIndex) => {
        const totalBilled = 3000 + (termIndex * 500) + (index * 200)
        let totalPaid = (termIndex * 800) + (index * 300)
        
        // Make one student have overpayment for testing
        if (index === 1 && termIndex === 1) {
          totalPaid = totalBilled + 150 // Overpayment
        }
        
        const balance = totalBilled - totalPaid
        let status: Fee["status"] = "pending"
        if (totalPaid > totalBilled) status = "overpayment"
        else if (totalPaid === totalBilled && totalBilled > 0) status = "paid"
        else if (totalPaid > 0) status = "partial"
        
        const newFee: Fee = {
          id: `fee_${Date.now()}_${index}_${termIndex}`,
          studentId: newStudent.id,
          term,
          totalBilled,
          totalPaid,
          balance,
          status,
          createdAt: new Date().toISOString(),
        }
        storage.fees.add(newFee)
      })
    } else if (studentData.category === "talim" || studentData.category === "tahfidh") {
      // Talim and Tahfidh students have months
      const months = [`January/${currentYear}`, `February/${currentYear}`, `March/${currentYear}`]
      months.forEach((month, monthIndex) => {
        const totalBilled = 2000 + (monthIndex * 300) + (index * 150)
        let totalPaid = (monthIndex * 600) + (index * 200)
        
        // Make one student have overpayment for testing
        if (index === 2 && monthIndex === 1) {
          totalPaid = totalBilled + 100 // Overpayment
        }
        
        const balance = totalBilled - totalPaid
        let status: Fee["status"] = "pending"
        if (totalPaid > totalBilled) status = "overpayment"
        else if (totalPaid === totalBilled && totalBilled > 0) status = "paid"
        else if (totalPaid > 0) status = "partial"
        
        const newFee: Fee = {
          id: `fee_${Date.now()}_${index}_${monthIndex}`,
          studentId: newStudent.id,
          term: month,
          totalBilled,
          totalPaid,
          balance,
          status,
          createdAt: new Date().toISOString(),
        }
        storage.fees.add(newFee)
      })
    }
  })

  console.log("Sample data created successfully!")
}
