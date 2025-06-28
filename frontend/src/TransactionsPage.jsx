import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

function formatCurrency(amount) {
  return amount < 0
    ? `-$${Math.abs(amount).toFixed(2)}`
    : `$${amount.toFixed(2)}`;
}

// Demo users for showcase
const demoUsers = [
  { name: "Matheus Ferrero", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Floyd Miles", avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
  { name: "Jerome Bell", avatar: "https://randomuser.me/api/portraits/men/65.jpg" },
  { name: "Jenny Wilson", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Kristin Watson", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
];

export default function TransactionsPage() {
  const { user } = useOutletContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

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

  const filteredTransactions = transactions.filter(
    (tx) =>
      (statusFilter === "All"
        ? true
        : tx.status.toLowerCase() === statusFilter.toLowerCase()) &&
      (search === "" ||
        tx.category.toLowerCase().includes(search.toLowerCase()) ||
        tx.status.toLowerCase().includes(search.toLowerCase()) ||
        (tx.amount + "").includes(search) ||
        (tx.date && new Date(tx.date).toLocaleDateString().includes(search)))
  );

  if (!user)
    return <div className="text-white text-center mt-10">Please log in.</div>;
  if (loading)
    return (
      <div className="text-white text-center mt-10">
        Loading transactions...
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="p-8 min-h-screen bg-[#1a1c22]">
      <div className="bg-[#1A1C22] rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search for anything...."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#292b3a] text-[#bfc9da] border-none rounded px-4 py-2 text-base outline-none w-full md:w-72"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#292b3a] text-[#bfc9da] border-none rounded px-4 py-2 text-base outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#23242a] rounded-lg">
                <th className="py-3 px-4 text-left text-[#bfc9da] font-medium rounded-l-lg">
                  Name
                </th>
                <th className="py-3 px-4 text-left text-[#bfc9da] font-medium">
                  Date
                </th>
                <th className="py-3 px-4 text-left text-[#bfc9da] font-medium">
                  Amount
                </th>
                <th className="py-3 px-4 text-left text-[#bfc9da] font-medium rounded-r-lg">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, idx) => {
                const demoUser = demoUsers[idx % demoUsers.length];
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-[#353657] last:border-b-0"
                  >
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={demoUser.avatar}
                        alt="profile"
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <span className="text-white text-base font-medium">
                        {demoUser.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white text-base">
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td
                      className={
                        tx.category.toLowerCase() === "revenue"
                          ? "py-3 px-4 text-[#22c55e] text-base font-semibold"
                          : "py-3 px-4 text-[#fbbf24] text-base font-semibold"
                      }
                    >
                      {tx.category.toLowerCase() === "revenue" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          tx.status.toLowerCase() === "paid"
                            ? "bg-[#22c55e] bg-opacity-20 text-[#22c55e] px-4 py-1 rounded-full text-sm font-semibold"
                            : "bg-[#fbbf24] bg-opacity-20 text-[#fbbf24] px-4 py-1 rounded-full text-sm font-semibold"
                        }
                      >
                        {tx.status.toLowerCase() === "paid"
                          ? "Completed"
                          : "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-[#bfc9da] py-6">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
