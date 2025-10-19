import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

from .....app.api.utils.text_cleaner import clean_transaction_name

def call(labelled_df):
    # Prepare training data
    X = labelled_df["name"]
    y = labelled_df["category"]

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

    categories = labelled_df["category"]

    # Build exact match lookup dictionary from labeled data
    labelled_df["name"] = labelled_df["name"].astype(str).apply(clean_transaction_name) # Cleanup names from the labeled dataframe
    lookup_dict = dict(zip(labelled_df["name"], categories))

    os.makedirs("./Labelling/models", exist_ok=True)
    joblib.dump(model, './Labelling/models/model.pkl')
    joblib.dump(vectorizer, './Labelling/models/vectorizer.pkl')
    joblib.dump(lookup_dict, './Labelling/models/lookup_dict.pkl')

def load():
    model = joblib.load('./Labelling/models/model.pkl')
    vectorizer = joblib.load('./Labelling/models/vectorizer.pkl')
    lookup_dict = joblib.load('./Labelling/models/lookup_dict.pkl')

    return model, vectorizer, lookup_dict