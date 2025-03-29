import Link from "next/link";
import { auth } from "@/auth";
import Image from "next/image";
import { ModeToggle } from "../themes/ModeToggle";
import HomeLogo from "../logos/Home.d";
import LogOut from "./components/LogOut";

export default async function TopNavbar() {
  const session = await auth();
  return (
    <nav className="border-b border-gray-300 shadow-sm bg-background w-full dark:border-gray-600 h-16">
      <div className="flex items-center justify-between p-4">
        <HomeLogo />
        <div className="flex items-center gap-x-5">
          <div>
            {!session?.user ? (
              <Link href={"/sign-in"}>
                <div className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-md">
                  Sign In
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-x-4 text-sm cursor-pointer">
                <div className="p-1 flex items-center justify-center w-10 h-10 bg-muted-foreground text-primary-foreground dark:text-white rounded-full border-2 border-blue-600 file:shadow-sm">
                  <span className="text-xl">{session?.user?.name?.slice(0,1)}</span>
                </div>
                {session?.user?.image && (
                  <Image
                    src={session?.user?.image}
                    alt="user"
                    width={30}
                    height={30}
                    className="rounded-full object-scale-down"
                  />
                )}
                <LogOut/>
              </div>
            )}
          </div>
          
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}