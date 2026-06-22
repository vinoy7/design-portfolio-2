"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import vinoyPortrait from "@/assets/about-me/vinoy-portrait.png";
import MobilePhotoStack from "./MobilePhotoStack";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const reveal = (delay = 0, reduce = false) => ({
  initial:     reduce ? { opacity: 0 } : { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, amount: 0.05 },
  transition:  { duration: 0.85, delay, ease: EASE },
});

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily:    "var(--font-averia)",
      fontWeight:    400,
      fontSize:      "28px",
      lineHeight:    "36px",
      letterSpacing: "-0.56px",
      color:         "#000",
    }}>
      {children}
    </p>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily:    "var(--font-dm-sans)",
      fontWeight:    400,
      fontSize:      "16px",
      lineHeight:    "24px",
      letterSpacing: "-0.16px",
      color:         "#757575",
    }}>
      {children}
    </p>
  );
}

export default function MobileAboutContent() {
  const reduce = useReducedMotion() ?? false;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Portrait */}
      <motion.div
        {...reveal(0, reduce)}
        style={{ position: "relative", width: "100%", height: "440px", borderRadius: "8px", overflow: "hidden", background: "#f2f2f2" }}
      >
        <Image src={vinoyPortrait} alt="Vinoy Varghese" fill className="object-cover" style={{ objectPosition: "center top" }} sizes="(max-width:768px) 100vw, 343px" />
      </motion.div>

      {/* How design happened for me? */}
      <motion.div {...reveal(0.1, reduce)} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "40px" }}>
        <Heading>How design happened for me?</Heading>
        <Body>
          Before I got into design, I spent four years as a photographer. I was
          pretty good behind the camera... not so great at figuring out the
          &ldquo;business&rdquo; part of being a creative. Turns out invoices and
          client management weren&apos;t as exciting as chasing the perfect shot.
        </Body>
        <Body>
          My first real introduction to design happened during college when I
          took an Advertising Design course. That&apos;s where I learned the
          basics of logo design, ad campaigns, and creating marketing materials.
          After graduation, when I had to put photography on pause, design
          naturally became my next creative outlet.
        </Body>
        <Body>
          About a year later, I landed an internship at Haymarket SAC, the
          publishers of Autocar India. Things finally felt like they were taking
          off and then COVID happened. Like everyone else, my plans got
          completely derailed, especially my hopes of continuing in the film
          industry.
        </Body>
        <Body>So, I pivoted.</Body>
        <Body>
          During the pandemic, I moved deeper into branding design and picked up
          hands-on experience through a couple of internships. Even though I
          initially wanted to focus purely on branding, I kept finding myself
          pulled into creating marketing assets and solving broader communication
          problems.
        </Body>
        <Body>
          Then in 2021, I came across UX design and honestly, everything just
          clicked. I loved the idea of solving complex problems while still being
          creative.
        </Body>
      </motion.div>

      {/* Beyond design... */}
      <motion.div {...reveal(0, reduce)} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "64px" }}>
        <Heading>Beyond design...</Heading>
        <Body>
          Outside of design, you&apos;ll usually find me geeking out over sports
          and films. Even though I barely had time this past year to keep up with
          movies and shows, I still somehow managed to watch most of the films
          even if it took me a week to watch it ... priorities, I guess.
        </Body>
        <Body>
          One of the biggest perks of remote work has been the freedom to travel.
          Recently, I spent over two months on the road. It started with my
          company&apos;s offsite in Goa and Chennai, after which I took my first
          solo trip through Hyderabad and the coastal regions of Kerala.
        </Body>
        <Body>
          That journey turned out to be much more than just travel. I met people
          from all over the world, from the UK and Portugal to Singapore and
          Japan. One of the best parts was getting to show people around my
          hometown in Kerala while also learning about their cultures, stories,
          and perspectives. It made the whole experience feel a lot more personal
          and memorable than just checking places off a list. All of this while I
          was designing across 4 products at Fusepay.
        </Body>
      </motion.div>

      {/* Swipeable photo stack */}
      <motion.div {...reveal(0, reduce)} style={{ marginTop: "80px" }}>
        <MobilePhotoStack />
      </motion.div>
    </div>
  );
}
