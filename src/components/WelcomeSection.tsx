
import { Smile } from "lucide-react";

const WelcomeSection = () => {
  return (
    <>
      {/* Title section */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-2xl p-6 text-center text-white mb-8">
        <h1 className="text-2xl font-bold">Selamat Datang di</h1>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-pulse mb-4">
          NiceNingrum
        </h2>
        <div className="flex items-center justify-center gap-2">
          <p className="text-gray-600 text-lg">
            Silakan Pilih Menu Favoritmu
          </p>
          <Smile className="w-6 h-6 text-yellow-500" />
        </div>
      </div>
    </>
  );
};

export default WelcomeSection;
