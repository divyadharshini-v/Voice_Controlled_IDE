import React from 'react';

const MicInput = ({ onTranscript }) => {
  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      onTranscript(spokenText);
    };

    recognition.onerror = (event) => {
      alert("Mic error: " + event.error);
    };

    recognition.start();
  };

  return (
    <button
      onClick={handleMicClick}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg shadow-md transition"
    >
      🎤 Start Speaking
    </button>
  );
};

export default MicInput;
