import unicodedata
import re
import os

installments_sentence_regex = r" - Parcela \d\/\d+"

def clean_transaction_name(name: str) -> str:
  name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("utf-8", "ignore")

  # Remove "Installments" from sentence
  name = re.sub(installments_sentence_regex, "", name)
  name = re.sub(r" \d\/\d+", "", name)

  return name

# Update amounts for the remaining expenses with installments
def multiply_amount(name, amount):
  if (re.search(installments_sentence_regex, name)):
      installment = int(re.sub(r".* - Parcela \d\/", "", name))
      return installment * amount

  return amount

# Update name for expenses with installments so I easily spot and handle them later
def update_name_expenses_with_installments(name):
    if (re.search(installments_sentence_regex, name)):
        return "HANDLE MANUALLY - " + name

    return name

def postprocess(UNLABELLED_DF):
  EXCLUSION_LIST = set(os.getenv("EXCLUSION_LIST", "").split(";"))

  UNLABELLED_DF['amount'] = UNLABELLED_DF.apply(lambda row: multiply_amount(row["name"], row.amount), axis=1)

  UNLABELLED_DF['name'] = UNLABELLED_DF.apply(lambda row: update_name_expenses_with_installments(row["name"]), axis=1)

  # Filter out installments other than the first one
  UNLABELLED_DF = UNLABELLED_DF[(~UNLABELLED_DF["name"].str.contains(r"- Parcela \b(?!1\b)\d+\b\/\d"))]

  # Filter out expenses in exclusion list
  UNLABELLED_DF = UNLABELLED_DF[UNLABELLED_DF["name"].apply(lambda x: x not in EXCLUSION_LIST)]

  # Apply tags
  UNLABELLED_DF["tags"] = os.getenv("TAGS", "")

  return UNLABELLED_DF