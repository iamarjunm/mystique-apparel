import { NextResponse } from "next/server";
import { client } from "@/sanity";

// GET /api/admin/reviews
export async function GET(req) {
  try {
    const query = `*[_type == "review"] | order(createdAt desc) {
      _id,
      rating,
      title,
      comment,
      createdAt,
      isApproved,
      verifiedPurchase,
      adminResponse,
      images[]{
        asset->{
          url
        }
      },
      product->{
        _id,
        title,
        slug
      },
      user->{
        _id,
        displayName,
        email,
        image
      }
    }`;

    const reviews = await client.fetch(query);
    return NextResponse.json({ reviews }, { status: 200 });

  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// PATCH /api/admin/reviews
export async function PATCH(req) {
  try {
    const { id, isApproved, adminResponse } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing review ID" }, { status: 400 });
    }

    const updates = {};
    if (isApproved !== undefined) updates.isApproved = isApproved;
    if (adminResponse !== undefined) updates.adminResponse = adminResponse;

    const updatedReview = await client.patch(id).set(updates).commit();

    return NextResponse.json({ success: true, review: updatedReview }, { status: 200 });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

// DELETE /api/admin/reviews
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing review ID" }, { status: 400 });
    }

    await client.delete(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
