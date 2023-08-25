import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";
import React, { FormEvent, useState } from "react";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { GoogleAuthSignUp } from "../GoogleAuth/GoogleAuth";
import { identify, track } from "../../Segment";
import { doc, setDoc } from "firebase/firestore";

const Register = ({ setScreen }: { setScreen: (screen: any) => void }) => {
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [company, setCompany] = useState("");
    const [position, setPosition] = useState("");
    const [goal, setGoal] = useState("");
    const [HDYHAU, setHDYHAU] = useState("");
    const navigate = useNavigate();
    const provider = new GoogleAuthProvider();

    const signUp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const credential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            if (credential) {
                console.log(credential);
                // add other sign up fields in
                const { user } = credential;
                const docRef = doc(db, 'users', user.uid)
                await setDoc(docRef, {
                    email: user.providerData?.[0]?.email,
                    fullname: user.displayName,
                    company,
                    password,
                    position,
                    usageReason: goal,
                    howFind: HDYHAU
                })
                identify(
                    user.uid,
                    user.displayName || "",
                    user.providerData?.[0]?.email || ""
                );
                await updateProfile(credential.user, { displayName: name });
                track("User Registered", {
                    withProvider: "email",
                    email: user.providerData?.[0].email || "",
                });
                navigate("/");
            }
        } catch (e) {
            console.log(e);
        }
    };

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
                    user.providerData?.[0]?.email || ""
                );
                track("User Registered", {
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
                setError(errorMessage);
                // The email of the user's account used.
                // const email = error.customData.email;
                // The AuthCredential type that was used.
                // const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
            });
    };

    return (
        <>
            <h1 className="text-xl font-bold">Create an account!</h1>
            <GoogleAuthSignUp onClick={signInWithGoogle} />
            <span className="flex mb-4 w-full items-center space-x-2 justify-between">
                <div className="w-1/3 border-b" />
                <div className="text-[0.5rem] text-gray-500">
                    Or sign up with email
                </div>
                <div className="w-1/3 border-b" />
            </span>
            <form onSubmit={signUp}>
                <span className="flex space-x-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="border px-4 py-2 rounded-lg w-1/2"
                    ></input>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        className="border px-4 py-2 rounded-lg w-1/2"
                    ></input>
                </span>
                <span className="flex mt-4 space-x-2">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border px-4 py-2 rounded-lg w-1/2"
                    ></input>
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border px-4 py-2 rounded-lg w-1/2"
                    ></input>
                </span>
                <span className="flex my-4 space-x-2">
                    <input
                        placeholder="Company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="border px-4 py-2 rounded-lg w-1/2"
                    ></input>
                    <input
                        placeholder="Position"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="border px-4 py-2 rounded-lg w-1/2"
                    ></input>
                </span>
                <input
                    placeholder="Why are you using Careerly?"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="border px-4 py-2 mb-4 rounded-lg w-full"
                ></input>
                <input
                    placeholder="How did you hear about us?"
                    value={HDYHAU}
                    onChange={(e) => setHDYHAU(e.target.value)}
                    className="border px-4 py-2 rounded-lg w-full"
                ></input>

                <button
                    type="submit"
                    className="flex justify-center w-full bg-primary px-4 py-2 mt-8 rounded text-white hover:bg-indigo-700"
                >
                    Sign up
                </button>
            </form>
            <p className={`text-red-600 ${error ? "block" : "hidden"}`}>
                {error}
            </p>
            <div className="w-full flex justify-center mt-2 text-xs">
                <p>
                    Already have an account?{" "}
                    <span
                        className="text-blue-500 cursor-pointer"
                        onClick={() => setScreen("login")}
                    >
                        Sign in
                    </span>
                </p>
            </div>
        </>
    );
};
export default Register;
