from dotenv import load_dotenv
import pandas as pd
import os

def init():
  # Load .env variables
  load_dotenv()

  load_dotenv()

  FILE_EXTENSION = ".csv"
  UNLABELED_FILE = os.getenv("UNLABELLED_CSV", "") + FILE_EXTENSION
  LABELED_FILE = os.getenv("LABELLED_CSV", "") + FILE_EXTENSION

  UNLABELLED_DF_PATH = os.path.join("./Private", UNLABELED_FILE)
  LABELLED_DF_PATH = os.path.join("./Private", LABELED_FILE)

  # Load CSVs
  UNLABELLED_DF = pd.read_csv(UNLABELLED_DF_PATH)
  LABELLED_DF = pd.read_csv(LABELLED_DF_PATH)

  return UNLABELLED_DF, LABELLED_DF