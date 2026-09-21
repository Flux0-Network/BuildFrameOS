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
  const margin = 15;
  let y = 15;

  // Header bar
  doc.setFillColor(30, 30, 30);
  doc.rect(0, 0, pageW, 12, "F");
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text("Erstellt mit BuildFrameOS", pageW / 2, 7.5, { align: "center" });

  y = 22;

  // Logo + App name side by side
  const logoSize = 14;
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", margin, y - 10, logoSize, logoSize);
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.text("BuildFrameOS", margin + logoSize + 3, y - 2);
  } else {
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.text("BuildFrameOS", margin, y);
  }
  y += 8;

  // Project name
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(project.name, margin, y);
  y += 6;

  // Report title
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Baubericht · ${formatDate(entry.date)}`, margin, y);
  y += 8;

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // Project info table
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text("Projektdaten", margin, y);
  y += 3;

  const infoRows: string[][] = [
    ["Projekt", project.name],
    ["Adresse", project.address ?? "—"],
    ["Auftraggeber", project.client ?? "—"],
    ["Status", project.status],
    ["Datum", formatDate(entry.date)],
    ["Ersteller", chefName || "—"],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    body: infoRows,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 38, fillColor: [245, 245, 245] },
      1: { cellWidth: "auto" },
    },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.2,
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Weather section
  if (entry.weather || entry.temperature != null || entry.workers != null) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text("Witterung", margin, y);
    y += 3;

    const weatherRow: string[] = [
      entry.weather ?? "—",
      entry.temperature != null ? `${entry.temperature} °C` : "—",
      entry.workers != null ? String(entry.workers) : "—",
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Wetter", "Temperatur", "Arbeiter"]],
      body: [weatherRow],
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [50, 50, 50], textColor: 255, fontStyle: "bold" },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.2,
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Attendees section
  if (entry.attendees && entry.attendees.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text("Anwesende", margin, y);
    y += 3;

    const attendeeRows = entry.attendees.map((a) => {
      const contact = contacts.find((c) => c.id === a.contactId);
      const displayName = a.firmName || contact?.company || contact?.name || "—";
      return [displayName, String(a.personCount), a.activity, a.notes ?? ""];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Firma / Person", "Personen", "Tätigkeit", "Notiz"]],
      body: attendeeRows,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [50, 50, 50], textColor: 255, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: "auto" },
        3: { cellWidth: 35 },
      },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.2,
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Activities
  if (entry.activities) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text("Tätigkeiten", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(entry.activities, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 6;
  }

  // Notes
  if (entry.notes) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text("Notizen", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(entry.notes, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 6;
  }

  // Chef notes
  if (entry.chefNotes) {
    doc.setFillColor(255, 252, 235);
    const chefLines = doc.splitTextToSize(entry.chefNotes, pageW - margin * 2 - 8);
    const boxH = chefLines.length * 4.5 + 14;
    doc.roundedRect(margin, y, pageW - margin * 2, boxH, 2, 2, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 80, 0);
    doc.text("Chef-Hinweis", margin + 4, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 55, 0);
    doc.text(chefLines, margin + 4, y + 12);
  }

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(
    `Generiert am ${new Date().toLocaleDateString("de-DE")} · BuildFrameOS`,
    pageW / 2,
    pageH - 6,
    { align: "center" }
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

  // Fallback: download + open mailto
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  if (chefEmail) {
    const subject = encodeURIComponent(filename.replace(".pdf", ""));
    const body = encodeURIComponent(
      `Hallo,\n\nerbei findest du den ${filename.replace(".pdf", "")}.\n\nMit freundlichen Grüßen`
    );
    setTimeout(() => {
      window.open(`mailto:${chefEmail}?subject=${subject}&body=${body}`);
    }, 500);
  }
}
