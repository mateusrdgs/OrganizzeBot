from dotenv import load_dotenv
import pandas as pd
import os
import joblib

def load_datasets():
  # Load .env variables
  load_dotenv()

  file_extension = ".csv"
  unlabelled_file = os.getenv("UNLABELLED_CSV", "") + file_extension
  labelled_file = os.getenv("LABELLED_CSV", "") + file_extension

  unlabelled_df_path = os.path.join("./Private", unlabelled_file)
  labelled_df_path = os.path.join("./Private", labelled_file)

  unlabelled_df = pd.read_csv(unlabelled_df_path)
  labelled_df = pd.read_csv(labelled_df_path)

  return labelled_df, unlabelled_df

def load_dumps():
  model = joblib.load('./Labelling/models/model.pkl')
  vectorizer = joblib.load('./Labelling/models/vectorizer.pkl')
  lookup_dict = joblib.load('./Labelling/models/lookup_dict.pkl')

  return model, vectorizer, lookup_dict