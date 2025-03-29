"use server"
import { signIn, signOut } from "@/auth";
import { revalidatePath } from "next/cache";

export async function logIn(provider: string){
    await signIn(provider, {redirectTo: "/"});
    revalidatePath('/');
}

export async function logOut(){
    await signOut({redirectTo: '/'});
    revalidatePath('/');
}

export async function doCredentialLogin(values:credentialLogin){
    try {
        const response = await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
        });
        return response;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}