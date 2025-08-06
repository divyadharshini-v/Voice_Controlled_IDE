import React, { useEffect, useRef, useState } from "react";

const VoiceControl = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log("Heard:", lastResult);
      handleVoiceCommand(lastResult);
    };

    recognition.onerror = (e) => {
      console.error("Recognition error:", e.error);
    };

    recognitionRef.current = recognition;
    recognition.start(); // Always listening for commands (not code)
  }, []);

  const handleVoiceCommand = (command) => {
    if (command.includes("start recording") && !isRecording) {
      speak("Recording started");
      setIsRecording(true);
      startCodeRecognition();
    } else if (command.includes("stop recording") && isRecording) {
      speak("Recording stopped");
      stopCodeRecognition();
    } else if (command.includes("scroll down")) {
      window.scrollBy({ top: 300, behavior: "smooth" });
    } else if (command.includes("scroll up")) {
      window.scrollBy({ top: -300, behavior: "smooth" });
    } else {
      console.log("Unknown command or ignored:", command);
    }
  };

  const startCodeRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1][0].transcript;
      setTranscript((prev) => prev + " " + result);
    };

    recognition.onerror = (e) => {
      console.error("Code recognition error:", e.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopCodeRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsRecording(false);
    console.log("Final transcript to backend:", transcript);

    // Stubbed backend call
    fetch("http://localhost:5000/api/code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: transcript }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Backend response:", data))
      .catch((err) => console.error("Backend error:", err));
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Voice-Controlled IDE</h1>

      <button
        className={`px-6 py-3 rounded-xl text-white font-semibold transition ${
          isRecording ? "bg-red-600" : "bg-green-600"
        }`}
        disabled
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Transcript:</h2>
        <pre className="bg-gray-100 p-4 rounded-xl max-h-60 overflow-auto whitespace-pre-wrap">
          {transcript || "Say 'start recording' to begin..."}
        </pre>
      </div>
    </div>
  );
};

export default VoiceControl;
