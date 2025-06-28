import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";

function formatCurrency(amount) {
  return amount < 0
    ? `-$${Math.abs(amount).toFixed(2)}`
    : `$${amount.toFixed(2)}`;
}

const walletCards = [
  { key: "balance", label: "Balance", icon: "💰", color: "bg-[#1abc5b]" },
  { key: "revenue", label: "Revenue", icon: "🟢", color: "bg-[#23243a]" },
  { key: "expenses", label: "Expenses", icon: "🔴", color: "bg-[#23243a]" },
  { key: "savings", label: "Savings", icon: "💵", color: "bg-[#23243a]" },
];

export default function WalletPage() {
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

  const { balance, revenue, expenses, savings } = useMemo(() => {
    let revenue = 0,
      expenses = 0;
    transactions.forEach((t) => {
      if (t.category.toLowerCase() === "revenue") revenue += t.amount;
      if (t.category.toLowerCase() === "expense") expenses += t.amount;
    });
    const balance = revenue - expenses;
    const savings = balance; // For now, same as balance
    return { balance, revenue, expenses, savings };
  }, [transactions]);

  const cardValues = { balance, revenue, expenses, savings };

  if (!user)
    return <div className="text-white text-center mt-10">Please log in.</div>;
  if (loading)
    return (
      <div className="text-white text-center mt-10">Loading wallet...</div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="p-8 min-h-screen bg-[#1a1c22] flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-10">Wallet Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-5xl mb-12">
        {walletCards.map((card) => (
          <div
            key={card.key}
            className={`rounded-2xl p-8 flex flex-col items-center shadow-lg ${card.color}`}
          >
            <div className="text-4xl mb-4">{card.icon}</div>
            <div className="text-[#bfc9da] text-lg font-medium mb-2">
              {card.label}
            </div>
            <div className="text-white text-3xl font-bold">
              {formatCurrency(cardValues[card.key])}
            </div>
          </div>
        ))}
      </div>
      <div className="text-[#bfc9da] text-lg mt-8">
        All your financial stats at a glance.
      </div>
    </div>
  );
}
