import React, { useState, useRef } from "react";

function LoadingButton({ onClick, loading, children, color }) {
  const colors = {
    purple: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-300",
    indigo: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300",
    gray: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-300",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-6 py-3 text-white text-lg font-semibold rounded shadow 
                  disabled:opacity-50 focus:outline-none focus:ring-4 flex items-center gap-2 justify-center 
                  ${colors[color] || colors.purple}`}
    >
      {loading && (
        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-solid"></span>
      )}
      {children}
    </button>
  );
}

export default function App() {
  const [transcript, setTranscript] = useState("");
  const [manualPrompt, setManualPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [compileOutput, setCompileOutput] = useState("");
  const [recording, setRecording] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingCompile, setLoadingCompile] = useState(false);
  const [compileInputs, setCompileInputs] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 🎤 Voice recording
  const handleStartRecording = async () => {
    setTranscript("");
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");

        try {
          const res = await fetch("http://localhost:5000/api/transcribe", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (res.ok) {
            setTranscript(data.transcript);
          } else {
            setTranscript("Error: " + data.error);
          }
        } catch (err) {
          setTranscript("Fetch error: " + err.message);
        }
        setRecording(false);
      };

      mediaRecorderRef.current.start();

      // Automatically stop recording after 4 seconds
      setTimeout(() => {
        mediaRecorderRef.current.stop();
        stream.getTracks().forEach((track) => track.stop());
      }, 4000);
    } catch (err) {
      console.error(err);
      alert("Could not access microphone.");
      setRecording(false);
    }
  };

  // ⚡ Generate code
  const handleGenerateCode = async () => {
    const promptToSend = manualPrompt.trim() || transcript.trim();
    console.log("Prompt to send:", promptToSend);

    if (!promptToSend) {
      alert("No prompt provided");
      return;
    }

    setLoadingGenerate(true);
    try {
      const res = await fetch("http://localhost:5000/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToSend }),
      });
      const data = await res.json();
      console.log("Generated code:", data.code);
      setGeneratedCode(data.code || "");
    } catch (error) {
      console.error("Error generating code:", error);
      alert("Error generating code.");
    }
    setLoadingGenerate(false);
  };

  // 🛠 Compile code
  const handleCompile = async () => {
    if (!generatedCode.trim()) {
      alert("No code to compile");
      return;
    }
    setLoadingCompile(true);
    setCompileOutput("");
    try {
      const res = await fetch("http://localhost:5000/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: generatedCode,
          inputs: compileInputs
            ? compileInputs
                .split(",")
                .map((i) => i.trim())
                .filter((i) => i.length > 0)
            : [],
        }),
      });
      const data = await res.json();
      setCompileOutput(
        data.stdout || data.stderr || "// No output or errors returned"
      );
    } catch (error) {
      console.error("Error compiling code:", error);
      alert("Error compiling code.");
    }
    setLoadingCompile(false);
  };

  // 💾 Save code as file
  const handleSave = () => {
    if (!generatedCode.trim()) {
      alert("No code to save");
      return;
    }
    const blob = new Blob([generatedCode], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "code.py";
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-white to-purple-100 flex flex-col items-center">
      {/* Header */}
      <header className="w-full text-center py-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <h1 className="text-4xl font-bold">🎙 Code with Your Voice</h1>
        <p className="mt-2 text-lg opacity-90">
          No keyboard? No problem — your voice is the new IDE.
        </p>
      </header>

      {/* Main content */}
      <div className="w-full max-w-5xl p-6 space-y-6">
        {/* Mic Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleStartRecording}
            disabled={recording}
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl text-4xl transition-all focus:outline-none focus:ring-4 ${
              recording
                ? "bg-red-500 animate-pulse focus:ring-red-300"
                : "bg-green-500 hover:bg-green-600 focus:ring-green-300"
            }`}
          >
            {recording ? "🎙" : "🎤"}
          </button>
          <p className="mt-3 text-gray-700 text-lg">
            {recording ? "Listening..." : "Click to speak your code idea"}
          </p>
        </div>

        {/* Transcript + Manual Input */}
        <div className="bg-white shadow rounded-lg p-4 space-y-4">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Transcript will appear here..."
            rows={2}
            className="w-full border rounded p-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="text"
            value={manualPrompt}
            onChange={(e) => setManualPrompt(e.target.value)}
            placeholder="Or type your prompt..."
            className="w-full border rounded p-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Generate Code */}
        <div className="bg-white shadow rounded-lg p-4 space-y-4">
          <div className="flex gap-3">
            <LoadingButton
              onClick={handleGenerateCode}
              loading={loadingGenerate}
              color="purple"
            >
              ⚡ Generate Code
            </LoadingButton>

            <LoadingButton onClick={handleSave} loading={false} color="gray">
              💾 Save
            </LoadingButton>
          </div>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto min-h-[150px] text-sm">
            {generatedCode || "// Your generated code will appear here"}
          </pre>
        </div>

        {/* Compile & Output */}
        <div className="bg-white shadow rounded-lg p-4 space-y-4">
          <input
            type="text"
            value={compileInputs}
            onChange={(e) => setCompileInputs(e.target.value)}
            placeholder="Enter inputs separated by commas"
            className="w-full border rounded p-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <LoadingButton
            onClick={handleCompile}
            loading={loadingCompile}
            color="indigo"
          >
            🛠 Compile & Run
          </LoadingButton>
          <pre className="bg-black text-white p-4 rounded-lg overflow-x-auto min-h-[100px] text-sm">
            {compileOutput || "// Output will appear here"}
          </pre>
        </div>
      </div>
    </div>
  );
}
