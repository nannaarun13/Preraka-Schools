import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; // adjust if path different

const LoginForm = ({ onForgotPassword, onRegisterClick, onHomeClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("LOGIN CLICKED"); // 🔥 debug

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("SUCCESS:", userCredential);

      alert("Login successful ✅");

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      alert(error.message); // 🔥 IMPORTANT
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <div className="flex justify-between text-sm">
        <button type="button" onClick={onForgotPassword}>
          Forgot password?
        </button>

        <button type="button" onClick={onRegisterClick}>
          Register
        </button>
      </div>

      <button type="button" onClick={onHomeClick} className="w-full text-sm">
        Back to Home
      </button>
    </form>
  );
};

export default LoginForm;