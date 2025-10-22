from Labelling.api.utils.text_cleaner import clean_transaction_name
from Labelling.api.utils.data_loader import load_dumps

# Define prediction function with exact match fallback
def predict_expense_category(name, model, vectorizer, lookup_dict, threshold):
    if name in lookup_dict:
        return lookup_dict[name], 1.0 # Exact match, full confidence

    vec = vectorizer.transform([name])
    pred = model.predict(vec)[0]
    proba = model.predict_proba(vec).max()

    if proba >= threshold:
        return pred, proba
    else:
        return "Other", proba

def call(unlabelled_df):
    model, vectorizer, lookup_dict = load_dumps()

    # Clean up expenses names to see if their name match with an existing one in the dictionary
    unlabeled_expenses_names = unlabelled_df["title"].astype(str).apply(clean_transaction_name)

    confidence_threshold = 0.7 # tune as needed
    final_preds = []

    for name in unlabeled_expenses_names:
        # Predict on unlabeled data
        cat, _ = predict_expense_category(name, model, vectorizer, lookup_dict, confidence_threshold)
        final_preds.append(cat)

    unlabelled_df["category"] = final_preds

    return unlabelled_df