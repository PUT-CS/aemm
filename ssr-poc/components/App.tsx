import {Counter} from "./Counter.tsx";

export const App = () => {
    const onClick = () => {
        console.log("Hello from onClick");
        alert("Button clicked!");
    }

    return <div>
        <h1>SSR PoC App</h1>
        <div>This is a PoC for SSR in Deno 2.0</div>
        <button type="button" onClick={onClick}>Click Me</button>
        <Counter count={0}/>
    </div>;
}