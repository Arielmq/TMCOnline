import MainLayout from "@/components/layout/MainLayout";
import { CirclePlus, Cloud } from "lucide-react";
import { useState, useEffect } from "react";
import { db, auth } from "@/firebase"; // Importa Firebase
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import Web3 from "web3";
import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import "./cloudMining.css";

const CloudMining = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTerahash, setSelectedTerahash] = useState(1);
  const [confirmedContracts, setConfirmedContracts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blockchain, setBlockchain] = useState("ethereum");

  const terahashOptions = [1, 250, 500, 750, 1000];
  const contractMonths = 50;

  useEffect(() => {
    const fetchUserAndContracts = async () => {
      setLoading(true);
      const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        setUser(currentUser);

        if (currentUser) {
          const contractsQuery = query(
            collection(db, "mining_contracts"),
            where("user_id", "==", currentUser.uid)
          );
          const contractsSnapshot = await getDocs(contractsQuery);
          const contracts = contractsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setConfirmedContracts(contracts || []);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchUserAndContracts();
  }, []);

  const calculateRemainingDays = (purchaseDate) => {
    if (!purchaseDate) return 0;
    const currentDate = new Date("2025-05-20T14:15:00-04:00");
    const endDate = new Date(purchaseDate);
    endDate.setMonth(endDate.getMonth() + contractMonths);
    const diffTime = endDate - currentDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const value = Number(e.target.value);
    if (value >= 1 && value <= 1000) {
      setSelectedTerahash(value);
    } else if (value < 1) {
      setSelectedTerahash(1);
    } else if (value > 1000) {
      setSelectedTerahash(1000);
    }
  };

  const getImage = (terahash) => {
    if (terahash >= 750) {
      return "https://res.cloudinary.com/dllkefj8m/image/upload/v1747763348/miners-empty_qbiray.png";
    } else if (terahash >= 250) {
      return "https://res.cloudinary.com/dllkefj8m/image/upload/v1747763348/tild6132-3532-4634-b362-303064656531__128_immerse_1_ffyfng.png";
    }
    return "https://res.cloudinary.com/dllkefj8m/image/upload/v1747763349/tild3231-3637-4463-a638-333539346434__8_immerse_1_xogphu.png";
  };

  const getDropShadow = (terahash) => {
    if (terahash === 250 || terahash === 750) {
      return "none";
    }
    let shadowSize;
    let color;
    if (terahash < 250) {
      shadowSize = (terahash - 1) * (20 / 249);
      color = "rgba(0, 0, 255, 0.9)";
    } else if (terahash < 750) {
      shadowSize = (terahash - 250) * (30 / 499);
      color = "rgba(0, 255, 0, 0.9)";
    } else {
      shadowSize = (terahash - 750) * (20 / 249);
      color = "rgba(128, 0, 128, 0.9)";
    }
    return `drop-shadow(0 0 ${shadowSize}px ${color})`;
  };

  const handleConfirm = async () => {
    if (!user) {
      alert("Debes iniciar sesión para confirmar un contrato.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/supabase/create-transaction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({ terahash: selectedTerahash, blockchain }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error en create-transaction: ${response.statusText}`);
      }

      const { amount, walletAddress, userId, terahash } = await response.json();

      if (blockchain === "ethereum") {
        if (!window.ethereum) {
          alert("MetaMask no está instalado.");
          return;
        }
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        const tx = await web3.eth.sendTransaction({
          from: accounts[0],
          to: walletAddress,
          value: web3.utils.toWei(amount.toString(), "ether"),
        });

        const verifyResponse = await fetch(
          "http://localhost:3000/api/supabase/verify-transaction",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transactionHash: tx.transactionHash,
              terahash,
              userId,
              blockchain,
            }),
          }
        );

        if (verifyResponse.ok) {
          const contractData = {
            user_id: user.uid,
            terahash: selectedTerahash,
            purchase_date: new Date().toISOString(),
            initial_investment: selectedTerahash * 25,
            monthly_profit: selectedTerahash * 25 * 0.04,
            total_profit: (selectedTerahash * 25 * 0.04 * contractMonths) - (selectedTerahash * 25),
            blockchain,
          };
          await addDoc(collection(db, "mining_contracts"), contractData);

          const contractsQuery = query(
            collection(db, "mining_contracts"),
            where("user_id", "==", user.uid)
          );
          const contractsSnapshot = await getDocs(contractsQuery);
          const contracts = contractsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setConfirmedContracts(contracts || []);
          alert(`Contrato de ${selectedTerahash} TH/s confirmado!`);
          closeModal();
        } else {
          throw new Error("Error al verificar la transacción");
        }
      } else if (blockchain === "solana") {
        if (!window.solana) {
          alert("Phantom no está instalado.");
          return;
        }
        const connection = new Connection("https://api.mainnet-beta.solana.com");
        const publicKey = new PublicKey(walletAddress);
        const fromPublicKey = await window.solana.connect().then((wallet) => wallet.publicKey);
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: fromPublicKey,
            toPubkey: publicKey,
            lamports: Math.round(amount * 1e9),
          })
        );
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPublicKey;

        const signed = await window.solana.signTransaction(transaction);
        const txid = await connection.sendRawTransaction(signed.serialize());

        const verifyResponse = await fetch(
          "http://localhost:3000/api/supabase/verify-transaction",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transactionHash: txid,
              terahash,
              userId,
              blockchain,
            }),
          }
        );

        if (verifyResponse.ok) {
          const contractData = {
            user_id: user.uid,
            terahash: selectedTerahash,
            purchase_date: new Date().toISOString(),
            initial_investment: selectedTerahash * 25,
            monthly_profit: selectedTerahash * 25 * 0.04,
            total_profit: (selectedTerahash * 25 * 0.04 * contractMonths) - (selectedTerahash * 25),
            blockchain,
          };
          await addDoc(collection(db, "mining_contracts"), contractData);

          const contractsQuery = query(
            collection(db, "mining_contracts"),
            where("user_id", "==", user.uid)
          );
          const contractsSnapshot = await getDocs(contractsQuery);
          const contracts = contractsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setConfirmedContracts(contracts || []);
          alert(`Contrato de ${selectedTerahash} TH/s confirmado!`);
          closeModal();
        } else {
          throw new Error("Error al verificar la transacción");
        }
      }
    } catch (error) {
      console.error("Error al confirmar contrato:", error);
      alert("Error al confirmar contrato: " + error.message);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <MainLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Cloud Mining</h1>
          <p className="text-muted-foreground">Administra tus contratos de minería en la nube</p>
        </div>
        {confirmedContracts.length > 0 && (
          <div className="text-sm text-gray-300">
            <strong>Tiempo Restante:</strong>{" "}
            {calculateRemainingDays(confirmedContracts[confirmedContracts.length - 1].purchase_date)} días
          </div>
        )}
      </div>
      <div className="border border-border rounded-lg p-8 flex flex-col items-center justify-center h-[60vh]">
        {confirmedContracts.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6">
            {confirmedContracts.map((contract, index) => (
              <div key={contract.id} className="cloudMining__machine">
                <img
                  src={getImage(contract.terahash)}
                  alt={`Contrato de minería ${index + 1}`}
                  className="cloudMining__image mb-4"
                />
                <div className="text-center">
                  <p className="text-lg font-medium">{contract.terahash} TH/s</p>
                  <p className="text-sm text-gray-400">
                    Adquirido el: {contract.purchase_date.split("T")[0]}
                  </p>
                  <p className="text-sm text-gray-400">
                    Inversión Inicial: ${contract.initial_investment.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400">
                    Beneficio Mensual: ${contract.monthly_profit.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400">
                    Beneficio Total Estimado: ${contract.total_profit.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            <button
              className="cloudMining__button mt-6 flex items-center gap-2 px-4 py-2 bg-bitcoin text-white rounded-lg hover:bg-bitcoin/80 transition"
              onClick={openModal}
            >
              <CirclePlus size={16} /> Agregar
            </button>
          </div>
        ) : (
          <>
            <Cloud className="w-16 h-16 text-bitcoin mb-6" />
            <div className="text-center max-w-md">
              Accede a nuestro servicio de minería en la nube. Contratos hasta 50 meses con un 4% de retorno mensual.
            </div>
            <button
              className="cloudMining__button mt-6 flex items-center gap-2 px-4 py-2 bg-bitcoin text-white rounded-lg hover:bg-bitcoin/80 transition"
              onClick={openModal}
            >
              <CirclePlus size={16} /> Agregar
            </button>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black text-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <img
              src={getImage(selectedTerahash)}
              alt="Contrato de minería"
              className="cloudMining__image"
              style={{ filter: getDropShadow(selectedTerahash) }}
            />
            <h2 className="text-xl font-bold mb-4">Seleccionar Contrato de Minería</h2>
            <p className="text-sm text-gray-300 mb-4">
              Contrato de {contractMonths} meses con un ROI mensual del 4%. Recupera tu inversión en 25 meses.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Cantidad de Terahash: {selectedTerahash} TH/s</label>
              <input
                type="range"
                min="1"
                max="1000"
                step="1"
                value={selectedTerahash}
                onChange={(e) => setSelectedTerahash(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-bitcoin"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                {terahashOptions.map((th) => (
                  <span key={th}>{th}</span>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Ingresar manualmente (1-1000):</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={selectedTerahash}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-bitcoin"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Seleccionar Blockchain:</label>
                <select
                  value={blockchain}
                  onChange={(e) => setBlockchain(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-bitcoin"
                >
                  <option value="ethereum">Ethereum (MetaMask)</option>
                  <option value="solana">Solana (Phantom)</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium">Detalles del Contrato</h3>
              <p className="text-sm">
                <strong>Inversión Inicial:</strong> ${(selectedTerahash * 25).toFixed(2)}
              </p>
              <p className="text-sm">
                <strong>Beneficio Mensual:</strong> ${(selectedTerahash * 25 * 0.04).toFixed(2)}
              </p>
              <p className="text-sm">
                <strong>Beneficio Total Estimado (50 meses):</strong> ${((selectedTerahash * 25 * 0.04 * contractMonths) - (selectedTerahash * 25)).toFixed(2)}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-bitcoin text-white rounded-lg hover:bg-bitcoin/80 transition"
                onClick={handleConfirm}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default CloudMining;