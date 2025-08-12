def run_python_code(code, inputs=None):
    import tempfile
    import subprocess
    import os

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode="w", encoding="utf-8") as temp_file:
            temp_file.write(code)
            temp_file_path = temp_file.name

        input_str = "\n".join(inputs) + "\n" if inputs else None

        print("Running code with inputs:", inputs)

        result = subprocess.run(
            ["python", temp_file_path],
            input=input_str,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=10
        )

        os.remove(temp_file_path)

        print("Execution stdout:", result.stdout)
        print("Execution stderr:", result.stderr)

        if result.returncode == 0:
            return {"stdout": result.stdout.strip(), "stderr": ""}
        else:
            return {"stdout": "", "stderr": result.stderr.strip()}

    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "Execution timed out"}
    except Exception as e:
        return {"stdout": "", "stderr": str(e)}
