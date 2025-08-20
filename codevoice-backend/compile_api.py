from fastapi import APIRouter, Form
from run_code_utils import wrap_runnable_code, run_locally

router = APIRouter()

@router.post("/compile/")
async def compile_code(
    code: str = Form(...),
    language: str = Form(...),
    inputs: str = Form("")
):
    # Inputs can be a string (from textarea) or empty
    inputs_list = [i for i in inputs.splitlines() if i.strip()] if inputs else []
    runnable_code = wrap_runnable_code(language, code)
    stdin = "\n".join(inputs_list) if inputs_list else ""
    stdout, stderr, compile_output = run_locally(language, runnable_code, stdin)
    return {
        "stdout": stdout,
        "stderr": stderr,
        "compile_output": compile_output
    }
