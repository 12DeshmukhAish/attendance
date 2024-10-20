import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableColumn, TableRow, Button, Textarea } from '@nextui-org/react';
import { format, parseISO } from 'date-fns';

export default function TGContent({ tg, isEditing, isLoading, onSubmit, onCancel }) {
  const [localSessions, setLocalSessions] = useState(Array.isArray(tg) ? tg : []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'yyyy-MM-dd');
    } catch {
      return dateString;
    }
  };

  const handleSessionChange = (index, field, value) => {
    const newSessions = [...localSessions];
    newSessions[index] = {
      ...newSessions[index],
      [field]: field === 'pointsDiscussed' ? value.split('\n').filter(point => point.trim()) : value
    };
    setLocalSessions(newSessions);
  };

  const handleAddSession = () => {
    setLocalSessions([...localSessions, { date: '', pointsDiscussed: [] }]);
  };

  const handleRemoveSession = (index) => {
    setLocalSessions(localSessions.filter((_, i) => i !== index));
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        {localSessions.length === 0 ? (
          <p className="text-gray-500">No TG sessions recorded yet.</p>
        ) : (
          <Table aria-label="TG Sessions">
            <TableHeader>
              <TableColumn>Date</TableColumn>
              <TableColumn>Points Discussed</TableColumn>
            </TableHeader>
            <TableBody>
              {localSessions.map((session, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(session.date)}</TableCell>
                  <TableCell>
                    <ul className="list-disc pl-4">
                      {session.pointsDiscussed?.map((point, pointIndex) => (
                        <li key={pointIndex}>{point}</li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(localSessions);
    }} className="mt-4 space-y-4">
      {localSessions.map((session, index) => (
        <div key={index} className="flex flex-col gap-2 p-4 border rounded-md">
          <input
            type="date"
            label="Date"
            value={formatDate(session.date)}
            onChange={(e) => handleSessionChange(index, 'date', e.target.value)}
            required
            className="p-2 border rounded"
          />
          <Textarea
            label="Points Discussed (one point per line)"
            value={session.pointsDiscussed?.join('\n') || ''}
            onChange={(e) => handleSessionChange(index, 'pointsDiscussed', e.target.value)}
            required
            className="min-h-[100px]"
          />
          <Button
            color="danger"
            onClick={() => handleRemoveSession(index)}
            className="self-end"
          >
            Remove Session
          </Button>
        </div>
      ))}
      <div className="space-y-4">
        <Button
          color="primary"
          onClick={handleAddSession}
          className="w-full"
        >
          Add TG Session
        </Button>
        <div className="flex justify-end gap-2">
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
            isDisabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}