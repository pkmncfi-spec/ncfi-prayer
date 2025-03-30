import Layout from "~/components/layout/sidebar-member";
import { SidebarTrigger } from "~/components/ui/sidebar";
import Image from 'next/image';
import { Separator } from "~/components/ui/separator";

export default function RequestPage() {
  return (
    <Layout> 
      <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
        <div className="fixed w-full bg-white max-w-[598px]">
        {/* Header */}
        <div className="sticky top-3 bg-white w-full z-10 py-3">
          <div className="flex items-center justify-between px-4">
              <SidebarTrigger />
                <div className="w-full h-02 items-center justify-center pr-7">
                  <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto" />
                  <p className="text-sm text-center text-muted-foreground">NCFI Prayer</p>
                </div>
          </div>
        </div>

          <Separator className="my-4" />
          <div className="flex flex-col w-full min-h-screen"></div>
        </div>
      </div>
    </Layout>
  );
}
