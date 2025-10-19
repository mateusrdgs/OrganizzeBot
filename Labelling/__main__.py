import os
from predict import predict
from utils.text_cleaner import postprocess
from utils.data_loader import load_datasets

def main():
    unlabelled_df, labelled_df = load_datasets()

    # Predict expenses categories
    unlabelled_df = predict(unlabelled_df, labelled_df)

    # Postprocess DataFrame
    unlabelled_df = postprocess(unlabelled_df)

    # Save DataFrame as CSV
    new_file = os.getenv("UNLABELLED_CSV", "") + " - labelled" + ".csv"
    new_file_path = os.path.join("./Private", new_file)

    unlabelled_df.to_csv(new_file_path, index=False, float_format="%.2f", header=False)

if __name__ == '__main__':
    main()