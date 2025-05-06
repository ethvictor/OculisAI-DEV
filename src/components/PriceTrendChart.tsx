import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PriceData {
  date: string;
  competitor1: number;
  competitor2: number;
  competitor3: number;
}

interface PriceTrendChartProps {
  data: PriceData[];
}

export const PriceTrendChart = ({ data }: PriceTrendChartProps) => {
  return (
    <div className="w-full h-[400px] p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Price Trends</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="competitor1"
            stroke="#1E40AF"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="competitor2"
            stroke="#60A5FA"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="competitor3"
            stroke="#93C5FD"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};