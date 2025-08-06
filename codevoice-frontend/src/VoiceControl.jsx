import React, { useEffect, useRef, useState } from "react";

const VoiceControl = ({ setTranscript }) => {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState("command"); // "command" or "input"

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log(`🎤 Heard: "${result}" | Mode: ${mode}`);

      // 🔁 Always listen in command mode
      if (mode === "command") {
        if (result.includes("start recording")) {
          setMode("input");
          console.log("🎙️ Switched to INPUT mode");
        } else if (result.includes("scroll up")) {
          window.scrollBy({ top: -200, behavior: "smooth" });
          console.log("⬆️ Scrolled up");
        } else if (result.includes("scroll down")) {
          window.scrollBy({ top: 200, behavior: "smooth" });
          console.log("⬇️ Scrolled down");
        } else if (result.includes("stop recording")) {
          setMode("command");
          console.log("🛑 Already in command mode");
        }
      } else if (mode === "input") {
        if (result.includes("stop recording")) {
          setMode("command");
          console.log("🛑 Stopped recording");
        } else {
          setTranscript(result);
          setMode("command");
          console.log("✅ Transcript set, back to command mode");
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
    };

    // Start recognition on mount
    recognition.start();
    setIsListening(true);

    return () => {
      recognition.stop();
      setIsListening(false);
    };
  }, [mode, setTranscript]);

  return (
    <div className="text-center mb-4">
      <p className="text-lg text-gray-700">
        🎧 Say: <strong>"start recording"</strong>, <strong>"stop recording"</strong>, <strong>"scroll up"</strong>, <strong>"scroll down"</strong>
      </p>
      <p className="text-sm text-blue-500">
        🎤 Current mode: {mode === "command" ? "Listening for commands" : "Listening for prompt"}
      </p>
    </div>
  );
};

export default VoiceControl;
