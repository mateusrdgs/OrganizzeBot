from fastapi import APIRouter
import os

from .services import predict as predictt
from .services import train as trainn
from ..utils import data_loader
from ..utils.text_cleaner import postprocess

router = APIRouter(prefix="/model")

@router.post("/train")
def train():
  labelled_df, _ = data_loader.load_datasets()

  trainn.call(labelled_df)

  return "train!"

@router.post("/predict")
def predict():
  _, unlabelled_df = data_loader.load_datasets()

  predictt.predict(unlabelled_df)

  # Postprocess DataFrame
  unlabelled_df = postprocess(unlabelled_df)

  # Save DataFrame as CSV
  new_file = os.getenv("UNLABELLED_CSV", "") + " - labelled" + ".csv"
  new_file_path = os.path.join("./Private", new_file)

  unlabelled_df.to_csv(new_file_path, index=False, float_format="%.2f", header=False)

  return "predict!"
