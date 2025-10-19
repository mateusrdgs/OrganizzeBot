from fastapi import FastAPI

from ..app.api.model import controller as model_controller

app = FastAPI()
app.include_router(model_controller.router)