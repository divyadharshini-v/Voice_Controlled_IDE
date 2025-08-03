from flask import Blueprint, request, jsonify
import whisper
import tempfile

transcribe_bp = Blueprint("transcribe", __name__)
model = whisper.load_model("base")

@transcribe_bp.route("/api/transcribe", methods=["POST"])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file"}), 400

    audio_file = request.files['audio']

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        audio_path = tmp.name
        audio_file.save(audio_path)

    result = model.transcribe(audio_path,language="en")
    return jsonify({"transcript": result["text"]})
