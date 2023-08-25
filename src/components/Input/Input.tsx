import React from "react";

const Input = ({
    placeholder,
    onChange,
    label,
    icon,
    disabled,
    className,
    value,
}: {
    placeholder?: string;
    onChange: (val: React.FormEvent<HTMLInputElement>) => void;
    label?: string;
    icon?: string;
    disabled?: boolean;
    className?: string;
    value?:string;
}) => {
    return (
        <div className="relative">
            {label && <p className="font-semibold text-sm mb-1">{label}</p>}
            {icon && (
                <img
                    className="absolute top-[1.2rem] left-3"
                    src={icon}
                    alt={icon}
                />
            )}
            <input
                type="text"
                className={`py-3 lg:w-[100%] border rounded-lg ${
                    icon ? "pl-8" : "pl-4"
                } ${className}`}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                value={value}
            />
        </div>
    );
};

export default Input;
