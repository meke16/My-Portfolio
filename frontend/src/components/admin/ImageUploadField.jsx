import React from "react";
import { Trash2 } from "lucide-react";

import UploadToCpanelButton from "./UploadToCpanelButton";

export default function ImageUploadField({
  label,
  folder,
  value = "",
  onChange,
  values = [],
  onValuesChange,
  multiple = false,
  helperText = "",
  buttonLabel = "Upload",
}) {
  const hasValue = Boolean(value);

  const uploadButton = (
    <UploadToCpanelButton
      folder={folder}
      label={buttonLabel}
      onUploaded={(url) => {
        if (multiple) {
          onValuesChange?.([...values, url]);
          return;
        }
        onChange?.(url);
      }}
      onError={(error) => window.alert(error?.message || "Upload failed")}
    />
  );

  if (multiple) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <label className="block text-sm text-gray-400 mb-1">{label}</label>
            {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
          </div>
          {uploadButton}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {values.length > 0 ? (
            values.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-gray-800 bg-gray-950"
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onValuesChange?.(values.filter((_, i) => i !== index))}
                  className="absolute right-2 top-2 rounded-lg bg-black/70 p-2 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-gray-800 bg-gray-950/60 p-6 text-center text-sm text-gray-500">
              No images uploaded yet.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <label className="block text-sm text-gray-400 mb-1">{label}</label>
          {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
        </div>
        <div className="flex items-center gap-2">
          {hasValue && onChange && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm"
            >
              Remove
            </button>
          )}
          {uploadButton}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="w-32 h-32 rounded-xl border border-gray-800 bg-gray-950 overflow-hidden flex items-center justify-center">
          {hasValue ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-gray-500 text-center px-3">No image selected</span>
          )}
        </div>
      </div>
    </div>
  );
}