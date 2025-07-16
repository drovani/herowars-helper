// ABOUTME: AddHeroButton component provides plus button for adding heroes to collection
// ABOUTME: Shows different states based on whether hero is already in collection
import { LoaderCircle, UserRoundCheckIcon, UserRoundPlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface AddHeroButtonProps {
  heroSlug: string;
  isInCollection?: boolean;
  isLoading?: boolean;
  onAddHero?: (heroSlug: string) => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export function AddHeroButton({
  heroSlug,
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
    if (isLoading) return <LoaderCircle className="size-4 animate-spin" />;
    if (isInCollection) return <UserRoundCheckIcon className="size-4" />;
    return <UserRoundPlusIcon className="size-4" />;
  };

  return (
    <Button
      variant={isInCollection ? "default" : variant}
      size={size}
      onClick={handleClick}
      disabled={isInCollection || isLoading}
      className={cn(
        "flex items-center gap-2 cursor-pointer",
        isLoading && "bg-blue-600 hover:bg-blue-700 cursor-wait",
        isInCollection && "bg-green-600 hover:bg-green-700",
        className
      )}
      title={getButtonText()}
    >
      {getIcon()}
    </Button>
  );
}