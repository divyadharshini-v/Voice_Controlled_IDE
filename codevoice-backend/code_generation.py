from fastapi import APIRouter, Form
from groq import Groq
import os
from dotenv import load_dotenv
import re

load_dotenv()
API_KEY = os.getenv("GROQ_API_KEY")
if not API_KEY:
    raise EnvironmentError("GROQ_API_KEY not set in .env file.")

client = Groq(api_key=API_KEY)
router = APIRouter()

def clean_code(text):
    code_block = re.search(r"```(?:\w+)?\n([\s\S]*?)```", text)
    if code_block:
        return code_block.group(1).strip()
    return text.strip()

@router.post("/generate-code/")
async def generate_code(
    problem: str = Form(...),
    language: str = Form(...)
):
    prompt = f"""
Write a complete, error-free {language} program for the following problem:
{problem}

Output rules:
1. Return ONLY the code.
2. Do not add explanations, headings, or Markdown backticks.
3. Ensure the code is ready to run without modification.
If the language is C, return a C function and not the main function unless required.
"""
    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        code = response.choices[0].message.content
        cleaned_code = clean_code(code)
        return {"code": cleaned_code}
    except Exception as e:
        return {"error": str(e)}
