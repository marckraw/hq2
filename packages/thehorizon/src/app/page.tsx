import { QuoteOfTheDay } from "@/components/horizon/quote-of-day";
import { Pulse } from "@/components/horizon/pulse";

export default function Home() {
  return (
    <div className="md:container py-6 space-y-6">
      <QuoteOfTheDay />
      <Pulse />
    </div>
  );
}
