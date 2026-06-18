import Image from "next/image";
import ctaBg from "@/assets/about-me/cta-bg-texture.png";
import BookACallButton from "./BookACallButton";

export default function Footer({ showCta = true }: { showCta?: boolean }) {
  return (
    <div className="flex flex-col" style={{ gap: "105px" }}>
      {/* CTA section — hidden on About Me page */}
      {showCta && (
      <div
        className="relative overflow-hidden"
        style={{ background: "#000", height: "245px", /* clipPath: "inset(0 round 12px)" */ }}
      >
        {/* Background texture */}
        <div
          className="absolute"
          style={{
            left: 0,
            bottom: "-85px",
            width: "100%",
            height: "693px",
          }}
        >
          <Image
            src={ctaBg}
            alt=""
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: 0,
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            gap: "35px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-averia)",
              fontWeight: 400,
              fontSize: "32px",
              lineHeight: "40px",
              letterSpacing: "-0.64px",
              color: "#000",
              textAlign: "center",
            }}
          >
            <p>{"Let's get in touch"}</p>
            <p>and bring your idea to life</p>
          </div>

          <BookACallButton />
        </div>
      </div>
      )}

      {/* Footer bar */}
      <div className="flex items-center justify-between" style={{ paddingBottom: "40px" }}>
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 400,
            fontSize: "18px",
            lineHeight: "24px",
            color: "#000",
            whiteSpace: "nowrap",
          }}
        >
          © 2026 Vinoy Varghese.
        </p>

        <div className="flex items-center gap-5">
          {[
            { label: "Email", href: "mailto:vinoy.248@gmail.com", external: false },
            { label: "GitHub", href: "https://github.com/vinoy7", external: true },
            { label: "LinkedIn", href: "https://www.linkedin.com/in/vinoy777", external: true },
            { label: "Resume", href: "/Vinoy_Varghese_Resume.pdf", external: true },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group block font-normal hover:font-medium"
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "18px",
                lineHeight: "24px",
                color: "#000",
                textDecoration: "none",
                width: "72px",
                textAlign: "center",
              }}
            >
              <span className="relative inline-block after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:w-full after:origin-center after:scale-x-0 after:bg-black after:transition-transform after:duration-300 after:ease-out after:content-[''] group-hover:after:scale-x-100">
                {link.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
