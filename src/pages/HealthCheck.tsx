
import MainLayout from "@/components/layout/MainLayout";
import MinerHealthCheck from "@/components/health/MinerHealthCheck";

const HealthCheck = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Health Check</h1>
        <p className="text-muted-foreground">Diagnose your mining hardware</p>
      </div>
      
      <MinerHealthCheck />
    </MainLayout>
  );
};

export default HealthCheck;
