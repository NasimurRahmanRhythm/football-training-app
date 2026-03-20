import User from "@/models/User";
import { USER_TYPES } from "@/lib/enums";

export const getUsers = async (userType) => {
  const pipeline = [];

  // 1. Filter stage
  if (userType) {
    if (userType === USER_TYPES.PLAYER) {
      // Verified players only
      pipeline.push({
        $match: { userType: USER_TYPES.PLAYER, isVerified: true },
      });
    } else if (userType === "PENDING_PLAYER") {
      // Players awaiting approval (not yet verified)
      pipeline.push({
        $match: { userType: USER_TYPES.PLAYER, isVerified: false },
      });
    } else {
      pipeline.push({ $match: { userType } });
    }
  }

  // 2. Project stage
  pipeline.push({
    $project: {
      _id: 1,
      name: 1,
      email: 1,
      userType: 1,
      profileImage: "$personalInfo.profileImage",
      position: {
        $cond: {
          if: { $eq: ["$userType", USER_TYPES.COACH] },
          then: "$$REMOVE", // Do not return position for COACH
          else: "$personalInfo.position", // Return position for PLAYER or others
        },
      },
    },
  });

  return await User.aggregate(pipeline);
};

export const getUserById = async (userId) => {
  const mongoose = require("mongoose");
  const pipeline = [
    {
      $match: { _id: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "sessions",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $in: ["$$userId", "$players.mongoId"] },
                  {
                    $anyElementTrue: {
                      $map: {
                        input: "$drills",
                        as: "d",
                        in: { $in: ["$$userId", "$$d.players.mongoId"] },
                      },
                    },
                  },
                ],
              },
            },
          },
          {
            $addFields: {
              myPerformance: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$type", "MATCH"] },
                      then: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$players",
                              as: "p",
                              cond: { $eq: ["$$p.mongoId", "$$userId"] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    {
                      case: { $eq: ["$type", "TRAINING"] },
                      then: {
                        $map: {
                          input: {
                            $filter: {
                              input: "$drills",
                              as: "d",
                              cond: {
                                $in: ["$$userId", "$$d.players.mongoId"],
                              },
                            },
                          },
                          as: "d",
                          in: {
                            name: "$$d.name",
                            duration: "$$d.duration",
                            performance: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: "$$d.players",
                                    as: "dp",
                                    cond: { $eq: ["$$dp.mongoId", "$$userId"] },
                                  },
                                },
                                0,
                              ],
                            },
                          },
                        },
                      },
                    },
                  ],
                  default: null,
                },
              },
            },
          },
          {
            $addFields: {
              playerRating: {
                $cond: {
                  if: { $eq: ["$type", "MATCH"] },
                  then: { $ifNull: ["$myPerformance.rating", 0] },
                  else: {
                    $ifNull: [{ $avg: "$myPerformance.performance.rating" }, 0],
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              type: 1,
              date: 1,
              duration: 1,
              opponent: 1,
              myPerformance: 1,
              playerRating: 1,
            },
          },
          {
            $sort: { date: -1 },
          },
        ],
        as: "sessions",
      },
    },
    {
      $addFields: {
        totalAvgRating: { $avg: "$sessions.playerRating" },
        matchAvgRating: {
          $avg: {
            $map: {
              input: {
                $filter: {
                  input: "$sessions",
                  as: "s",
                  cond: { $eq: ["$$s.type", "MATCH"] },
                },
              },
              as: "ms",
              in: "$$ms.playerRating",
            },
          },
        },
        trainingAvgRating: {
          $avg: {
            $map: {
              input: {
                $filter: {
                  input: "$sessions",
                  as: "s",
                  cond: { $eq: ["$$s.type", "TRAINING"] },
                },
              },
              as: "ts",
              in: "$$ts.playerRating",
            },
          },
        },
        totalGoals: {
          $sum: "$sessions.myPerformance.goals",
        },
        totalAssists: {
          $sum: "$sessions.myPerformance.assists",
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        userType: 1,
        isVerified: 1,
        personalInfo: 1,
        sessions: 1,
        totalAvgRating: { $ifNull: ["$totalAvgRating", 0] },
        matchAvgRating: { $ifNull: ["$matchAvgRating", 0] },
        trainingAvgRating: { $ifNull: ["$trainingAvgRating", 0] },
        totalGoals: { $ifNull: ["$totalGoals", 0] },
        totalAssists: { $ifNull: ["$totalAssists", 0] },
      },
    },
  ];

  const results = await User.aggregate(pipeline);
  return results.length > 0 ? results[0] : null;
};
