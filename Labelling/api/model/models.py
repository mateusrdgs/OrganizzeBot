from decimal import Decimal
from pydantic import BaseModel, Field

class Expense(BaseModel):
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    title: str = Field(min_length=1)
    amount: Decimal = Field(decimal_places=2)
    category: str | None = None
