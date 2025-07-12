import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeaders } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function authenticateUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeaders(authHeader || "");
    
    if (!token) {
      return { success: false, error: "No token provided" };
    }
    
    const decoded = verifyToken(token);
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, active: true },
    });
    
    if (!user || !user.active) {
      return { success: false, error: "User not found or inactive" };
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: "Invalid token" };
  }
}

export function requireAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const auth = await authenticateUser(request);
    
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: 401 }
      );
    }
    
    // Add user to request object
    (request as AuthenticatedRequest).user = auth.user;
    
    return handler(request as AuthenticatedRequest);
  };
}

export function requireRole(roles: string[]) {
  return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return async (request: NextRequest) => {
      const auth = await authenticateUser(request);
      
      if (!auth.success) {
        return NextResponse.json(
          { error: auth.error || "Authentication required" },
          { status: 401 }
        );
      }
      
      if (!roles.includes(auth.user!.role)) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      
      // Add user to request object
      (request as AuthenticatedRequest).user = auth.user;
      
      return handler(request as AuthenticatedRequest);
    };
  };
}
