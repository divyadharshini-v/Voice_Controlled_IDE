


import whisper

def speech_to_txt(path):
    """
    Transcribe speech from an audio file using OpenAI Whisper.
    Args:
        path (str): Path to the audio file (wav, mp3, etc.)
    Returns:
        str: Transcribed text
    """
    model = whisper.load_model("medium.en")
    result = model.transcribe(path, language="en", beam_size=3)
    return result['text']

