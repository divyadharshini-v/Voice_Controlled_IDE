from flask import Blueprint, request, jsonify
from transformer_handler import generate_code_from_prompt, process_prompt, run_python_code

routes_blueprint = Blueprint("routes", __name__)

@routes_blueprint.route("/api/generate-code", methods=["POST"])
def generate_code():
    data = request.get_json(force=True)
    user_prompt = data.get("prompt", "")

    if not isinstance(user_prompt, str) or not user_prompt.strip():
        return jsonify({"error": "Invalid or empty prompt"}), 400

    processed_prompt = process_prompt(user_prompt)
    generated_code = generate_code_from_prompt(processed_prompt)

    if generated_code.startswith("# Error:"):
        return jsonify({"error": generated_code}), 500

    return jsonify({"code": generated_code})


@routes_blueprint.route("/api/compile", methods=["POST"])
def compile_code():
    data = request.get_json(force=True)
    code = data.get("code", "")
    inputs = data.get("inputs", [])

    if not isinstance(code, str) or not code.strip():
        return jsonify({"error": "No code to compile provided"}), 400

    if not isinstance(inputs, list):
        inputs = []

    result = run_python_code(code, inputs)
    return jsonify(result)
