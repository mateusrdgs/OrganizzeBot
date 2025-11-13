export class Expense {
  date: string;
  title: string;
  amount: number;
  category: string;
  tags: string;

  constructor(
    date: string,
    title: string,
    amount: number,
    category: string,
    tags: string,
  ) {
    this.date = date;
    this.title = title;
    this.amount = amount;
    this.category = category;
    this.tags = tags;
  }
}
