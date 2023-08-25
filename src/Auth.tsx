import { User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import { AuthContextType } from "./constant/types";
import { identify } from "./Segment";

export const AuthContext = React.createContext<AuthContextType>({
    currentUser: null,
    isLoggedIn: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    useEffect(() => {
        // @ts-ignore
        if (window.fcWidget) {
            // @ts-ignore
            window.fcWidget.setExternalId(currentUser?.uid);
            // @ts-ignore
            window.fcWidget.user.setFirstName(
                currentUser?.displayName?.split(" ")[0]
            );
            // @ts-ignore
            window.fcWidget.user.setLastName(
                currentUser?.displayName?.split(" ")[1]
            );
            // @ts-ignore
            window.fcWidget.user.setEmail(currentUser?.email);
        }
    }, [currentUser]);

    useEffect(() => {
        // first check if stored in local storage to avoid delayed pop in
        const storedUser = JSON.parse(
            window.localStorage.getItem("careerlyUser") || "null"
        ) as User;
        if (storedUser) {
            setCurrentUser(storedUser);
            identify(
                storedUser.uid,
                storedUser.displayName || "",
                storedUser.providerData?.[0]?.email || ""
            );
            setIsLoggedIn(true);
        }

        auth.onAuthStateChanged((user) => {
            if (user) {
                window.localStorage.setItem(
                    "careerlyUser",
                    JSON.stringify(user.toJSON())
                );
                setIsLoggedIn(true);
                identify(
                    user.uid,
                    user.displayName || "",
                    user.providerData?.[0]?.email || ""
                );
                setCurrentUser(user);
            } else {
                setIsLoggedIn(false);
            }
        });
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};
