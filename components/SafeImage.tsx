import Image, { type ImageProps } from "next/image";
import { BLUR_DATA_URL, isOptimizable, safeImage } from "@/lib/utils/image";

type Props = Omit<ImageProps, "src" | "alt"> & {
  src: string | null | undefined;
  alt: string;
};

/**
 * Wrapper around next/image that:
 *  - Falls back to placeholder SVG when src is empty/invalid
 *  - Disables optimization automatically for data: URLs
 *  - Provides a soft blur-up placeholder by default
 *
 * Use `priority` for above-the-fold images (Hero), default lazy otherwise.
 */
export default function SafeImage({
  src,
  alt,
  placeholder,
  blurDataURL,
  ...rest
}: Props) {
  const finalSrc = safeImage(src);
  const optimizable = isOptimizable(finalSrc);

  return (
    <Image
      {...rest}
      src={finalSrc}
      alt={alt}
      unoptimized={!optimizable}
      placeholder={placeholder ?? (optimizable ? "blur" : "empty")}
      blurDataURL={blurDataURL ?? (optimizable ? BLUR_DATA_URL : undefined)}
    />
  );
}
