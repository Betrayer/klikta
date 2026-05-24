export const requestTelegramToken = async (
  initData: string,
): Promise<string> => {
  const response = await fetch("/api/telegram-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData }),
  });
  if (!response.ok) {
    throw new Error(`telegram-auth-${response.status}`);
  }
  const data: unknown = await response.json();
  if (
    typeof data === "object" &&
    data !== null &&
    typeof (data as { token?: unknown }).token === "string"
  ) {
    return (data as { token: string }).token;
  }
  throw new Error("telegram-auth-malformed");
};
