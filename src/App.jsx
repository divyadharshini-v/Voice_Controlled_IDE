import React, { useState } from 'react';
import CodeEditor from './components/Editor';
import MicInput from './components/MicInput';
import axios from 'axios';

const App = () => {
  const [code, setCode] = useState('');

  const handleVoiceCommand = async (text) => {
    console.log("Voice Input:", text);
    try {
      const response = await axios.post('http://localhost:5000/api/parse', { text });
      setCode((prev) => prev + '\n' + response.data.code);
    } catch (error) {
      alert('Error connecting to backend');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>CodeVoice IDE</h1>
      <MicInput onTranscript={handleVoiceCommand} />
      <CodeEditor code={code} setCode={setCode} />
    </div>
  );
};

export default App;
