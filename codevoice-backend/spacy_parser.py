import spacy

nlp = spacy.load("en_core_web_sm")

def extract_entities(text):
    doc = nlp(text)
    return [(ent.text, ent.label_) for ent in doc.ents]

def extract_noun_phrases(text):
    doc = nlp(text)
    return [chunk.text for chunk in doc.noun_chunks]

def get_intent(text):
    doc = nlp(text)
    # A simple heuristic
    for token in doc:
        if token.pos_ == "VERB":
            return token.lemma_
    return "unknown"
