import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Section({
  title,
  subtitle,
  href,
  children
}: {
  title: string;
  subtitle?: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="storefront-section">
      <div className="section-head">
        <div><h2>{title}</h2>{subtitle && <p className="section-subtitle">{subtitle}</p>}</div>
        {href && (
          <Link
            href={href}
            className="section-link"
          >
            Все
            <ChevronRight size={14} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
