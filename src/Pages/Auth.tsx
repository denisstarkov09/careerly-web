import { useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Auth";
import logo from "../assets/logo.png";

import LoginForm from "../components/AuthForms/Login";
import RegisterForm from "../components/AuthForms/Register";

type LoginScreens = "login" | "register";

const Auth = () => {
    const [screen, setScreen] = useState<LoginScreens>("login");
    const navigate = useNavigate();
    const { isLoggedIn } = useContext(AuthContext);

    useEffect(() => {
        auth.useDeviceLanguage();
        if (isLoggedIn) {
            navigate("/");
        }
    }, [isLoggedIn, navigate]);

    return (
        <div className="flex flex-col md:flex-row items-center justify-center lg:justify-between w-full h-full bg-no-repeat bg-fill lg:bg-right lg:bg-contain bg-[#F4F6FF] bg-[url('assets/background-login.svg')]">
            <div className="w-1/2 h-1/4 hidden lg:flex items-center lg:w-1/4 lg:ml-64">
                <img src={logo} alt="Careerly" />
            </div>

            <div
                className={`flex flex-col bg-white shadow-lg rounded-lg p-4 lg:mr-64 ${
                    screen === "login" ? "w-96" : "w-auth"
                }`}
            >
                {screen === "login" ? (
                    <LoginForm setScreen={setScreen} />
                ) : (
                    <RegisterForm setScreen={setScreen} />
                )}
            </div>
        </div>
    );
};

export default Auth;
