"use client";

import { useState } from "react";
import { safeImage } from "@/lib/utils/image";

type Props = { images: string[]; alt: string };

export default function ProductGallery({ images, alt }: Props) {
  const safe = images.length ? images : [""];
  const [active, setActive] = useState(0);

  return (
    <div className="gallery">
      <div className="gallery__main">
        <img src={safeImage(safe[active])} alt={alt} />
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
              <img src={safeImage(img)} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
