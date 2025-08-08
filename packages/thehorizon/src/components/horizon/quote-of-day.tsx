import { Quote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuoteOfTheDay() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Quote className="h-5 w-5 text-primary" />
          Quote of the Day
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg italic">
          "The best way to predict the future is to create it."
        </p>
        <p className="mt-2 text-sm text-muted-foreground">- Peter Drucker</p>
      </CardContent>
    </Card>
  );
}
