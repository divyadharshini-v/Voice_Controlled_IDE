# compile_utils.py
import subprocess
import tempfile
import os

def run_python_code(code):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode="w") as temp_file:
            temp_file.write(code)
            temp_file_path = temp_file.name

        result = subprocess.run(
            ["python", temp_file_path],
            capture_output=True,
            text=True,
            timeout=10
        )

        os.remove(temp_file_path)

        if result.returncode == 0:
            return {"output": result.stdout.strip(), "error": ""}
        else:
            return {"output": "", "error": result.stderr.strip()}

    except subprocess.TimeoutExpired:
        return {"output": "", "error": "Execution timed out"}
    except Exception as e:
        return {"output": "", "error": str(e)}
