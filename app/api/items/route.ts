import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET all items or filtered items
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const month = searchParams.get("month") || "";
    const year = searchParams.get("year") || "";
    const recent = searchParams.get("recent") === "true";

    // Build query
    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { locationFound: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    // Filter by month and year
    if (month || year) {
      const dateQuery: Record<string, Date> = {};
      if (year && month) {
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(
          parseInt(year),
          parseInt(month),
          0,
          23,
          59,
          59,
        );
        dateQuery.$gte = startDate;
        dateQuery.$lte = endDate;
      } else if (year) {
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
        dateQuery.$gte = startDate;
        dateQuery.$lte = endDate;
      }
      if (Object.keys(dateQuery).length > 0) {
        query.dateFound = dateQuery;
      }
    }

    const skip = (page - 1) * limit;
    const actualLimit = recent ? 10 : limit;

    const items = await db
      .collection("items")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(recent ? 0 : skip)
      .limit(actualLimit)
      .toArray();

    const total = await db.collection("items").countDocuments(query);

    // Transform MongoDB _id to id for frontend compatibility
    const transformedItems = items.map((item) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json({
      items: transformedItems,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 },
    );
  }
}

// POST create new item
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    // Generate unique code
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const count = await db.collection("items").countDocuments();
    const code = `LF-${year}-${month}-${String(count + 1).padStart(3, "0")}`;

    const newItem = {
      ...body,
      code,
      status: "stored",
      dateFound: new Date(body.dateFound),
      dispatchDeadline: body.dispatchDeadline
        ? new Date(body.dispatchDeadline)
        : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("items").insertOne(newItem);

    return NextResponse.json(
      {
        ...newItem,
        id: result.insertedId.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 },
    );
  }
}
