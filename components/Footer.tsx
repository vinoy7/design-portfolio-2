import Image from "next/image";
import ctaBg from "@/assets/about-me/cta-bg-texture.png";

export default function Footer() {
  return (
    <div className="flex flex-col" style={{ gap: "105px" }}>
      {/* CTA section */}
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

          <a
            href="mailto:vinoy@fusepay.app"
            style={{
              background: "#292929",
              borderRadius: "4px",
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              width: "144px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 500,
                fontSize: "20px",
                lineHeight: "32px",
                letterSpacing: "-0.4px",
                color: "#f5eee2",
              }}
            >
              Book a Call
            </span>
          </a>
        </div>
      </div>

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
          © 2026. All lefts reserved.
        </p>

        <div className="flex items-center gap-5">
          {["Email", "LinkedIn", "Resume"].map((link) => (
            <a
              key={link}
              href="#"
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 400,
                fontSize: "18px",
                lineHeight: "24px",
                color: "#000",
                textDecoration: "none",
                width: "72px",
                textAlign: "center",
                display: "block",
              }}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
