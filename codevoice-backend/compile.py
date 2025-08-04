import subprocess
import tempfile
import os
from flask import Blueprint, request, jsonify

compile_bp = Blueprint('compile', __name__)

def sanitize_code(code: str) -> str:
    """
    Ensures the generated code has properly closed comments
    and strips unnecessary model artifacts.
    """
    # Remove unclosed multiline comment blocks
    if code.count("'''") % 2 != 0:
        code += "\n'''"
    if code.count('"""') % 2 != 0:
        code += '\n"""'

    # Additional cleaning: remove triple quotes with no content
    lines = code.splitlines()
    cleaned_lines = []
    inside_triple = False
    for line in lines:
        if line.strip().startswith(("'''", '"""')):
            inside_triple = not inside_triple
            continue  # Skip the broken line
        if not inside_triple:
            cleaned_lines.append(line)
    return "\n".join(cleaned_lines)

@compile_bp.route('/api/compile', methods=['POST'])
def compile_code():
    data = request.get_json()
    code = data.get('code', '')

    if not code:
        return jsonify({'error': 'No code provided'}), 400

    # Sanitize the code before compiling
    safe_code = sanitize_code(code)

    try:
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.py', delete=False) as temp:
            temp.write(safe_code)
            temp_path = temp.name

        result = subprocess.run(
            ['python', temp_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=10
        )

        os.remove(temp_path)  # clean up

        return jsonify({
            'output': result.stdout,
            'errors': result.stderr
        })

    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Execution timed out'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
