import pandas as pd
import re
import unicodedata
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

file_extension = ".csv"
unlabelled_file = os.getenv("UNLABELLED_CSV", "") + file_extension
labelled_file = os.getenv("LABELLED_CSV", "") + file_extension

df_unlabeled_path = os.path.join("..", "./Private", unlabelled_file)
df_labeled_path = os.path.join("..", "./Private", labelled_file)

installments_sentence_regex = r" - Parcela \d\/\d+"

# Load CSVs
df_unlabeled = pd.read_csv(df_unlabeled_path)
df_labeled = pd.read_csv(df_labeled_path)

# Prepare training data
X = df_labeled["name"]
y = df_labeled["category"]

# Group rare categories into 'Other'
min_samples = 2
category_counts = y.value_counts()
y = y.apply(lambda x: x if category_counts[x] >= min_samples else "Other")

# Vectorize descriptions using bigrams
vectorizer = TfidfVectorizer(ngram_range=(1, 2))
X_vec = vectorizer.fit_transform(X)

# 7. Train/test split
X_train, X_test, y_train, y_test = train_test_split(
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
df_labeled["name"] = df_labeled["name"].astype(str).apply(clean_transaction_name) # Cleanup names from the labeled dataframe
expense_to_category = dict(zip(df_labeled["name"], y))

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

# Filter out installments other than the first one
df_unlabeled = df_unlabeled[(~df_unlabeled["name"].str.contains(r"- Parcela \b(?!1\b)\d+\b\/\d"))]

# Clean up expenses names to see if their name match with an existing one in the dictionary
unlabeled_expenses_names = df_unlabeled["name"].astype(str).apply(clean_transaction_name)

# Predict on unlabeled data using the new function
confidence_threshold = 0.7 # tune as needed
final_preds = []
for name in unlabeled_expenses_names:
    cat, conf = predict_expense_category(name, model, vectorizer, expense_to_category, confidence_threshold)
    final_preds.append(cat)

df_unlabeled["category"] = final_preds
df_unlabeled["tags"] = os.getenv("TAGS", "")

# Update amounts for the remaining expenses with installments
def multiply_amount(name, amount):
    if (re.search(installments_sentence_regex, name)):
        installment = int(re.sub(r".* - Parcela \d\/", "", name))
        return installment * amount

    return amount

df_unlabeled['amount'] = df_unlabeled.apply(lambda row: multiply_amount(row["name"], row.amount), axis=1)

# Update name for expenses with installments so I easily spot and handle them later
def update_name_expenses_with_installments(name):
    if (re.search(installments_sentence_regex, name)):
        return "HANDLE MANUALLY - " + name

    return name

df_unlabeled['name'] = df_unlabeled.apply(lambda row: update_name_expenses_with_installments(row["name"]), axis=1)

# Save DataFrame as CSV
new_file = os.getenv("UNLABELLED_CSV", "") + " - labelled" + file_extension
new_file_path = os.path.join("..", "./Private", new_file)

df_unlabeled.to_csv(new_file_path, index=False, float_format="%.2f", header=False)