// ABOUTME: EventCard component displays individual events in the activity log
// ABOUTME: Shows event type, hero name, changes made, and timestamp with appropriate icons
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  PlusIcon, 
  MinusIcon, 
  StarIcon, 
  ShieldIcon, 
  ClockIcon 
} from "lucide-react";
import { cn } from "~/lib/utils";
import type { PlayerEvent } from "~/repositories/types";

interface EventCardProps {
  event: PlayerEvent;
  heroName?: string;
  className?: string;
}

export function EventCard({ event, heroName, className }: EventCardProps) {
  const { event_type, hero_slug, event_data, created_at } = event;

  const getEventIcon = () => {
    switch (event_type) {
      case 'CLAIM_HERO':
        return <PlusIcon className="size-4 text-green-600" />;
      case 'UNCLAIM_HERO':
        return <MinusIcon className="size-4 text-red-600" />;
      case 'UPDATE_HERO_STARS':
        return <StarIcon className="size-4 text-yellow-600" />;
      case 'UPDATE_HERO_EQUIPMENT':
        return <ShieldIcon className="size-4 text-blue-600" />;
      default:
        return <ClockIcon className="size-4 text-gray-600" />;
    }
  };

  const getEventTitle = () => {
    switch (event_type) {
      case 'CLAIM_HERO':
        return 'Added Hero';
      case 'UNCLAIM_HERO':
        return 'Removed Hero';
      case 'UPDATE_HERO_STARS':
        return 'Updated Stars';
      case 'UPDATE_HERO_EQUIPMENT':
        return 'Updated Equipment';
      default:
        return 'Unknown Event';
    }
  };

  const getEventDescription = () => {
    const data = event_data as any;
    
    switch (event_type) {
      case 'CLAIM_HERO':
        return `Added ${heroName || hero_slug} to collection with ${data.initial_stars || 1} stars and equipment level ${data.initial_equipment_level || 1}`;
      case 'UNCLAIM_HERO':
        return `Removed ${heroName || hero_slug} from collection (${data.final_stars || 0} stars, equipment level ${data.final_equipment_level || 0})`;
      case 'UPDATE_HERO_STARS':
        return `Updated ${heroName || hero_slug} stars: ${data.previous_stars || 0} → ${data.new_stars || 0}`;
      case 'UPDATE_HERO_EQUIPMENT':
        return `Updated ${heroName || hero_slug} equipment level: ${data.previous_equipment_level || 0} → ${data.new_equipment_level || 0}`;
      default:
        return `Unknown event for ${heroName || hero_slug}`;
    }
  };

  const getEventBadgeColor = () => {
    switch (event_type) {
      case 'CLAIM_HERO':
        return 'bg-green-100 text-green-800';
      case 'UNCLAIM_HERO':
        return 'bg-red-100 text-red-800';
      case 'UPDATE_HERO_STARS':
        return 'bg-yellow-100 text-yellow-800';
      case 'UPDATE_HERO_EQUIPMENT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={cn("transition-all duration-200", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getEventIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm">{getEventTitle()}</h4>
              <Badge className={getEventBadgeColor()}>
                {event_type.replace('_', ' ')}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {getEventDescription()}
            </p>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ClockIcon className="size-3" />
              {created_at ? formatTimestamp(created_at) : 'Unknown time'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}