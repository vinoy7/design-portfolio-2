"use client";

import Image from "next/image";
import { motion } from "motion/react";
import vinoyPortrait from "@/assets/about-me/vinoy-portrait.png";
import PageFlipBook from "./PageFlipBook";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-averia)",
        fontWeight: 400,
        fontSize: "36px",
        lineHeight: "44px",
        letterSpacing: "-0.72px",
        color: "#000",
      }}
    >
      {children}
    </p>
  );
}

function BodyText({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-dm-sans)",
        fontWeight: 400,
        fontSize: "19px",
        lineHeight: "28px",
        letterSpacing: "-0.19px",
        color: "#757575",
      }}
    >
      {children}
    </p>
  );
}


const revealProps = (delay = 0) => ({
  initial: { opacity: 0, y: 56 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.05 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export default function AboutMeContent() {
  return (
    <div className="flex flex-col">
      {/* Full-width portrait */}
      <motion.div
        {...revealProps(0)}
        className="relative overflow-hidden w-full"
        style={{ height: "699px", background: "#f2f2f2" }}
      >
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "-85px",
            width: "1052px",
            height: "1274px",
            transform: "translateX(-50%)",
          }}
        >
          <Image
            src={vinoyPortrait}
            alt="Vinoy Varghese"
            fill
            className="object-cover"
          />
        </div>
      </motion.div>

      {/* How design happened for me? — trails the portrait */}
      <motion.div
        {...revealProps(0.2)}
        className="flex flex-col gap-2"
        style={{ marginTop: "40px" }}
      >
        <SectionHeading>How design happened for me?</SectionHeading>

        <div className="flex flex-col gap-5">
          <BodyText>
            Before I got into design, I spent four years as a photographer. I
            was pretty good behind the camera... not so great at figuring out
            the &ldquo;business&rdquo; part of being a creative. Turns out
            invoices and client management weren&apos;t as exciting as chasing
            the perfect shot.
          </BodyText>
          <BodyText>
            My first real introduction to design happened during college when I
            took an Advertising Design course. That&apos;s where I learned the
            basics of logo design, ad campaigns, and creating marketing
            materials. After graduation, when I had to put photography on pause,
            design naturally became my next creative outlet.
          </BodyText>
          <BodyText>
            About a year later, I landed an internship at Haymarket SAC, the
            publishers of Autocar India. Things finally felt like they were
            taking off and then COVID happened. Like everyone else, my plans got
            completely derailed, especially my hopes of continuing in the film
            industry.
          </BodyText>
          <BodyText>So, I pivoted.</BodyText>
          <BodyText>
            During the pandemic, I moved deeper into branding design and picked
            up hands-on experience through a couple of internships. Even though
            I initially wanted to focus purely on branding, I kept finding
            myself pulled into creating marketing assets and solving broader
            communication problems.
          </BodyText>
          <BodyText>
            Then in 2021, I came across UX design and honestly, everything just
            clicked. I loved the idea of solving complex problems while still
            being creative.
          </BodyText>
        </div>
      </motion.div>

      {/* Beyond design... */}
      <motion.div
        {...revealProps(0)}
        className="flex flex-col gap-2"
        style={{ marginTop: "140px" }}
      >
        <SectionHeading>Beyond design...</SectionHeading>
        <div className="flex flex-col gap-5">
          <BodyText>
            Outside of design, you&apos;ll usually find me geeking out over
            sports and films. Even though I barely had time this past year to
            keep up with movies and shows, I still somehow managed to watch
            most of the films even if it took me a week to watch it ...
            priorities, I guess.
          </BodyText>
          <BodyText>
            One of the biggest perks of remote work has been the freedom to
            travel. Recently, I spent over two months on the road. It started
            with my company&apos;s offsite in Goa and Chennai, after which I
            took my first solo trip through Hyderabad and the coastal regions
            of Kerala.
          </BodyText>
          <BodyText>
            That journey turned out to be much more than just travel. I met people
            from all over the world, from the UK and Portugal to Singapore and
            Japan. One of the best parts was getting to show people around my
            hometown in Kerala while also learning about their cultures, stories,
            and perspectives. It made the whole experience feel a lot more
            personal and memorable than just checking places off a list. All of
            this while I was designing across 4 products at Fusepay.
          </BodyText>
        </div>
      </motion.div>

      {/* Sketchbook — WebGL page-flip of personal art/photography */}
      <motion.div {...revealProps(0)} style={{ marginTop: "200px" }}>
        <PageFlipBook />
      </motion.div>
    </div>
  );
}
