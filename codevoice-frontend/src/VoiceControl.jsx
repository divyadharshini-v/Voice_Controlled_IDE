// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef } from "react";

const VoiceControl = ({
  isRecording,
  onTranscriptChange,
  onStartRecording,
  onStopRecording,
  onGenerateCode,
  onCompileCode,
  onSaveCode,
  onCopyCode,
}) => {
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcriptText = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcriptText += event.results[i][0].transcript.trim() + " ";
      }

      transcriptText = transcriptText.toLowerCase().trim();
      console.log("Heard:", transcriptText);

      // Commands detection
      if (transcriptText.includes("start recording")) {
        console.log("Command: Start Recording");
        onStartRecording();
        listeningRef.current = true;
      }

      if (transcriptText.includes("stop recording")) {
        console.log("Command: Stop Recording");
        listeningRef.current = false;
        onStopRecording();
        // Do not return here; allow transcript to be appended if isRecording is true
      }

      if (transcriptText.includes("generate code")) {
        console.log("Command: Generate Code");
        onGenerateCode();
      }

      if (transcriptText.includes("compile")) {
        console.log("Command: Compile Code");
        onCompileCode();
      }


      if (transcriptText.includes("save")) {
        console.log("Command: Save Code");
        onSaveCode();
      }

      if (transcriptText.includes("copy")) {
        console.log("Command: Copy Code");
        if (onCopyCode) onCopyCode();
      }

      // Append transcript only if recording is active
      if (isRecording && listeningRef.current) {
        onTranscriptChange((prev) => (prev ? prev + " " + transcriptText : transcriptText));
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error", e);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended, restarting...");
      if (listeningRef.current) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    listeningRef.current = isRecording;

    return () => {
      listeningRef.current = false;
      recognition.stop();
    };
  }, [isRecording, onStartRecording, onStopRecording, onGenerateCode, onCompileCode, onSaveCode, onTranscriptChange]);

  return null; // UI is handled in App.jsx
};

export default VoiceControl;
