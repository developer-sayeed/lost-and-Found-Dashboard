import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

/**
 * Settings Type
 */
type HotelSettings = {
  _id?: string;
  key: string;
  hotelName: string;
  hotelAddress: string;
  hotelPhone: string;
  hotelEmail: string;
  hotelWebsite: string;
  logo: string;
  otherLinks: any[];
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Default settings (without DB fields)
 */
const DEFAULT_SETTINGS: Omit<
  HotelSettings,
  "_id" | "key" | "createdAt" | "updatedAt"
> = {
  hotelName: "Warwick Hotels and Resorts",
  hotelAddress: "",
  hotelPhone: "",
  hotelEmail: "",
  hotelWebsite: "",
  logo: "/images/warwick-logo.png",
  otherLinks: [],
};

/**
 * GET Settings
 */
// export async function GET() {
//   try {
//     const { db } = await connectToDatabase();

//     let settings = await db
//       .collection<HotelSettings>("settings")
//       .findOne({ key: "hotel_settings" });

//     // If not found, create default settings
//     if (!settings) {
//       const newSettings: HotelSettings = {
//         key: "hotel_settings",
//         ...DEFAULT_SETTINGS,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       await db.collection<HotelSettings>("settings").insertOne(newSettings);

//       settings = newSettings;
//     }

//     return NextResponse.json(settings);
//   } catch (error) {
//     console.error("Error fetching settings:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch settings" },
//       { status: 500 },
//     );
//   }
// }
export async function GET() {
  try {
    const { db } = await connectToDatabase();

    let settings = await db
      .collection<HotelSettings>("settings")
      .findOne({ key: "hotel_settings" });

    if (!settings) {
      const newSettings = {
        key: "hotel_settings",
        ...DEFAULT_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db
        .collection<HotelSettings>("settings")
        .insertOne(newSettings);

      // IMPORTANT FIX: attach _id manually
      settings = {
        _id: result.insertedId.toString(),
        ...newSettings,
      };
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

/**
 * PUT Update Settings
 */
export async function PUT(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const updateData: Partial<HotelSettings> = {
      ...body,
      updatedAt: new Date(),
    };

    await db
      .collection<HotelSettings>("settings")
      .updateOne(
        { key: "hotel_settings" },
        { $set: updateData },
        { upsert: true },
      );

    const settings = await db
      .collection<HotelSettings>("settings")
      .findOne({ key: "hotel_settings" });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
