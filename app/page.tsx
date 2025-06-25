import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SideMenu } from "@/components/common/side-menu";
import { MainPage } from "@/components/main-page";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <SideMenu />
        <MainPage />
      </div>
      <Footer />
    </div>
  );
}
