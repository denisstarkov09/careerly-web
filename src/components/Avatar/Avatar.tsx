import React from "react";

const Avatar = ({
    src,
    name,
}: {
    src?: string | null;
    name?: string | null;
}) => {
    return (
        <div>
            {src || name ? (
                <img
                    className="w-10 h-10 mr-2 rounded-3xl border"
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    src={
                        src ||
                        `http://www.gravatar.com/avatar/${name}?d=identicon`
                    }
                />
            ) : (
                <div className="flex justify-center items-center w-8 h-8 mr-2 rounded-3xl bg-gray-300 border border-gray-400 text-black text-sm">
                    {name?.slice(0, 1) || "?"}
                </div>
            )}
        </div>
    );
};

export default Avatar;
