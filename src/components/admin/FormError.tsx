type FormErrorProps = {
  message: string;
  className?: string;
};

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;
  return (
    <div className={className ?? "border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700"}>
      {message}
    </div>
  );
}
