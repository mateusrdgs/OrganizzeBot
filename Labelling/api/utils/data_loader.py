import joblib

def load_dumps():
  model = joblib.load('./Labelling/models/model.pkl')
  vectorizer = joblib.load('./Labelling/models/vectorizer.pkl')
  lookup_dict = joblib.load('./Labelling/models/lookup_dict.pkl')

  return model, vectorizer, lookup_dict