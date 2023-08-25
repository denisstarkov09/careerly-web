import React from "react";

function CardGroup({
    children,
    date,
}: {
    children: React.ReactNode;
    date: string;
}) {
    return (
        <div className="flex flex-row mt-16">
            <div className="flex flex-col -mt-8">
                <div className="w-16 mb-4 -mx-4 text-primary uppercase text-sm font-bold">
                    {date}
                </div>
                <div className="border-l-4 flex-1 h-full"></div>
            </div>
            <span className="lg:ml-8 w-full">{children}</span>
        </div>
    );
}

export default CardGroup;
