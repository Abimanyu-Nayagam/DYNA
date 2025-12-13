import { LoginForm } from "@/components/LoginForm";
import "../styles/Login.css";

export function Login() {
  return (
    <div className="login-container">
      <div className="login-card">
        <LoginForm />
      </div>
    </div>
  );
}
