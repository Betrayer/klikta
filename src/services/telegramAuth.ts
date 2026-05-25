export const requestTelegramToken = async (
  initData: string,
): Promise<string> => {
  let response: Response;
  try {
    response = await fetch("/api/telegram-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    });
  } catch {
    throw new Error("network");
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const reason =
      typeof data === "object" &&
      data !== null &&
      typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : `http-${response.status}`;
    throw new Error(reason);
  }
  if (
    typeof data === "object" &&
    data !== null &&
    typeof (data as { token?: unknown }).token === "string"
  ) {
    return (data as { token: string }).token;
  }
  throw new Error("malformed");
};
