import React, { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { uploadAssetFile } from "../../lib/uploadAsset";

export default function UploadToCpanelButton({
  folder,
  onUploaded,
  onError,
  className = "",
  label = "Upload",
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadAssetFile(file, { folder });
      onUploaded?.(url);
    } catch (error) {
      onError?.(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={openPicker}
        disabled={uploading}
        className={`inline-flex items-center gap-2.5 px-5 py-2.5 border-[2px] border-white bg-white text-black text-[10px] font-black uppercase tracking-widest hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all shadow-brutalist-white-sm active:shadow-none disabled:opacity-50 ${className}`}
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} /> : <Upload className="w-4 h-4" strokeWidth={3} />}
        {uploading ? "Transmitting..." : label}
      </button>
    </>
  );
}
