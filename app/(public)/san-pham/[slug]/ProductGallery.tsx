"use client";

import { useState } from "react";
import SafeImage from "@/components/SafeImage";

type Props = { images: string[]; alt: string };

export default function ProductGallery({ images, alt }: Props) {
  const safe = images.length ? images : [""];
  const [active, setActive] = useState(0);

  return (
    <div className="gallery">
      <div className="gallery__main">
        <SafeImage
          src={safe[active]}
          alt={alt}
          width={1280}
          height={800}
          priority
          fetchPriority="high"
          sizes="(max-width: 1024px) 100vw, 720px"
        />
      </div>
      {safe.length > 1 ? (
        <div className="gallery__thumbs">
          {safe.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`gallery__thumb ${i === active ? "is-active" : ""}`}
              aria-label={`Ảnh ${i + 1}`}
            >
              <SafeImage
                src={img}
                alt=""
                width={120}
                height={80}
                sizes="120px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
