"use client";
import { PropsWithChildren } from "react";

type HiddenMap = Record<string, string | number | null | undefined>;

export default function ConfirmForm({
  action,
  hidden,
  confirmMessage,
  className,
  children,
}: PropsWithChildren<{ action: (formData: FormData) => void | Promise<void>, hidden?: HiddenMap, confirmMessage: string, className?: string }>) {
  return (
    <form action={action} className={className}
      onSubmit={(e) => { if (!confirm(confirmMessage)) e.preventDefault(); }}>
      {hidden && Object.entries(hidden).map(([k, v]) =>
        <input key={k} type="hidden" name={k} value={v == null ? "" : String(v)} />
      )}
      {children}
    </form>
  );
}
