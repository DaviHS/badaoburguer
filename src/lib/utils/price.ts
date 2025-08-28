
export function parsePrice(value: string | number | undefined): number {
  const number = Number(value);
  return isNaN(number) ? 0 : number;
}

export function formatCurrency(value: string | number | undefined): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parsePrice(value));
}