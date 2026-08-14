import { useState } from "react";
import { Plus, X, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  emptyMainDish,
  emptyAlternative,
  type MainDish,
  type Alternative,
  type MealEntry,
} from "@/lib/nutrition-plan";

type Props = {
  label: string;
  time: string;
  entry: MealEntry;
  onChange: (entry: MealEntry) => void;
};

export function MealSlotCard({ label, time, entry, onChange }: Props) {
  const [draftDish, setDraftDish] = useState("");
  const [draftQty, setDraftQty] = useState("");

  const addAlternative = () => {
    const value = draftDish.trim();
    if (!value) return;
    onChange({
      ...entry,
      alternatives: [...entry.alternatives, { dish: value, quantity: draftQty.trim() }],
    });
    setDraftDish("");
    setDraftQty("");
  };

  const updateAlternative = (index: number, patch: Partial<Alternative>) => {
    const alternatives = entry.alternatives.map((a, i) =>
      i === index ? { ...a, ...patch } : a,
    );
    onChange({ ...entry, alternatives });
  };

  const removeAlternative = (index: number) => {
    onChange({
      ...entry,
      alternatives: entry.alternatives.filter((_, i) => i !== index),
    });
  };

  const updateMain = (index: number, patch: Partial<MainDish>) => {
    const mains = entry.mains.map((m, i) => (i === index ? { ...m, ...patch } : m));
    onChange({ ...entry, mains });
  };

  const addMain = () => {
    onChange({ ...entry, mains: [...entry.mains, emptyMainDish()] });
  };

  const removeMain = (index: number) => {
    const mains = entry.mains.filter((_, i) => i !== index);
    onChange({ ...entry, mains: mains.length > 0 ? mains : [emptyMainDish()] });
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <header className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">{label}</h3>
      </header>

      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Piatto principale
        </label>
        <label className="mr-10 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quantità
        </label>
      </div>

      <div className="space-y-2">
        {entry.mains.map((mainDish, i) => (
          <div key={i} className="flex gap-2">
            <div className="relative flex-1">
              <Utensils className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
              <Input
                value={mainDish.dish}
                onChange={(e) => updateMain(i, { dish: e.target.value })}
                placeholder={i === 0 ? `Cosa mangi a ${label.toLowerCase()}?` : "Altro piatto…"}
                className="h-11 bg-surface pl-9 text-base"
              />
            </div>
            <Input
              value={mainDish.quantity}
              onChange={(e) => updateMain(i, { quantity: e.target.value })}
              placeholder="es. 200g"
              className="h-11 w-28 bg-surface text-base"
              inputMode="text"
            />
            {entry.mains.length > 1 ? (
              <button
                type="button"
                aria-label="Rimuovi piatto"
                onClick={() => removeMain(i)}
                className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
              >
                <X className="size-4" />
              </button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-11 w-11 shrink-0 border border-border"
                onClick={addMain}
              >
                <Plus className="size-4" />
                <span className="sr-only">Aggiungi piatto</span>
              </Button>
            )}
          </div>
        ))}

        {entry.mains.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addMain}
            className="border border-border text-muted-foreground"
          >
            <Plus className="mr-1 size-4" />
            Aggiungi piatto
          </Button>
        )}
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Alternative
        </p>

        {entry.alternatives.length > 0 && (
          <ul className="mb-2 space-y-2">
            {entry.alternatives.map((alt, i) => (
              <li
                key={`${alt.dish}-${i}`}
                className="group flex items-center gap-2 rounded-lg border border-dashed border-border bg-surface px-3 py-2 text-sm text-surface-foreground"
              >
                <span className="text-accent">oppure</span>
                <input
                  value={alt.dish}
                  onChange={(e) => updateAlternative(i, { dish: e.target.value })}
                  placeholder="Alternativa…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                />
                <input
                  value={alt.quantity}
                  onChange={(e) => updateAlternative(i, { quantity: e.target.value })}
                  placeholder="es. 200g"
                  className="w-20 bg-transparent text-right text-sm outline-none placeholder:text-muted-foreground/60"
                />
                <button
                  type="button"
                  aria-label={`Rimuovi alternativa ${alt.dish || i + 1}`}
                  onClick={() => removeAlternative(i)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <Input
            value={draftDish}
            onChange={(e) => setDraftDish(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAlternative();
              }
            }}
            placeholder="Aggiungi un'alternativa…"
            className="h-10 flex-1 bg-surface text-sm"
          />
          <Input
            value={draftQty}
            onChange={(e) => setDraftQty(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAlternative();
              }
            }}
            placeholder="es. 200g"
            className="h-10 w-28 bg-surface text-sm"
          />
          <Button type="button" variant="secondary" size="icon" className="h-10 w-10 shrink-0" onClick={addAlternative}>
            <Plus className="size-4" />
            <span className="sr-only">Aggiungi alternativa</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
