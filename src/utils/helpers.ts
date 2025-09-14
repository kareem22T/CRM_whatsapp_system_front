export interface AppConfig {
  BASE_URL: string;
  SHOW_INVOICES: boolean;
  SHOW_POS: boolean;
  SHOW_SALES: boolean;
  SHOW_SESSIONS_REPORT: boolean;
  LOGO_SIDE: string;
  LOGO: string;
}

export const generatePageNumbers = (page: number, totalPages: number) => {
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const pages:number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
};

export function encodeName(str: string) {
  return str.replace(/ /g, "%20");
}

export function decodeName(str: string) {
  return str.replace(/%20/g, " ");
}

export function getPaymentStatus (status: string) {
  switch (status) {
    case "Paid":
      return 2;
    case "Unpaid":
      return 0;
    case "PartialPaid":
      return 1;
    default:
      return 2;
    }
}

export function safeParse<T>(value: string | null, fallback: T): T {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}
