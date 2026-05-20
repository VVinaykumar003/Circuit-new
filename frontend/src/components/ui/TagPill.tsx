import type { Tag } from "../../type/tag";

interface Props {
  tag: Tag;
  onRemove?: (id: string) => void;
}

const tagColorClasses: Record<
  Tag["color"],
  string
> = {
  blue: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  green: "bg-green-500/15 text-green-600 border-green-500/30",
  yellow: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
  red: "bg-red-500/15 text-red-600 border-red-500/30",
  purple: "bg-purple-500/15 text-purple-600 border-purple-500/30",
};


export default function TagPill({ tag, onRemove }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full 
      text-xs border ${tagColorClasses[tag.color]}`}
    >
      {tag.label}

      {onRemove && (
        <button
          onClick={() => onRemove(tag.id)}
          className="ml-1 text-xs opacity-60 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </span>
  );
}
