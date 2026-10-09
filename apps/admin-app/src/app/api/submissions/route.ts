import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!verifySessionToken(sessionCookie)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to view submissions." },
        { status: 401 }
      );
    }

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
    console.error("Admin DB fetch error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!verifySessionToken(sessionCookie)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to perform this action." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // body might be empty if query param used
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Submission ID is required for deletion." },
        { status: 400 }
      );
    }

    try {
      await prisma.submission.delete({
        where: { id },
      });
    } catch (dbError: any) {
      // Prisma error code P2025: Record to delete does not exist
      if (dbError.code === "P2025") {
        return NextResponse.json({
          success: true,
          message: "Record already removed or does not exist in database.",
          id,
        });
      }
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      message: "Submission deleted successfully.",
      id,
    });
  } catch (error: any) {
    console.error("Admin DB delete error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete submission" },
      { status: 500 }
    );
  }
}

