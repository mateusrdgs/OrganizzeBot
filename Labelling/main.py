import pandas as pd
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from dotenv import load_dotenv

load_dotenv()

file_extension = ".csv"
unlabelled_file = os.getenv("UNLABELLED_CSV", "") + file_extension
labelled_file = os.getenv("LABELLED_CSV", "") + file_extension

df_unlabeled_path = os.path.join("./", "Private", unlabelled_file)
df_labeled_path = os.path.join("./", "Private", labelled_file)

# 1. Load CSVs
df_unlabeled = pd.read_csv(df_unlabeled_path) # Unlabeled data
df_labeled = pd.read_csv(df_labeled_path) # Has 'category' column

# 2. Prepare training data
X = df_labeled["name"]
y = df_labeled["category"]

# 3. Convert text into numbers using TF-IDF
vectorizer = TfidfVectorizer()
X_vec = vectorizer.fit_transform(X)

# 4. Train/test split to evaluate model
X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.3, random_state=42)

# 5. Train the model
model = LogisticRegression()
model.fit(X_train, y_train)

# 6. Evaluate model
y_pred = model.predict(X_test)
print("Classification Report:\n")
print(classification_report(y_test, y_pred))

# 7. Predict categories for new, unseen transactions
new_transactions = df_unlabeled["name"]
new_vec = vectorizer.transform(new_transactions)
new_preds = model.predict(new_vec)

# 8. Output predictions
df_unlabeled["predicted_category"] = new_preds

print("\nPredicted Categories:")
for desc, cat in zip(df_unlabeled["name"], new_preds):
    print(f"{desc} --> {cat}")