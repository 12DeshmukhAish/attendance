import React, { useState, useEffect } from 'react'
import { Input, Table, TableBody, TableCell, TableHeader, TableColumn, TableRow, Button, Checkbox } from '@nextui-org/react'

export default function TheoryContent({ content, isEditing, isLoading, onSubmit, onCancel }) {
  const [localContent, setLocalContent] = useState([])

  // Populate localContent when content prop is updated
  useEffect(() => {
    if (content) {
      setLocalContent(content)
    }
  }, [content])

  const handleContentChange = (index, field, value) => {
    const newContent = [...localContent]
    newContent[index][field] = value
    setLocalContent(newContent)
  }

  const handleStatusChange = (index) => {
    const newContent = [...localContent]
    newContent[index].status = newContent[index].status === 'covered' ? 'not_covered' : 'covered'
    setLocalContent(newContent)
  }

  const handleAddContent = () => {
    setLocalContent([...localContent, {
      title: '',
      description: '',
      proposedDate: '',
      completedDate: '',
      references: '',
      courseOutcomes: '',
      programOutcomes: '',
      status: 'not_covered'
    }])
  }

  const handleRemoveContent = (index) => {
    const newContent = [...localContent]
    newContent.splice(index, 1)
    setLocalContent(newContent)
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (localContent.some(item => !item.title || !item.description)) {
      alert('Title and Description are required fields.')
      return
    }

    onSubmit(localContent) // Call the parent onSubmit function with local content
  }

  // Render the non-editable table when not in editing mode
  if (!isEditing) {
    return (
      <Table aria-label="Theory Content">
        <TableHeader>
          <TableColumn>Title</TableColumn>
          <TableColumn>Description</TableColumn>
          <TableColumn>Proposed Date</TableColumn>
          <TableColumn>Completed Date</TableColumn>
          <TableColumn>References</TableColumn>
          <TableColumn>Course Outcomes</TableColumn>
          <TableColumn>Program Outcomes</TableColumn>
          <TableColumn>Status</TableColumn>
        </TableHeader>
        <TableBody>
          {localContent.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.proposedDate || 'N/A'}</TableCell>
              <TableCell>{item.completedDate || 'N/A'}</TableCell>
              <TableCell>{item.references || 'N/A'}</TableCell>
              <TableCell>{item.courseOutcomes || 'N/A'}</TableCell>
              <TableCell>{item.programOutcomes || 'N/A'}</TableCell>
              <TableCell>{item.status === 'covered' ? 'Covered' : 'Not Covered'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  // Render the form when editing
  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {localContent.map((item, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
          <Input
            type="text"
            label="Title"
            value={item.title}
            onChange={(e) => handleContentChange(index, 'title', e.target.value)}
            required
          />
          <Input
            type="text"
            label="Description"
            value={item.description}
            onChange={(e) => handleContentChange(index, 'description', e.target.value)}
            required
          />
          <input
            type="date"
            value={item.proposedDate || ''}
            onChange={(e) => handleContentChange(index, 'proposedDate', e.target.value)}
            className="border p-2 rounded-md"
          />
          <input
            type="date"
            value={item.completedDate || ''}
            onChange={(e) => handleContentChange(index, 'completedDate', e.target.value)}
            className="border p-2 rounded-md"
          />
          <Input
            type="text"
            label="References"
            value={item.references}
            onChange={(e) => handleContentChange(index, 'references', e.target.value)}
          />
          <Input
            type="text"
            label="Course Outcomes"
            value={item.courseOutcomes}
            onChange={(e) => handleContentChange(index, 'courseOutcomes', e.target.value)}
          />
          <Input
            type="text"
            label="Program Outcomes"
            value={item.programOutcomes}
            onChange={(e) => handleContentChange(index, 'programOutcomes', e.target.value)}
          />
          <Checkbox
            isSelected={item.status === 'covered'}
            onChange={() => handleStatusChange(index)}
          >
            Covered
          </Checkbox>
          <Button
            color="danger"
            onClick={() => handleRemoveContent(index)}
          >
            Remove Content
          </Button>
        </div>
      ))}
      <Button
        color="primary"
        onClick={handleAddContent}
      >
        Add Content
      </Button>
      <div className="flex justify-end gap-2 mt-4">
        <Button
          color="primary"
          type="submit"
          isLoading={isLoading}
        >
          Save
        </Button>
        <Button
          color="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
