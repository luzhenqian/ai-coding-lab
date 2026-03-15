type StatsCardProps = {
  label: string;
  value: number | string;
};

export function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="rounded-lg border p-6 dark:border-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
