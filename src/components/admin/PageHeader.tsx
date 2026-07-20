type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-[12px] font-bold uppercase tracking-wide text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-[12px] text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
