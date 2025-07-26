export async function sendSlackAlert(text: string) {
  const webhookUrl = import.meta.env.VITE_SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("⚠️ SLACK_WEBHOOK_URL not defined in env.");
    return;
  }

  const payload = { text };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const bodyText = await res.text();

    if (!res.ok || bodyText.trim() !== "ok") {
      console.error(
        `⚠️ Slack webhook error: status=${res.status}, body="${bodyText}"`
      );
    }
  } catch (err: any) {
    console.error("❌ Failed to send Slack alert:", err.message || err);
  }
}
