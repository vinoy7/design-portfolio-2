"use client";

import Image from "next/image";
import { motion } from "motion/react";
import row01 from "@/assets/playground/row-01.png";
import row02 from "@/assets/playground/row-02.png";
import row03 from "@/assets/playground/row-03.png";
import row04 from "@/assets/playground/row-04.png";
import row05 from "@/assets/playground/row-05.png";
import row06 from "@/assets/playground/row-06.png";
import row07 from "@/assets/playground/row-07.png";
import row08 from "@/assets/playground/row-08.png";
import row09 from "@/assets/playground/row-09.png";
import row10 from "@/assets/playground/row-10.png";
import row11 from "@/assets/playground/row-11.png";
import row12 from "@/assets/playground/row-12.png";
import row13 from "@/assets/playground/row-13.png";

// Order matches Figma node 6386:141163 (top→bottom). row-13 = new Fusepay
// Settings/General mobile screens; Weekday table (row-08) now precedes the
// FuseCard-activation (row-06) and Approval (row-07) phone rows.
const rows = [row01, row02, row03, row04, row05, row08, row06, row07, row09, row13, row10, row11, row12];

const revealProps = (delay = 0) => ({
  initial: { opacity: 0, y: 56 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.05 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export default function PlaygroundContent() {
  return (
    <div className="flex flex-col" style={{ gap: "21px" }}>
      {rows.map((src, i) => (
        <motion.div key={i} {...revealProps(i === 0 ? 0 : 0.05)}>
          <Image
            src={src}
            alt={`Playground exploration ${i + 1}`}
            sizes="1041px"
            style={{ width: "100%", height: "auto", display: "block" }}
            priority={i < 2}
          />
        </motion.div>
      ))}
    </div>
  );
}
