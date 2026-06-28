import Link from "next/link";

type BadgeStatus = "Live" | "Beta" | "Coming Soon";

interface AppCardProps {
  icon: string;
  name: string;
  description: string;
  status: BadgeStatus;
  route: string;
}

const badgeStyle: Record<BadgeStatus, string> = {
  Live: "bg-emerald-100 text-emerald-700",
  Beta: "bg-amber-100 text-amber-700",
  "Coming Soon": "bg-gray-100 text-gray-500",
};

export default function AppCard({ icon, name, description, status, route }: AppCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <span className="text-4xl">{icon}</span>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeStyle[status]}`}>
          {status}
        </span>
      </div>
      <div className="flex-1">
        <h2
          className="text-xl font-bold text-slate-900 mb-1"
          style={{ fontFamily: "var(--font-fraunces, serif)" }}
        >
          {name}
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
      </div>
      <Link
        href={route}
        className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors duration-150"
      >
        Buka →
      </Link>
    </div>
  );
}
