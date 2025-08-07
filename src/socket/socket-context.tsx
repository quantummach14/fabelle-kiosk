import {
  createContext,
  useEffect,
  type ReactNode,
  type FC,
} from "react";
import { connectSocket, disconnectSocket } from "./socket-service";

export const SocketContext = createContext<null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const Run_Socket = () => {
    connectSocket({ Run_Socket });
  };

  useEffect(() => {
    Run_Socket();
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <SocketContext.Provider value={null}>
      {children}
    </SocketContext.Provider>
  );
};
