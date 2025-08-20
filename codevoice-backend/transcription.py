from fastapi import APIRouter, UploadFile, File
import tempfile
import os
import numpy as np
from faster_whisper import WhisperModel
import soundfile as sf
import webrtcvad
import shutil
from pydub import AudioSegment

router = APIRouter()

# Load Whisper model once
model = WhisperModel("large-v2", device="cpu", compute_type="int8")

# VAD helper
def apply_vad(audio, sample_rate):
    vad = webrtcvad.Vad(2)
    frame_duration = 30  # ms
    frame_size = int(sample_rate * frame_duration / 1000)
    voiced_audio = b""
    for i in range(0, len(audio), frame_size):
        frame = audio[i:i+frame_size]
        if len(frame) < frame_size:
            break
        if vad.is_speech(frame, sample_rate):
            voiced_audio += frame
    return voiced_audio

@router.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    # Check if ffmpeg is available
    if not shutil.which("ffmpeg"):
        return {"error": "ffmpeg not found on PATH. Please install ffmpeg and add to PATH."}
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
        temp_file.write(await file.read())
        temp_path = temp_file.name
    wav_path = temp_path + ".wav"
    try:
        # Convert webm to wav using pydub
        audio_seg = AudioSegment.from_file(temp_path)
        audio_seg = audio_seg.set_channels(1)
        # Export to wav
        audio_seg.export(wav_path, format="wav")
        print(f"Converted audio: channels={audio_seg.channels}, frame_rate={audio_seg.frame_rate}, duration={audio_seg.duration_seconds}s, sample_width={audio_seg.sample_width}")
        # Load audio
        audio, sr = sf.read(wav_path)
        print(f"Loaded audio: shape={audio.shape}, dtype={audio.dtype}, sample_rate={sr}")
        # Resample if needed
        if sr != 16000:
            from scipy.signal import resample
            duration = audio.shape[0] / sr
            target_length = int(duration * 16000)
            audio = resample(audio, target_length)
            sr = 16000
            print(f"Resampled audio to 16000 Hz, new shape: {audio.shape}")
        # Convert to mono if needed
        if audio.ndim > 1:
            audio = audio.mean(axis=1)
        # Normalize to float32 [-1, 1]
        if audio.dtype != np.float32:
            audio = audio.astype(np.float32) / 32768.0
        segments, info = model.transcribe(audio, language="en")
        transcript = " ".join([seg.text for seg in segments])
        return {"transcript": transcript}
    except Exception as e:
        print(f"Transcription error: {e}")
        return {"error": str(e)}
    finally:
        try:
            os.remove(temp_path)
        except Exception:
            pass
        if os.path.exists(wav_path):
            try:
                os.remove(wav_path)
            except Exception:
                pass
