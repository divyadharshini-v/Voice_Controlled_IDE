# routes.py
from flask import Blueprint, request, jsonify
from transformer_handler import generate_code_from_prompt

routes_blueprint = Blueprint('routes', __name__)

@routes_blueprint.route('/api/parse', methods=['POST'])
def parse_intent_and_generate_code():
    data = request.get_json()
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"error": "Prompt is empty"}), 400
    code = generate_code_from_prompt(prompt)
    return jsonify({"code": code})

@routes_blueprint.route('/api/generate-code', methods=['POST'])
def generate_code():
    data = request.get_json()
    prompt = data.get("text", "")
    if not prompt:
        return jsonify({"error": "Prompt is empty"}), 400
    code = generate_code_from_prompt(prompt)
    return jsonify({"code": code})
