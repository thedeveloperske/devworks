type ManageClaimsTabSkeletonProps = {
  title: string;
  description?: string;
};

export function ManageClaimsTabSkeleton({
  title,
  description = "This tab will be built next. Share the fields and rules when you are ready.",
}: ManageClaimsTabSkeletonProps) {
  return (
    <div className="border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
      <p className="text-[11px] font-medium text-slate-700">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-[11px] text-slate-500">
        {description}
      </p>
    </div>
  );
}
