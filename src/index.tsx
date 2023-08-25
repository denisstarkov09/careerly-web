import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Timeline from "./Pages/Timeline";
import Layout from "./Pages/Layout";
import Home from "./Pages/Home";
import Auth from "./Pages/Auth";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthProvider } from "./Auth";
import Settings from "./Pages/Settings";
import { EntriesProvider } from "./Entries";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <AuthProvider>
        <EntriesProvider>
            <React.StrictMode>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route
                                index
                                element={
                                    <ProtectedRoute>
                                        <Home />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="timeline/:person"
                                element={
                                    <ProtectedRoute>
                                        <Timeline />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="settings/:view"
                                element={
                                    <ProtectedRoute>
                                        <Settings />
                                    </ProtectedRoute>
                                }
                            />

                            <Route path="login" element={<Auth />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </React.StrictMode>
        </EntriesProvider>
    </AuthProvider>
);
