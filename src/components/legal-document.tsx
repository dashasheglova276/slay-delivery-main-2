import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export default function LegalDocument({
  title,
  updatedAt,
  intro,
  sections
}: {
  title: string;
  updatedAt: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <Link href="/" className="mb-4 flex items-center gap-1 text-sm text-smoke-500">
        <ChevronLeft size={15} />
        На главную
      </Link>

      <div className="rounded-xl3 border border-smoke-100 bg-white p-5 shadow-card sm:p-8">
        <h1 className="font-display text-xl font-extrabold text-ink sm:text-2xl">{title}</h1>
        <p className="mt-1 text-xs text-smoke-400">Действует с {updatedAt}</p>

        {intro && <p className="mt-4 text-sm leading-relaxed text-smoke-600">{intro}</p>}

        <div className="mt-6 flex flex-col gap-6">
          {sections.map((section, i) => (
            <section key={section.heading}>
              <h2 className="mb-2 font-display text-sm font-bold text-ink">
                {i + 1}. {section.heading}
              </h2>
              <div className="flex flex-col gap-2">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-sm leading-relaxed text-smoke-600">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-8 rounded-xl2 bg-smoke-50 p-3 text-xs leading-relaxed text-smoke-400">
          Это типовой шаблон документа для интернет-магазина. Перед публикацией в production
          рекомендуется согласовать точный юридический текст с юристом компании с учётом
          применимого законодательства.
        </p>
      </div>
    </div>
  );
}
