import os
import tempfile
import subprocess
from flask import Blueprint, request, jsonify
import whisper

transcribe_bp = Blueprint('transcribe', __name__)

# Load a more accurate Whisper model
model = whisper.load_model("small")  # you can change to "medium" or "large"

def convert_to_wav(input_path, output_path):
    # Convert any audio to 16kHz mono WAV using ffmpeg
    command = [
        'ffmpeg', '-y', '-i', input_path,
        '-ac', '1',
        '-ar', '16000',
        output_path
    ]
    subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

@transcribe_bp.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    audio_file = request.files['file']

    with tempfile.NamedTemporaryFile(delete=False) as tmp_input:
        input_path = tmp_input.name
        audio_file.save(input_path)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_wav:
        wav_path = tmp_wav.name

    try:
        convert_to_wav(input_path, wav_path)
        result = model.transcribe(wav_path, language="en")
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(input_path):
            os.remove(input_path)
        if os.path.exists(wav_path):
            os.remove(wav_path)

    return jsonify({'transcript': result['text']})
