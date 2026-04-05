export default function Header({
  title,
  actionMenu,
}: {
  title: string;
  actionMenu?: { label: string; href: string };
}) {
  return (
    <div className="p-4 flex justify-between items-center gap-x-4 bg-slate-800 text-white">
      <p className="uppercase text-white font-bold font-mono">{title}</p>
      {actionMenu && (
        <a
          href={actionMenu.href}
          className="px-4 py-2 text-xs uppercase font-bold bg-white text-slate-950 rounded hover:bg-gray-200"
        >
          {actionMenu.label}
        </a>
      )}
    </div>
  );
}
