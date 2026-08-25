import type { WeekPlan } from "@/lib/nutrition-plan";
import { DAYS, MEAL_SLOTS, emptyDay, countPlanned } from "@/lib/nutrition-plan";

export async function exportWeekPdf(week: WeekPlan) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  let hasContent = false;

  const ensureSpace = (height: number) => {
    if (y + height <= pageHeight - margin) return;
    doc.addPage();
    y = margin;
  };

  const addWrappedText = (text: string, x: number, maxWidth: number, lineHeight: number) => {
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, x, y);
      y += lineHeight;
    }
  };

  doc.setProperties({ title: "Piano Alimentare" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Piano Alimentare — Settimana", margin, y);
  y += 11;

  for (const day of DAYS) {
    const dayPlan = week[day] ?? emptyDay();
    if (countPlanned(dayPlan) === 0) continue;

    hasContent = true;
    ensureSpace(22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(65, 82, 44);
    doc.text(day, margin, y);
    y += 4;
    doc.setDrawColor(190, 183, 159);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;

    for (const slot of MEAL_SLOTS) {
      const entry = dayPlan[slot.id];
      const mains = entry.mains.filter((main) => main.dish.trim());
      const alternatives = entry.alternatives.filter((alt) => alt.dish.trim());
      if (mains.length === 0 && alternatives.length === 0) continue;

      ensureSpace(24);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(38, 54, 34);
      doc.text(slot.label, margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(40, 40, 40);
      for (const main of mains) {
        const quantity = main.quantity.trim() ? ` — ${main.quantity.trim()}` : "";
        addWrappedText(`• ${main.dish.trim()}${quantity}`, margin + 4, contentWidth - 4, 5.2);
      }

      if (alternatives.length > 0) {
        y += 1;
        doc.setTextColor(120, 83, 35);
        for (const alt of alternatives) {
          const quantity = alt.quantity.trim() ? ` — ${alt.quantity.trim()}` : "";
          addWrappedText(`oppure ${alt.dish.trim()}${quantity}`, margin + 8, contentWidth - 8, 5.2);
        }
      }
      y += 4;
    }

    y += 4;
  }

  if (!hasContent) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("Nessun pasto inserito.", margin, y);
  }

  const fileName = "piano-alimentare.pdf";

  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const [{ Directory, Filesystem }, { Share }] = await Promise.all([
        import("@capacitor/filesystem"),
        import("@capacitor/share"),
      ]);
      const pdfData = doc.output("datauristring").split(",")[1];
      if (!pdfData) throw new Error("PDF non generato");

      const saved = await Filesystem.writeFile({
        path: fileName,
        data: pdfData,
        directory: Directory.Cache,
      });

      await Share.share({
        title: "Piano Alimentare",
        text: "PDF del piano alimentare settimanale",
        url: saved.uri,
        dialogTitle: "Salva o condividi il PDF",
      });
      return;
    }
  } catch (error) {
    console.warn("Esportazione PDF nativa non disponibile, uso download browser.", error);
  }

  doc.save(fileName);
}