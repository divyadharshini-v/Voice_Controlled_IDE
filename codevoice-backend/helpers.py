import re

def clean_transcription(text):
    cleaned = re.sub(r'[^\x00-\x7F]+', ' ', text)  # Remove non-ASCII
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned
