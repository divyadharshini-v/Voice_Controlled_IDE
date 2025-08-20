from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import os
from groq import Groq

router = APIRouter()
client = Groq()

@router.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
  # Save uploaded file to audio folder
  audio_dir = os.path.join(os.path.dirname(__file__), "audio")
  os.makedirs(audio_dir, exist_ok=True)
  audio_path = os.path.join(audio_dir, file.filename)
  with open(audio_path, "wb") as f:
    f.write(await file.read())
  try:
    with open(audio_path, "rb") as f:
      translation = client.audio.translations.create(
        file=(audio_path, f.read()),
        model="whisper-large-v3",
        prompt=(
          "You are a code and math transcription assistant. "
          "Transcribe the audio as literally as possible, focusing on technical, programming, and mathematical terms. "
          "Do not hallucinate or change keywords. If you hear words like 'factorial', 'for loop', 'if statement', 'print', 'input', or numbers, transcribe them exactly as spoken. "
          "If the audio is unclear, do your best to guess the intended code or math term, but do not replace with unrelated words. "
          "Correct only obvious grammar or spelling mistakes, but never change code or math terms."
        ),
        response_format="json",
        temperature=0.0
      )
    transcript = translation.text
    return JSONResponse({"transcript": transcript})
  except Exception as e:
    return JSONResponse({"error": str(e)})