import { AuthForm } from "@/components/auth/auth-form";
import { AuthFrame } from "@/components/auth/auth-frame";

export const metadata = { title: "Criar loja" };

export default function SignupPage() {
  return (
    <AuthFrame>
      <AuthForm mode="signup" />
    </AuthFrame>
  );
}
