export default function EfficiencyTable({
  data = [],
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">

      <div className="border-b p-5">
        <h2 className="font-semibold">
          County Efficiency
        </h2>
      </div>

      <table className="w-full text-left text-sm">

        <thead className="bg-slate-50">
          <tr>
            <th className="p-4">County</th>
            <th className="p-4">Applications</th>
            <th className="p-4">Completed</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr
              key={item.county}
              className="border-t"
            >
              <td className="p-4">
                {item.county}
              </td>

              <td className="p-4">
                {item.applications}
              </td>

              <td className="p-4">
                {item.completed}
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}