import { SignupForm } from "@/components/SignUpForm";
import "../styles/Signup.css";

export function Signup() {
  return (
    <div className="signup-container">
      <div className="signup-card">
        <SignupForm />
      </div>
    </div>
  );
}
