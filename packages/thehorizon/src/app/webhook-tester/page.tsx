import WebhookTester from "./_components/WebhookTester";

export default function WebhookTesterPage() {
  return (
    <div className="w-full min-h-screen p-8 overflow-x-auto">
      <h1 className="text-3xl font-bold mb-4">Webhook Tester</h1>
      <WebhookTester />
    </div>
  );
}

