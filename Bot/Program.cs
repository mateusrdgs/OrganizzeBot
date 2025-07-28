using System.Globalization;
using DotNetEnv;

namespace Bot
{
  class Program
  {
    static async Task Main()
    {
      Env.Load();

      string? expensesFileName = Environment.GetEnvironmentVariable("EXPENSES_FILE_NAME");
      string? cardName = Environment.GetEnvironmentVariable("CARD_NAME");

      if (expensesFileName is null || cardName is null)
      {
        throw new Exception("EXPENSES_FILE_NAME or CARD_NAME not found");
      }
      else
      {
        var brCultureInfo = new CultureInfo("pt-BR");
        List<Expense> expenses = new List<Expense>();
        string currentDirectory = Directory.GetParent("./")?.ToString()!;

        using (var reader = new StreamReader(string.Concat(Directory.GetParent(currentDirectory), "/Private/", expensesFileName)))
        {
          while (!reader.EndOfStream)
          {
            var line = reader.ReadLine();

            if (line != null)
            {
              var values = line.Split(',');

              try
              {
                DateOnly date = DateOnly.Parse(values[0], brCultureInfo);
                decimal amount = decimal.Parse(values[2], brCultureInfo) / 100;

                expenses.Add(new Expense(date.ToString(), values[1], amount.ToString("N2", brCultureInfo), values[3], values.Skip(4).ToArray(), cardName));
              }
              catch (Exception ex)
              {
                Console.WriteLine(ex.Message);
              }
            }
          }
        }

        OrganizzeBot organizzeBot = new OrganizzeBot();

        await organizzeBot.Start(expenses);
      }
    }
  }
}

