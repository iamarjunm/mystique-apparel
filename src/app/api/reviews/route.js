import { NextResponse } from "next/server";
import { client } from "@/sanity";

// GET /api/reviews?productId=xxx
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const query = `*[_type == "review" && product._ref == $productId && isApproved == true] | order(createdAt desc) {
      _id,
      rating,
      title,
      comment,
      createdAt,
      helpful,
      adminResponse,
      verifiedPurchase,
      variantInfo,
      images[]{
        asset->{
          url
        }
      },
      user->{
        _id,
        displayName,
        email,
        image
      }
    }`;

    const reviews = await client.fetch(query, { productId });
    
    // Also calculate aggregate
    const aggregateQuery = `*[_type == "review" && product._ref == $productId && isApproved == true] {
      rating
    }`;
    const allRatings = await client.fetch(aggregateQuery, { productId });
    
    let averageRating = 0;
    if (allRatings.length > 0) {
      const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = sum / allRatings.length;
    }

    return NextResponse.json({ 
      reviews,
      stats: {
        total: allRatings.length,
        average: averageRating
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(req) {
  try {
    const body = await req.json();
    const { productId, rating, title, comment, firebaseUid, email, name, image, variantInfo, images } = body;

    if (!productId || !rating || !firebaseUid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify if the user has purchased the item
    // Note: We use the firebaseUid as userId in orders
    const orderQuery = `*[_type == "order" && userId == $firebaseUid && $productId in items[].product._ref]`;
    const orders = await client.fetch(orderQuery, { firebaseUid, productId });
    const verifiedPurchase = orders.length > 0;

    // 2. Find or Create User Document in Sanity
    let sanityUserId = null;
    
    // First try to find existing user by firebaseUid or email
    const userQuery = `*[_type == "userProfile" && (firebaseUid == $firebaseUid || email == $email)][0]`;
    const existingUser = await client.fetch(userQuery, { firebaseUid, email: email || "" });

    if (existingUser) {
      sanityUserId = existingUser._id;
      // Update name/image if provided but missing in Sanity
      if ((name && !existingUser.displayName) || (image && !existingUser.image)) {
        await client.patch(existingUser._id).set({
          displayName: existingUser.displayName || name,
          image: existingUser.image || image
        }).commit();
      }
    } else {
      // Create user if they don't exist in sanity
      const newUser = await client.create({
        _type: "userProfile",
        displayName: name || "Anonymous User",
        email: email || "",
        firebaseUid: firebaseUid,
        image: image || null,
        createdAt: new Date().toISOString()
      });
      sanityUserId = newUser._id;
    }

    // Process Images
    const imageAssets = [];
    if (images && Array.isArray(images) && images.length > 0) {
      for (const base64Str of images) {
        // Basic validation for base64 image
        if (typeof base64Str === 'string' && base64Str.startsWith('data:image/')) {
          try {
            // Remove the data URI scheme prefix
            const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Upload to Sanity
            const asset = await client.assets.upload('image', buffer);
            
            imageAssets.push({
              _key: Math.random().toString(36).substring(7),
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: asset._id
              }
            });
          } catch (uploadError) {
            console.error("Failed to upload image to Sanity:", uploadError);
            // We continue with other images if one fails
          }
        }
      }
    }

    // 3. Create the Review
    const newReview = await client.create({
      _type: "review",
      product: {
        _type: "reference",
        _ref: productId,
      },
      user: {
        _type: "reference",
        _ref: sanityUserId,
      },
      rating: Number(rating),
      title: title || "",
      comment: comment || "",
      createdAt: new Date().toISOString(),
      helpful: 0,
      isApproved: false, // Hidden until admin approves
      isFeatured: false,
      verifiedPurchase,
      variantInfo: variantInfo || { color: "", size: "" },
      images: imageAssets.length > 0 ? imageAssets : undefined
    });

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });

  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to create review", details: error.message }, { status: 500 });
  }
}
