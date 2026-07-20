import type { MemberStatusPoint } from "../member-status-series";

type MemberStatusLineChartProps = {
  points: MemberStatusPoint[];
};

const WIDTH = 360;
const HEIGHT = 120;
const PAD = { top: 10, right: 10, bottom: 24, left: 32 };

function niceMax(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

function buildLine(
  points: MemberStatusPoint[],
  key: "active" | "cancelled",
  xAt: (index: number) => number,
  yAt: (value: number) => number
) {
  if (points.length === 0) return "";
  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${xAt(index)} ${yAt(point[key])}`;
    })
    .join(" ");
}

export function MemberStatusLineChart({ points }: MemberStatusLineChartProps) {
  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const maxValue = niceMax(
    Math.max(0, ...points.flatMap((point) => [point.active, point.cancelled]))
  );

  const xAt = (index: number) => {
    if (points.length <= 1) return PAD.left + plotWidth / 2;
    return PAD.left + (index / (points.length - 1)) * plotWidth;
  };
  const yAt = (value: number) =>
    PAD.top + plotHeight - (value / maxValue) * plotHeight;

  const activePath = buildLine(points, "active", xAt, yAt);
  const cancelledPath = buildLine(points, "cancelled", xAt, yAt);

  const yTicks = [0, 0.5, 1].map((fraction) => ({
    value: Math.round(maxValue * fraction),
    y: yAt(maxValue * fraction),
  }));

  const latest = points[points.length - 1];
  const labelStep =
    points.length <= 6 ? 1 : points.length <= 12 ? 2 : Math.ceil(points.length / 6);

  return (
    <div className="border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-[12px] font-semibold text-slate-900">
          Active vs Cancelled
        </h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Member status over the last 12 months
        </p>
      </div>

      <div className="px-4 py-4">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="mx-auto h-[120px] w-full max-w-md"
          role="img"
          aria-label={
            latest
              ? `Active ${latest.active}, cancelled ${latest.cancelled}`
              : "No member status history"
          }
        >
          {yTicks.map((tick) => (
            <g key={tick.value}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={tick.y}
                y2={tick.y}
                stroke="#e2e8f0"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={PAD.left - 6}
                y={tick.y + 3}
                textAnchor="end"
                className="fill-slate-400"
                style={{ fontSize: 9 }}
              >
                {tick.value}
              </text>
            </g>
          ))}

          {points.length > 0 ? (
            <>
              <path
                d={activePath}
                fill="none"
                stroke="#70103b"
                strokeWidth="1.25"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={cancelledPath}
                fill="none"
                stroke="#64748b"
                strokeWidth="1.25"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray="3 2.5"
                vectorEffect="non-scaling-stroke"
              />
              {points.map((point, index) => (
                <g key={point.month}>
                  <circle
                    cx={xAt(index)}
                    cy={yAt(point.active)}
                    r="1.75"
                    fill="#70103b"
                  />
                  <circle
                    cx={xAt(index)}
                    cy={yAt(point.cancelled)}
                    r="1.75"
                    fill="#64748b"
                  />
                  {index % labelStep === 0 || index === points.length - 1 ? (
                    <text
                      x={xAt(index)}
                      y={HEIGHT - 6}
                      textAnchor="middle"
                      className="fill-slate-400"
                      style={{ fontSize: 9 }}
                    >
                      {point.label}
                    </text>
                  ) : null}
                </g>
              ))}
            </>
          ) : (
            <text
              x={WIDTH / 2}
              y={HEIGHT / 2}
              textAnchor="middle"
              className="fill-slate-400"
              style={{ fontSize: 11 }}
            >
              No member data
            </text>
          )}
        </svg>

        <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <li className="flex items-center gap-1.5 text-[12px] text-slate-700">
            <span
              aria-hidden
              className="inline-block h-px w-3 bg-maroon"
            />
            Active
            {latest ? (
              <span className="font-semibold text-slate-900">
                {latest.active.toLocaleString()}
              </span>
            ) : null}
          </li>
          <li className="flex items-center gap-1.5 text-[12px] text-slate-700">
            <span
              aria-hidden
              className="inline-block h-px w-3 border-t border-dashed border-slate-500"
            />
            Cancelled
            {latest ? (
              <span className="font-semibold text-slate-900">
                {latest.cancelled.toLocaleString()}
              </span>
            ) : null}
          </li>
        </ul>
      </div>
    </div>
  );
}
