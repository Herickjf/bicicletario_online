import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bird, Snail } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const nav = useNavigate()

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="flex flex-col gap-4 items-center">
        <Snail className="h-20 w-20"/>
        <div className="text-center">

          <h1 className="mb-4 text-4xl font-bold">Oops</h1>
          <p className="mb-4 text-xl text-gray-500">Página não encontrada</p>
          <a href="/" className="text-white underline hover:text-blue-100">
            Retornar ao início
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
