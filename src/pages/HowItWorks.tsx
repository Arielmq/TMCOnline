
import MainLayout from "@/components/layout/MainLayout";

const HowItWorks = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">How It Works</h1>
        <p className="text-muted-foreground">Learn about Hashira AI</p>
      </div>
    
      <div className="bg-white/10 p-8 rounded-lg max-w-2xl mx-auto">
   
      <div className="space-y-6 text-white">
        <div>
          <h3 className="text-2xl font-semibold text-orange-400 mb-2">1. Standard Miner Setup</h3>
          <p>
            You begin by configuring each of your mining machines exactly as you normally would—
            installing firmware, joining them to your local network, and pointing them at your chosen
            mining pool.
          </p>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-orange-400 mb-2">2. Centralized IP List</h3>
          <p>
            Once your miners are running, simply collect their local IP addresses and paste them
            into our program. This single, consolidated list lets our backend talk to every machine
            in one go—no more jumping between dozens of web interfaces.
          </p>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-orange-400 mb-2">3. Secure Remote Access</h3>
          <p>
            To monitor your farm from anywhere (even outside your LAN), we create a secure tunnel.
            We walked through how to set up tools like ngrok, LocalTunnel or Cloudflare Tunnel so
            that your server—running on your local network—can safely expose its data feed to the
            outside world.
          </p>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-orange-400 mb-2">4. Instant Dashboard Refresh</h3>
          <p>
            After opening the tunnel, just reload the dashboard UI. Within seconds, you’ll see
            real-time temperatures, hash rates, fan speeds, error statuses and more—live metrics
            for every single miner in your fleet.
          </p>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-orange-400 mb-2">5. Subscription & Configuration Guide</h3>
          <p>
            When you subscribe, we’ll send you a step-by-step configuration guide tailored to your
            setup. It covers everything from securing your tunnel to optimizing update intervals,
            so you can get the most out of your mining operation without any guesswork.
          </p>
        </div>
      </div>
    </div>
    </MainLayout>
  );
};

export default HowItWorks;
