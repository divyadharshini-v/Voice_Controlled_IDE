
import React, { useEffect, useState, useRef } from "react";
import VoiceControl from "./VoiceControl";
import axios from "axios";

function App() {
  const handleReadCode = () => {
    if (!generatedCode) return;
    const utterance = new window.SpeechSynthesisUtterance(generatedCode);
    window.speechSynthesis.speak(utterance);
  };
  const [transcript, setTranscript] = useState("");
  const [manualPrompt, setManualPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [compileOutput, setCompileOutput] = useState("");
  const [userInput, setUserInput] = useState("");
  const [micLoading, setMicLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [compileLoading, setCompileLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [language, setLanguage] = useState("python");

  const transcriptEndRef = useRef(null);
  const codeEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  // Explicit start/stop functions for voice control
  const startRecording = async () => {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleTranscribe(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
      speak("Recording started");
    } catch (err) {
      setTranscript("Microphone access denied or not available");
    }
  };

  const stopRecording = () => {
    if (recording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Button click handler uses the above
  const handleMicClick = async () => {
    if (recording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleTranscribe = async (audioBlob) => {
    setMicLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.wav");
      const res = await axios.post("http://localhost:8000/transcribe/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      console.log("Transcribe response:", res.data);
      if (res.data.transcript) {
        setTranscript((prev) => prev + " " + res.data.transcript);
      } else if (res.data.error) {
        setTranscript("❌ " + res.data.error);
        speak("Error transcribing audio.");
      } else {
        setTranscript("❌ No transcript received.");
        speak("No transcript received.");
      }
    } catch (err) {
      console.error(err);
      setTranscript("❌ Error transcribing audio.");
      speak("Error transcribing audio.");
    }
    setMicLoading(false);
  };

  const handleGenerateCode = async () => {
    const promptToSend = transcript.trim() || manualPrompt.trim();
    if (!promptToSend) return;
    setGenerateLoading(true);
    try {
      const formData = new FormData();
      formData.append("problem", promptToSend);
      formData.append("language", language);
      const res = await axios.post("http://localhost:8000/generate-code", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setGeneratedCode(res.data.code || "// No code generated");
      speak("Code generated successfully.");
    } catch (err) {
      console.error(err);
      setGeneratedCode("// Error generating code");
      speak("Error generating code.");
    }
    setGenerateLoading(false);
  };

  const handleCompile = async () => {
    if (!generatedCode) return;
    setCompileLoading(true);
    try {
      const formData = new FormData();
      formData.append("code", generatedCode);
      formData.append("language", language);
      formData.append("inputs", userInput);
      const res = await axios.post("http://localhost:8000/compile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const output = res.data.stdout || res.data.stderr || res.data.compile_output || "// No output received";
      setCompileOutput(output);
      speak("Compilation finished.");
    } catch (err) {
      console.error(err);
      setCompileOutput("// Error compiling code");
      speak("Error compiling code.");
    }
    setCompileLoading(false);
  };

  const handleSaveFile = () => {
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated_code.py";
    a.click();
    window.URL.revokeObjectURL(url);
    speak("File saved successfully.");
  };

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  useEffect(() => {
    codeEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [generatedCode, compileOutput]);

  return (
    <>
      <VoiceControl
        isRecording={recording}
        onTranscriptChange={setTranscript}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onGenerateCode={handleGenerateCode}
        onCompileCode={handleCompile}
        onSaveCode={handleSaveFile}
        onCopyCode={() => {
          if (generatedCode) {
            navigator.clipboard.writeText(generatedCode);
            speak("Code copied to clipboard");
          }
        }}
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-200 to-purple-50 px-4">
        <div className="flex flex-col items-center w-full max-w-2xl">
          {/* Header */}
          <header className="w-full text-center py-6 bg-purple-600 text-white rounded-lg mb-6 shadow-lg">
            <h1 className="text-3xl font-bold">🎤 Code with Your Voice</h1>
            <p className="mt-1 text-sm opacity-90">No keyboard? No problem — your voice is the new IDE.</p>
          </header>

          {/* Microphone */}
          <div className="mb-4 flex flex-col items-center">
            <button
              className={`p-6 rounded-full shadow-lg text-2xl text-white ${
                recording ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
              }`}
              onClick={handleMicClick}
              disabled={micLoading}
            >
              {micLoading ? "⏳" : recording ? "⏹️" : "🎤"}
            </button>
            <p className="text-center mt-2 text-gray-700">{recording ? "Recording..." : "Click to speak your code idea"}</p>
          </div>

          {/* Transcript */}
          <textarea
            className="w-full p-3 mb-3 rounded-lg border shadow-sm focus:ring-2 focus:ring-purple-500 resize-none"
            rows="3"
            placeholder="Transcript will appear here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          ></textarea>
        {/* Manual Prompt */}
          <input
            className="w-full p-3 mb-4 rounded-lg border shadow-sm focus:ring-2 focus:ring-purple-500"
            type="text"
            placeholder="Or type your prompt..."
            value={manualPrompt}
            onChange={(e) => setManualPrompt(e.target.value)}
          />
          {/* Language Selector */}
          <div className="w-full mb-4">
            <label className="block font-medium mb-1">Select Language:</label>
            <select
              className="w-full p-2 border rounded"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
                <option value="c">C</option>
              <option value="java">Java</option>
            </select>
          </div>
          

          {/* Generate Code */}
          <button
            onClick={handleGenerateCode}
            disabled={generateLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg shadow mb-4"
          >
            {generateLoading ? "Generating..." : "⚡ Generate Code"}
          </button>

          {/* Code Output (Editable) & Copy Button */}
          <div className="w-full bg-gray-900 text-green-400 rounded-lg p-4 mb-4 overflow-auto min-h-[150px] font-mono relative">
            <button
              onClick={() => {
                if (generatedCode) {
                  navigator.clipboard.writeText(generatedCode);
                  speak("Code copied to clipboard");
                }
              }}
              className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded text-sm shadow"
              disabled={!generatedCode}
              title="Copy code"
            >
              📋 Copy
            </button>
            <textarea
              className="w-full bg-transparent text-green-400 font-mono border-none outline-none resize-vertical min-h-[120px]"
              value={generatedCode}
              onChange={e => setGeneratedCode(e.target.value)}
              placeholder="// Your generated code will appear here"
              rows={8}
              spellCheck={false}
              style={{ minHeight: '120px' }}
            />
            <div ref={codeEndRef}></div>
          </div>

          {/* User Input for Compiler */}
          <textarea
            className="w-full p-3 mb-3 rounded-lg border shadow-sm focus:ring-2 focus:ring-blue-500 resize-none"
            rows="3"
            placeholder="Enter input for your program here..."
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
          ></textarea>
          {/* Compile & Run */}
          <button
            onClick={handleCompile}
            disabled={compileLoading || !generatedCode}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow mb-4"
          >
            {compileLoading ? "Running..." : "🛠️ Compile & Run"}
          </button>

          {/* Program Output */}
          <div className="w-full bg-black text-green-400 rounded-lg p-4 mb-8 overflow-auto min-h-[100px] font-mono">
            <pre>{compileOutput || "// Output will appear here"}</pre>
            <div ref={transcriptEndRef}></div>
          </div>

          {/* Read Code & Save File */}
          <div className="w-full flex gap-2 mb-4">
            <button
              onClick={handleReadCode}
              disabled={!generatedCode}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg shadow"
            >
              🗣️ Read Code
            </button>
            <button
              onClick={handleSaveFile}
              disabled={!generatedCode}
              className="flex-1 bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg shadow"
            >
              💾 Save Code
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
