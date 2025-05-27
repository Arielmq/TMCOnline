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
    // Verificar si Phantom está instalado
    if (!window.solana || !window.solana.isPhantom) {
      toast.error('Phantom no detectado. Instala la extensión de Phantom en tu navegador.');
      window.open('https://phantom.app/', '_blank');
      return;
    }

    // Seleccionar el adaptador de Phantom si no está seleccionado
    if (!wallet || wallet.adapter.name !== 'Phantom') {
      const phantomAdapter = new PhantomWalletAdapter({ network: WalletAdapterNetwork.Devnet });
      select(phantomAdapter.name);
      // Esperar un breve momento para asegurar que el adaptador esté listo
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Verificar el estado del adaptador antes de conectar
    if (wallet?.adapter?.readyState !== 'Installed') {
      toast.error('El monedero Phantom no está listo. Asegúrate de que la extensión esté activa y desbloqueada.');
      return;
    }

    // Intentar conectar
    await connect();
    toast.success('Wallet Phantom conectado exitosamente');
  } catch (error) {
    console.error('Error al conectar el wallet:', error);
    if (error.name === 'WalletNotReadyError') {
      toast.error('Phantom no está listo. Asegúrate de que la extensión esté activa y desbloqueada.');
    } else if (error.name === 'WalletNotSelectedError') {
      toast.error('No se ha seleccionado un monedero. Por favor, intenta de nuevo.');
    } else {
      toast.error(`Error al conectar Phantom: ${error.message}`);
    }
  }
};


  const handlePlanSelection = async (plan) => {
    if (!user) {
      toast.error('Debes iniciar sesión para seleccionar un plan');
      navigate('/auth');
      return;
    }

    if (!connected || !publicKey) {
      toast.error('Por favor, conecta tu wallet de Phantom');
      handleConnectWallet(); // Attempt to connect if not connected
      return;
    }

    if (membership?.plan === plan && plan !== 'free') {
      toast.info('Ya tienes este plan activo');
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
        toast.success('Pago exitoso. Tu membresía ha sido activada.');
        navigate('/app');
      } else {
        toast.error('Error al verificar el pago.');
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Suscripción</h1>
        <p className="text-muted-foreground">Elige el plan que mejor se adapte a tus necesidades</p>
      </div>

      {/* Wallet connection button */}
      {!connected && (
        <div className="mb-6 p-4 bg-grey-50 border border-border rounded-lg">
          <p className="text-muted-foreground mb-2">
            Necesitas conectar tu wallet de Phantom para seleccionar un plan de pago.
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
            <h3 className="text-xl font-bold">Plan Gratuito</h3>
            <p className="text-3xl font-bold mt-2">0 SOL<span className="text-sm font-normal text-muted-foreground">/mes</span></p>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Acceso básico al panel</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Monitoreo de hasta 3 mineros</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Alertas básicas</span>
            </li>
          </ul>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handlePlanSelection('free')}
            disabled={loading || membership?.plan === 'free'}
          >
            {membership?.plan === 'free' ? 'Plan Actual' : 'Seleccionar Plan'}
          </Button>
        </Card>

        {/* Premium Plan */}
        <Card className="p-6 border-2 border-bitcoin bg-grey-50 relative">
          <div className="absolute -top-3 right-4 bg-bitcoin text-black text-xs font-bold py-1 px-3 rounded-full">Recomendado</div>
          <div className="mb-4">
            <h3 className="text-xl font-bold">Plan Premium</h3>
            <p className="text-3xl font-bold mt-2">{PREMIUM_PRICE_SOL} SOL<span className="text-sm font-normal text-muted-foreground">/mes</span></p>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Acceso completo al panel</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Monitoreo ilimitado de mineros</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Alertas avanzadas en tiempo real</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Análisis de rendimiento</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Soporte prioritario</span>
            </li>
          </ul>
          <Button
            className="w-full bg-bitcoin hover:bg-bitcoin/90 flex items-center justify-center gap-2"
            onClick={() => handlePlanSelection('premium')}
            disabled={loading}
          >
            {loading ? 'Procesando...' : (
              <>
                <Zap className="h-4 w-4" />
                {membership?.plan === 'premium' ? 'Plan Actual' : 'Seleccionar Plan'}
              </>
            )}
          </Button>
        </Card>

        {/* Enterprise Plan */}
        <Card className="p-6 border-2 border-border bg-grey-50">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Plan Empresarial</h3>
            <p className="text-3xl font-bold mt-2">{ENTERPRISE_PRICE_SOL} SOL<span className="text-sm font-normal text-muted-foreground">/mes</span></p>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Todo lo del Plan Premium</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>API dedicada</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Gestión multiubicación</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Soporte 24/7</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Personalización completa</span>
            </li>
          </ul>
          <Button
            className="w-full bg-bitcoin hover:bg-bitcoin/90 flex items-center justify-center gap-2"
            onClick={() => handlePlanSelection('enterprise')}
            disabled={loading}
          >
            {loading ? 'Procesando...' : (
              <>
                <Zap className="h-4 w-4" />
                {membership?.plan === 'enterprise' ? 'Plan Actual' : 'Seleccionar Plan'}
              </>
            )}
          </Button>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-grey-50 border border-border rounded-lg">
        <h3 className="text-lg font-medium mb-2">¿Por qué suscribirse?</h3>
        <p className="text-muted-foreground">
          Con una suscripción premium, obtienes acceso a herramientas avanzadas de monitoreo y análisis
          que te ayudarán a maximizar la rentabilidad de tu minería de Bitcoin. Nuestras alertas en tiempo real
          te ayudan a reaccionar al instante ante cualquier problema.
        </p>
      </div>
    </MainLayout>
  );
};

export default Subscription;