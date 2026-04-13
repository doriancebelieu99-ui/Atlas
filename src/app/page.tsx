import { getAllDestinations } from "@/lib/destinations";
import HomeClient from "./home-client";

export default function HomePage() {
  const destinations = getAllDestinations();

  return <HomeClient destinations={destinations} />;
}
