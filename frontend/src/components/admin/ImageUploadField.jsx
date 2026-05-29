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
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{label}</label>
            {helperText && <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">{helperText}</p>}
          </div>
          {uploadButton}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {values.length > 0 ? (
            values.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="group relative aspect-square overflow-hidden border-[2px] border-white bg-[#0a0a0a] shadow-brutalist-white-sm"
              >
                <img src={url} alt="" className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-300" />
                <button
                  type="button"
                  onClick={() => onValuesChange?.(values.filter((_, i) => i !== index))}
                  className="absolute right-2 top-2 border-[1.5px] border-white bg-black/80 p-2 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity active:bg-red-600"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={3} />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full border-[2px] border-dashed border-white/20 bg-[#0a0a0a] p-8 text-center">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 italic">No assets detected.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{label}</label>
          {helperText && <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">{helperText}</p>}
        </div>
        <div className="flex items-center gap-4">
          {hasValue && onChange && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-4 py-2 border-[2px] border-white text-white/40 hover:text-red-500 hover:border-red-500 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Purge Asset
            </button>
          )}
          {uploadButton}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="w-40 h-40 border-[2.5px] border-white bg-[#0a0a0a] shadow-brutalist-white-sm overflow-hidden flex items-center justify-center">
          {hasValue ? (
            <img src={value} alt="" className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all" />
          ) : (
            <span className="text-[10px] font-black uppercase tracking-widest text-white/10 text-center px-4 italic leading-relaxed">No asset signature present.</span>
          )}
        </div>
      </div>
    </div>
  );
}