from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from Labelling.api.model import controller as model_controller

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=[
    "http://localhost:8000",
  ],
  allow_methods=[
    "POST"
  ]
)
app.include_router(model_controller.router)