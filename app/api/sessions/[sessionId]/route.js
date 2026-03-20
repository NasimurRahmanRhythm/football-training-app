import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Session from "@/models/Session";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { sessionId } = await params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID." },
        { status: 400 },
      );
    }

    const session = await Session.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(sessionId),
        },
      },

      // =============================
      // MATCH TYPE PLAYERS LOOKUP
      // =============================
      {
        $lookup: {
          from: "users",
          let: { playerIds: "$players.mongoId" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$playerIds"] },
              },
            },
            {
              $project: {
                name: 1,
                position: "$personalInfo.position",
                profileImage: "$personalInfo.profileImage",
              },
            },
          ],
          as: "matchUsers",
        },
      },

      // Merge MATCH players
      {
        $addFields: {
          players: {
            $map: {
              input: "$players",
              as: "p",
              in: {
                _id: "$$p.mongoId",
                rating: "$$p.rating",
                goals: "$$p.goals",
                assists: "$$p.assists",
                cleansheet: "$$p.cleansheet",
                comment: "$$p.comment",
                name: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$matchUsers",
                            as: "u",
                            cond: { $eq: ["$$u._id", "$$p.mongoId"] },
                          },
                        },
                        as: "filtered",
                        in: "$$filtered.name",
                      },
                    },
                    0,
                  ],
                },
                position: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$matchUsers",
                            as: "u",
                            cond: { $eq: ["$$u._id", "$$p.mongoId"] },
                          },
                        },
                        as: "filtered",
                        in: "$$filtered.position",
                      },
                    },
                    0,
                  ],
                },
                profileImage: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$matchUsers",
                            as: "u",
                            cond: { $eq: ["$$u._id", "$$p.mongoId"] },
                          },
                        },
                        as: "filtered",
                        in: "$$filtered.profileImage",
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },

      // =============================
      // TRAINING TYPE DRILLS LOOKUP
      // =============================
      {
        $lookup: {
          from: "users",
          let: {
            drillPlayerIds: {
              $reduce: {
                input: "$drills",
                initialValue: [],
                in: {
                  $concatArrays: ["$$value", "$$this.players.mongoId"],
                },
              },
            },
          },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$drillPlayerIds"] },
              },
            },
            {
              $project: {
                name: 1,
                position: "$personalInfo.position",
                profileImage: "$personalInfo.profileImage",
              },
            },
          ],
          as: "drillUsers",
        },
      },

      // Merge DRILL players
      {
        $addFields: {
          drills: {
            $map: {
              input: "$drills",
              as: "d",
              in: {
                _id: "$$d._id",
                name: "$$d.name",
                duration: "$$d.duration",
                players: {
                  $map: {
                    input: "$$d.players",
                    as: "dp",
                    in: {
                      _id: "$$dp.mongoId",
                      rating: "$$dp.rating",
                      comment: "$$dp.comment",
                      name: {
                        $arrayElemAt: [
                          {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$drillUsers",
                                  as: "u",
                                  cond: {
                                    $eq: ["$$u._id", "$$dp.mongoId"],
                                  },
                                },
                              },
                              as: "filtered",
                              in: "$$filtered.name",
                            },
                          },
                          0,
                        ],
                      },
                      position: {
                        $arrayElemAt: [
                          {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$drillUsers",
                                  as: "u",
                                  cond: {
                                    $eq: ["$$u._id", "$$dp.mongoId"],
                                  },
                                },
                              },
                              as: "filtered",
                              in: "$$filtered.position",
                            },
                          },
                          0,
                        ],
                      },
                      profileImage: {
                        $arrayElemAt: [
                          {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$drillUsers",
                                  as: "u",
                                  cond: {
                                    $eq: ["$$u._id", "$$dp.mongoId"],
                                  },
                                },
                              },
                              as: "filtered",
                              in: "$$filtered.profileImage",
                            },
                          },
                          0,
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      {
        $project: {
          matchUsers: 0,
          drillUsers: 0,
        },
      },
    ]);

    if (!session.length) {
      return NextResponse.json(
        { error: "Session not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(session[0], { status: 200 });
  } catch (error) {
    console.error("GET /api/sessions/[sessionId] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { sessionId } = await params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID." },
        { status: 400 },
      );
    }

    const body = await req.json();

    const updatedSession = await Session.findByIdAndUpdate(sessionId, {
      $set: body,
    });

    if (!updatedSession) {
      return NextResponse.json(
        { error: "Session not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error) {
    console.error("PUT /api/sessions/[sessionId] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { sessionId } = await params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID." },
        { status: 400 },
      );
    }

    const deletedSession = await Session.findByIdAndDelete(sessionId);

    if (!deletedSession) {
      return NextResponse.json(
        { error: "Session not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Session deleted successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/sessions/[sessionId] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
