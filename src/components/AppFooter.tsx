export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white px-4 py-3 text-center font-sans text-[12px] font-semibold text-slate-600">
      Promed Experience &copy; {year} - All Rights Reserved
    </footer>
  );
}
