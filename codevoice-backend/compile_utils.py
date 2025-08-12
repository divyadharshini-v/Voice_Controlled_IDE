import subprocess
import tempfile
import os

def run_python_code(code, inputs=None):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode="w") as temp_file:
            temp_file.write(code)
            temp_file_path = temp_file.name

        # Prepare input string if provided
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
