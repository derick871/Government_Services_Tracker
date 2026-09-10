export default function MetricCard({
  title,
  value,
 
}) 
{
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-bold text-slate-800">
        {value}{}
      </h3>

    </div>
  );
}