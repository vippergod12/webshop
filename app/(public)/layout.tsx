import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import NavigationProgress from "@/components/NavigationProgress";
import RouteTransition from "@/components/RouteTransition";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <Navbar />
      <RouteTransition>{children}</RouteTransition>
      <Footer />
      <FloatingActions />
    </>
  );
}
