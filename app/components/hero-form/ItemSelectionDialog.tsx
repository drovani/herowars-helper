import { SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";
import EquipmentImage from "~/components/EquipmentImage";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { type EquipmentRecord } from "~/data/equipment.zod";
import type { HeroRankLevel } from "~/data/ReadonlyArrays";

interface ItemSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (equipmentSlug: string | null) => void;
  equipment: EquipmentRecord[];
  quality: HeroRankLevel;
}

export default function ItemSelectionDialog({
  open,
  onClose,
  onSelect,
  equipment,
  quality,
}: ItemSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const availableEquipment = equipment.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="capitalize">
            Select {quality.replace("+", " +")} Equipment
          </DialogTitle>
          <div className="relative mt-4">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button
              variant="ghost"
              className="flex items-center gap-2 justify-start p-2 h-16"
              onClick={() => {
                onSelect(null);
                onClose();
              }}
            >
              <div className="size-12 bg-muted rounded flex items-center justify-center">
                <XIcon className="size-6 text-muted-foreground" />
              </div>
              <span>Empty Slot</span>
            </Button>

            {availableEquipment.map((equip) => (
              <Button
                key={equip.slug}
                variant="ghost"
                className="flex items-center gap-2 justify-start p-2 h-16"
                onClick={() => {
                  onSelect(equip.slug);
                  onClose();
                }}
              >
                <div className="size-16">
                  <EquipmentImage equipment={equip} size="md" />
                </div>
                <span className="text-sm">{equip.name}</span>
              </Button>
            ))}
          </div>
          {availableEquipment.length === 0 && searchQuery && (
            <div className="text-center text-muted-foreground py-8">
              No equipment found matching "{searchQuery}"
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
