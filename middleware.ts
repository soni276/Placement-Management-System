import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const publicStudent = ["/student/login", "/student/register"];
const publicAdmin = ["/admin/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = (session?.user as { role?: string })?.role ?? (session as { role?: string })?.role;

  if (pathname.startsWith("/student")) {
    if (publicStudent.includes(pathname)) {
      if (role === "student") return NextResponse.redirect(new URL("/student/profile", req.url));
      return NextResponse.next();
    }
    if (!session || role !== "student") {
      return NextResponse.redirect(new URL("/student/login", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (publicAdmin.includes(pathname)) {
      if (role === "admin") return NextResponse.redirect(new URL("/admin/overview", req.url));
      return NextResponse.next();
    }
    if (!session || role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/student/:path*", "/admin/:path*"],
};
