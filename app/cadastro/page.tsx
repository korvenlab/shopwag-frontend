import { AppFrame } from "@/components/app-frame";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Criar loja" };

export default function SignupPage() {
  return (
    <AppFrame>
      <AuthForm mode="signup" />
    </AppFrame>
  );
}
