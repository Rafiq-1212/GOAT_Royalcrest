import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

// GET /api/submissions - Retrieve all questionnaire submissions
export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: submissions,
    });
  } catch (error: any) {
    console.error("Prisma Neon fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch submissions from database",
      },
      { status: 500 }
    );
  }
}

// POST /api/submissions - Create a new submission from landing page
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, buyingIntent, propertyType, budget, timeline } = body;

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Full name, email, and phone are required." },
        { status: 400 }
      );
    }

    const newSubmission = await prisma.submission.create({
      data: {
        fullName,
        email,
        phone,
        buyingIntent: buyingIntent || "To invest",
        propertyType: propertyType || "Apartment",
        budget: budget || "AED 1–2 million (₹2.3 Cr – ₹4.6 Cr)",
        timeline: timeline || "Within 3 months",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newSubmission,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Prisma Neon create error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to save submission to Neon database",
      },
      { status: 500 }
    );
  }
}
