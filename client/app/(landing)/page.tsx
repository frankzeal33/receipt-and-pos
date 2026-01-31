import Hero from "./_components/Hero";
import Features from "@/components/landing/Features";
import Templates from "@/components/landing/Templates";
import WhyChoose from "@/components/landing/WhyChoose";
import Video from "./_components/Video";
import GetStarted from "@/components/landing/GetStarted";


export default function Home() {
  return (
    <main className="pt-[2rem]">
      <Hero/>
      <Video/>
      <Features/>
      <WhyChoose/>
      <Templates/>
      <GetStarted/>
    </main>
  );
}
