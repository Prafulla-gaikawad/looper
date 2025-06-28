export default function PersonalPage({ onLogout, user }) {
  return (
    <div className="p-8 min-h-screen bg-[#1a1c22] flex flex-col items-center justify-center">
      <div className="bg-[#23243a] rounded-2xl p-10 flex flex-col items-center shadow-lg max-w-md w-full">
        <img
          src={
            user?.user_profile ||
            "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(user?.name || "User") +
              "&background=1abc5b&color=fff&size=128"
          }
          alt="profile"
          className="w-28 h-28 rounded-full object-cover mb-6 border-4 border-[#1abc5b]"
        />
        <div className="text-white text-2xl font-bold mb-2">{user?.name}</div>
        <div className="text-[#bfc9da] text-lg mb-1">
          User ID: <span className="text-white">{user?.user_id}</span>
        </div>
        <div className="text-[#bfc9da] text-lg mb-6">
          Email: <span className="text-white">{user?.email}</span>
        </div>
        <button
          onClick={onLogout}
          className="bg-[#1abc5b] text-white px-8 py-3 rounded font-semibold hover:bg-[#159c4a] transition text-lg mt-4"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
