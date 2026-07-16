import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Session from "@/models/Session";
import { SESSION_TYPES } from "@/lib/enums";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // Validation
    const { type, date, duration } = body;
    if (!type || !date || !duration) {
      return NextResponse.json(
        { error: "Type, date, and duration are required." },
        { status: 400 },
      );
    }

    if (!Object.values(SESSION_TYPES).includes(type)) {
      return NextResponse.json(
        { error: "Invalid session type." },
        { status: 400 },
      );
    }

    const session = await Session.create(body);

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("POST /api/sessions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type")?.toUpperCase();
    const full = searchParams.get("full") === "1";

    const query = {};
    if (type) {
      if (!Object.values(SESSION_TYPES).includes(type)) {
        return NextResponse.json(
          { error: "Invalid session type query." },
          { status: 400 },
        );
      }
      query.type = type;
    }

    let q = Session.find(query, full ? undefined : "date type").sort({ date: -1 });

    // When ?full=1, populate player names for CSV export
    if (full) {
      q = q
        .populate("players.mongoId", "name")
        .populate("drills.players.mongoId", "name");
    }

    const sessions = await q;
    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error("GET /api/sessions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
