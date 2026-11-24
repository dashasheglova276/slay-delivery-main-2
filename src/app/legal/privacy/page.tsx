import { redirect } from "next/navigation";

// Каноническая страница теперь /privacy. Оставляем редирект для старых ссылок.
export default function LegalPrivacyRedirect() {
  redirect("/privacy");
}
