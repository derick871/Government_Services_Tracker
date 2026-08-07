import React, { useState } from "react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerUser = async (e) => {
    e.preventDefault();

    alert("User Registered successfully");

    console.log({
      email,
      password,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <form
        onSubmit={registerUser}
        className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md"
      >
        <h2 className="mb-6 text-2xl font-bold text-slate-800">
          Citizen Register
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          className="mb-4 w-full rounded-md border border-slate-300 p-2 outline-none focus:border-blue-500"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          className="mb-4 w-full rounded-md border border-slate-300 p-2 outline-none focus:border-blue-500"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full rounded-md bg-amber-500 p-2 font-semibold text-white hover:bg-amber-600"
        >
          Register
        </button>
      </form>
    </div>
  );
}