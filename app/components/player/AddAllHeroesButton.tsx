// ABOUTME: AddAllHeroesButton component provides bulk hero addition with confirmation and progress feedback
// ABOUTME: Shows confirmation dialog, loading states, and operation results for bulk hero collection management
import { useState } from "react";
import { UserRoundPlusIcon, LoaderCircle, CheckCircle, AlertTriangle, UsersIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";

interface AddAllHeroesButtonProps {
  /** Whether to show the button as disabled */
  disabled?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Callback when user confirms bulk addition */
  onConfirm?: () => void;
  /** Loading state during bulk operation */
  isLoading?: boolean;
  /** Progress percentage (0-100) during loading */
  progress?: number;
  /** Operation result after completion */
  result?: {
    success: boolean;
    message: string;
    data?: {
      totalHeroes: number;
      addedCount: number;
      skippedCount: number;
      errorCount: number;
    };
  };
  /** Expected number of heroes that would be added (for confirmation dialog) */
  expectedAddCount?: number;
}

export function AddAllHeroesButton({
  disabled = false,
  className,
  onConfirm,
  isLoading = false,
  progress = 0,
  result,
  expectedAddCount,
}: AddAllHeroesButtonProps) {
  const [showResult, setShowResult] = useState(false);

  // Show result when operation completes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open && result) {
      setShowResult(false);
    }
  };

  // Handle confirmation and trigger action
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
      setShowResult(true);
    }
  };

  // Auto-hide result after delay
  if (result && !showResult) {
    setTimeout(() => setShowResult(true), 100);
  }

  const buttonText = isLoading 
    ? `Adding Heroes...` 
    : "Add All Heroes to Collection";

  const buttonIcon = isLoading 
    ? <LoaderCircle className="size-4 animate-spin" />
    : <UsersIcon className="size-4" />;

  return (
    <div className="space-y-4">
      <AlertDialog onOpenChange={handleDialogOpenChange}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled || isLoading}
            className={cn(
              "flex items-center gap-2",
              isLoading && "cursor-wait",
              className
            )}
          >
            {buttonIcon}
            {buttonText}
          </Button>
        </AlertDialogTrigger>
        
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UsersIcon className="size-5" />
              Add All Heroes to Collection
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will add all available heroes to your collection that you don't already have.
              {expectedAddCount !== undefined && expectedAddCount > 0 && (
                <>
                  <br />
                  <br />
                  <strong>Approximately {expectedAddCount} heroes</strong> will be added to your collection
                  with default settings (1 star, level 1 equipment).
                </>
              )}
              {expectedAddCount === 0 && (
                <>
                  <br />
                  <br />
                  <strong>All heroes are already in your collection!</strong> No heroes will be added.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm}
              disabled={isLoading || expectedAddCount === 0}
              className="flex items-center gap-2"
            >
              <UserRoundPlusIcon className="size-4" />
              {expectedAddCount === 0 ? "Nothing to Add" : "Add All Heroes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading progress display */}
      {isLoading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Adding heroes to your collection...</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Result display */}
      {result && showResult && (
        <Alert 
          className={cn(
            "transition-all duration-300",
            result.success 
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
          )}
        >
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle className="size-4 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="size-4 mt-0.5 flex-shrink-0" />
            )}
            <AlertDescription className="flex-1">
              <div className="font-medium mb-1">
                {result.success ? "Success!" : "Error"}
              </div>
              <div className="text-sm">
                {result.message}
              </div>
              {result.success && result.data && (
                <div className="mt-2 text-xs space-y-1 opacity-90">
                  <div>• Added: {result.data.addedCount} heroes</div>
                  {result.data.skippedCount > 0 && (
                    <div>• Already had: {result.data.skippedCount} heroes</div>
                  )}
                  {result.data.errorCount > 0 && (
                    <div>• Errors: {result.data.errorCount} heroes</div>
                  )}
                </div>
              )}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResult(false)}
              className="text-current hover:bg-current/10 p-1 h-auto min-w-0"
            >
              ×
            </Button>
          </div>
        </Alert>
      )}
    </div>
  );
}