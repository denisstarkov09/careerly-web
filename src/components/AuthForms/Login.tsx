import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";
import { FormEvent, useState } from "react";
import { auth, db } from "../../firebase";
import { GoogleAuthLogin } from "../GoogleAuth/GoogleAuth";
import { useNavigate } from "react-router-dom";
import { identify, track } from "../../Segment";
import { doc, setDoc } from "firebase/firestore";

const Login = ({ setScreen }: { setScreen: (screen: any) => void }) => {
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const provider = new GoogleAuthProvider();

    const signIn = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const credential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            if (credential) {
                console.log(credential);
                const { user } = credential;
                identify(
                    user.uid,
                    user.displayName || "",
                    user.providerData?.[0].email || ""
                );
                track("User SignedIn", {
                    withProvider: "email",
                    email: user.providerData?.[0].email || "",
                });
                navigate("/");
            }
        } catch (e: any) {
            const errorCode = e.code;
            const errorMessage = e.message;
            if (errorCode === "auth/user-not-found") {
                setError("Incorrect email or password");
            }
            console.log(errorCode, errorMessage);
        }
    };
    provider.addScope("profile");
    provider.addScope("email");
    const signInWithGoogle = async () => {
        signInWithPopup(auth, provider)
            .then(async (result: any) => {
                // This gives you a Google Access Token. You can use it to access the Google API.

                const credential =
                    GoogleAuthProvider.credentialFromResult(result);
                const token = credential?.accessToken;
                // The signed-in user info.
                const user = result.user;
                console.log(token, user);
                const docRef = doc(db, 'users', user.uid)
                await setDoc(docRef, {
                    email: user.providerData?.[0]?.email,
                    fullname: user.displayName,
                })
                identify(
                    user.uid,
                    user.displayName || "",
                    user.providerData?.[0].email || ""
                );
                track("User SignedIn", {
                    withProvider: "google",
                    email: user.providerData?.[0].email || "",
                });
                // IdP data available using getAdditionalUserInfo(result)
                // ...
                navigate("/");
            })
            .catch((error: any) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
                // The email of the user's account used.
                // const email = error.customData.email;
                // The AuthCredential type that was used.
                // const credential =
                //     GoogleAuthProvider.credentialFromError(error);
                // ...
            });
    };
    return (
        <>
            <h1 className="text-2xl font-bold mb-8">Welcome Back!</h1>
            <form onSubmit={signIn}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="border px-4 py-2 w-full rounded-lg mb-2"
                ></input>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border px-4 py-2 w-full rounded-lg mb-8"
                ></input>
                <button
                    type="submit"
                    className="flex justify-center w-full bg-primary px-4 py-2 rounded-lg text-white hover:bg-indigo-700"
                >
                    Sign in
                </button>
                <p
                    className={`text-red-600 ${
                        error ? "block" : "hidden"
                    } text-sm pl-4 pt-1`}
                >
                    {error}
                </p>
            </form>
            <span className="flex mt-4 w-full items-center space-x-2 justify-between">
                <div className="w-1/3 border-b" />
                <div className="text-[0.5rem] text-gray-500">
                    Or sign in with
                </div>
                <div className="w-1/3 border-b" />
            </span>
            <GoogleAuthLogin onClick={signInWithGoogle} />
            <span className="text-xs w-full flex justify-center">
                <p>
                    Don't have an account yet?{" "}
                    <span
                        className="text-blue-500 cursor-pointer"
                        onClick={() => setScreen("register")}
                    >
                        Sign up
                    </span>
                </p>
            </span>
        </>
    );
};

export default Login;
