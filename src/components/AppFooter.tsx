export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-site-footer fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white px-4 py-2 text-center font-sans text-[10px] font-normal text-slate-500">
      Promed Web Experience &copy; {year} - All Rights Reserved
    </footer>
  );
}
