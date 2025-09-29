import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './auth-context';
import { UserRole } from '@/types';

export interface BikeRackType {
    id: number;
    name: string;
    address: {
        street: string
        number: number
        zip_code: string
        city: string
        state: string
    } | null;
    role: UserRole;
};

interface BikeracksContextType {
    currentBikeRack: BikeRackType | undefined;
    userBikeRacks: BikeRackType[];
    createBikeRack: (bikeRack: BikeRackType) => Promise<boolean>;
    selectBikeRack: (br_id: number) => void;
    bikeRackLoading: boolean;
    refetch: () => void;
};

const BikeRackContext = createContext<BikeracksContextType | undefined>(undefined);

export function BikeRackProvider({children} : {children: React.ReactNode}) {
    const { user, changeUserRole } = useAuth();
    const [bikeRackLoading, setBikeRackLoading] = useState(true);

    const [currentBikeRack, setCurrentBikeRack] = useState<BikeRackType | undefined>(undefined);
    const [userBikeRacks, setUserBikeRacks] = useState<BikeRackType[]>([]);
    const [refetchCount, setRefetchCount] = useState(0);

    const refetch = () => {
        setRefetchCount(prev => prev + 1);
    }

    useEffect(() => {
        if (!user || !user.user_id) {
            setBikeRackLoading(false);
            return;
        }

        setBikeRackLoading(true);

        fetch(`http://localhost:4000/user/listBikeracks/${user.user_id}`)
        // fetch(`http://localhost:4000/user/listBikeracks/2`)
        .then(res => res.json())
        .then(data => {
            setUserBikeRacks(data.map(bikerack => {
                return {
                    id: bikerack.bike_rack_id,
                    name: bikerack.name,
                    address: bikerack.street ? {
                        street: bikerack.street,
                        number: bikerack.num,
                        zip_code: bikerack.zip_code,
                        city: bikerack.city,
                        state: bikerack.state
                    } : null,
                    role: bikerack.role
                }
            }))
        })
        .catch(err => {
            console.error("Erro ao buscar Bicicletários do Usuário",err)
            throw new Error(err);
        }).finally(() => {
            setBikeRackLoading(false)
        })
    }, [user?.user_id, refetchCount])

    const selectBikeRack = async (index: number) => {
        setBikeRackLoading(true);
        
        const selectedBikeRack = userBikeRacks[index];
        
        if (!selectedBikeRack) {
            setBikeRackLoading(false);
            return;
        }

        // Atualiza o bike rack selecionado
        setCurrentBikeRack(selectedBikeRack);

        try {
            // Busca a role do usuário no bike rack selecionado
            const res = await fetch(`http://localhost:4000/user/role/${selectedBikeRack.id}/${user.user_id}`);
            
            if (!res.ok) {
                throw new Error('Erro ao buscar role');
            }

            const data = await res.json();
            
            if (data.role) {
                changeUserRole(data.role as UserRole);
            } else {
                changeUserRole("customer");
            }
        } catch (err) {
            console.log("Não foi possível buscar a Role:", err);
            changeUserRole("customer"); // Fallback
        } finally {
            setBikeRackLoading(false);
        }
    };

    const createBikeRack = async (bikerack: BikeRackType): Promise<boolean> => {
        setBikeRackLoading(true);
        try{
            const res = await fetch('http://localhost:4000/bikerack/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: bikerack.name,
                    image: "",
                    address: {
                        street: bikerack.address.street,
                        num: bikerack.address.number,
                        zip_code:bikerack.address.zip_code,
                        city: bikerack.address.city,
                        state: bikerack.address.state
                    }
                })
            });

            if(!res.ok){
                throw new Error('Erro ao criar biciletário!');
            }
            const data = await res.json()

            console.log(data)

            // vincular esse bikerack criado ao usuário que solicitou:
            try {
                fetch(`http://localhost:4000/user/createRole`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        id_user: user.user_id,
                        id_bikerack: data["bike_rack_id"],
                        role: "owner"
                    })
                })
                if(!res.ok){
                    console.log("Erro ao anexar o bicicletário criado ao usuário que criou!")
                    return false;
                }

            }catch(err){
                console.log(err)
                console.log("Erro na atribuição de função do usuário no bicicletário:");
                setBikeRackLoading(false);
                return false;

            }

            // atualiza lista de bikeracks desse usuário
            refetch();
            changeUserRole('owner');

            for(const br of userBikeRacks){
                if(br.id === data["bike_rack_id"]){
                    setCurrentBikeRack(br);
                    break;
                }
            }
        }catch(err){
            console.log("Erro na criação de bicicletário:", err)
            setBikeRackLoading(false);
            return false;

        }finally{
            setBikeRackLoading(false);
            return true
        }
    }

    const value = useMemo(() => ({
        bikeRackLoading,
        currentBikeRack,
        userBikeRacks,
        createBikeRack,
        selectBikeRack,
        refetch,
    }), [bikeRackLoading, currentBikeRack, userBikeRacks, createBikeRack, selectBikeRack, refetch])

    return (
        <BikeRackContext.Provider
        value={value}>
            {children}
        </BikeRackContext.Provider>
    );
}

export function useBikeRacks(){
    const context = useContext(BikeRackContext)
    if(context === undefined) {
        throw new Error('useBikeRacks deve ser usado dentro de um BikeRackProvider');
    }
    return context;
}