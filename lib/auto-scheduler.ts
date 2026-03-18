export interface SlotAssignment {
  candidateId: number;
  panelIndex: number;
  slotIndex: number;
  timeMinutes: number; // minutes from 9:00
}

export function generatePanelSlots(
  candidateIds: number[],
  startHour: number = 9,
  startMinute: number = 0,
  slotDurationMinutes: number = 15
): { numPanels: number; assignments: SlotAssignment[] } {
  const n = candidateIds.length;
  let numPanels = 1;
  if (n <= 15) numPanels = 1;
  else if (n <= 30) numPanels = 2;
  else if (n <= 60) numPanels = 3;
  else numPanels = 4;

  const baseMinutes = startHour * 60 + startMinute;
  const assignments: SlotAssignment[] = [];
  const slotsPerPanel: number[][] = Array.from({ length: numPanels }, () => []);

  candidateIds.forEach((cid, idx) => {
    const panelIndex = idx % numPanels;
    slotsPerPanel[panelIndex].push(cid);
  });

  let slotIndex = 0;
  const maxSlots = Math.max(...slotsPerPanel.map((arr) => arr.length), 1);
  for (let s = 0; s < maxSlots; s++) {
    for (let p = 0; p < numPanels; p++) {
      const cid = slotsPerPanel[p][s];
      if (cid !== undefined) {
        const timeMinutes = baseMinutes + slotIndex * slotDurationMinutes;
        assignments.push({
          candidateId: cid,
          panelIndex: p,
          slotIndex: s,
          timeMinutes,
        });
      }
    }
    slotIndex++;
  }

  return { numPanels, assignments };
}

export function formatTimeFromMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}
