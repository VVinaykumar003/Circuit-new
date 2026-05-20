import { useRef } from "react";
import {Paperclip} from "lucide-react";
interface Props {
  files: File[];
  onChange: (files: File[]) => void;
}

export default function AttachmentInput({
  files,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    onChange([...files, ...Array.from(newFiles)]);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2 text-base-content">
      <div
        className=" border-dashed border-base-300 rounded-lg p-4 text-center cursor-pointer hover:bg-base-200 border-2"
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex justify-center">

        <Paperclip /> Attach files
        </div>
        <p className="text-xs text-base-content/60">
          Click to upload (multiple files supported)
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => addFiles(e.target.files)}
      />

      {files.length > 0 && (
        <ul className="space-y-1 text-sm">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex justify-between items-center bg-base-200 px-3 py-1 rounded"
            >
              <span className="truncate">{file.name}</span>
              <button
                className="text-error"
                onClick={() => removeFile(i)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
