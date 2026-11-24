import { Star } from "lucide-react";

export default function RatingStars({
  rating,
  reviewsCount,
  size = 13
}: {
  rating: number;
  reviewsCount?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1 text-smoke-500">
      <Star size={size} className="fill-lime-500 text-lime-500" />
      <span className="text-xs font-semibold text-ink">{rating.toFixed(1)}</span>
      {typeof reviewsCount === "number" && (
        <span className="text-xs text-smoke-400">({reviewsCount})</span>
      )}
    </div>
  );
}
