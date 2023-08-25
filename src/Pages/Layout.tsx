import { Outlet, Link, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "../Auth";
import logo from "../assets/logo_white.png";
import settings from "../assets/settings-icon.svg";
import Avatar from "../components/Avatar/Avatar";
import { useNavigate } from "react-router-dom";

const Layout = () => {
    const navigate = useNavigate();
    const { currentUser, isLoggedIn } = useContext(AuthContext);
    const [showDropdown, setShowDropdown] = useState(false);

    function usePageViews() {
        const location = useLocation();
        useEffect(() => {
            // @ts-ignore
            window.analytics.page(location.pathname);
        }, [location]);
    }
    usePageViews();
    const DropDown = () => {
        return (
            <div className="flex flex-col space-y-2 bg-gray-100 text-gray-600 border-4 p-2 shadow rounded-lg">
                {["profile", "billing", "notifications", "team"].map((i) => (
                    <div
                        className="cursor-pointer capitalize hover:bg-blue-100 py-2 px-10 rounded-lg"
                        onClick={() => {
                            setShowDropdown(false);
                            navigate(`/settings/${i}`);
                        }}
                    >
                        {i}
                    </div>
                ))}
                <div
                    className="cursor-pointer px-2 text-sm text-gray-400"
                    onClick={userSignOut}
                >
                    Sign out
                </div>
            </div>
        );
    };

    const userSignOut = async () => {
        try {
            await signOut(auth);
            window.localStorage.removeItem("careerlyUser");
        } catch (e) {
            console.log(e);
        }
    };
    return (
        <div
            className="font-jakarta h-screen"
            onClick={() => setShowDropdown(false)}
        >
            <div className="flex items-center justify-between px-4 lg:px-24 pb-4 pt-2 bg-primary text-white">
                <Link to="/">
                    <img className="w-28" src={logo} alt="Careerly" />
                </Link>
                <span className="flex items-center">
                    <div>
                        {isLoggedIn ? (
                            <span className="flex flex-row items-center divide-x">
                                <Avatar
                                    src={currentUser?.photoURL}
                                    name={currentUser?.displayName}
                                />
                                {/* {`Signed in ${currentUser?.email}`} */}
                                <div className="relative border-gray-300 border-opacity-40">
                                    <img
                                        className="w-5 ml-2 cursor-pointer"
                                        src={settings}
                                        alt="Settings"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDropdown(!showDropdown);
                                        }}
                                    />
                                    <div
                                        className="overflow-none absolute -left-36 top-10 z-20"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {showDropdown && <DropDown />}
                                    </div>
                                </div>
                            </span>
                        ) : (
                            "Signed out"
                        )}
                    </div>
                </span>
            </div>

            <Outlet />
        </div>
    );
};

export default Layout;
