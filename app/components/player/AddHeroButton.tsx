// ABOUTME: AddHeroButton component provides plus button for adding heroes to collection
// ABOUTME: Shows different states based on whether hero is already in collection
import { Button } from "~/components/ui/button";
import { PlusIcon, CheckIcon } from "lucide-react";
import { cn } from "~/lib/utils";

interface AddHeroButtonProps {
  heroSlug: string;
  heroName: string;
  isInCollection?: boolean;
  isLoading?: boolean;
  onAddHero?: (heroSlug: string) => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export function AddHeroButton({
  heroSlug,
  heroName,
  isInCollection = false,
  isLoading = false,
  onAddHero,
  className,
  variant = "outline",
  size = "sm"
}: AddHeroButtonProps) {
  const handleClick = () => {
    if (!isInCollection && !isLoading && onAddHero) {
      onAddHero(heroSlug);
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Adding...";
    if (isInCollection) return "In Collection";
    return "Add to Collection";
  };

  const getIcon = () => {
    if (isLoading) return null;
    if (isInCollection) return <CheckIcon className="size-4" />;
    return <PlusIcon className="size-4" />;
  };

  return (
    <Button
      variant={isInCollection ? "default" : variant}
      size={size}
      onClick={handleClick}
      disabled={isInCollection || isLoading}
      className={cn(
        "flex items-center gap-2",
        isInCollection && "bg-green-600 hover:bg-green-700",
        className
      )}
    >
      {getIcon()}
      {getButtonText()}
    </Button>
  );
}