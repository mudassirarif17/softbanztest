import { FC, useState, createContext } from 'react';
type SidebarContext = {
  sidebarToggle: any;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  mySidebarToggle: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SidebarContext = createContext<SidebarContext>(
  {} as SidebarContext
);

export const SidebarProvider: FC = ({ children  }) => {
  const [sidebarToggle, setSidebarToggle] = useState(false);

  const toggleSidebar = () => {
    // setSidebarToggle(!sidebarToggle);
    alert("hello")
  };

  const closeSidebar = () => {
    setSidebarToggle(false);
  };

  const mySidebarToggle = () => {
    alert("Hello maddy")
  }

  return (
    <SidebarContext.Provider
      value={{ sidebarToggle, toggleSidebar, closeSidebar , mySidebarToggle }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
