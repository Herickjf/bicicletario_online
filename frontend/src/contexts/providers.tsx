import React, { createContext, useContext, useState, useEffect } from 'react'

// Providers a serem utilizados
import { AuthProvider } from "@/contexts/auth-context"
import { BikeRackProvider } from './bikerack-context';

const Providers = (
    {children}: {children: React.ReactNode}
) => (
    <AuthProvider>
        <BikeRackProvider>
            {children}
        </BikeRackProvider>
    </AuthProvider>
)

export default Providers;