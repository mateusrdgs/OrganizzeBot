from utils.text_cleaner import clean_transaction_name

def build(labelled_df):
  categories = labelled_df["category"]

  # Build exact match lookup dictionary from labeled data
  labelled_df["name"] = labelled_df["name"].astype(str).apply(clean_transaction_name) # Cleanup names from the labeled dataframe
  expense_to_category = dict(zip(labelled_df["name"], categories))

  return expense_to_category
