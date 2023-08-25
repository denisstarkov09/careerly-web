import React, { useState } from "react";

import { Entry } from "./constant/types";

type EntriesMap = {
    [name: string]: Entry[];
};
type EntriesContextType = {
    entries: EntriesMap;
    setEntries: (e: EntriesMap) => void;
};

export const EntriesContext = React.createContext<EntriesContextType>({
    entries: {},
    setEntries: () => {},
});

export const EntriesProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [entries, setEntries] = useState<{ [name: string]: Entry[] }>({});

    return (
        <EntriesContext.Provider value={{ entries, setEntries }}>
            {children}
        </EntriesContext.Provider>
    );
};
