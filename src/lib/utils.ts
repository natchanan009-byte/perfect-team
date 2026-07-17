import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** รวม className อย่างปลอดภัย (จาก shadcn/ui pattern) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
