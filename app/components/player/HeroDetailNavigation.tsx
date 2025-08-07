// ABOUTME: HeroDetailNavigation component provides navigation between different hero detail views
// ABOUTME: Adapts between desktop vertical navigation and mobile bottom sticky navigation
import {
  UserIcon,
  SwordIcon,
  ShirtIcon,
  GemIcon,
  ZapIcon,
  SparklesIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface HeroDetailNavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  className?: string;
}

const navigationItems = [
  { id: "hero", label: "Hero", icon: UserIcon },
  { id: "skills", label: "Skills", icon: SwordIcon },
  { id: "skins", label: "Skins", icon: ShirtIcon },
  { id: "artifacts", label: "Artifacts", icon: GemIcon },
  { id: "glyphs", label: "Glyphs", icon: ZapIcon },
  { id: "sparks", label: "Sparks", icon: SparklesIcon },
];

export function HeroDetailNavigation({
  activeView,
  onViewChange,
  className,
}: HeroDetailNavigationProps) {
  return (
    <>
      {/* Desktop Navigation - Vertical Right Side */}
      <div
        className={cn(
          "hidden lg:flex flex-col bg-white border-l",
          className
        )}
      >
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium text-gray-900">Views</h3>
        </div>
        <div className="flex-1 p-2">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={cn(
                "w-full flex flex-col items-center gap-2 p-3 rounded-lg text-sm transition-colors",
                activeView === id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="size-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Navigation - Bottom Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around py-2">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 min-w-0 flex-1 transition-colors",
                activeView === id
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon className="size-5 flex-shrink-0" />
              <span className="text-xs font-medium truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Spacer - Prevents content from being hidden behind bottom nav */}
      <div className="lg:hidden h-16" />
    </>
  );
}