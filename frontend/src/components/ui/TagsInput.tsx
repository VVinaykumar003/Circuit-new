import { useState } from "react";
import type { Tag } from "../../type/tag";
import TagPill from "./TagPill";

const COLORS: Tag["color"][] = [
  "blue",
  "green",
  "yellow",
  "red",
  "purple",
];

interface Props {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  disabled?: boolean;
}

export default function TagsInput({
  value,
  onChange,
  disabled = false,
}: Props) {
  const [input, setInput] = useState("");

  const addTag = () => {
    if (!input.trim()) return;

    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        label: input,
        color:
          COLORS[Math.floor(Math.random() * COLORS.length)],
      },
    ]);

    setInput("");
  };

  const removeTag = (id: string) => {
    onChange(value.filter((t) => t.id !== id));
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 px-2 py-1.5 
      rounded-lg border border-base-300 focus:outline-none
         focus-within:ring-2 focus-within:ring-primary/40 bg-base-100 text-base-content 
      ${disabled ? "opacity-50" : ""}`}
    >
      {/* Existing tags */}
      {value.map((tag) => (
        <TagPill
          key={tag.id}
          tag={tag}
          onRemove={!disabled ? removeTag : undefined}
        />
      ))}

      {/* Input */}
      {!disabled && (
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={() => {
  if (input.trim()) addTag();
}}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Add tag"
          className="flex-1 min-w-20 bg-transparent outline-none 
          text-sm text-base-content 
            
          placeholder:text-base-content/70"
        />
      )}
    </div>
  );
}
