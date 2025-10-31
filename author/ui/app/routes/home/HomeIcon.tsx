import React from "react";
import type {IconType} from "react-icons";

interface HomeIconProps {
    text: string;
    onClick: () => void;
    icon: IconType;
}

export default function HomeIcon(
    { text, onClick, icon: Icon }: HomeIconProps
) {
    return (
        <a
            className="flex flex-col items-center justify-center gap-3 p-8 rounded-lg hover:bg-accent cursor-pointer transition-colors"
            onClick={onClick}
        >
            <Icon className="w-16 h-16" />
            <span className="text-lg font-medium">{text}</span>
        </a>
    )
}