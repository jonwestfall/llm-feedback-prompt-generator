import React, { useState } from 'react';
import FeedbackOptionSetup from './components/FeedbackOptionsSetup.jsx';
import StudentFeedbackTable from './components/StudentFeedbackTable.jsx';

function App() {
  const [feedbackOptions, setFeedbackOptions] = useState([]);

  return (
    <div>
      {feedbackOptions.length === 0 ? (
        <FeedbackOptionSetup onSave={setFeedbackOptions} />
      ) : (
        <StudentFeedbackTable feedbackOptions={feedbackOptions} />
      )}
    </div>
  );
}

export default App;
