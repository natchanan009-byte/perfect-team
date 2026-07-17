import { redirect } from "next/navigation";

// Redirect ทันทีไปหน้า login — AuthProvider จะดูแล routing ต่อ (login → dashboard ถ้า authenticated)
export default function Home() {
  redirect("/login");
}
