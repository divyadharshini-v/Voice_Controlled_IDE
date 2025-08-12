import re
import subprocess
import tempfile
import os

def generate_code_from_prompt(prompt):
    full_prompt = (
        "You are an expert Python programmer.\n"
        "Generate a single, complete, runnable Python program for the request below.\n"
        "You may include minimal comments if necessary but avoid explanations or extra text.\n"
        f"{prompt}\n"
    )
    try:
        result = subprocess.run(
            ["ollama", "run", "starcoder2:3b", full_prompt],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=60
        )
    except subprocess.TimeoutExpired:
        return "# Error: Model timed out generating code."

    if result.returncode != 0:
        return f"# Error: Model returned non-zero exit code.\n{result.stderr}"

    output = result.stdout.strip()

    # Remove full_prompt from output if repeated
    if full_prompt in output:
        output = output.replace(full_prompt, '').strip()

    # Clean output to remove extra text or explanations
    cleaned_output = clean_generated_code(output)

    return cleaned_output

def clean_generated_code(code):
    """
    Clean AI-generated code to remove unwanted explanations, markdown, or comments.
    Rules:
    - Remove any markdown triple backticks and language tags
    - Remove lines that start with common explanation phrases
    - Remove leading/trailing whitespace
    """

    # Remove Markdown code block ticks
    code = re.sub(r"```(?:python)?", "", code, flags=re.IGNORECASE)
    code = code.replace("```", "")

    # Remove lines starting with explanations or instructions
    lines = code.splitlines()
    cleaned_lines = []
    skip_phrases = [
        "Here is the",
        "This program",
        "Explanation",
        "```",
        "# Output",
        "# Input",
        "# Program Description",
        "# Explanation",
        "# Note",
        "# Sample Input",
        "# Sample Output",
    ]
    for line in lines:
        if any(line.strip().startswith(phrase) for phrase in skip_phrases):
            continue
        cleaned_lines.append(line)

    cleaned_code = "\n".join(cleaned_lines).strip()
    return cleaned_code


def process_prompt(user_prompt):
    user_prompt = user_prompt.strip()
    if not user_prompt:
        return "Write a complete Python program that prints 'Hello, World!'"

    if "factorial" in user_prompt.lower():
        return "Write a complete Python program to calculate and print the factorial of 5."

    if len(user_prompt.split()) < 5:
        return f"Write a complete Python program to {user_prompt}"

    if "program" not in user_prompt.lower():
        return f"Write a complete Python program that {user_prompt}"

    return user_prompt


def run_python_code(code, inputs=None):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode="w", encoding="utf-8") as temp_file:
            temp_file.write(code)
            temp_file_path = temp_file.name

        input_str = "\n".join(inputs) + "\n" if inputs else None

        result = subprocess.run(
            ["python", temp_file_path],
            input=input_str,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=10
        )

        os.remove(temp_file_path)

        if result.returncode == 0:
            return {"stdout": result.stdout.strip(), "stderr": ""}
        else:
            return {"stdout": "", "stderr": result.stderr.strip()}

    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "Execution timed out"}
    except Exception as e:
        return {"stdout": "", "stderr": str(e)}
