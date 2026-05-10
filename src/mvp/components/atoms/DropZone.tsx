import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';

/**
 * Large dashed drop area used on Quick input, Documents, BTL bulk
 * import, and Connected Parties. The dashed border, hover/drag-over
 * tightening, and "Browse files" pill are all CSS — this component
 * just wires file-input semantics and drag events.
 */
export interface DropZoneProps {
  /** Headline ("Drop documents to upload"). */
  label?: string;
  /** Sub-line ("PDF, JPG, HEIC · up to 25 MB"). */
  sublabel?: string;
  /** "Browse files" button text. Defaults to "Browse files". */
  browseLabel?: string;
  /** Forwarded to the hidden `<input type="file" accept>`. */
  accept?: string;
  /** Multi-file (default `true`). */
  multiple?: boolean;
  /** Visual size hint. `compact` uses smaller padding for narrow rails. */
  size?: 'default' | 'compact';
  /** File handler. Receives the `File[]` whether dropped or browsed. */
  onFiles?: (files: File[]) => void;
  /** Optional icon override. */
  icon?: React.ReactNode;
  className?: string;
}

const UPLOAD_ICON = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export default function DropZone({
  label = 'Drop documents to upload',
  sublabel = 'PDF, JPG, HEIC · up to 25 MB',
  browseLabel = 'Browse files',
  accept,
  multiple = true,
  size = 'default',
  onFiles,
  icon,
  className,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const cls = [
    'drop-zone',
    size === 'compact' ? 'compact' : '',
    isDragOver ? 'is-dragover' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  function handleFiles(list: FileList | null) {
    if (!list || !onFiles) return;
    onFiles(Array.from(list));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer?.files ?? null);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    // Reset so re-uploading the same file fires the change event.
    e.target.value = '';
  }

  return (
    <div
      className={cls}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <div className="drop-zone-icon">{icon ?? UPLOAD_ICON}</div>
      <div className="drop-zone-label">{label}</div>
      <div className="drop-zone-sublabel">{sublabel}</div>
      <button
        type="button"
        className="drop-zone-browse"
        onClick={() => inputRef.current?.click()}
      >
        {browseLabel}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
