import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export async function GET(){
 const locations=await prisma.pickupLocation.findMany({where:{active:true},orderBy:{name:"asc"}});
 return NextResponse.json({locations});
}
