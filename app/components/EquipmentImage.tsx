import { cva, type VariantProps } from "class-variance-authority";
import { useState } from "react";
import { type EquipmentRecord } from "~/data/equipment.zod";
import { cn, getEquipmentImageUrl } from "~/lib/utils";

const imageVariants = cva("relative", {
  variants: {
    size: {
      default: "w-24 h-24",
      xs: "w-6 h-6",
      sm: "w-8 h-8",
      md: "w-16 h-16",
      lg: "w-24 h-24",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

function EquipmentImage({ equipment, size = "default" }: Props) {
  const [status, setStatus] = useState(equipment.slug ? "loading" : "error");

  return (
    <div className={cn(imageVariants({ size }))}>
      <img
        alt={`${equipment.name || "unknown"} icon`}
        src={getEquipmentImageUrl(equipment.slug)}
        className={cn(
          status === "loaded" || status === "loading" ? "" : "hidden",
          size == "xs" ? "p-0.5 rounded-sm" : "p-1 rounded-lg"
        )}
        onError={() => setStatus("error")}
        onLoad={() => setStatus("loaded")}
      />
      <img
        alt={`${equipment.name || "unknown"} icon border`}
        src={`/images/equipment/border-${equipment.quality || "gray"}${
          equipment.type === "fragment" && equipment.quality !== "gray"
            ? "-fragment"
            : ""
        }.png`}
        className="absolute top-0 left-0 h-full w-full"
      />
    </div>
  );
}

interface Props extends VariantProps<typeof imageVariants> {
  equipment: Pick<EquipmentRecord, "name" | "quality" | "type" | "slug">;
}

export default EquipmentImage;
