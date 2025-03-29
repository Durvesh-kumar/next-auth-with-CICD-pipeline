import sendEmail from "@/helpers/nodemailer";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req:NextRequest)=> {
    try {
        const {email} = await req.json();

        console.log(email);
        

        if(!email){
            return NextResponse.json({message: "All fields are required", success: false, error: true}, {status: 400})
        }

        const findUser = await prisma.user.findUnique({
            where:{
                email
            }
        });

        if(!findUser){
            return NextResponse.json({message: "User not found", error:true, success:false}, {status: 400})
        }

        if(findUser.isVerified === false){
            return NextResponse.json({message: "User not found", success:false, error:true})
        }

        sendEmail({email, emailType: "forgot-password", userId: findUser.id});

        return NextResponse.json({message: "User verify successfully", error: false, success:true}, {status: 200})
    } catch (error) {
        console.log("[forgot-password > verify-email_POST]", error);
        return new NextResponse("Internal Server Error", {status: 500})
    }
}