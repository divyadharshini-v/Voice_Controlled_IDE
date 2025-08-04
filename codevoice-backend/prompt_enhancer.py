def enhance_prompt(user_prompt):
    """
    Enhance the user input to guide the model to produce clean code.
    """
    return f"""# Task: {user_prompt}
# Provide clean, complete, and runnable Python 3 code.
# Include appropriate print statements to show outputs.
# Do NOT leave any comment open or unclosed.
"""
