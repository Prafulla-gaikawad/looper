import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { baseUrl } from "./URL";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${baseUrl}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        if (setUser) {
          setUser({
            name: payload.name,
            user_id: payload.user_id,
            email: payload.email,
          });
        }
        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1c22]">
      <form
        className="bg-[#23243a] border border-[#292b3a] p-10 rounded-2xl shadow-2xl flex flex-col min-w-[340px] w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 27 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M21.6016 5.17785H10.0906V0.294373L26.4851 0.294373V16.6889H21.6016V5.17785Z"
                  fill="#FFC01E"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.6101 14.8951C11.8643 14.3968 10.9876 14.1309 10.0907 14.1309V9.24741C11.9535 9.24741 13.7744 9.79977 15.3232 10.8346C16.872 11.8695 18.0791 13.3404 18.792 15.0614C19.5048 16.7823 19.6913 18.676 19.3279 20.5029C18.9645 22.3299 18.0675 24.008 16.7504 25.3252C15.4332 26.6423 13.7551 27.5393 11.9281 27.9027C10.1012 28.2661 8.20751 28.0796 6.48657 27.3668C4.76563 26.6539 3.29472 25.4468 2.25984 23.898C1.22496 22.3492 0.672604 20.5283 0.672607 18.6655L5.55609 18.6655C5.55608 19.5624 5.82204 20.4391 6.32031 21.1849C6.81858 21.9306 7.5268 22.5118 8.3554 22.855C9.184 23.1982 10.0958 23.288 10.9754 23.1131C11.855 22.9381 12.663 22.5062 13.2972 21.872C13.9314 21.2379 14.3633 20.4299 14.5383 19.5502C14.7132 18.6706 14.6234 17.7588 14.2802 16.9302C13.937 16.1016 13.3558 15.3934 12.6101 14.8951Z"
                  fill="#1FCB4F"
                />
              </svg>
            </span>
            <span className="text-2xl font-bold text-white tracking-wide">
              Penta
            </span>
          </div>
          <h2 className="text-white text-3xl font-bold">Sign In</h2>
        </div>
        {error && (
          <div className="bg-red-600 text-white py-2 px-4 rounded mb-3 text-center text-base">
            {error}
          </div>
        )}
        <label className="text-[#bfc9da] text-base mb-1 mt-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-[#1a1c22] text-white border border-[#353657] rounded px-4 py-2 mb-1 text-base outline-none focus:border-[#1abc5b]"
        />
        <label className="text-[#bfc9da] text-base mb-1 mt-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-[#1a1c22] text-white border border-[#353657] rounded px-4 py-2 mb-1 text-base outline-none focus:border-[#1abc5b]"
        />
        <button
          type="submit"
          className="mt-5 bg-[#1abc5b] text-white rounded px-4 py-3 text-lg font-semibold hover:bg-[#159c4a] transition shadow-md"
        >
          Login
        </button>
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-[#353657]" />
          <span className="mx-3 text-[#bfc9da] text-sm">or</span>
          <div className="flex-1 h-px bg-[#353657]" />
        </div>
        <div className="mt-2 text-[#bfc9da] text-center text-base">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-[#1abc5b] font-semibold hover:underline ml-1"
          >
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}
