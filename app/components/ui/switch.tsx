import { Root, Thumb } from "@radix-ui/react-switch";
import { type ClassValue } from "clsx";
import { forwardRef, useState } from "react";

import { cn } from "~/lib/utils";

const Switch = forwardRef<
  React.ComponentRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root> & {
    className?: ClassValue;
    checkedIcon?: React.ReactNode;
    uncheckedIcon?: React.ReactNode;
  }
>(({ className, checkedIcon, uncheckedIcon, onCheckedChange, ...props }, ref) => {
  const isControlled = props.checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(props.defaultChecked || false);

  const isChecked = isControlled ? props.checked : internalChecked;
  const handleCheckedChange = (checked: boolean) => {
    if (!isControlled) {
      setInternalChecked(checked);
    }
    if (onCheckedChange) {
      onCheckedChange(checked);
    }
  }

  return (
    <Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className
      )}
      onCheckedChange={handleCheckedChange}
      {...props}
      checked={isChecked}
      ref={ref}
    >
      <Thumb
        className={cn(
          "pointer-events-none flex items-center justify-center size-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      >
        {isChecked && checkedIcon && checkedIcon}
        {!isChecked && uncheckedIcon && uncheckedIcon}
      </Thumb>
    </Root>
  )
});

Switch.displayName = Root.displayName;

export { Switch };
