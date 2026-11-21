export type IconName =
  | "home" | "grid" | "chef" | "cart" | "user" | "search" | "heart"
  | "bolt" | "arrow-right" | "arrow-left" | "clock" | "chevron" | "trash" | "plus" | "minus";

const paths: Record<IconName, string> = {
  home: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  grid: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z",
  chef: "M7 15a4 4 0 1 1 1.5-7.7A4 4 0 0 1 15.5 7.300 4 4 0 1 1 17 15v5H7z M7 18h10",
  cart: "M3 4h2l2.500 11h10.500L20 7H6.500 M9 20.500h.01 M17 20.500h.01",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 3.500-6 8-6s8 2 8 6",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-5-5",
  heart: "M12 21s-8-5-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 6-8 11-8 11z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  "arrow-right": "M5 12h14 M13 6l6 6-6 6",
  "arrow-left": "M19 12H5 M11 6l-6 6 6 6",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  chevron: "M9 6l6 6-6 6",
  trash: "M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13",
  plus: "M12 5v14 M5 12h14",
  minus: "M5 12h14",
};

interface Props {
  name: IconName;
  size?: number;
  filled?: boolean;
}

export default function Icon({ name, size = 22, filled = false }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
