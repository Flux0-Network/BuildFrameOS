import type { DiaryEntry, Project, Contact } from "./store";

async function loadLogoBase64(): Promise<string | null> {
  try {
    const res = await fetch("/buildframeOS-logo.png");
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Palette
const C = {
  dark:      [30, 41, 59]   as [number,number,number],  // slate-800
  amber:     [245, 158, 11] as [number,number,number],  // amber-500
  amberLight:[255, 251, 235] as [number,number,number], // amber-50
  amberMid:  [253, 230, 138] as [number,number,number], // amber-200
  white:     [255, 255, 255] as [number,number,number],
  bg:        [248, 250, 252] as [number,number,number], // slate-50
  rowAlt:    [241, 245, 249] as [number,number,number], // slate-100
  border:    [226, 232, 240] as [number,number,number], // slate-200
  text:      [15, 23, 42]   as [number,number,number],  // slate-900
  muted:     [100, 116, 139] as [number,number,number], // slate-500
};

function sectionLabel(doc: any, x: number, y: number, label: string) {
  // Amber accent bar
  doc.setFillColor(...C.amber);
  doc.rect(x, y - 3.5, 3, 5, "F");
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.text);
  doc.text(label.toUpperCase(), x + 5, y);
}

export async function generateBauberichtPDF(
  entry: DiaryEntry,
  project: Project,
  contacts: Contact[],
  chefName: string
): Promise<Blob> {
  const [{ default: jsPDF }, { default: autoTable }, logoBase64] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    loadLogoBase64(),
  ]);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - margin * 2;

  // ── Header background ──────────────────────────────────────
  const headerH = 46;
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, pageW, headerH, "F");

  // Amber top accent stripe
  doc.setFillColor(...C.amber);
  doc.rect(0, 0, pageW, 3, "F");

  // Logo
  const logoSize = 16;
  const logoY = 10;
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", margin, logoY, logoSize, logoSize);
  }

  // App name
  const textX = logoBase64 ? margin + logoSize + 4 : margin;
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text("BuildFrameOS", textX, logoY + 7);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.amber);
  doc.text("Bautagebuch", textX, logoY + 13);

  // "BAUBERICHT" badge on right
  const badgeW = 30;
  const badgeX = pageW - margin - badgeW;
  doc.setFillColor(...C.amber);
  doc.roundedRect(badgeX, logoY + 1, badgeW, 8, 1.5, 1.5, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.dark);
  doc.text("BAUBERICHT", badgeX + badgeW / 2, logoY + 6.2, { align: "center" });

  // Project name below
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text(project.name, margin, 36);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(formatDate(entry.date), margin, 42);

  // ── Meta info strip ────────────────────────────────────────
  doc.setFillColor(...C.rowAlt);
  doc.rect(0, headerH, pageW, 13, "F");

  const metaItems = [
    { label: "Auftraggeber", value: project.client ?? "—" },
    { label: "Adresse",      value: project.address ?? "—" },
    { label: "Ersteller",    value: chefName || "—" },
  ];

  const colW = contentW / metaItems.length;
  metaItems.forEach((item, i) => {
    const x = margin + i * colW;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.muted);
    doc.text(item.label.toUpperCase(), x, headerH + 5.5);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.text);
    const maxW = colW - 4;
    const val = doc.splitTextToSize(item.value, maxW)[0] ?? item.value;
    doc.text(val, x, headerH + 11);
  });

  let y = headerH + 20;

  // ── Helper: text card ──────────────────────────────────────
  function textCard(label: string, content: string) {
    sectionLabel(doc, margin, y, label);
    y += 5;
    const lines: string[] = doc.splitTextToSize(content, contentW - 8);
    const boxH = lines.length * 4.8 + 10;
    doc.setFillColor(...C.bg);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentW, boxH, 2, 2, "FD");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.text);
    doc.text(lines, margin + 5, y + 7);
    y += boxH + 8;
  }

  // ── Witterung ──────────────────────────────────────────────
  if (entry.weather || entry.temperature != null || entry.workers != null) {
    sectionLabel(doc, margin, y, "Witterung");
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Wetter", "Temperatur", "Arbeiter"]],
      body: [[
        entry.weather ?? "—",
        entry.temperature != null ? `${entry.temperature} °C` : "—",
        entry.workers != null ? `${entry.workers} Personen` : "—",
      ]],
      theme: "plain",
      styles: { fontSize: 9, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 }, textColor: C.text },
      headStyles: {
        fillColor: C.dark, textColor: C.white, fontStyle: "bold", fontSize: 8,
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      },
      alternateRowStyles: { fillColor: C.bg },
      tableLineColor: C.border,
      tableLineWidth: 0.25,
    });
    y = (doc as any).lastAutoTable.finalY + 9;
  }

  // ── Anwesende ──────────────────────────────────────────────
  if (entry.attendees && entry.attendees.length > 0) {
    sectionLabel(doc, margin, y, "Anwesende Firmen");
    y += 4;

    const rows = entry.attendees.map((a) => {
      const contact = contacts.find((c) => c.id === a.contactId);
      const name = a.firmName || contact?.company || contact?.name || "—";
      return [name, String(a.personCount), a.activity, a.notes ?? "—"];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Firma / Person", "Pers.", "Tätigkeit", "Notiz"]],
      body: rows,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 }, textColor: C.text },
      headStyles: {
        fillColor: C.dark, textColor: C.white, fontStyle: "bold", fontSize: 8,
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      },
      alternateRowStyles: { fillColor: C.bg },
      columnStyles: {
        0: { cellWidth: 48 },
        1: { cellWidth: 14, halign: "center" },
        2: { cellWidth: "auto" },
        3: { cellWidth: 38 },
      },
      tableLineColor: C.border,
      tableLineWidth: 0.25,
    });
    y = (doc as any).lastAutoTable.finalY + 9;
  }

  // ── Tätigkeiten ────────────────────────────────────────────
  if (entry.activities) {
    textCard("Tätigkeiten", entry.activities);
  }

  // ── Notizen ────────────────────────────────────────────────
  if (entry.notes) {
    textCard("Notizen", entry.notes);
  }

  // ── Chef-Hinweis ───────────────────────────────────────────
  if (entry.chefNotes) {
    sectionLabel(doc, margin, y, "Chef-Hinweis");
    y += 5;

    const chefLines: string[] = doc.splitTextToSize(entry.chefNotes, contentW - 14);
    const boxH = chefLines.length * 4.8 + 12;

    // Amber background card
    doc.setFillColor(...C.amberLight);
    doc.setDrawColor(...C.amberMid);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentW, boxH, 2, 2, "FD");

    // Left amber accent border
    doc.setFillColor(...C.amber);
    doc.rect(margin, y, 3.5, boxH, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 53, 15); // amber-900
    doc.text(chefLines, margin + 8, y + 8);
    y += boxH + 8;
  }

  // ── Footer ─────────────────────────────────────────────────
  // Amber bottom stripe
  doc.setFillColor(...C.amber);
  doc.rect(0, pageH - 10, pageW, 10, "F");

  // Logo in footer
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", margin, pageH - 8.5, 6, 6);
  }

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.dark);
  doc.text(
    "BuildFrameOS",
    logoBase64 ? margin + 8 : margin,
    pageH - 4.5
  );

  doc.setFont("helvetica", "normal");
  doc.text(
    `Generiert am ${new Date().toLocaleDateString("de-DE")}`,
    pageW / 2,
    pageH - 4.5,
    { align: "center" }
  );

  doc.text(
    project.name,
    pageW - margin,
    pageH - 4.5,
    { align: "right" }
  );

  return doc.output("blob");
}

export async function sharePDF(
  blob: Blob,
  filename: string,
  chefEmail?: string
): Promise<void> {
  const file = new File([blob], filename, { type: "application/pdf" });

  if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: filename });
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  if (chefEmail) {
    const subject = encodeURIComponent(filename.replace(".pdf", ""));
    const body = encodeURIComponent(
      `Hallo,\n\nanbei findest du den ${filename.replace(".pdf", "")}.\n\nMit freundlichen Grüßen`
    );
    setTimeout(() => {
      window.open(`mailto:${chefEmail}?subject=${subject}&body=${body}`);
    }, 500);
  }
}
