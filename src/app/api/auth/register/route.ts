import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { registerSchema } from "@/lib/validations/schemas";
import { signToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  console.log("🚀 Register API called");
  try {
    const body = await request.json();
    console.log("📝 Request body received:", { ...body, password: "[REDACTED]" });
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    console.log("✅ Data validated successfully");
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    console.log("🔍 Existing user check:", existingUser ? "User exists" : "User doesn't exist");
    
    if (existingUser) {
      console.log("❌ User already exists");
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }
    
    // Hash password
    console.log("🔐 Hashing password...");
    const hashedPassword = await hash(validatedData.password, 12);
    console.log("✅ Password hashed successfully");
    
    // Create user
    console.log("👤 Creating user...");
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        points: 100, // Welcome points
      },
    });
    console.log("✅ User created successfully:", user.id);
    
    // Generate token
    console.log("🎫 Generating token...");
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
    });
    console.log("✅ Token generated successfully");
    
    // Return success response (don't include password)
    const { password: _, ...userWithoutPassword } = user;
    
    console.log("🎉 Registration completed successfully");
    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      token,
      user: userWithoutPassword,
    });
    
  } catch (error: any) {
    console.error("💥 Registration error:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
