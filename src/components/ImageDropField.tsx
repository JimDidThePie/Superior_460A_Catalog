import { Image, UploadCloud, X } from "lucide-react";
import { useId, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";

type ImageDropFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  placeholder?: string;
  className?: string;
};

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/svg+xml,image/gif";

const readFileAsDataUrl = (file: File, onChange: (value: string) => void) => {
  if (!file.type.startsWith("image/")) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => onChange(String(reader.result || ""));
  reader.readAsDataURL(file);
};

export function ImageDropField({
  label,
  value,
  onChange,
  description,
  placeholder = "https://example.com/image.jpg",
  className = "",
}: ImageDropFieldProps) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      readFileAsDataUrl(file, onChange);
    }

    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      readFileAsDataUrl(file, onChange);
    }
  };

  return (
    <div className={`media-drop-field ${className}`.trim()}>
      <span className="media-drop-label">{label}</span>
      {description ? <span>{description}</span> : null}
      <div
        className={`media-drop-zone ${dragging ? "is-dragging" : ""}`.trim()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          id={inputId}
          className="media-file-input"
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          onChange={handleFileInput}
        />
        <div className="media-drop-actions">
          <UploadCloud aria-hidden="true" />
          <span>Drop image or GIF here</span>
          <strong>Upload</strong>
        </div>
        {value ? (
          <div className="media-preview">
            <img src={value} alt="" />
          </div>
        ) : (
          <div className="media-preview is-empty">
            <Image aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="input-icon">
        <Image aria-hidden="true" />
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      </div>
      {value ? (
        <button type="button" className="media-clear-button" onClick={() => onChange("")}>
          <X aria-hidden="true" />
          Clear image
        </button>
      ) : null}
    </div>
  );
}
