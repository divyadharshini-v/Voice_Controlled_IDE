
require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.0/min/vs' }});
require(['vs/editor/editor.main'], function () {
  window.editor = monaco.editor.create(document.getElementById('editor'), {
    value: '',
    language: 'javascript',
    theme: 'vs-dark',
    fontSize: 16
  });
});

function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  recognition.onresult = function(event) {
    const command = event.results[0][0].transcript.toLowerCase();
    document.getElementById("voiceText").innerText = "You said: " + command;

    // Basic parsing example
    if (command.includes("for loop")) {
      editor.setValue("for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}");
    } else {
      editor.setValue("// Voice command not recognized. Try saying 'create a for loop'");
    }
  };
}
