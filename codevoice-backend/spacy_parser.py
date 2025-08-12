#spacy_parser.py
import spacy

nlp = spacy.load("en_core_web_sm")

def get_intent(text):
    doc = nlp(text)
    for token in doc:
        if token.pos_ == "VERB":
            return token.lemma_
    return "unknown"
