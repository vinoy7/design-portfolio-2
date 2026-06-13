import Image from "next/image";
import heroPhoto from "@/assets/about-me/hero-vinoy-photo.png";

export default function Hero() {
  return (
    <div className="relative w-full" style={{ height: "510px" }}>
      {/* Text block */}
      <div
        className="absolute flex flex-col justify-between"
        style={{
          left: "0",
          top: "265px",
          width: "442px",
          height: "251px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-averia)",
            fontSize: "36px",
            lineHeight: "44px",
            letterSpacing: "-1.44px",
            color: "#000",
          }}
        >
          <p style={{ fontWeight: 300 }}>Hi!</p>
          <p>
            <span style={{ fontWeight: 300 }}>{"I'm "}</span>
            <span style={{ fontWeight: 700 }}>Vinoy Varghese</span>
          </p>
        </div>

        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "-0.16px",
            color: "#636363",
          }}
        >
          My passion for design and creativity has led me to work in various
          fields, from graphic design and branding to product design and user
          experience. I strive to push the boundaries of design and create
          meaningful experiences for the users.
        </p>
      </div>

      {/* Hero photo */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: "calc(50% + 10px)",
          top: "265px",
          width: "510px",
          height: "245px",
          // borderRadius: "12px",
        }}
      >
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "-65px",
            width: "669px",
            height: "375px",
            transform: "translateX(-50%)",
          }}
        >
          <Image
            src={heroPhoto}
            alt="Vinoy Varghese"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
