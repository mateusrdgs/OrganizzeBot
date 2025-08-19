using Microsoft.Playwright;

namespace Bot
{
  class OrganizzeBot
  {
    public async Task Start(List<Expense> expenses, List<Log> logs)
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
        Log log;
        try
        {
          await CreateExpense(page, expenses[i]);
          log = new Log(expenses[i], Status.Success);
          logs.Add(log);
        }
        catch (Exception)
        {
          log = new Log(expenses[i], Status.Fail);
          logs.Add(log);
          throw;
        }
      }
    }

    async Task Login(IPage page)
    {
      await page.GetByText("Login").First.ClickAsync();

      await page.WaitForURLAsync("**/login");

      string? email = Environment.GetEnvironmentVariable("ORGANIZZE_EMAIL");
      string? password = Environment.GetEnvironmentVariable("ORGANIZZE_PASSWORD");

      if (email is null)
      {
        throw new Exception("ORGANIZZE_EMAIL not found");
      }
      else if (password is null)
      {
        throw new Exception("ORGANIZZE_PASSWORD not found");
      }
      else
      {
        await page.Locator("id=email").FillAsync(email);
        await page.Locator("id=password").FillAsync(password);

        await page.GetByText("Entrar").First.ClickAsync();
      }
    }

    async Task CreateExpense(IPage page, Expense expense)
    {
      var modal = page.GetByLabel("Nova despesa");

      await page.GetByLabel("Descrição").FillAsync(expense.Name);
      await page.GetByLabel("Valor").FillAsync(expense.Amount);
      await page.GetByLabel("Data").FillAsync(expense.Date);
      await page.GetByText("Conta/Cartão").ClickAsync();
      await page.GetByLabel("Nova despesa").GetByText(expense.CardName).First.ClickAsync();
      await page.GetByLabel("Categoria").ClickAsync();
      await page.GetByLabel("Nova despesa").GetByText(expense.Category).ClickAsync();

      if (expense.Installments > 1)
      {
        await modal.Locator("span").Filter(new() { HasText = "Repetir" }).Locator("xpath=..").ClickAsync();
        await modal.Locator("span").Filter(new() { HasText = "é um lançamento parcelado em" }).Locator("xpath=..").ClickAsync();
        await page.Locator(".item[data-value='2']").ClickAsync();
        await page.Locator($"[data-selectable][data-value='{expense.Installments}']").ClickAsync();
      }

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
}