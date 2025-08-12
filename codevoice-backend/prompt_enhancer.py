# prompt_enhancer.py

def refine_prompt(prompt: str) -> str:
    """
    Refines a vague or short user prompt into a more detailed,
    explicit instruction for generating complete runnable Python code.
    """

    # Basic cleanup
    prompt = prompt.strip()

    # Add clarifications if prompt is very short or vague
    if len(prompt) < 20:
        prompt = (
            f"Write a complete Python program that fulfills the following task: {prompt}. "
            "Include necessary input/output handling and ensure the program runs without errors."
        )
    else:
        # For longer prompts, try to enforce the format and completion
        if not prompt.lower().startswith(("write", "create", "implement", "generate")):
            prompt = (
                f"Write a complete Python program that fulfills the following task: {prompt}. "
                "The program should be runnable and handle inputs/outputs properly."
            )
        else:
            # If it already starts well, just add a reminder to be complete and runnable
            prompt += " The code should be complete, runnable, and include input/output handling."

    return prompt
