import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type SpinnerProps = HTMLAttributes<HTMLSpanElement>;

export default function Spinner({ ...props }: SpinnerProps) {
  return (
    <div
      {...props}
      className={cn(
        "size-4 animate-spin rounded-full border-[0.15em] border-[unset] border-b-transparent",
        props.className,
      )}
    ></div>
  );
}
