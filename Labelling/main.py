from dotenv import load_dotenv
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from Labelling.api.model import controller as model_controller

@asynccontextmanager
async def lifespan(_app: FastAPI):
  load_dotenv()
  yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
  CORSMiddleware,
  allow_origins=[
    "http://localhost",
  ],
  allow_methods=[
    "POST"
  ]
)

app.include_router(model_controller.router)