import { useEffect, useState } from "react";
import {
  MdClose,
  MdDelete,
  MdAttachFile,
  MdOpenInNew,
  MdPictureAsPdf,
  MdInsertDriveFile,
  MdImage,
} from "react-icons/md";
import type { LeaveRequest } from "@/type/leave";
import Button from "@/components/ui/Button";

interface Props {
  leave: LeaveRequest | null;
  onClose: () => void;
  onUpdate?: (leave: LeaveRequest) => void;
  mode?: "edit" | "view";
}

/* ================= ATTACHMENT HELPERS ================= */

const getAttachmentUrl = (item: any): string => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (item instanceof File) return URL.createObjectURL(item);
  if (typeof item === "object") {
    return item.url || item.secure_url || item.fileUrl || item.path || "";
  }
  return "";
};

const getAttachmentName = (item: any, index: number): string => {
  if (item instanceof File && item.name) return item.name;
  if (typeof item === "object" && item.name) return item.name;
  const url = getAttachmentUrl(item);
  if (url) {
    try {
      const cleanUrl = url.split("?")[0];
      const parts = cleanUrl.split("/");
      const lastPart = parts[parts.length - 1];
      if (lastPart && lastPart.length > 0 && !lastPart.startsWith("v1")) {
        return decodeURIComponent(lastPart);
      }
    } catch {
      // fallback
    }
  }
  return `Attachment ${index + 1}`;
};

const isImageFile = (item: any, url: string): boolean => {
  if (item instanceof File && item.type?.startsWith("image/")) return true;
  if (typeof item === "object" && item.type?.startsWith?.("image/")) return true;
  if (typeof url === "string") {
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(url)) return true;
    if (url.includes("/image/upload/")) return true;
  }
  return false;
};

const isPdfFile = (item: any, url: string): boolean => {
  if (item instanceof File && item.type === "application/pdf") return true;
  if (typeof item === "object" && item.type === "application/pdf") return true;
  if (typeof url === "string") {
    if (/\.pdf(\?.*)?$/i.test(url)) return true;
  }
  return false;
};

