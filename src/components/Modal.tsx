export default function Modal({
  isOpen,
  title,
  body,
  confirmLabel,
  onConfirm,
  cancelLabel,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  body: string | React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel: string;
  onCancel: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md md:max-w-lg max-w-11/12">
        <p className="text-lg font-bold mb-2">{title}</p>
        <p>{body}</p>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="min-w-20 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="min-w-20 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
