from flask import Blueprint, request, jsonify
from app.nlp.spacy_parser import extract_spacy_intent
from app.nlp.transformer_handler import extract_transformer_sentiment

# Create the blueprint
main = Blueprint('main', __name__)

@main.route('/api/parse', methods=['POST'])
def parse_text():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400

    text = data['text']
    spacy_result = extract_spacy_intent(text)
    transformer_result = extract_transformer_sentiment(text)

    return jsonify({
    'code': spacy_result.get('code', '// No code generated.'),
    'intent': spacy_result.get('intent', 'unknown')
})

