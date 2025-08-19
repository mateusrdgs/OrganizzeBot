namespace Bot
{
  class Log
  {
    public Expense Expense { get; set; }

    public DateTime Datetime { get; set; }

    public Enum Status { get; set; }

    public Log(Expense expense, Status status)
    {
      Expense = expense;
      Datetime = DateTime.Now;
      Status = status;
    }
  }
}