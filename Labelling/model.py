from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

def train(labelled_df):
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

    return model, vectorizer