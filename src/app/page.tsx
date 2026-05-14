import { redirect } from "next/navigation";

/** Guest-first: land straight on manual quote creation. */
export default function Home() {
  redirect("/quotes/new");
}
