export type Item = { type: "single" | "double"; src: string };

// Ordered by sequence number (reading order). Names encode {layout}-{seq}:
//   single = fills one page, double = spans a full spread.
export const ITEMS: Item[] = [
  { type: "single", src: "/assets/sketchbook/single-1.jpg" },
  { type: "single", src: "/assets/sketchbook/single-14.jpg" },
  { type: "double", src: "/assets/sketchbook/double-2.jpg" },
  { type: "double", src: "/assets/sketchbook/double-3.jpg" },
  { type: "single", src: "/assets/sketchbook/single-4.jpg" },
  { type: "single", src: "/assets/sketchbook/single-5.jpg" },
  { type: "single", src: "/assets/sketchbook/single-7.jpg" },
  { type: "single", src: "/assets/sketchbook/single-9.jpg" },
  { type: "single", src: "/assets/sketchbook/single-10.jpg" },
  { type: "single", src: "/assets/sketchbook/single-11.jpg" },
  { type: "single", src: "/assets/sketchbook/single-12.jpg" },
  { type: "single", src: "/assets/sketchbook/single-13.jpg" },
  { type: "double", src: "/assets/sketchbook/double-15.jpg" },
  { type: "single", src: "/assets/sketchbook/single-16.jpg" },
  { type: "single", src: "/assets/sketchbook/single-17.jpg" },
  { type: "double", src: "/assets/sketchbook/double-18.jpg" },
  { type: "single", src: "/assets/sketchbook/single-19.jpg" },
  { type: "single", src: "/assets/sketchbook/single-20.jpg" },
  { type: "single", src: "/assets/sketchbook/single-21.jpg" },
  { type: "single", src: "/assets/sketchbook/single-22.jpg" },
  { type: "double", src: "/assets/sketchbook/double-23.jpg" },
  { type: "single", src: "/assets/sketchbook/single-24.jpg" },
  { type: "single", src: "/assets/sketchbook/single-25.jpg" },
  { type: "single", src: "/assets/sketchbook/single-26.jpg" },
  { type: "single", src: "/assets/sketchbook/single-27.jpg" },
  { type: "double", src: "/assets/sketchbook/double-28.jpg" },
  { type: "single", src: "/assets/sketchbook/single-29.jpg" },
  { type: "single", src: "/assets/sketchbook/single-30.jpg" },
  { type: "single", src: "/assets/sketchbook/single-31.jpg" },
  { type: "single", src: "/assets/sketchbook/single-32.jpg" },
  { type: "single", src: "/assets/sketchbook/single-33.jpg" },
  { type: "single", src: "/assets/sketchbook/single-34.jpg" },
  { type: "single", src: "/assets/sketchbook/single-35.jpg" },
  { type: "single", src: "/assets/sketchbook/single-36.jpg" },
  { type: "single", src: "/assets/sketchbook/single-37.jpg" },
  { type: "single", src: "/assets/sketchbook/single-38.jpg" },
  { type: "single", src: "/assets/sketchbook/single-39.jpg" },
];

// A single physical page face.
export type Face =
  | { kind: "blank" }
  | { kind: "full"; src: string } // single photo, cover-cropped to the page
  | { kind: "half"; src: string; side: 0 | 1 }; // double photo half (0 left, 1 right)

// Lay items into page faces. First spread is intentionally blank (beige).
// Doubles always begin on a left page (align with a filler blank if needed).
export function buildFaces(): Face[] {
  const faces: Face[] = [{ kind: "blank" }, { kind: "blank" }];
  for (const it of ITEMS) {
    if (it.type === "single") {
      faces.push({ kind: "full", src: it.src });
    } else {
      if (faces.length % 2 === 1) faces.push({ kind: "blank" });
      faces.push({ kind: "half", src: it.src, side: 0 });
      faces.push({ kind: "half", src: it.src, side: 1 });
    }
  }
  if (faces.length % 2 === 1) faces.push({ kind: "blank" });
  return faces;
}

export const FACES = buildFaces();

