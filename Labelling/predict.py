import re
import unicodedata
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

def predict(UNLABELLED_DF, LABELLED_DF):
  installments_sentence_regex = r" - Parcela \d\/\d+"

  # Prepare training data
  X = LABELLED_DF["name"]
  y = LABELLED_DF["category"]

  # Group rare categories into 'Other'
  min_samples = 2
  category_counts = y.value_counts()
  y = y.apply(lambda x: x if category_counts[x] >= min_samples else "Other")

  # Vectorize descriptions using bigrams
  vectorizer = TfidfVectorizer(ngram_range=(1, 2))
  X_vec = vectorizer.fit_transform(X)

  # 7. Train/test split
  X_train, _, y_train, _ = train_test_split(
      X_vec, y, test_size=0.3, random_state=42, stratify=y
  )

  # Train model with class balancing
  model = LogisticRegression(class_weight="balanced", max_iter=1000)
  model.fit(X_train, y_train)

  def clean_transaction_name(name: str) -> str:
      name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("utf-8", "ignore")

      # Remove "Installments" from sentence
      name = re.sub(installments_sentence_regex, "", name)
      name = re.sub(r" \d\/\d+", "", name)

      return name

  # Build exact match lookup dictionary from labeled data
  LABELLED_DF["name"] = LABELLED_DF["name"].astype(str).apply(clean_transaction_name) # Cleanup names from the labeled dataframe
  expense_to_category = dict(zip(LABELLED_DF["name"], y))

  # Define prediction function with exact match fallback
  def predict_expense_category(name, model, vectorizer, lookup_dict, threshold=0.7):
      if name in lookup_dict:
          return lookup_dict[name], 1.0 # Exact match, full confidence
      vec = vectorizer.transform([name])
      pred = model.predict(vec)[0]
      proba = model.predict_proba(vec).max()
      if proba >= threshold:
          return pred, proba
      else:
          return "Other", proba

  # Clean up expenses names to see if their name match with an existing one in the dictionary
  unlabeled_expenses_names = UNLABELLED_DF["name"].astype(str).apply(clean_transaction_name)

  # Predict on unlabeled data using the new function
  confidence_threshold = 0.7 # tune as needed
  final_preds = []
  for name in unlabeled_expenses_names:
      cat, _ = predict_expense_category(name, model, vectorizer, expense_to_category, confidence_threshold)
      final_preds.append(cat)

  UNLABELLED_DF["category"] = final_preds

  return UNLABELLED_DF