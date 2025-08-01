import spacy
from spacy.matcher import Matcher

nlp = spacy.load("en_core_web_sm")

# Define intent patterns
matcher = Matcher(nlp.vocab)

patterns = [
    {"label": "generate_for_loop", "pattern": [{"LOWER": "for"}, {"LOWER": "loop"}]},
    {"label": "generate_while_loop", "pattern": [{"LOWER": "while"}, {"LOWER": "loop"}]},
    {"label": "create_function", "pattern": [{"LOWER": "create"}, {"LOWER": "function"}]},
    {"label": "generate_if_else", "pattern": [{"LOWER": "if"}, {"LOWER": "else"}]},
    {"label": "create_variable", "pattern": [{"LOWER": "create"}, {"LOWER": "variable"}]},
    {"label": "switch_case", "pattern": [{"LOWER": "switch"}, {"LOWER": "case"}]},
    {"label": "print_statement", "pattern": [{"LOWER": "print"}]},
    {"label": "comment_code", "pattern": [{"LOWER": "add"}, {"LOWER": "comment"}]},
    {"label": "open_file", "pattern": [{"LOWER": "open"}, {"LOWER": "file"}]},
]

# Add to matcher
for p in patterns:
    matcher.add(p["label"], [p["pattern"]])

def get_intent_spacy(text):
    doc = nlp(text)
    matches = matcher(doc)

    if matches:
        match_id, start, end = matches[0]
        intent = nlp.vocab.strings[match_id]
        return {"intent": intent, "matched_text": doc[start:end].text}
    return {"intent": "unknown", "matched_text": ""}
