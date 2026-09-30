"use client";

import React, { useEffect, useId, useRef } from 'react';
import { X } from '@phosphor-icons/react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  // CSS width of the dialog on large screens, e.g. "56rem".
  width?: string;
  hideTitle?: boolean;
}

// A modal built on the native <dialog>, which handles focus trapping and Escape.
export function Dialog({ open, onClose, title, children, width, hideTitle }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Start at the title rather than on the close button.
      titleRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      style={width ? ({ '--modal-width': width } as React.CSSProperties) : undefined}
      onClose={onClose}
      onClick={(event) => {
        // A click on the dialog element itself is a click on the backdrop.
        if (event.target === ref.current) onClose();
      }}
    >
      <div className={open ? 'relative p-6 md:p-8' : 'hidden'}>
        <button type="button" onClick={onClose} className="icon-btn absolute right-3 top-3" aria-label="Close">
          <X size={20} aria-hidden="true" />
        </button>
        <h2
          id={titleId}
          ref={titleRef}
          tabIndex={-1}
          className={hideTitle ? 'sr-only' : 'mb-6 pr-10 text-2xl font-bold outline-none'}
        >
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel, danger, busy }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} width="26rem">
      <p className="text-muted">{message}</p>
      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
