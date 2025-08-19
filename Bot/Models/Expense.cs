using System.Globalization;
using System.Text.RegularExpressions;

namespace Bot
{
  class Expense
  {
    public string Date { get; set; }
    public string Name { get; set; }
    public string Amount { get; set; }
    public string Category { get; set; }
    public string[] Tags { get; set; }

    public string CardName { get; set; }

    public int Installments { get; set; }

    public Expense(string date, string name, string amount, string category, string tags, string cardName, CultureInfo cultureInfo)
    {
      Date = DateOnly.Parse(date, cultureInfo).ToString();
      Name = name;
      Amount = (decimal.Parse(amount, cultureInfo) / 100).ToString("N2", cultureInfo);
      Category = category;
      Tags = tags.Split(";").ToArray();
      CardName = cardName;

      if (Regex.IsMatch(name, @" - Parcela \d\/\d"))
      {
        var regEx = new Regex(@".+ - Parcela \d\/");
        Installments = int.Parse(regEx.Replace(name, ""));
      }
      else
      {
        Installments = 1;
      }
    }
  }
}