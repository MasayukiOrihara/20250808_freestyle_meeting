import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SideMenu } from "@/components/side-menu";
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
