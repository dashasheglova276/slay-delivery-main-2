import { CSSProperties } from "react";

interface Props {
  emoji: string;
  bg: string;
  image?: string;
  className?: string;
  size?: number;
}

/** Картинка блюда/категории. Если задан image — показывается фото, иначе эмодзи на градиенте. */
export default function Thumb({ emoji, bg, image, className = "", size = 64 }: Props) {
  const style: CSSProperties = { background: bg };
  return (
    <div className={"thumb " + className} style={style}>
      {image ? (
        <img src={image} alt="" loading="lazy" />
      ) : (
        <span className="thumb-emoji" style={{ fontSize: size }}>
          {emoji}
        </span>
      )}
    </div>
  );
}
