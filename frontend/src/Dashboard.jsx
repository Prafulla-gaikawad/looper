import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  FaWallet,
  FaMoneyBillWave,
  FaCreditCard,
  FaDollarSign,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";
import { RiCheckboxBlankCircleFill } from "react-icons/ri";
import { Link, useOutletContext } from "react-router-dom";
import { useRef } from "react";
import { baseUrl } from "./URL";

function formatCurrency(amount) {
  return amount < 0
    ? `-$${Math.abs(amount).toLocaleString()}`
    : `$${amount.toLocaleString()}`;
}

function getMonthName(dateStr) {
  return new Date(dateStr).toLocaleString("default", { month: "short" });
}

const cardIcons = [
  <FaWallet className="text-2xl text-[#22c55e]" />,
  <FaMoneyBillWave className="text-2xl text-[#22c55e]" />,
  <FaCreditCard className="text-2xl text-[#22c55e]" />,
  <FaDollarSign className="text-2xl text-[#22c55e]" />,
];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg px-4 py-2 text-white font-semibold text-lg shadow-lg bg-[#23242a] min-w-[140px]">
        <div className="text-base mb-1 text-[#bfc9da]">{label}</div>
        {payload.map((entry) => (
          <div
            key={entry.dataKey}
            className="flex items-center gap-2 mb-1 last:mb-0"
          >
            <span
              className={
                entry.dataKey === "Income"
                  ? "inline-block w-3 h-3 rounded-full bg-[#22c55e]"
                  : "inline-block w-3 h-3 rounded-full bg-[#fbbf24]"
              }
            ></span>
            <span className="text-sm">
              {entry.dataKey}:{" "}
              <span
                className={
                  entry.dataKey === "Income"
                    ? "text-[#22c55e]"
                    : "text-[#fbbf24]"
                }
              >
                ${entry.value.toFixed(2)}
              </span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function CustomLegend() {
  return (
    <div className="flex items-center gap-6 ml-2">
      <span className="flex items-center gap-2 text-sm text-white">
        <RiCheckboxBlankCircleFill className="text-[#22c55e] text-base" />{" "}
        Income
      </span>
      <span className="flex items-center gap-2 text-sm text-white">
        <RiCheckboxBlankCircleFill className="text-[#fbbf24] text-base" />{" "}
        Expenses
      </span>
    </div>
  );
}

// Demo users for showcase
const demoUsers = [
  {
    name: "Matheus Ferrero",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Floyd Miles",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    name: "Jerome Bell",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg",
  },
  {
    name: "Jenny Wilson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Kristin Watson",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

export default function Dashboard({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const { onLogout } = useOutletContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef();

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${baseUrl}/api/transactions`);
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

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Top cards calculations
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

  // Prepare data for line chart (Income/Expenses by month)
  const chartData = useMemo(() => {
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

  // Recent 3 transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, [transactions]);

  // Filtered and paginated transactions for table
  const filteredTransactions = useMemo(() => {
    let txs = transactions;
    if (search) {
      txs = txs.filter(
        (t) =>
          t.category.toLowerCase().includes(search.toLowerCase()) ||
          t.status.toLowerCase().includes(search.toLowerCase()) ||
          (t.amount + "").includes(search) ||
          (t.date && new Date(t.date).toLocaleDateString().includes(search))
      );
    }
    return txs.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  }, [transactions, search]);

  if (!user)
    return <div className="text-white text-center mt-10">Please log in.</div>;
  if (loading)
    return (
      <div className="text-white text-center mt-10">Loading dashboard...</div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-[#282c35] w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-[#1A1C22] py-4 w-full">
        <h1 className="text-2xl md:text-2xl font-bold text-white ml-6">
          Dashboard
        </h1>
        <div className="flex items-center gap-4 mr-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#23242a] text-[#bfc9da] rounded-lg px-4 py-2 pl-10 w-48 md:w-64 outline-none border-none focus:ring-2 focus:ring-[#22c55e]"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bfc9da] text-sm" />
          </div>
          <div className="relative" ref={profileRef}>
            <FaUserCircle
              className="text-[#bfc9da] w-10 h-10 cursor-pointer hover:text-[#22c55e] transition"
              onClick={() => setDropdownOpen((v) => !v)}
            />
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#23242a] rounded-lg shadow-lg py-2 z-50 border border-[#282c35]">
                <button
                  className="block w-full text-left px-4 py-2 text-[#bfc9da] hover:bg-[#282c35] hover:text-[#22c55e] transition"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Dashboard Content */}
      <div className="p-6 md:p-10">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            icon={cardIcons[0]}
            label="Balance"
            value={formatCurrency(balance)}
          />
          <DashboardCard
            icon={cardIcons[1]}
            label="Revenue"
            value={formatCurrency(revenue)}
          />
          <DashboardCard
            icon={cardIcons[2]}
            label="Expenses"
            value={formatCurrency(expenses)}
          />
          <DashboardCard
            icon={cardIcons[3]}
            label="Savings"
            value={formatCurrency(savings)}
          />
        </div>

        {/* Overview and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overview Line Chart */}
          <div className="bg-[#1A1C22] rounded-xl p-6 col-span-2 shadow-md border border-[#23243a]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">Overview</h3>
              <div className="flex items-center gap-4">
                <CustomLegend />
                <select className="bg-[#23243a] border border-[#353657] text-[#bfc9da] text-sm rounded px-3 py-1 outline-none">
                  <option>Monthly</option>
                </select>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="#353657"
                  strokeDasharray="6 6"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#bfc9da"
                  fontSize={14}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#bfc9da"
                  fontSize={14}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#22c55e", strokeDasharray: "3 3" }}
                />
                <Line
                  type="monotone"
                  dataKey="Income"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    stroke: "#23243a",
                    strokeWidth: 3,
                    fill: "#22c55e",
                  }}
                  activeDot={{
                    r: 8,
                    fill: "#22c55e",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Expenses"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    stroke: "#23243a",
                    strokeWidth: 3,
                    fill: "#fbbf24",
                  }}
                  activeDot={{
                    r: 8,
                    fill: "#fbbf24",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Recent Transactions */}
          <div className="bg-[#1A1C22] rounded-xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">
                Recent Transaction
              </h3>
              <Link
                to="/transactions"
                className="text-[#22c55e] text-sm font-semibold hover:underline"
              >
                See all
              </Link>
            </div>
            <ul>
              {recentTransactions.map((tx, idx) => {
                const demoUser = demoUsers[idx % demoUsers.length];
                return (
                  <li
                    key={tx.id}
                    className={
                      "flex items-center justify-between py-3 " +
                      (idx < recentTransactions.length - 1
                        ? "border-b border-[#353657]"
                        : "")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={demoUser.avatar}
                        alt="profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-[#bfc9da] text-xs font-medium mb-0.5">
                          Transfers{" "}
                          {tx.category.toLowerCase() === "revenue"
                            ? "from"
                            : "to"}
                        </span>
                        <span className="text-white text-base font-bold leading-tight">
                          {demoUser.name}
                        </span>
                      </div>
                    </div>
                    <span
                      className={
                        tx.category.toLowerCase() === "revenue"
                          ? "text-[#22c55e] text-base font-semibold"
                          : "text-[#fbbf24] text-base font-semibold"
                      }
                    >
                      {tx.category.toLowerCase() === "revenue" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-[#1A1C22] rounded-xl p-6 mt-8 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h3 className="text-2xl font-bold text-white">Transactions</h3>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search for anything...."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#292b3a] text-[#bfc9da] border-none rounded px-4 py-2 text-base outline-none w-full md:w-72"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[#292b3a] rounded-lg">
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
    </div>
  );
}

function DashboardCard({ icon, label, value }) {
  return (
    <div className="bg-[#1A1C22] rounded-xl p-6 flex flex-row items-center shadow-md min-w-[220px]">
      <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-[#262a32] mr-5">
        {icon}
      </div>
      <div className="flex flex-col justify-center">
        <div className="text-[#bfc9da] text-sm font-medium mb-1">{label}</div>
        <div className="text-white text-3xl font-bold tracking-tight">
          {value}
        </div>
      </div>
    </div>
  );
}
