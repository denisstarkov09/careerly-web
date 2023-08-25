import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./Auth";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isLoggedIn } = useContext(AuthContext);
    if (isLoggedIn === null) {
        return <p>{"Loading"}</p>;
    }
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    // Otherwise logged in
    return <>{children}</>;
};
