import { prisma } from "@/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest)=>{
    try {
        const {email, password, confirmPassword}= await req.json();

        console.log(email, password, confirmPassword);
        

        if(!email || !password || !confirmPassword){
            return NextResponse.json({message: "All fields are required", success: false, error:true}, {status: 400})
        }

        if(password !== confirmPassword){
            return NextResponse.json({message: "Password and conform password should be same", success: false, error: true}, {status: 400});
        }

        const findUser = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if(!findUser){
            return NextResponse.json({message: "Invalid User", error: true, success:false}, {status: 400})
        }

        if(findUser.forgotVerify === false){
            return NextResponse.json({message: "Invalid User", error: true, success:false}, {status: 400})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await prisma.user.update({
            where:{
                id: findUser.id
            },
            data: {
                password: hashedPassword,
                forgotVerify: false
            }
        })

        return NextResponse.json({message: "Password update successfully", success: true, error: false}, {status: 200})
        
    } catch (error) {
        console.log("[forgot-password > create-new-password]", error);
        return new NextResponse("Internal Server Error", {status: 500})
    }
}