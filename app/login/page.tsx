import { AuthForm } from "@/components/auth/auth-form";
import { AuthFrame } from "@/components/auth/auth-frame";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <AuthFrame>
      <AuthForm mode="login" />
    </AuthFrame>
  );
}
