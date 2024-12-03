import { createContext, useMemo, useState } from "react";

export const MaintenanceContext = createContext<any>({});

const MaintenanceProvider = ({children}: any) => {
    const [isMaintenance, setIsMaintenance] = useState<boolean>(false);
    const contextValue = useMemo(() => ({ isMaintenance, setIsMaintenance }), [isMaintenance]);
    return (
        <MaintenanceContext.Provider value={contextValue}>
            {children}
        </MaintenanceContext.Provider>
    );
}

export default MaintenanceProvider