type MemberPopulationSlice = {
  label: string;
  value: number;
  color: string;
};

type MemberPopulationPieChartProps = {
  individualCount: number;
  corporateCount: number;
};

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function describeSlice(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

export function MemberPopulationPieChart({
  individualCount,
  corporateCount,
}: MemberPopulationPieChartProps) {
  const slices: MemberPopulationSlice[] = [
    { label: "Corporate members", value: corporateCount, color: "#70103b" },
    { label: "Individual members", value: individualCount, color: "#64748b" },
  ];

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const size = 112;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 48;

  let angleCursor = 0;
  const paths =
    total === 0
      ? []
      : slices
          .filter((slice) => slice.value > 0)
          .map((slice) => {
            // Full circle: a single arc path collapses, so use a circle instead.
            if (slice.value === total) {
              return {
                ...slice,
                d: "",
                fullCircle: true as const,
              };
            }

            const sweep = (slice.value / total) * 360;
            const startAngle = angleCursor;
            const endAngle = angleCursor + sweep;
            angleCursor = endAngle;

            return {
              ...slice,
              d: describeSlice(cx, cy, radius, startAngle, endAngle),
              fullCircle: false as const,
            };
          });

  return (
    <div className="border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-[12px] font-semibold text-slate-900">
          Member Population
        </h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Individual vs corporate
        </p>
      </div>

      <div className="flex items-center gap-4 px-4 py-4">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="shrink-0"
          role="img"
          aria-label={`Member population: ${corporateCount} corporate, ${individualCount} individual`}
        >
          {total === 0 ? (
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          ) : (
            paths.map((slice) =>
              slice.fullCircle ? (
                <circle
                  key={slice.label}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill={slice.color}
                />
              ) : (
                <path key={slice.label} d={slice.d} fill={slice.color} />
              )
            )
          )}
        </svg>

        <ul className="min-w-0 space-y-1.5">
          {slices.map((slice) => {
            const pct =
              total === 0 ? 0 : Math.round((slice.value / total) * 1000) / 10;
            return (
              <li
                key={slice.label}
                className="flex items-center gap-2 text-[12px] text-slate-700"
              >
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="min-w-0 leading-snug">
                  {slice.label.replace(" members", "")}:{" "}
                  <span className="font-semibold text-slate-900">
                    {slice.value.toLocaleString()}
                  </span>
                  {total > 0 ? (
                    <span className="text-slate-500"> ({pct}%)</span>
                  ) : null}
                </span>
              </li>
            );
          })}
          <li className="pt-0.5 text-[12px] text-slate-500">
            Total:{" "}
            <span className="font-semibold text-slate-700">
              {total.toLocaleString()}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
