import React, { useState, useEffect, useRef } from 'react';

export default function StudentFeedbackTable({ feedbackOptions, customPrompt }) {
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('students');
    return saved
      ? JSON.parse(saved)
      : [{ id: Date.now(), name: '', grade: '', selected: {} }];
  });

  const lastInputRef = useRef(null);
  const prevStudentCountRef = useRef(students.length);

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    const prevCount = prevStudentCountRef.current;
    if (students.length > prevCount && lastInputRef.current) {
      lastInputRef.current.focus();
    }
    prevStudentCountRef.current = students.length;
  }, [students]);

  const updateName = (id, name) => {
    setStudents(students.map(s => s.id === id ? { ...s, name } : s));
  };

  const updateGrade = (id, grade) => {
    setStudents(students.map(s => s.id === id ? { ...s, grade } : s));
  };

  const toggleFeedback = (studentId, feedbackId) => {
    setStudents(students.map(s => {
      if (s.id !== studentId) return s;
      const selected = { ...s.selected, [feedbackId]: !s.selected[feedbackId] };
      return { ...s, selected };
    }));
  };

  const addStudentRow = () => {
    const newId = Date.now();
    setStudents([...students, { id: newId, name: '', grade: '', selected: {} }]);
  };

  const deleteStudent = (id) => {
    const student = students.find(s => s.id === id);
    const confirmDelete = window.confirm(`Are you sure you want to delete ${student.name || 'this student'}?`);
    if (confirmDelete) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const generatePrompt = (student) => {
    const selectedFeedbacks = feedbackOptions.filter(fb => student.selected[fb.id]);
    const descriptions = selectedFeedbacks.map(fb => fb.description || fb.label).join(' ');
    const prompt = `${customPrompt} Provide feedback for ${student.name}. ${descriptions}`.trim();
    navigator.clipboard.writeText(prompt);
    alert(`Copied to clipboard: \n\n${prompt}`);
    addStudentRow();
  };

  if (!Array.isArray(feedbackOptions)) {
    return <div style={{ padding: '2rem' }}>No feedback options available.</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Student Feedback Table</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', backgroundColor: '#fafafa', border: '1px solid #ddd' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #ccc', textAlign: 'left' }}>Student Name</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #ccc', textAlign: 'left' }}>Grade</th>
            {feedbackOptions.map(fb => (
              <th key={fb.id} style={{ padding: '0.5rem', borderBottom: '1px solid #ccc', textAlign: 'left' }}>{fb.label}</th>
            ))}
            <th style={{ padding: '0.5rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, idx) => (
            <tr key={student.id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                <input
                  type="text"
                  id={`student-name-${student.id}`}
                  value={student.name}
                  ref={idx === students.length - 1 ? lastInputRef : null}
                  onChange={(e) => updateName(student.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addStudentRow();
                    }
                  }}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
              <input
              type="text"
              value={student.grade || ''}
              onChange={(e) => updateGrade(student.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const index = students.findIndex(s => s.id === student.id);
                  if (index < students.length - 1) {
                    const nextInput = document.querySelector(`#student-name-${students[index + 1].id}`);
                    nextInput?.focus();
                  } else {
                    addStudentRow();
                  }
                }
              }}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />

              </td>
              {feedbackOptions.map(fb => (
                <td key={fb.id} style={{ textAlign: 'center', borderBottom: '1px solid #eee' }}>
                  <input
                    type="checkbox"
                    checked={!!student.selected[fb.id]}
                    onChange={() => toggleFeedback(student.id, fb.id)}
                  />
                </td>
              ))}
              <td style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                <button
                  onClick={() => generatePrompt(student)}
                  style={{ padding: '0.4rem 0.8rem', marginRight: '0.5rem', borderRadius: '4px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  Generate
                </button>
                <button
                  onClick={() => deleteStudent(student.id)}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', backgroundColor: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addStudentRow}
        style={{ padding: '0.5rem 1rem', borderRadius: '4px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        Add Student
      </button>
    </div>
  );
}
