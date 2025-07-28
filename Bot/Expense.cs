class Expense
{
  public string Date { get; set; }
  public string Name { get; set; }
  public string Amount { get; set; }
  public string Category { get; set; }

  public string[] Tags { get; set; }

  public string CardName { get; set; }

  public Expense(string date, string name, string amount, string category, string[] tags, string cardName)
  {
    Date = date;
    Name = name;
    Amount = amount;
    Category = category;
    Tags = tags;
    CardName = cardName;
  }
}