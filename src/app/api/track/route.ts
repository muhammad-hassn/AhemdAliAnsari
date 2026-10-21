import { NextResponse, type NextRequest } from "next/server";
import { trackOrder } from "@/server/queries/orders";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { orderNumber?: string; email?: string };
    const { orderNumber, email } = body;

    if (!orderNumber || !email) {
      return NextResponse.json(
        { ok: false, error: "Please enter both order number and email." },
        { status: 400 },
      );
    }

    const ip = request.headers.get("x-forwarded-for") ?? "local";
    const result = await trackOrder(orderNumber, email, ip);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to process tracking lookup." },
      { status: 500 },
    );
  }
}
