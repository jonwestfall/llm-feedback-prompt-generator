import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import StudentFeedbackTable from './StudentFeedbackTable';

export default function FeedbackOptionSetup() {
  const [feedbacks, setFeedbacks] = useState(() => {
    const saved = localStorage.getItem('feedbackOptions');
    return saved ? JSON.parse(saved) : [];
  });

  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [customPrompt, setCustomPrompt] = useState(() => localStorage.getItem('customPrompt') || '');
  const [viewTable, setViewTable] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [studentKey, setStudentKey] = useState(0); // forces rerender of student table

  const labelRef = useRef(null);
  const descriptionRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('feedbackOptions', JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
  if (customPrompt !== null) {
    localStorage.setItem('customPrompt', customPrompt);
  }
}, [customPrompt]);

  const addFeedback = () => {
    if (!label.trim()) return;
    const newFeedback = { id: Date.now(), label, description };
    setFeedbacks([...feedbacks, newFeedback]);
    setLabel('');
    setDescription('');
    labelRef.current?.focus();
  };

  const removeFeedback = (id) => {
    setFeedbacks(feedbacks.filter(f => f.id !== id));
  };

  const handleSave = () => {
    setStudentKey(prev => prev + 1);
    setViewTable(true);
  };

  const resetSession = () => {
    localStorage.clear();
    setFeedbacks([]);
    setCustomPrompt('');
    setViewTable(false);
    alert('Session has been reset.');
  };

  const exportFeedbackCSV = () => {
  let csv = `# Custom Prompt: ${customPrompt.trim()}\n`;

  feedbacks.forEach(fb => {
    const label = fb.label.replace(/"/g, '""');
    const description = fb.description.replace(/"/g, '""');
    csv += `${label},${description}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'feedback_options.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


const importFeedbackCSV = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const rawText = event.target.result.trim();

    // Split the file into lines
    const lines = rawText.split('\n');
    let customPrompt = '';
    let csvLines = lines;

    // Detect and extract custom prompt from the first line
    if (lines[0].startsWith('# Custom Prompt:')) {
      customPrompt = lines[0].replace('# Custom Prompt:', '').trim().replace(/^"|"$/g, '');
      csvLines = lines.slice(1); // remove prompt line
      setCustomPrompt(customPrompt);
    }

    // Join the remaining lines as proper CSV string
    const csvString = csvLines.join('\n');

    const parsed = Papa.parse(csvString, {
  skipEmptyLines: true
});

const feedbacks = parsed.data.map((row, i) => {
  const label = (row[0] || '').trim();
  const description = row.slice(1).join(',').trim(); // 👈 recombine extra columns
  return { id: Date.now() + i, label, description };
}).filter(f => f.label);


    setFeedbacks(feedbacks);
  };

  reader.readAsText(file);
};


  const importStudentCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const lines = event.target.result.split('\n').filter(Boolean).map(name => name.trim());
      const students = lines.map((name, i) => ({
        id: Date.now() + i,
        name,
        grade: '',
        selected: {}
      }));

      const action = window.confirm('Replace current students? Click "Cancel" to add to the list.');
      const saved = JSON.parse(localStorage.getItem('students') || '[]');
      const updated = action ? students : [...saved, ...students];
      localStorage.setItem('students', JSON.stringify(updated));
      alert(`Imported ${students.length} student(s).`);
    };
    reader.readAsText(file);
  };

  const exportStudentsCSV = () => {
    const savedStudents = localStorage.getItem('students');
    if (!savedStudents) {
      alert('No student data to export.');
      return;
    }
    const students = JSON.parse(savedStudents);
    const header = ['Name', 'Grade', ...feedbacks.map(f => f.label), 'Generated Prompt'];
    const rows = students.map(student => {
      const selectedFeedbacks = feedbacks.filter(fb => student.selected?.[fb.id]);
      const prompt = `${customPrompt} Provide feedback for ${student.name}. ` + selectedFeedbacks.map(fb => fb.description || fb.label).join(' ');
      return [
        student.name,
        student.grade || '',
        ...feedbacks.map(f => student.selected?.[f.id] ? 'Yes' : 'No'),
        `"${prompt.replace(/"/g, '""')}"`
      ];
    });
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_feedback.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const containerStyle = {
    padding: '2rem',
    backgroundColor: darkMode ? '#121212' : '#ffffff',
    color: darkMode ? '#ffffff' : '#000000',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  };

  if (viewTable) {
    return (
      <div style={containerStyle}>
        <button onClick={() => setViewTable(false)} style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}>
          Back to Feedback Setup
        </button>
        <StudentFeedbackTable
          key={studentKey}
          feedbackOptions={feedbacks}
          customPrompt={customPrompt}
        />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>LLM Feedback Prompt Generator</h1>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '0.5rem 1rem', marginRight: '1rem' }}>
          Toggle {darkMode ? 'Light' : 'Dark'} Mode
        </button>
        <button onClick={() => setShowAbout(true)} style={{ padding: '0.5rem 1rem' }}>About</button>
      </div>

      {showAbout && (
        <div style={{ border: '1px solid #ccc', backgroundColor: darkMode ? '#222' : '#eee', padding: '1rem', marginBottom: '1rem' }}>
          <h3>About</h3>
          <p>This tool was developed by Jon Westfall (jon@jonwestfall.com) and ChatGPT to streamline student feedback using LLMs.</p>
          <button onClick={() => setShowAbout(false)} style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem' }}>Close</button>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Prompt Setup</h3>
        <textarea
          placeholder="Enter custom prompt instructions here..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
        />
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Define Feedback Options</h2>

      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
        <input
          ref={labelRef}
          placeholder="Feedback label (e.g., Too Short)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              descriptionRef.current?.focus();
            }
          }}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <textarea
          ref={descriptionRef}
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              addFeedback();
            }
          }}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button onClick={addFeedback} style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px' }}>Add Feedback</button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        {feedbacks.map(fb => (
          <div key={fb.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '6px', marginBottom: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: '500' }}>{fb.label}</div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>{fb.description}</div>
            </div>
            <button onClick={() => removeFeedback(fb.id)} style={{ padding: '0.25rem 0.75rem' }}>Remove</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={handleSave} style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px' }}>Go to Student Table</button>
        <button onClick={resetSession} style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px' }}>Reset Session</button>
        <button onClick={exportFeedbackCSV} style={{ padding: '0.5rem 1rem', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '6px' }}>Export Feedback CSV</button>
        <button onClick={exportStudentsCSV} style={{ padding: '0.5rem 1rem', backgroundColor: '#6f42c1', color: '#fff', border: 'none', borderRadius: '6px' }}>Export Student Table CSV</button>
        <label style={{ padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: '#000', borderRadius: '6px', cursor: 'pointer' }}>
          Import Feedback CSV
          <input type="file" accept=".csv" onChange={importFeedbackCSV} style={{ display: 'none' }} />
        </label>
        <label style={{ padding: '0.5rem 1rem', backgroundColor: '#20c997', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>
          Import Student Names
          <input type="file" accept=".csv" onChange={importStudentCSV} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
}
