import Image from "next/image"
import { ReactElement } from "react"
import Link from "next/link";

export default function OnBoarding({formComponent, image}: {formComponent: ReactElement; image: string}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex gap-2 max-w-sm w-full items-center mx-auto">
          <Link href={'/'} className="flex items-center gap-2 font-medium">
              <div>
                <div className="flex items-center gap-1">
                  <Image src={"/logo.png"} width={40} height={40} alt="RIPE"/>
                  <h2 className="font-bold text-3xl font-mono">RI<span className="text-green">PE</span></h2>
                </div>
              </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            {formComponent}
          </div>
        </div>
      </div>
      <div className="hidden lg:flex bg-green items-center justify-center">
        <Image
          width={500}
          height={500}
          src={image}
          alt="Receipt"
          unoptimized
        />
      </div>
    </div>
  )
}
