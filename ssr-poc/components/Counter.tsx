import React from "react";

export const Counter = ({ count }: { count: number }) => {
    const [currentCount, setCurrentCount] = React.useState(count);

    const increment = () => {
        setCurrentCount(currentCount + 1);
    };

    const decrement = () => {
        setCurrentCount(currentCount - 1);
    }

    return (
        <div>
            <p>Count: {currentCount}</p>
            <button type="button" onClick={decrement}>-</button>
            <button type="button" onClick={increment}>+</button>
        </div>
    );
}