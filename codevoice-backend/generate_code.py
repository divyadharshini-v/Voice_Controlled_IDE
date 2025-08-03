from flask import Blueprint, request, jsonify
import ollama

generate_code_bp = Blueprint("generate_code", __name__)

@generate_code_bp.route('/api/generate-code', methods=['POST'])
def generate_code():
    try:
        data = request.get_json()
        prompt = data.get("text", "").strip()

        if not prompt:
            return jsonify({"error": "No input text provided"}), 400

        response = ollama.chat(
            model="starcoder",
            messages=[{"role": "user", "content": prompt}]
        )

        code_output = response.get("message", {}).get("content", "")

        if not code_output:
            return jsonify({"error": "Empty response from model"}), 500

        return jsonify({"code": code_output})

    except Exception as e:
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500
