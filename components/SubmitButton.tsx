"use client";
import { useFormStatus } from "react-dom";
import Button from "./ui/Button";

export default function SubmitButton({ 
  label, 
  pendingLabel,
  variant = "primary",
  size = "md",
  className
}: { 
  label: string; 
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      aria-disabled={pending}
      variant={variant}
      size={size}
      className={className}
    >
      {pending ? (pendingLabel || "Guardando…") : label}
    </Button>
  );
}


