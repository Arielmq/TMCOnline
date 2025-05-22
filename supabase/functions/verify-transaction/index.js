import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";
import Web3 from "https://esm.sh/web3@1.7.4";
import { Connection, PublicKey } from "https://esm.sh/@solana/web3.js@1.66.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactionHash, terahash, userId, blockchain } = await req.json();

    if (!transactionHash || !terahash || !userId || !blockchain) {
      throw new Error("Faltan parámetros: transactionHash, terahash, userId o blockchain");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } }
    );

    // Verificar transacción
    let isValid = false;
    const walletAddress = Deno.env.get(blockchain === "ethereum" ? "ETH_WALLET_ADDRESS" : "SOL_WALLET_ADDRESS") || "";
    const costUSD = terahash * 25;

    if (blockchain === "ethereum") {
      const web3 = new Web3(Deno.env.get("ETH_NODE_URL") || "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID");
      const tx = await web3.eth.getTransactionReceipt(transactionHash);
      if (tx && tx.to.toLowerCase() === walletAddress.toLowerCase() && tx.status) {
        const txDetails = await web3.eth.getTransaction(transactionHash);
        const amountETH = web3.utils.fromWei(txDetails.value, "ether");
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
        );
        const priceData = await response.json();
        const ethPrice = priceData.ethereum.usd;
        const amountUSD = parseFloat(amountETH) * ethPrice;
        isValid = amountUSD >= costUSD * 0.95; // Tolerancia del 5%
      }
    } else if (blockchain === "solana") {
      const connection = new Connection(Deno.env.get("SOLANA_NODE_URL") || "https://api.mainnet-beta.solana.com");
      const tx = await connection.getTransaction(transactionHash, { commitment: "confirmed" });
      if (tx && tx.transaction.message.accountKeys.some(key => key.toBase58() === walletAddress)) {
        const amountSOL = tx.meta.postBalances[tx.transaction.message.accountKeys.findIndex(key => key.toBase58() === walletAddress)] / 1e9;
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`
        );
        const priceData = await response.json();
        const solPrice = priceData.solana.usd;
        const amountUSD = amountSOL * solPrice;
        isValid = amountUSD >= costUSD * 0.95;
      }
    }

    if (!isValid) {
      throw new Error("Transacción no válida o insuficiente");
    }

    // Guardar contrato en Supabase
    const { error } = await supabaseAdmin
      .from("mining_contracts")
      .insert({
        user_id: userId,
        terahash: parseInt(terahash),
        machine_count: 1,
        purchase_date: new Date().toISOString(),
        transaction_hash: transactionHash,
      });

    if (error) {
      throw new Error("Error al guardar contrato: " + error.message);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error en verify-transaction:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});