// ABOUTME: StarRating component displays and allows editing of hero star progression (1-6 stars)
// ABOUTME: Shows filled/empty stars with click interaction for updating star levels
import { StarIcon } from "lucide-react";
import { cn } from "~/lib/utils";

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  readOnly?: boolean;
  onStarClick?: (stars: number) => void;
  className?: string;
}

export function StarRating({
  stars,
  maxStars = 6,
  readOnly = false,
  onStarClick,
  className,
}: StarRatingProps) {
  const handleStarClick = (starIndex: number) => {
    if (!readOnly && onStarClick) {
      onStarClick(starIndex + 1);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }, (_, index) => {
          const isFilled = index < stars;
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStarClick(index)}
              disabled={readOnly}
              className={cn(
                "transition-colors duration-200",
                !readOnly && "hover:scale-110 cursor-pointer",
                readOnly && "cursor-default"
              )}
              data-testid={isFilled ? "filled" : "empty"}
            >
              <StarIcon
                className={cn(
                  "size-5",
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-300"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
