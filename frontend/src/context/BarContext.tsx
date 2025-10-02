'use client';

import { createContext, useContext, useState } from 'react';

type BarContextType = {
	showSidebar: boolean;
	setShowSidebar: (value: boolean) => void;
};

const BarContext = createContext<BarContextType | null>(null);

export const BarProvider = ({ children }: { children: React.ReactNode }) => {
	const [showSidebar, setShowSidebar] = useState(true);

	return (
		<BarContext.Provider value={{ showSidebar, setShowSidebar }}>
			{children}
		</BarContext.Provider>
	);
};

export const useBarContext = () => {
	const context = useContext(BarContext);
	if (!context) {
		throw new Error('useBarContext must be used within a BarProvider');
	}
	return context;
};
