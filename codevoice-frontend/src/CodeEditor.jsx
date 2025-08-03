import React from "react";
import axios from "axios";

const CodeEditor = ({ transcript, manualPrompt, setGeneratedCode, generatedCode }) => {
  const handleGenerateCode = async () => {
    const text = transcript || manualPrompt;
    if (!text.trim()) return alert("Please provide a prompt.");

    try {
      const res = await axios.post("http://localhost:5000/api/generate-code", { text });
      setGeneratedCode(res.data.code || "No code generated.");
    } catch (err) {
      console.error("Code generation failed:", err);
      setGeneratedCode("Error generating code.");
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white p-4 rounded shadow">
      <button
        onClick={handleGenerateCode}
        className="bg-green-600 text-white px-4 py-2 mb-4 rounded"
      >
        ⚡ Generate Code
      </button>

      <div>
        <label className="block font-medium mb-1">💻 Generated Code:</label>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap">
          {generatedCode || "Your code will appear here."}
        </pre>
      </div>
    </div>
  );
};

export default CodeEditor;
