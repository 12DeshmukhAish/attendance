import * as XLSX from "xlsx"

export const generateExcelReport = (attendanceData, viewType, userRole) => {
  if (!attendanceData) return

  const wb = XLSX.utils.book_new()

  const createSheet = (data, sheetName) => {
    let wsData = []

    if (viewType === "cumulative") {
      const subjects = Array.from(new Set(data.flatMap(d => d.subjects?.map(s => s.subject) || [])))

      wsData.push(["Roll Number", "Student Name", ...subjects.flatMap(s => [s, "", ""]), "Final Attendance", "", ""])
      wsData.push(["", "", ...subjects.flatMap(() => ["Total", "Present", "%"]), "Total", "Present", "%"])

      data.sort((a, b) => a.student.rollNumber.localeCompare(b.student.rollNumber)).forEach((studentData) => {
        let row = [studentData.student.rollNumber, studentData.student.name]
        let totalLectures = 0
        let totalPresent = 0

        subjects.forEach((subject) => {
          const subjectData = studentData.subjects.find(s => s.subject === subject)
          if (subjectData) {
            row.push(subjectData.totalCount, subjectData.presentCount, ((subjectData.presentCount / subjectData.totalCount) * 100).toFixed(2))
            totalLectures += subjectData.totalCount
            totalPresent += subjectData.presentCount
          } else {
            row.push("-", "-", "-")
          }
        })

        row.push(totalLectures, totalPresent, ((totalPresent / totalLectures) * 100).toFixed(2))
        wsData.push(row)
      })
    } else {
      wsData.push(["Roll Number", "Student Name", "Total Lectures", "Present", "Attendance %"])

      data.students.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber)).forEach((student) => {
        wsData.push([
          student.rollNumber,
          student.name,
          data.totalLectures,
          student.presentCount,
          ((student.presentCount / data.totalLectures) * 100).toFixed(2) + "%"
        ])
      })
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData)

    const colWidths = wsData[0].map((_, i) => ({ wch: Math.max(...wsData.map(row => String(row[i]).length)) + 2 }))
    ws['!cols'] = colWidths

    const range = XLSX.utils.decode_range(ws['!ref'])
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
        if (!ws[cellRef]) continue
        ws[cellRef].s = {
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          },
          alignment: { vertical: 'center', horizontal: 'center' },
          font: { name: 'Arial', sz: 11 }
        }
        if (R === 0 || R === 1) {
          ws[cellRef].s.font.bold = true
          ws[cellRef].s.fill = { fgColor: { rgb: "EEEEEE" } }
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  }

  if (userRole === "student") {
    createSheet({ students: attendanceData, totalLectures: attendanceData.reduce((sum, subject) => sum + subject.totalLectures, 0) }, "Student Report")
  } else if (userRole === "faculty" || userRole === "admin" || userRole === "superadmin") {
    if (viewType === "cumulative") {
      createSheet(attendanceData, "Cumulative Report")
    } else if (Array.isArray(attendanceData)) {
      attendanceData.forEach((batchData, index) => {
        createSheet(batchData, `Batch ${index + 1}`)
      })
    } else {
      createSheet(attendanceData, "Attendance Report")
    }
  }

  const fileName = `Attendance_Report_${new Date().toISOString().replace(/[:.]/g, "-")}.xlsx`
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' })
  const blob = new Blob([s2ab(atob(wbout))], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()

  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}

function s2ab(s) {
  const buf = new ArrayBuffer(s.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF
  return buf
}