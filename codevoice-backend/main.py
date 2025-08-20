from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware 
from code_generation import router as code_router 
from compile_api import router as compile_router
from transcription import router as transcribe_router 
from txt_speech import router as txt_speech
app = FastAPI() 
app.add_middleware( CORSMiddleware, 
                   allow_origins=["*"], 
                   allow_credentials=True, 
                   allow_methods=["*"], 
                   allow_headers=["*"], ) 

app.include_router(code_router) 
app.include_router(compile_router)          
app.include_router(transcribe_router)
app.include_router(txt_speech)