from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()
app = FastAPI()
apii_key = os.getenv("OPENAI_API_KEY")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
client = OpenAI(
    api_key=apii_key,
    base_url="https://openrouter.ai/api/v1"
)

@app.post("/generate")
async def generate_code(request: Request):
    data = await request.json()
    prompt = data.get("prompt", "")

    response = client.chat.completions.create(
        model="deepseek/deepseek-r1-zero:free",
        messages=[
            {"role": "system", "content": "Generate only HTML, CSS, and JS sections from user prompts. Clearly label each section."},
            {"role": "user", "content": prompt}
        ]
    )

    # Print full code in terminal
    print(response.choices[0].message.content)

    return {"code": response.choices[0].message.content}
