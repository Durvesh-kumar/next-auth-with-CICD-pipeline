import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import sendEmail from "@/helpers/nodemailer";
import { prisma } from "@/prisma";

export const POST = async (req: NextRequest)=> {
    
    try {
        const {name, email, password, conformPassword} = await req.json();

        if(!name || !email || !password || !conformPassword){
            return NextResponse.json({message: "All fields are required", success: false, error: true}, {status: 400});
        }

        if(password !== conformPassword){
            return NextResponse.json({message: "Password and conform password should be same", success: false, error: true}, {status: 400});
        }

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if(user?.isProvider === true){
            return NextResponse.json({message: "User already registered with Facebook and Google", success: false, error: true}, {status: 400});
        }

        if(user?.isVerified === true){
            return NextResponse.json({message: "User already registered", success: false, error: true}, {status: 400});
        }
        
        if(user?.isVerified === false){
            await prisma.user.delete({
                where: {
                    id: user.id
                }
            })
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        const createUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                isVerified: false,
                isProvider: false
            }
        })

        sendEmail({email, emailType: "verify-email", userId: createUser.id});

        return NextResponse.json({message: "User registered successfully", success: true, error: false});
    } catch (error) {
        console.log(error);
        return new NextResponse("Internal Server Error", { status: 500});
    }
}