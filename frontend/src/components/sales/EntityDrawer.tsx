import { useAuth } from "@/auth/AuthContext";
import { updateAccount, updateContact } from "@/services/salesService";
import { useEffect, useState } from "react";

import { entitySchemas } from "./schema/entitySchemas";

type Props = {
  open: boolean;
  mode: "view" | "edit";
  type: "contact" | "account" | "lead";
  data: any;
  onClose: () => void;
  onSave?: (data: any) => void;
};

export default function EntityDrawer({
  open,
  mode,
  type,
  data,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<any>({});
  const [editMode, setEditMode] = useState(mode === "edit");
  const isAccount = type === "account";
const isContact = type === "contact";

  const {auth}=useAuth();
  const slug=auth?.slug;
//  console.log("Drawer data:", data);
  // sync data when drawer opens
  // useEffect(() => {
  //   setForm(data || {});
  //   setEditMode(mode === "edit");
  // }, [data, open, mode]);
// console.log("PROP MODE:", mode);
// console.log("STATE EDITMODE:", editMode);
useEffect(() => {
   setEditMode(mode === "edit");
  if (!data) return;

  if (isAccount) {
    setForm({
      ...data,
      primaryContact: data.primaryContact || {},
      phone: data.primaryContact?.phone || {},
    });
  } else {
    setForm(data);
  }

 
}, [data, open, mode]);

  if(!slug){
    return null;
  }
  if (!open) return null;
const fullName = isAccount
  ? data?.accountName
  : data?.firstName && data?.lastName
    ? `${data.firstName} ${data.lastName}`
    : data?.name || "Unknown";
  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };
const handleSave = async () => {
  try {
    const payload = isAccount
      ? {
          ...form,
          primaryContact: {
            ...form.primaryContact,
            phone: form.primaryContact?.phone,
          },
        }
      : {
          ...form,
          phone: {
            number: form?.phone?.number,
          },
        };

    const api = isAccount
      ? updateAccount
      : updateContact;

    const res = await api(slug, form._id, payload);

  onSave?.(res.data.data); // 👈 ye
setForm(res.data.data);  // 👈 ye bhi
setEditMode(false);
    // console.log("API Response", res.data);
    setEditMode(false);
  } catch (err) {
    console.error(err);
  }
};
const getValue = (obj: any, path: string) => {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
};
const setValue = (obj: any, path: string, value: any) => {
  const keys = path.split(".");
  const newObj = { ...obj };

  let temp = newObj;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      temp[key] = value;
    } else {
      temp[key] = { ...temp[key] || {} };
      temp = temp[key];
    }
  });

  return newObj;
};
const title =
  type === "account"
    ? form?.accountName
    : `${form?.firstName || ""} ${form?.lastName || ""}`;
return (
  <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
    <div className="w-full max-w-2xl bg-base-100 h-full shadow-xl flex flex-col overflow-hidden">

      {/* HEADER */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>

          <p className="text-sm text-gray-500">
            {isAccount
              ? form?.industry
              : form?.company}
          </p>
        </div>

        <div className="flex gap-2 items-center">
          {!editMode && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setEditMode(true)}
            >
              Edit
            </button>
          )}

          <button
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="p-3 border-b flex gap-2">
        <button className="btn btn-sm btn-primary">
          Call
        </button>

        <button className="btn btn-sm btn-outline">
          Email
        </button>
      </div>

      {/* BODY */}
      <div className="p-4 overflow-auto flex-1">
        <div className="grid grid-cols-2 gap-4 text-sm">

          {entitySchemas[type]?.map((field: any) => (
            <FieldEdit
              key={field.key}
              label={field.label}
              value={getValue(form, field.key)}
              editable={editMode}
              onChange={(val: any) =>
                setForm((prev: any) =>
                  setValue(prev, field.key, val)
                )
              }
            />
          ))}

        </div>
      </div>

      {/* FOOTER */}
      {editMode && (
        <div className="p-3 border-t flex justify-end gap-2">
          <button
            className="btn btn-sm"
            onClick={() => {
              setForm(data);
              setEditMode(false);
            }}
          >
            Cancel
          </button>

          <button
            className="btn btn-sm btn-primary"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      )}

    </div>
  </div>
);
}
function FieldEdit({ label, value, editable, onChange }: any) {
  const isDate =
    label === "Created At" ||
    label === "Updated At";

  const displayValue =
    isDate && value
      ? new Date(value).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : value;
  return (
    <div className="bg-base-200 p-3 rounded-lg">
      <div className="text-xs text-gray-500">{label}</div>

      {editable ? (
        <input
          className="w-full bg-transparent outline-none font-medium"
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
        />
      ) : (
        <div className="font-medium break-words">
          {displayValue || "-"}
        </div>
      )}
    </div>
  );
}