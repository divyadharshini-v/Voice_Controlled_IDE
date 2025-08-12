import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const CodeEditor = ({ transcript, manualPrompt, setGeneratedCode, generatedCode }) => {
  const [compileOutput, setCompileOutput] = useState(""); // terminal-style output
  const [filename, setFilename] = useState("my_code.py"); // editable filename
  const codeBoxRef = useRef(null);

  const handleGenerateCode = async () => {
    const text = transcript || manualPrompt;
    if (!text.trim()) return setCompileOutput("⚠️ Please provide a prompt.");

    try {
      const res = await axios.post("http://localhost:5001/api/generate-code", { text });
      setGeneratedCode(res.data.code || "No code generated.");
      setCompileOutput("✅ Code generated successfully.");
    } catch (err) {
      console.error("Code generation failed:", err);
      setCompileOutput("❌ Error generating code.");
    }
  };

  const handleSaveFile = () => {
    const blob = new Blob([generatedCode], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename || "code.py";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCompileOutput(`📦 Code saved as '${filename}'`);
  };

  const handleCompile = async () => {
    try {
      const res = await axios.post("http://localhost:5001/api/compile", {
        code: generatedCode,
      });
      setCompileOutput(res.data.output || "⚠️ No output received.");
    } catch (err) {
      console.error("Compilation error:", err);
      setCompileOutput("❌ Error compiling code.");
    }
  };

  // Auto-scroll to code area when code updates
  useEffect(() => {
    if (codeBoxRef.current) {
      codeBoxRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [generatedCode]);

  return (
    <div className="w-full max-w-2xl bg-white p-4 rounded shadow">
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleGenerateCode}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          ⚡ Generate Code
        </button>
        <button
          onClick={handleCompile}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          🧪 Compile
        </button>
        <button
          onClick={handleSaveFile}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          💾 Save
        </button>
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium">📝 Filename:</label>
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          className="border border-gray-300 px-3 py-1 w-full rounded mt-1"
          placeholder="Enter filename like script.py"
        />
      </div>

      <div className="mb-4" ref={codeBoxRef}>
        <label className="block font-medium mb-1">💻 Generated Code:</label>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap">
          {generatedCode || "Your code will appear here."}
        </pre>
      </div>

      <div>
        <label className="block font-medium mb-1">📟 Terminal Output:</label>
        <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto whitespace-pre-wrap h-40">
          {compileOutput || "Your output will appear here."}
        </pre>
      </div>
    </div>
  );
};

export default CodeEditor;
