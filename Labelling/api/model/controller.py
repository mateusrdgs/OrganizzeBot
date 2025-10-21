from typing import List
from fastapi import APIRouter
import pandas as pd

from Labelling.api.model.models import Expense
from Labelling.api.model.services import predict as predict_service, train as train_service
from Labelling.api.utils import data_loader
from Labelling.api.utils.text_cleaner import postprocess

router = APIRouter(prefix="/model")

@router.post("/train")
def train():
  labelled_df, _ = data_loader.load_datasets()

  train_service.call(labelled_df)

@router.post("/predict")
def predict(expenses: List[Expense]):
  unlabelled_df = pd.DataFrame([vars(expense) for expense in expenses], columns=["date", "title", "amount"])

  predict_service.call(unlabelled_df)

  # Postprocess DataFrame
  unlabelled_df = postprocess(unlabelled_df)

  return unlabelled_df.to_dict(
    orient='records',
  )
