
import MainLayout from "@/components/layout/MainLayout";

const HowItWorks = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">How It Works</h1>
        <p className="text-muted-foreground">Learn about TMC Watch</p>
      </div>
      <div className="border border-border rounded-lg p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-medium mb-2">How It Works</h2>
          <p className="text-muted-foreground">This page will explain how TMC Watch platform works and its features.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default HowItWorks;
