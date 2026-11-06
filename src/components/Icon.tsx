/* Линейные иконки услуг, рисуем сами — без внешних библиотек. */
const PATHS: Record<string, string> = {
  shirt: "M9 3 4 6l2 5 2-1v11h8V10l2 1 2-5-5-3c-.5 1.6-1.6 2.5-3 2.5S9.5 4.6 9 3Z",
  coat: "M9 3h6l1 3 3 2v13h-5v-6h-4v6H5V8l3-2 1-3Zm3 3v9",
  shoe: "M3 16v-5l4-1 3 3h4l6 2c1 .3 1 1 1 2v1H3Zm0 3h18",
  home: "M4 11 12 4l8 7v9h-5v-5H9v5H4v-9Z",
  leather: "M12 3c3 2 6 2 7 2 0 7-2 13-7 16C7 18 5 12 5 5c1 0 4 0 7-2Zm0 4v10",
  iron: "M4 17h16c0-5-3-9-8-9H8M4 17l2-5h6M4 20h16",
};

export function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="#cfe3ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
