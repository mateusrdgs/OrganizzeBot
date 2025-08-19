using System.Globalization;
using DotNetEnv;

namespace Bot
{
  class Program
  {
    static async Task Main()
    {
      List<Log> logs = new List<Log>();

      try
      {
        Env.Load();

        string? expensesFileName = Environment.GetEnvironmentVariable("EXPENSES_FILE_NAME");
        string? cardName = Environment.GetEnvironmentVariable("CARD_NAME");

        if (expensesFileName is null)
        {
          throw new Exception("EXPENSES_FILE_NAME not found");
        }
        else if (cardName is null)
        {
          throw new Exception("CARD_NAME not found");
        }
        else
        {
          List<Expense> expenses = new List<Expense>();
          var brCultureInfo = new CultureInfo("pt-BR");
          string currentDirectory = Directory.GetParent("./")?.ToString()!;

          using (var reader = new StreamReader(string.Concat(currentDirectory, "/Private/", expensesFileName)))
          {
            while (!reader.EndOfStream)
            {
              var line = reader.ReadLine();

              if (line != null)
              {
                var values = line.Split(',');

                string date = values[0];
                string name = values[1];
                string amount = values[2];
                string category = values[3];
                string tags = values[4];

                var expense = new Expense(
                  date,
                  name,
                  amount,
                  category,
                  tags,
                  cardName,
                  brCultureInfo
                );

                expenses.Add(expense);
              }
            }
          }

          OrganizzeBot organizzeBot = new OrganizzeBot();
          await organizzeBot.Start(expenses, logs);
        }
      }
      catch (Exception ex)
      {
        Console.WriteLine(ex.Message);
      }
      finally
      {
        foreach (var log in logs)
        {
          Console.WriteLine(log.Datetime.ToString());
          Console.WriteLine(log.Expense.Name);
          Console.WriteLine(log.Status);
        }
      }
    }
  }
}

