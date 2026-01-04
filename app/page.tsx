"use client";
import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Home() {
  const [input, setInput] = useState("");
  const [pesan, setPesan] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Ambil API Key dari .env.local
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

  // 2. Inisialisasi genAI (Pastikan nama variabelnya sama)
  const genAI = new GoogleGenerativeAI(apiKey);

  // 3. Inisialisasi model (Gunakan format ini untuk menghindari error 404)
  const model = genAI.getGenerativeModel(
  { model: "gemini-1.5-flash" },
  { apiVersion: "v1" } // Tambahkan ini secara spesifik
  );

  // Auto scroll ke bawah
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [pesan]);

  const kirimChat = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    setPesan((prev) => [...prev, userMessage]);
    const promptSaatIni = input;
    setInput("");
    setLoading(true);

    try {
      const result = await model.generateContent(promptSaatIni);
      const response = await result.response;
      const aiText = response.text();
      
      setPesan((prev) => [...prev, { role: "ai", text: aiText }]);
    } catch (error: any) {
      console.error("Error Detail:", error);
      setPesan((prev) => [...prev, { role: "ai", text: "Terjadi kesalahan koneksi ke Sky AI." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-black text-white">
      <div className="w-full max-w-3xl flex flex-col h-[80vh]">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Sky AI Web Interface
        </h1>

        <div 
          ref={scrollRef}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 overflow-y-auto mb-4 flex flex-col gap-4"
        >
          {pesan.map((p, i) => (
            <div key={i} className={`flex ${p.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`p-3 rounded-xl max-w-[80%] ${p.role === "user" ? "bg-blue-600" : "bg-zinc-800"}`}>
                {p.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-blue-400 animate-pulse">Sky sedang mengetik...</div>}
        </div>

        <div className="flex gap-2">
          <input 
            className="flex-1 p-3 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && kirimChat()}
            placeholder="Ketik pesan..."
          />
          <button 
            onClick={kirimChat}
            className="bg-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-500 transition-colors"
          >
            Kirim
          </button>
        </div>
      </div>
    </main>
  );
}