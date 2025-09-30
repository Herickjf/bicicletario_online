import { DashboardLayout } from "./dashboard-layout";
import { Button } from "../ui/button";
import { Bike, Bug, Ghost, MousePointer2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Label } from "../ui/label";

export default function CantOpen({pageName}: {
    pageName: string
}){
    const nav = useNavigate();

    return (
        <DashboardLayout>
        <div className="min-h-full flex flex-col items-center justify-center gap-4 p-10">
            <Ghost className="mt-20 mb-5 h-40 w-40"/>  
            <Label className="text-2xl text-center">Você precisa se conectar a um bicicletário para ter acesso a {pageName}!</Label>
            <Button 
                variant="outline"
                size="sm"
                onClick={() => nav('/bikeracks')}
                className="flex items-center justify-center p-5 text-md"
            >
                <Bike
                className="mr-2 h-4 w-4"
                />
                Ver Bicicletários
            </Button>
        </div>
      </DashboardLayout>
    )
}