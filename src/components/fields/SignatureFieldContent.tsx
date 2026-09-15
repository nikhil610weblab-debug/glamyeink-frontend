import { PenLine } from 'lucide-react';
import type { AgreementField } from '../../types/document';

interface Props {
  field: AgreementField;
  onRequestSign: () => void;
}

export function SignatureFieldContent({ field, onRequestSign }: Props) {
  if (field.signature) {
    return (
      <div className="flex h-full w-full items-center justify-center p-0.5">
        <img
          src={field.signature.imageDataUrl}
          alt={`${field.label} preview`}
          className="max-h-full max-w-full object-contain"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onRequestSign();
      }}
      className="flex h-full w-full items-center justify-center gap-1.5 rounded-[3px] border border-dashed border-[var(--field-signature)] bg-[color-mix(in_srgb,var(--field-signature)_7%,white)] text-[var(--field-signature)] transition-colors hover:bg-[color-mix(in_srgb,var(--field-signature)_14%,white)]"
      style={{ fontSize: Math.max(10, field.style.fontSize - 1) }}
    >
      <PenLine size={13} />
      Click to sign
    </button>
  );
}
