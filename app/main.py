from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.poem_generator import generate_poem
from app.image_generator import generate_image
import speech_recognition as sr


app = FastAPI()

# ✅ Configure CORS to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from React frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

class RequestBody(BaseModel):
    choice: str
    prompt: str

@app.post("/generate/")
async def generate(request: RequestBody):
    if request.choice.lower() == "poem":
        return {"result": generate_poem(request.prompt)}
    elif request.choice.lower() == "image":
        image_url = generate_image(request.prompt)
        if image_url:
            return {"result": image_url}
        else:
            raise HTTPException(status_code=500, detail="Failed to generate image.")
    else:
        raise HTTPException(status_code=400, detail="Invalid choice. Choose 'poem' or 'image'.")

@app.post("/voice-to-text/")
async def voice_to_text():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        audio = recognizer.listen(source)

        try:
            text = recognizer.recognize_google(audio).lower()
            print("Recognized:", text)
            return {"text": text}
        except sr.UnknownValueError:
            return {"text": "Sorry, I couldn't understand."}
        except sr.RequestError:
            return {"text": "Speech recognition service error."}

