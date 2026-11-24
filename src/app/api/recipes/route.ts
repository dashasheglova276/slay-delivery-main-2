export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getRecipes } from "@/lib/data-service";

export async function GET() {
  const recipes = await getRecipes();
  return NextResponse.json({ recipes });
}
