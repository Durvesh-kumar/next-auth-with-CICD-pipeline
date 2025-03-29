import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export const POST = async(req:NextRequest)=>{
    try {

        const {values, userEmail} = await req.json();

        // const otp = Number(values.toString().replaceAll(",", ""));

        const email = decodeURIComponent(userEmail);

        const findUser = await prisma.user.findUnique({
            where: {
                email
            }
        })
        
        if(!findUser){
            return NextResponse.json({message:"Invalid user", success: false, error:true}, {status: 401});
        }

        const otpExpiry = findUser.verifyOtpExpiry ? new Date(findUser.verifyOtpExpiry) > new Date() : false;

        if(!otpExpiry){
            return NextResponse.json({message: "OTP is expired", error:true, success:false}, {status: 402});
        }

         const compare = Number(findUser.verifyOtp) === Number(values.pin)

        if(!compare){
            return NextResponse.json({message:"Invalid OTP", success: false, error:true}, {status: 403});
        }

        await prisma.user.update({
            where: {
                email
            },
            data:{
               isVerified: true,
               verifyOtp: undefined,
               verifyOtpExpiry: undefined
            }
        });

        return NextResponse.json({ message: "OTP verify successfully", error: false, success: true }, { status: 200 })
    } catch (error) {
        console.log("[verify-email_POST", error);
        return new NextResponse("Internal Server Error", {status: 500})
    }
}