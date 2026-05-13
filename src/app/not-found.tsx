import Link from "next/link";
import Ballpit from "@/components/shared/Ballpit";
import SplashCursor from "@/components/shared/SplashCursor";

export default function NotFound() {
  return (
    <div
      className="relative w-full overflow-hidden bg-void flex items-center justify-center h-dvh"
    >
      <SplashCursor 
        COLOR="#4f46e5"
        RAINBOW_MODE={false}
      />
      
      <div className="absolute inset-0 z-0">
        <Ballpit
          count={100}
          gravity={0.3}
          friction={0.9975}
          wallBounce={0.95}
          followCursor={true}
          colors={[0x6366f1, 0x4f46e5, 0x818cf8]}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center p-6 bg-void/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl sm:p-8">
        <h1 className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 via-purple-400 to-indigo-600 drop-shadow-lg tracking-tighter sm:text-8xl md:text-9xl">
          404
        </h1>
        <h2 className="text-xl font-medium text-white/90 mt-4 tracking-tight sm:text-2xl md:text-3xl">
          Página não encontrada
        </h2>
        <p className="text-white/60 mt-4 max-w-md text-base sm:text-lg">
          A URL que você tentou acessar não existe ou foi movida. 
          Brinque com a gravidade enquanto estiver por aqui, ou volte para a segurança.
        </p>

        <Link
          href="/"
          className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-full font-medium transition-all duration-200 hover:bg-indigo-500 active:scale-95 shadow-lg hover:shadow-indigo-500/50 sm:px-8 sm:py-4"
        >
          Voltar para Home
        </Link>
      </div>
    </div>
  );
}
