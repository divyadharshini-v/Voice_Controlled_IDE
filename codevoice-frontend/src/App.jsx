import React, { useState } from "react";
import MicInput from "./MicInput";
import CodeEditor from "./CodeEditor";

const App = () => {
  const [transcript, setTranscript] = useState("");
  const [manualPrompt, setManualPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">🎧 CodeVoice</h1>

      <MicInput
        setTranscript={setTranscript}
        transcript={transcript}
        manualPrompt={manualPrompt}
        setManualPrompt={setManualPrompt}
        setGeneratedCode={setGeneratedCode}
      />

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
