'use client'
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import axios from 'axios'
import { Button, Select, SelectItem, Spinner } from '@nextui-org/react'
import TheoryContent from './TheoryContent'
import PracticalContent from './PracticalContent'
import TGContent from './TGContent'
import SubjectInfo from './subjectInfo'
import { handleExcelUpload, handleExcelDownload } from '@/app/utils/excelHandlers'

export default function TeachingPlanPage() {
  const [subjectId, setSubjectId] = useState('')
  const [subjectIds, setSubjectIds] = useState([])
  const [subject, setSubject] = useState(null)
  const [content, setContent] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const userProfile = JSON.parse(sessionStorage.getItem('userProfile'))
      const userSubjectIds = userProfile?.subjects || []
      setSubjectIds(userSubjectIds)

      if (userSubjectIds.length === 1) {
        setSubjectId(userSubjectIds[0])
        fetchSubjectInfo(userSubjectIds[0])
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Failed to fetch subjects')
    }
  }

  const fetchSubjectInfo = async (id) => {
    if (!id) return

    setIsLoading(true)
    try {
      const response = await axios.get(`/api/subject?_id=${id}`)
      const subjectData = response.data.subject
      setSubject(subjectData)
      
      // Set the appropriate content based on subject type
      if (subjectData.subType === 'tg') {
        setContent(subjectData.tgSessions || [])
      } else {
        setContent(subjectData.content || [])
      }
    } catch (error) {
      console.error('Error fetching subject info:', error)
      toast.error('Failed to fetch subject information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubjectChange = (event) => {
    const id = event.target.value
    setSubjectId(id)
    setContent([])
    setIsEditing(false)
    fetchSubjectInfo(id)
  }

  const handleSubmit = async (updatedContent) => {
    console.log(updatedContent);
    
    if (!subjectId || !subject) {
      toast.error('Please select a subject')
      return
    }

    setIsLoading(true)
    try {
      let payload = {}
      
      if (subject.subType === 'tg') {
        payload = {
          tgSessions: updatedContent.map(session => ({
            date: session.date,
            pointsDiscussed: Array.isArray(session.pointsDiscussed) ? 
              session.pointsDiscussed : 
              [session.pointsDiscussed]
          }))
        }
      } else {
        payload = {
          content: Array.isArray(updatedContent) ? updatedContent : [updatedContent]
        }
      }

      const response = await axios.put(`/api/v1/contents?_id=${subjectId}`, payload)

      if (response.status === 200) {
        toast.success('Content updated successfully')
        if (subject.subType === 'tg') {
          setContent(updatedContent)
          setSubject(prev => ({ ...prev, tgSessions: updatedContent }))
        } else {
          const normalizedContent = Array.isArray(updatedContent) ? updatedContent : [updatedContent]
          setContent(normalizedContent)
          setSubject(prev => ({ ...prev, content: normalizedContent }))
        }
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating content:', error)
      toast.error('Failed to update content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event) => {
    if (!subject) {
      toast.error('Please select a subject first')
      return
    }
    await handleExcelUpload(event, subject, setContent, setIsEditing)
  }

  const handleFileDownload = () => {
    if (!subject) {
      toast.error('Please select a subject first')
      return
    }
    handleExcelDownload(content, subject)
  }

  const renderContent = () => {
    if (!subject?.subType) return null

    const contentProps = {
      content,
      isEditing,
      isLoading,
      onSubmit: handleSubmit,
      onCancel: () => setIsEditing(false)
    }

    switch (subject.subType) {
      case 'theory':
        return <TheoryContent {...contentProps} />
      case 'practical':
        return <PracticalContent {...contentProps} subject={subject} />
      case 'tg':
        return <TGContent {...contentProps} tg={subject.tgSessions}/>
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Teaching Plan</h1>

      <div className="mb-4">
        {subjectIds.length > 1 ? (
          <Select
            label="Select Subject"
            placeholder="Choose a subject"
            selectedKeys={subjectId ? [subjectId] : []}
            onChange={handleSubjectChange}
          >
            {subjectIds.map((id) => (
              <SelectItem key={id} value={id}>
                {id}
              </SelectItem>
            ))}
          </Select>
        ) : (
          subjectId && (
            <p className="text-gray-600">
              Subject: {subjectId}
            </p>
          )
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center my-4">
          <Spinner />
        </div>
      )}

      {subject && <SubjectInfo subject={subject} />}

      {subjectId && !isEditing && !isLoading && (
        <div className="mt-4">
          <Button
            color="primary"
            onClick={() => setIsEditing(true)}
            className="mb-4"
          >
            Edit Content
          </Button>
        </div>
      )}

      {renderContent()}

      {subjectId && !isLoading && (
        <div className="flex gap-4 mt-4">
          <div>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
              id="uploadExcel"
            />
            <Button
              color="secondary"
              onClick={() => document.getElementById('uploadExcel').click()}
            >
              Upload Content (Excel)
            </Button>
          </div>
          
          <Button
            color="primary"
            onClick={handleFileDownload}
            isDisabled={!content || content.length === 0}
          >
            Download Content (Excel)
          </Button>
        </div>
      )}
    </div>
  )
}