export default function LeaveDrawer({
  leave,
  onClose,
  onUpdate,
  mode = "view",
}: Props) {
  const [edited, setEdited] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    if (leave) {
      let rawAtts = leave.attachments || (leave as any).attachment || [];
      if (typeof rawAtts === "string") {
        try {
          rawAtts = JSON.parse(rawAtts);
        } catch {
          rawAtts = [rawAtts];
        }
      }
      const attsArray = Array.isArray(rawAtts) ? rawAtts : [rawAtts].filter(Boolean);

      setEdited({
        ...leave,
        attachments: attsArray,
      });
    }
  }, [leave]);

  if (!leave || !edited) return null;

  /* ================= ADD ATTACHMENT ================= */
  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);

    setEdited((prev: any) => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles],
    }));
  };

  /* ================= REMOVE FILE ================= */
  const removeFile = (index: number) => {
    setEdited((prev: any) => ({
      ...prev,
      attachments: prev.attachments.filter((_: any, i: number) => i !== index),
    }));
  };

  /* ================= REUSABLE FIELD ================= */
  const Field = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange?: (val: string) => void;
  }) => (
    <div className="space-y-1">
      <p className="text-xs text-base-content/60">{label}</p>

      {mode === "view" ? (
        <div className="bg-base-200 px-3 py-2 rounded-md text-sm">
          {value || "-"}
        </div>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="input input-bordered w-full"
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 ">
      <div className="w-full max-w-md bg-base-100 h-full shadow-xl flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-base-300 sticky top-0 bg-base-100 z-10">
          <h3 className="text-lg font-semibold">
            {mode === "view" ? "Leave Details" : "Edit Leave"}
          </h3>

          <button onClick={onClose} className="btn btn-sm btn-ghost">
            <MdClose size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <Field
            label="Type"
            value={edited.type}
            onChange={(val) =>
              setEdited({ ...edited, type: val })
            }
          />

          <Field
            label="From Date"
            value={edited.fromDate}
            onChange={(val) =>
              setEdited({ ...edited, fromDate: val })
            }
          />

          <Field
            label="To Date"
            value={edited.toDate}
            onChange={(val) =>
              setEdited({ ...edited, toDate: val })
            }
          />

          {/* REASON */}
          <div className="space-y-1">
            <p className="text-xs text-base-content/60">Reason</p>

            {mode === "view" ? (
              <div className="bg-base-200 px-3 py-2 rounded-md text-sm whitespace-pre-wrap">
                {edited.reason || "-"}
              </div>
            ) : (
              <textarea
                value={edited.reason}
                onChange={(e) =>
                  setEdited({ ...edited, reason: e.target.value })
                }
                className="textarea textarea-bordered w-full text-sm leading-relaxed"
                rows={3}
              />
            )}
          </div>

          {/* ================= ATTACHMENTS SECTION ================= */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-base-200 pb-2">
              <div className="flex items-center gap-2">
                <MdAttachFile size={18} className="text-primary" />
                <p className="text-sm font-semibold text-base-content">
                  Attachments
                </p>
                {edited.attachments?.length > 0 && (
                  <span className="badge badge-sm badge-primary badge-outline font-bold">
                    {edited.attachments.length}
                  </span>
                )}
              </div>
            </div>

            {edited.attachments && edited.attachments.length > 0 ? (
              <div className="space-y-3">
                {edited.attachments.map((file: any, index: number) => {
                  const fileUrl = getAttachmentUrl(file);
                  const fileName = getAttachmentName(file, index);
                  const isImg = isImageFile(file, fileUrl);
                  const isPdf = isPdfFile(file, fileUrl);

                  return (
                    <div
                      key={index}
                      className="group border border-base-300 rounded-xl p-3 bg-base-100 hover:border-primary/50 transition-all shadow-sm flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* THUMBNAIL / ICON */}
                          {isImg && fileUrl ? (
                            <div
                              onClick={() => setPreviewImage({ url: fileUrl, name: fileName })}
                              className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-base-300 cursor-pointer group-hover:ring-2 ring-primary/40 transition"
                            >
                              <img
                                src={fileUrl}
                                alt={fileName}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <MdImage className="text-white" size={18} />
                              </div>
                            </div>
                          ) : isPdf ? (
                            <div className="w-12 h-12 rounded-lg bg-error/10 text-error flex items-center justify-center shrink-0 border border-error/20">
                              <MdPictureAsPdf size={24} />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                              <MdInsertDriveFile size={24} />
                            </div>
                          )}

                          {/* NAME & TYPE */}
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-sm font-medium text-base-content truncate"
                              title={fileName}
                            >
                              {fileName}
                            </p>
                            <p className="text-[11px] text-base-content/50 uppercase tracking-wider mt-0.5">
                              {isImg ? "Image" : isPdf ? "PDF Document" : "Attachment"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {fileUrl && (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs btn-outline btn-primary gap-1"
                              title="Open attachment in new tab"
                            >
                              <MdOpenInNew size={14} />
                              Open
                            </a>
                          )}

                          {mode === "edit" && (
                            <button
                              onClick={() => removeFile(index)}
                              className="btn btn-xs btn-ghost text-error hover:bg-error/10"
                              title="Remove file"
                            >
                              <MdDelete size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* INLINE IMAGE PREVIEW */}
                      {isImg && fileUrl && (
                        <div
                          onClick={() => setPreviewImage({ url: fileUrl, name: fileName })}
                          className="mt-1 relative rounded-lg overflow-hidden border border-base-200 cursor-pointer group/img"
                        >
                          <img
                            src={fileUrl}
                            alt={fileName}
                            className="w-full max-h-48 object-cover rounded-lg hover:scale-[1.02] transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1 transition">
                            <MdOpenInNew size={16} /> Click to view full image
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 px-4 border border-dashed border-base-300 rounded-xl bg-base-200/50">
                <MdAttachFile className="mx-auto text-base-content/30 mb-1" size={24} />
                <p className="text-xs text-base-content/60 font-medium">
                  No attachments uploaded for this leave request
                </p>
              </div>
            )}

            {/* UPLOAD INPUT IN EDIT MODE */}
            {mode === "edit" && (
              <div className="pt-2">
                <label className="text-xs font-medium text-base-content/60 block mb-1">
                  Upload Additional Files
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleAddFiles}
                  className="file-input file-input-bordered file-input-sm w-full text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        {mode === "edit" && (
          <div className="p-4 border-t border-base-300 bg-base-100 sticky bottom-0">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                onUpdate?.(edited);
                onClose();
              }}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL FOR FULL IMAGE PREVIEW */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-base-100 rounded-2xl overflow-hidden shadow-2xl p-2 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center px-4 py-2 border-b border-base-200">
              <span className="text-sm font-semibold truncate max-w-[80%]">
                {previewImage.name}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-xs btn-outline btn-primary gap-1"
                >
                  <MdOpenInNew size={14} /> Full View
                </a>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="btn btn-xs btn-ghost btn-circle"
                >
                  <MdClose size={18} />
                </button>
              </div>
            </div>
            <div className="p-2 overflow-auto max-h-[80vh] flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}