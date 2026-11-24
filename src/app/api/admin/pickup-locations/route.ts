import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
export const dynamic="force-dynamic";
export async function GET(){const user=await getCurrentUser();if(!user||user.role!=="ADMIN")return NextResponse.json({error:"Недостаточно прав"},{status:403});return NextResponse.json({locations:await prisma.pickupLocation.findMany({orderBy:{createdAt:"desc"}})});}
export async function POST(req:NextRequest){const user=await getCurrentUser();if(!user||user.role!=="ADMIN")return NextResponse.json({error:"Недостаточно прав"},{status:403});const b=await req.json();if(!b.name?.trim()||!b.address?.trim()||!b.hours?.trim())return NextResponse.json({error:"Укажите название, адрес и график работы"},{status:400});const location=await prisma.pickupLocation.create({data:{name:b.name.trim(),address:b.address.trim(),hours:b.hours.trim(),description:b.description?.trim()||null,contact:b.contact?.trim()||null,lat:Number.isFinite(b.lat)?b.lat:null,lng:Number.isFinite(b.lng)?b.lng:null,active:b.active??true}});return NextResponse.json({location},{status:201});}
