import React, { useState } from "react";
import MicInput from "./MicInput";
import CodeEditor from "./CodeEditor";
import VoiceControl from './VoiceControl'; // ✅ import VoiceControl

const App = () => {
  const [transcript, setTranscript] = useState("");
  const [manualPrompt, setManualPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">🎧 CodeVoice</h1>

      {/* ✅ VoiceControl triggers recording via voice command like "start recording" */}
      <VoiceControl setTranscript={setTranscript} />

      {/* 🎙️ Manual or voice-based input */}
      <MicInput
        setTranscript={setTranscript}
        transcript={transcript}
        manualPrompt={manualPrompt}
        setManualPrompt={setManualPrompt}
        setGeneratedCode={setGeneratedCode}
      />

      {/* 💻 Display the generated code */}
      <CodeEditor
        transcript={transcript}
        manualPrompt={manualPrompt}
        setGeneratedCode={setGeneratedCode}
        generatedCode={generatedCode}
      />
    </div>
  );
};

export default App;
