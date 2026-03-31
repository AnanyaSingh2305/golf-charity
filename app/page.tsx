"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [score, setScore] = useState("");
  const [scores, setScores] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [charity, setCharity] = useState("Education");

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    if (data.user) fetchScores(data.user.id);
  }

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Signup successful!");
  }

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else {
      alert("Login successful!");
      getUser();
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function fetchScores(userId: string) {
    const { data } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setScores(data || []);
  }

  // 🔥 5-score rolling logic
  async function addScore() {
    if (!score) return alert("Enter score");

    const { data: existingScores } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (existingScores && existingScores.length >= 5) {
      const oldest = existingScores[0];

      await supabase.from("scores").delete().eq("id", oldest.id);
    }

    const { error } = await supabase.from("scores").insert([
      {
        score: parseInt(score),
        user_id: user.id,
        charity: charity,
      },
    ]);

    if (error) alert(error.message);
    else {
      setScore("");
      fetchScores(user.id);
    }
  }

  async function deleteScore(id: string) {
    await supabase.from("scores").delete().eq("id", id);
    fetchScores(user.id);
  }

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={title}>🏌️ Golf Score Tracker</h1>

        {!user ? (
          <>
            <h2>Login / Signup</h2>

            <input
              style={input}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              style={input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button style={primaryBtn} onClick={signUp}>
                Sign Up
              </button>
              <button style={secondaryBtn} onClick={login}>
                Login
              </button>
            </div>
          </>
        ) : (
          <>
            <h3>Welcome, {user.email}</h3>

            <button style={logoutBtn} onClick={logout}>
              Logout
            </button>

            <hr style={divider} />

            <h2>Add Score</h2>

            <input
              style={input}
              placeholder="Enter score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />

            <h3>Support a Charity</h3>

            <select
              style={input}
              value={charity}
              onChange={(e) => setCharity(e.target.value)}
            >
              <option>Education</option>
              <option>Health</option>
              <option>Environment</option>
            </select>

            <button style={primaryBtn} onClick={addScore}>
              Save Score
            </button>

            <hr style={divider} />

            <h2>Last 5 Scores</h2>

            {scores.length === 0 && <p>No scores yet</p>}

            {scores.map((s) => (
              <div key={s.id} style={scoreCard}>
                <div>
                  <p><b>Score:</b> {s.score}</p>
                  <p style={{ fontSize: "12px", color: "gray" }}>
                    {s.charity}
                  </p>
                </div>

                <button
                  style={deleteBtn}
                  onClick={() => deleteScore(s.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* 🎨 STYLES */

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f5f7fb",
};

const card = {
  width: "350px",
  background: "#fff",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
};

const title = {
  textAlign: "center" as const,
  marginBottom: "10px",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #ddd",
};

const primaryBtn = {
  padding: "10px",
  background: "#0070f3",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "10px",
  background: "#555",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const logoutBtn = {
  background: "red",
  color: "#fff",
  border: "none",
  padding: "5px 10px",
  borderRadius: "5px",
  cursor: "pointer",
};

const divider = {
  margin: "15px 0",
};

const scoreCard = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px",
  border: "1px solid #eee",
  borderRadius: "6px",
  marginBottom: "8px",
};

const deleteBtn = {
  background: "#000",
  color: "#fff",
  border: "none",
  padding: "5px 10px",
  borderRadius: "5px",
  cursor: "pointer",
};