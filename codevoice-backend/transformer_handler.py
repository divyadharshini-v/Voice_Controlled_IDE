# transformer_handler.py
from prompt_enhancer import enhance_prompt
import subprocess

def generate_code_from_prompt(user_prompt):
    try:
        enhanced_prompt = enhance_prompt(user_prompt)
        result = subprocess.run(
            ["ollama", "run", "starcoder", enhanced_prompt],
            capture_output=True,
            text=True,
            timeout=60
        )
        output = result.stdout.strip()
        return output
    except subprocess.TimeoutExpired:
        return "# Error: Code generation timed out."
    except Exception as e:
        return f"# Error during code generation: {str(e)}"
