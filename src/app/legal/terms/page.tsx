import { redirect } from "next/navigation";

// Каноническая страница теперь /terms. Оставляем редирект для старых ссылок.
export default function LegalTermsRedirect() {
  redirect("/terms");
}
