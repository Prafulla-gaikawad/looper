import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const COLORS = ["#1abc5b", "#fbbf24"];

export default function AnalyticsPage() {
  const { user } = useOutletContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:3000/api/transactions");
        const data = await res.json();
        if (res.ok) {
          setTransactions(data.filter((t) => t.user_id === user?.user_id));
        } else {
          setError("Failed to fetch transactions");
        }
      } catch (err) {
        setError("Network error");
      }
      setLoading(false);
    }
    if (user?.user_id) fetchTransactions();
  }, [user]);

  // Pie chart data: Revenue vs Expenses
  const pieData = useMemo(() => {
    let revenue = 0,
      expenses = 0;
    transactions.forEach((t) => {
      if (t.category.toLowerCase() === "revenue") revenue += t.amount;
      if (t.category.toLowerCase() === "expense") expenses += t.amount;
    });
    return [
      { name: "Revenue", value: revenue },
      { name: "Expenses", value: expenses },
    ];
  }, [transactions]);

  // Bar chart data: Monthly totals
  const barData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("default", { month: "short" }),
      Income: 0,
      Expenses: 0,
    }));
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const idx = d.getMonth();
      if (t.category.toLowerCase() === "revenue")
        months[idx].Income += t.amount;
      if (t.category.toLowerCase() === "expense")
        months[idx].Expenses += t.amount;
    });
    return months;
  }, [transactions]);

  // Top 3 months by savings
  const topSavings = useMemo(() => {
    return [...barData]
      .map((m) => ({ ...m, Savings: m.Income - m.Expenses }))
      .sort((a, b) => b.Savings - a.Savings)
      .slice(0, 3);
  }, [barData]);

  if (!user)
    return <div className="text-white text-center mt-10">Please log in.</div>;
  if (loading)
    return (
      <div className="text-white text-center mt-10">Loading analytics...</div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="p-8 min-h-screen bg-[#1a1c22]">
      <h1 className="text-2xl font-bold text-white mb-8">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Pie Chart */}
        <div className="bg-[#23243a] rounded-xl p-6 flex flex-col items-center">
          <h2 className="text-lg text-white font-semibold mb-4">
            Revenue vs Expenses
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#23243a",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Bar Chart */}
        <div className="bg-[#23243a] rounded-xl p-6 flex flex-col items-center">
          <h2 className="text-lg text-white font-semibold mb-4">
            Monthly Income & Expenses
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={barData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#353657" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#bfc9da" />
              <YAxis stroke="#bfc9da" />
              <Tooltip
                contentStyle={{
                  background: "#23243a",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Legend />
              <Bar dataKey="Income" fill="#1abc5b" />
              <Bar dataKey="Expenses" fill="#fbbf24" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Top Savings Months */}
      <div className="bg-[#23243a] rounded-xl p-6 mt-8">
        <h2 className="text-lg text-white font-semibold mb-4">
          Top 3 Months by Savings
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          {topSavings.length === 0 ? (
            <div className="text-white text-center w-full py-8">
              No savings data available for any month.
            </div>
          ) : (
            topSavings.map((m, idx) => (
              <div
                key={m.month}
                className="flex-1 bg-[#1a1c22] rounded-lg p-4 flex flex-col items-center"
              >
                <div className="text-[#1abc5b] text-2xl font-bold mb-2">
                  {m.month}
                </div>
                <div className="text-white text-lg">
                  Savings: ${m.Savings.toFixed(2)}
                </div>
                <div className="text-[#bfc9da] text-sm mt-1">
                  Income: ${m.Income.toFixed(2)} | Expenses: $
                  {m.Expenses.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
