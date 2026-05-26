import { auth } from "@/lib/auth";
import LandingPage from "./landing/page";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
