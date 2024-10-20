import * as XLSX from 'xlsx'
import { format, parse } from 'date-fns'
import { toast } from 'sonner'

const formatDateForExcel = (dateString) => {
  if (!dateString) return ''
  try {
    const date = parse(dateString, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx', new Date())
    return format(date, 'dd/MM/yyyy')
  } catch {
    return dateString
  }
}

const parseExcelDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = parse(dateString, 'dd/MM/yyyy', new Date())
    return format(date, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx')
  } catch {
    return dateString
  }
}
export const handleExcelUpload = async (event, subject, setContent, setIsEditing) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array', cellDates: true })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'dd/MM/yyyy' })

    const contentData = jsonData.slice(1).filter(row => row.some(cell => cell))  // Skip header and empty rows
    console.log(contentData);
    
    let parsedContent = []

    if (subject.subType === 'tg') {
      parsedContent = contentData.map(row => ({
        date: parseExcelDate(row[0]),
        pointsDiscussed: row[1]?.split('\n').filter(point => point.trim()) || []
      }))
    } else if (subject.subType === 'practical') {
      parsedContent = contentData.map(row => ({
        title: row[0] || '',
        description: row[1] || '',
        proposedDate: parseExcelDate(row[2]),
        references: row[3] || '',
        courseOutcomes: row[4] || '',
        programOutcomes: row[5] || '',
        status: 'not_covered',
        batchStatus: parseBatchStatus(row[6])
      }))
    } else{
      parsedContent = contentData.map(row => ({
        title: row[0] || '',
        description: row[1] || '',
        proposedDate: parseExcelDate(row[2]),
        completedDate: parseExcelDate(row[3]),
        references: row[4] || '',
        courseOutcomes: row[5] || '',
        programOutcomes: row[6] || '',
        status: row[7] || 'not_covered'
      }))
    }

    console.log(parsedContent);
    if (parsedContent.length === 0) {
      toast.error('No valid content found in the Excel file')
      return
    }
    // onSubmit(parsedContent)
    setContent(parsedContent)
    setIsEditing(true)
    toast.success('Excel file processed successfully')
  } catch (error) {
    console.error('Error processing Excel file:', error)
    toast.error('Failed to process Excel file')
  }
}

export const handleExcelDownload = (content, subject,tg) => {
  let dataToExport = []
  
  if (subject.subType === 'tg') {
    // Handle TG sessions, using subject.tgSessions if content is empty
    const sessions = tg?.length ? tg : (subject.tgSessions || [])
    dataToExport = sessions.map(session => ({
      'Date': formatDateForExcel(session.date),
      'Points Discussed': Array.isArray(session.pointsDiscussed) ? 
        session.pointsDiscussed.join('\n') : 
        session.pointsDiscussed || ''
    }))
  } else if (subject.subType === 'practical') {
    dataToExport = (content || []).map(item => ({
      title: item.title || '',
      description: item.description || '',
      proposedDate: formatDateForExcel(item.proposedDate),
      references: item.references || '',
      courseOutcomes: item.courseOutcomes || '',
      programOutcomes: item.programOutcomes || '',
      batchStatus: formatBatchStatus(item.batchStatus)
    }))
  } else {
    // Theory subjects
    dataToExport = (content || []).map(item => ({
      title: item.title || '',
      description: item.description || '',
      proposedDate: formatDateForExcel(item.proposedDate),
      completedDate: formatDateForExcel(item.completedDate),
      references: item.references || '',
      courseOutcomes: item.courseOutcomes || '',
      programOutcomes: item.programOutcomes || '',
      status: item.status || 'not_covered'
    }))
  }

  if (dataToExport.length === 0) {
    toast.error('No content available to export')
    return
  }

  try {
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teaching Plan')
    XLSX.writeFile(workbook, `${subject.name || 'teaching'}_plan.xlsx`)
    toast.success('File downloaded successfully')
  } catch (error) {
    console.error('Error downloading Excel file:', error)
    toast.error('Failed to download Excel file')
  }
}

const formatBatchStatus = (batchStatus) => {
  if (!Array.isArray(batchStatus)) return ''
  
  return batchStatus.map(batch => {
    const status = batch.status === 'covered' ? 
      `Covered on ${formatDateForExcel(batch.completedDate)}` : 
      'Not covered'
    return `Batch ${batch.batchId}: ${status}`
  }).join('\n')
}

const parseBatchStatus = (batchStatusString) => {
  if (!batchStatusString) return []
  
  try {
    if (typeof batchStatusString === 'string') {
      return batchStatusString.split('\n').map(line => {
        const [batchId, statusInfo] = line.split(':').map(s => s.trim())
        const isCovered = statusInfo.toLowerCase().includes('covered on')
        
        return {
          batchId: batchId.replace('Batch ', ''),
          status: isCovered ? 'covered' : 'not_covered',
          completedDate: isCovered ? 
            parseExcelDate(statusInfo.replace('Covered on ', '')) : 
            undefined
        }
      })
    }
    // If it's already an object/array, return as is
    return Array.isArray(batchStatusString) ? 
      batchStatusString : 
      JSON.parse(batchStatusString)
  } catch {
    return []
  }
}