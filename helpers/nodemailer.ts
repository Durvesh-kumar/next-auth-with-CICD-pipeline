import { prisma } from "@/prisma";
import nodemailer from "nodemailer";


export default async function sendEmail({email, emailType, userId}:{email:string, emailType: string, userId:string}){
   
   try {
      const genOTP = ()=>{
         const chers = "123456789";
         const leng = chers.length;

         let otp = "";

         for(let i=0; i < 6; i++){
            otp += chers[Math.floor(Math.random()*leng)];
         }
         return otp;
      }

      const otp = genOTP();

      console.log(otp);
      

      if(emailType === "verify-email"){
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                verifyOtp: otp,
                verifyOtpExpiry: Date.now() + 3600000
            }
        })
      } else if(emailType === "forgot-password"){
        await prisma.user.update({
            where: {
                id: userId
            },
             data: {
                forgotOtp: otp,
                forgotOtpExpiry: Date.now() + 3600000
             }
        })
      }



     // Looking at the send email in production? Check out our Email API/SMTP product!

     const transporter = nodemailer.createTransport({
        port: 587,
        secure: false,
        service: "gmail",
        debug: true,
        logger: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
        
     });

     const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: emailType === "verify-email" ? "Verify your email" : "Reset your password",
        html: `<div>
        <center>
          <h1>${emailType === "verify-email" ? "VERIFY YOUR EMAIL" : "RESET YOUR PASSWORD"}</h1>
        </center>
        <h2>Action Required: <span>One-Time Verification Code</span> </h3>
        <p>You are receiving this email becouse a request was made for a one-time code that can be used authentication.</p>
        <p>Plesee enter the following code for verification: </p>
        <center>
           <h3>${otp}</h3>
        </center>
           
        <p> If you did not request this change, please change your password or use the chat in the DK-Store user interface to contact us.</p>
        </div>`
    };

    const mailresponse = await transporter.sendMail(mailOptions);

        return mailresponse;
      
   } catch (error:any) {
      console.log("[sendEmail]", error);
      throw new Error(error)
   }
}