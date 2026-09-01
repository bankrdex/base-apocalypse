import type { ErrorComponentProps } from "@tanstack/react-router";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ground px-6 text-center text-type">
      <h1 className="label text-mute">Fault</h1>
      <p className="measure text-pretty text-body text-type">
        {error.message || "An unexpected error occurred. Try reloading the page."}
      </p>
    </main>
  );
}
