import spacy

nlp = spacy.load("en_core_web_sm")

def extract_spacy_intent(text):
    text = text.lower()
    doc = nlp(text)

    # Helper to extract function name
    def extract_function_name():
        for ent in doc.ents:
            if ent.label_ in ["PERSON", "ORG", "PRODUCT", "WORK_OF_ART"]:
                return ent.text.strip()
        for token in doc:
            if token.pos_ == "NOUN" and token.text not in ["function", "loop"]:
                return token.text.strip()
        return "my_function"

    # Helper to extract variable name (for read/write)
    def extract_filename():
        for token in doc:
            if token.text.endswith(".txt") or token.text.endswith(".py"):
                return token.text
        return "file.txt"

    # ==========================
    # RULE-BASED + NER INTENTS
    # ==========================

    if "for loop" in text:
        return {
            "intent": "generate_for_loop",
            "language": "javascript",
            "code": "for (let i = 0; i < 10; i++) {\n  console.log(i);\n}"
        }

    elif "while loop" in text:
        return {
            "intent": "generate_while_loop",
            "language": "python",
            "code": "i = 0\nwhile i < 10:\n    print(i)\n    i += 1"
        }

    elif "create function" in text or "define function" in text:
        func_name = extract_function_name()
        return {
            "intent": "define_function",
            "language": "python",
            "code": f"def {func_name}():\n    pass"
        }

    elif "sort list" in text or "sort array" in text:
        return {
            "intent": "sort_array",
            "language": "python",
            "code": "my_list = [5, 2, 9, 1]\nmy_list.sort()\nprint(my_list)"
        }

    elif "reverse string" in text:
        return {
            "intent": "reverse_string",
            "language": "python",
            "code": "text = 'hello'\nreversed_text = text[::-1]\nprint(reversed_text)"
        }

    elif "if condition" in text or "if statement" in text:
        return {
            "intent": "generate_if_condition",
            "language": "javascript",
            "code": "if (x > 0) {\n  console.log('Positive number');\n}"
        }

    elif "create python function" in text:
        func_name = extract_function_name()
        return {
            "intent": "python_function",
            "language": "python",
            "code": f"def {func_name}():\n    pass"
        }

    elif "create html form" in text:
        return {
            "intent": "html_form",
            "language": "html",
            "code": "<form>\n  <input type='text' />\n</form>"
        }

    elif "add flexbox layout" in text:
        return {
            "intent": "flexbox_layout",
            "language": "css",
            "code": "display: flex;\njustify-content: center;"
        }

    elif "read file" in text:
        filename = extract_filename()
        return {
            "intent": "read_file",
            "language": "python",
            "code": f"with open('{filename}', 'r') as file:\n    contents = file.read()\n    print(contents)"
        }

    elif "write file" in text:
        filename = extract_filename()
        return {
            "intent": "write_file",
            "language": "python",
            "code": f"with open('{filename}', 'w') as file:\n    file.write('Hello, world!')"
        }

    elif "hello" in text or "hi" in text:
        return {
            "intent": "greeting",
            "code": "// Hello! How can I assist you today?"
        }

    elif "thank you" in text or "thanks" in text:
        return {
            "intent": "gratitude",
            "code": "// You're welcome!"
        }

    # ======== Default fallback ========
    else:
        return {
            "intent": "unknown",
            "code": "// Sorry, I couldn't understand the request."
        }
