from flask import Blueprint, request, jsonify
from transformer_handler import analyze_sentiment
import requests

routes_blueprint = Blueprint("routes", __name__)

@routes_blueprint.route("/api/parse", methods=["POST"])
def parse():
    try:
        data = request.get_json(force=True)
        command = data.get("command", "").strip()

        if not command:
            return jsonify({"error": "Empty command provided"}), 400

        sentiment = analyze_sentiment(command)

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "starcoder",
                "prompt": command,
                "stream": False
            },
            timeout=60
        )

        if response.status_code != 200:
            return jsonify({"error": "Ollama API error"}), 500

        result = response.json()
        generated_code = result.get("response", "").strip()

        return jsonify({
            "code": generated_code,
            "sentiment": sentiment
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
