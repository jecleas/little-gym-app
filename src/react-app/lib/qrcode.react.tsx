import { CSSProperties } from "react";

type QRCodeSVGProps = {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  includeMargin?: boolean;
  style?: CSSProperties;
  className?: string;
};

/**
 * Lightweight stand-in for the `qrcode.react` package.
 * It renders an `<img>` that points to a remote QR rendering service so the
 * application can function without the external dependency.
 */
export const QRCodeSVG = ({ value, size = 160, className, style }: QRCodeSVGProps) => {
  const encoded = encodeURIComponent(value);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
  return <img src={src} width={size} height={size} alt="QR code" className={className} style={style} />;
};

export default QRCodeSVG;
