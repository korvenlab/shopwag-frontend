import { AppFrame } from "@/components/app-frame";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <AppFrame>
      <AuthForm mode="login" />
    </AppFrame>
  );
}
