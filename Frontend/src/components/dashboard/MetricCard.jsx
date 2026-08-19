export default function MetricCard({
  title,
  value,
  change,
  changeType= 'neutral',
  icon: Icon,
  suffix= ""
}) {
  const changeColors= {
    increase: 'text-green-500',
    decrease: 'text-red-500',
    neutral: 'text-amber-500'
  }
}
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