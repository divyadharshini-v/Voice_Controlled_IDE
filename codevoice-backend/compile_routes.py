from flask import Blueprint, request, jsonify
from routes import run_python_code  # import from routes.py

compile_blueprint = Blueprint("compile", __name__)

@compile_blueprint.route("/api/compile", methods=["POST"])
def compile_code():
    data = request.get_json()
    code = data.get("code", "")
    inputs = data.get("inputs", [])

    if not code:
        return jsonify({"error": "No code provided"}), 400

    result = run_python_code(code, inputs)

    return jsonify({
        "output": result.get("stdout", ""),
        "errors": result.get("stderr", "")
    })
