import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { getFunctions, httpsCallable } from 'firebase/functions';
import "./subscription.css"
const Subscription = () => {
  const { user, membership } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { publicKey, signTransaction, connected, connect, wallet, select } = useWallet();

  // Solana configuration
  const SOLANA_RPC_URL = 'https://api.devnet.solana.com'; // Change to mainnet-beta for production
  const COMPANY_WALLET = new PublicKey('8Bya2i4DVXwWpRCJtG2bJYkzvTG588xcdT6eqcyN5oTV'); // Replace with your actual Solana address
  const PREMIUM_PRICE_SOL = 0.1; // 0.1 SOL for premium plan
  const ENTERPRISE_PRICE_SOL = 0.3; // 0.3 SOL for enterprise plan

  const connection = useMemo(() => new Connection(SOLANA_RPC_URL, 'confirmed'), []);

  // Debugging: Log membership, connection, wallet, and window.solana
  useEffect(() => {
    console.log('Membership:', membership);
    console.log('Wallet connected:', connected);
    console.log('Selected wallet:', wallet);
    console.log('window.solana:', window.solana);
  }, [membership, connected, wallet]);

  const handleConnectWallet = async () => {
    try {
      // Check if Phantom is installed
      if (!window.solana || !window.solana.isPhantom) {
        toast.error('Phantom not detected. Please install the Phantom extension in your browser.');
        window.open('https://phantom.app/', '_blank');
        return;
      }

      // Select Phantom adapter if not selected
      if (!wallet || wallet.adapter.name !== 'Phantom') {
        const phantomAdapter = new PhantomWalletAdapter({ network: WalletAdapterNetwork.Devnet });
        select(phantomAdapter.name);
        // Wait a moment to ensure the adapter is ready
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Check adapter state before connecting
      if (wallet?.adapter?.readyState !== 'Installed') {
        toast.error('Phantom wallet is not ready. Make sure the extension is active and unlocked.');
        return;
      }

      // Try to connect
      await connect();
      toast.success('Phantom wallet connected successfully');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.name === 'WalletNotReadyError') {
        toast.error('Phantom is not ready. Make sure the extension is active and unlocked.');
      } else if (error.name === 'WalletNotSelectedError') {
        toast.error('No wallet selected. Please try again.');
      } else {
        toast.error(`Error connecting Phantom: ${error.message}`);
      }
    }
  };


  const handlePlanSelection = async (plan) => {
    if (!user) {
      toast.error('You must be logged in to select a plan');
      navigate('/auth');
      return;
    }

    if (!connected || !publicKey) {
      toast.error('Please connect your Phantom wallet');
      handleConnectWallet(); // Attempt to connect if not connected
      return;
    }

    if (membership?.plan === plan && plan !== 'free') {
      toast.info('You already have this plan active');
      return;
    }

    setLoading(true);

    try {
      // Create Solana transaction
      const amount = plan === 'premium' ? PREMIUM_PRICE_SOL : ENTERPRISE_PRICE_SOL;
      const lamports = Math.round(amount * 1_000_000_000); // Convert SOL to lamports

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: COMPANY_WALLET,
          lamports,
        })
      );

      // Get latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign transaction with Phantom
      const signedTransaction = await signTransaction(transaction);

      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      // Confirm transaction
      await connection.confirmTransaction(signature, 'confirmed');

      // Call Cloud Function to verify payment
      const functions = getFunctions();
      const verifyPayment = httpsCallable(functions, 'verifyPayment');
      const result = await verifyPayment({ transactionSignature: signature, plan });

      if (result.data.success) {
        toast.success('Payment successful. Your membership has been activated.');
        navigate('/app');
      } else {
        toast.error('Error verifying payment.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">Choose the plan that best fits your needs</p>
      </div>

      {/* Wallet connection button */}
      {!connected && (
        <div className="mb-6 p-4 bg-grey-50 border border-border rounded-lg">
          <p className="text-muted-foreground mb-2">
            You need to connect your Phantom wallet to select a paid plan.
          </p>
          <Button  onClick={handleConnectWallet} className="bg-blue-600 hover:bg-blue-700 phantomButton">
        {"  "}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Free Plan */}
        <Card className="p-6 border-2 border-border bg-grey-50">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Free Plan</h3>
            <p className="text-3xl font-bold mt-2">0 SOL<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Basic dashboard access</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Monitor up to 3 miners</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Basic alerts</span>
            </li>
          </ul>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handlePlanSelection('free')}
            disabled={loading || membership?.plan === 'free'}
          >
            {membership?.plan === 'free' ? 'Current Plan' : 'Select Plan'}
          </Button>
        </Card>

        {/* Premium Plan */}
        <Card className="p-6 border-2 border-bitcoin bg-grey-50 relative">
          <div className="absolute -top-3 right-4 bg-bitcoin text-black text-xs font-bold py-1 px-3 rounded-full">Recommended</div>
          <div className="mb-4">
            <h3 className="text-xl font-bold">Premium Plan</h3>
            <p className="text-3xl font-bold mt-2">{PREMIUM_PRICE_SOL} SOL<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Full dashboard access</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Unlimited miner monitoring</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Advanced real-time alerts</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Performance analysis</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Priority support</span>
            </li>
          </ul>
          <Button
            className="w-full bg-bitcoin hover:bg-bitcoin/90 flex items-center justify-center gap-2"
            onClick={() => handlePlanSelection('premium')}
            disabled={loading}
          >
            {loading ? 'Processing...' : (
              <>
                <Zap className="h-4 w-4" />
                {membership?.plan === 'premium' ? 'Current Plan' : 'Select Plan'}
              </>
            )}
          </Button>
        </Card>

        {/* Enterprise Plan */}
        <Card className="p-6 border-2 border-border bg-grey-50">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Enterprise Plan</h3>
            <p className="text-3xl font-bold mt-2">{ENTERPRISE_PRICE_SOL} SOL<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Everything in Premium Plan</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Dedicated API</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Multi-location management</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>24/7 support</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Full customization</span>
            </li>
          </ul>
          <Button
            className="w-full bg-bitcoin hover:bg-bitcoin/90 flex items-center justify-center gap-2"
            onClick={() => handlePlanSelection('enterprise')}
            disabled={loading}
          >
            {loading ? 'Processing...' : (
              <>
                <Zap className="h-4 w-4" />
                {membership?.plan === 'enterprise' ? 'Current Plan' : 'Select Plan'}
              </>
            )}
          </Button>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-grey-50 border border-border rounded-lg">
        <h3 className="text-lg font-medium mb-2">Why subscribe?</h3>
        <p className="text-muted-foreground">
          With a premium subscription, you get access to advanced monitoring and analytics tools
          that help you maximize the profitability of your Bitcoin mining. Our real-time alerts
          help you react instantly to any issue.
        </p>
      </div>
    </MainLayout>
  );
};

export default Subscription;