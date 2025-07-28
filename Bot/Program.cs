using System.Globalization;
using Microsoft.Playwright;
using DotNetEnv;

public class Program
{

  static void Main()
  {
    Env.Load();

    string? expensesFileName = Environment.GetEnvironmentVariable("EXPENSES_FILE_NAME");
    string? cardName = Environment.GetEnvironmentVariable("CARD_NAME");
    var brCultureInfo = new CultureInfo("pt-BR");

    List<Expense> expenses = new List<Expense>();

    if (expensesFileName is not null && cardName is not null)
    {
      using (var reader = new StreamReader(expensesFileName))
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
      OrganizzeBot(expenses).Wait();
    }
    else
    {
      throw new Exception("EXPENSES_FILE_NAME or CARD_NAME not found");
    }

  }

  static async Task OrganizzeBot(List<Expense> expenses)
  {
    using var playwright = await Playwright.CreateAsync();

    await using var browser = await playwright.Chromium.LaunchAsync(new()
    {
      Headless = false,
      SlowMo = 500,
    });

    var page = await browser.NewPageAsync();
    await page.GotoAsync("https://www.organizze.com.br/");

    await Login(page);
    await page.WaitForURLAsync("**/inicio");
    await page.GetByRole(AriaRole.Link, new() { Name = "m DESPESA" }).ClickAsync();

    for (var i = 0; i < expenses.Count(); i++)
    {
      await CreateExpense(page, expenses[i]);
    }
  }

  static async Task Login(IPage page)
  {
    await page.GetByText("Login").First.ClickAsync();

    await page.WaitForURLAsync("**/login");

    string? email = Environment.GetEnvironmentVariable("ORGANIZZE_EMAIL");
    string? password = Environment.GetEnvironmentVariable("ORGANIZZE_PASSWORD");

    if (email is not null && password is not null)
    {
      await page.Locator("id=email").FillAsync(email);
      await page.Locator("id=password").FillAsync(password);

      await page.GetByText("Entrar").First.ClickAsync();
    }
    else
    {
      throw new Exception("ORGANIZZE_EMAIL or ORGANIZZE_PASSWORD not found");
    }
  }

  static async Task CreateExpense(IPage page, Expense expense)
  {
    var modal = page.GetByLabel("Nova despesa");

    await page.GetByLabel("Descrição").FillAsync(expense.Name);
    await page.GetByLabel("Valor").FillAsync(expense.Amount);
    await page.GetByLabel("Data").FillAsync(expense.Date);
    await page.GetByText("Conta/Cartão").ClickAsync();
    await page.GetByLabel("Nova despesa").GetByText(expense.CardName).First.ClickAsync();
    await page.GetByLabel("Categoria").ClickAsync();
    await page.GetByLabel("Nova despesa").GetByText(expense.Category).ClickAsync();
    await modal.Locator("span").Filter(new() { HasText = "Tags" }).Locator("xpath=..").ClickAsync();

    foreach (var tag in expense.Tags)
    {
      await page.GetByLabel("Tags").ClickAsync();
      await modal.Locator(".option").GetByText(tag, new() { Exact = true }).ClickAsync();
    }

    await modal.ClickAsync();

    await modal.GetByRole(AriaRole.Button).Last.ClickAsync();

    await page.GetByText("carregando").IsHiddenAsync();
  }
}
