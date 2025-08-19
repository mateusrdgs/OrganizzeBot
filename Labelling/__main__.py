import os
from __init__ import init
from predict import predict
from postprocess import postprocess

def main():
    UNLABELLED_DF, LABELLED_DF = init()

    # Predict expenses categories
    UNLABELLED_DF = predict(UNLABELLED_DF, LABELLED_DF)

    # Postprocess DataFrame
    UNLABELLED_DF = postprocess(UNLABELLED_DF)

    # Save DataFrame as CSV
    new_file = os.getenv("UNLABELLED_CSV", "") + " - labelled" + ".csv"
    new_file_path = os.path.join("..", "./Private", new_file)

    UNLABELLED_DF.to_csv(new_file_path, index=False, float_format="%.2f", header=False)

if __name__ == '__main__':
    main()