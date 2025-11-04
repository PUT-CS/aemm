import { Outlet } from "react-router";

export default function CenteredLayout() {
  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <Outlet />
      </div>
    </>
  );
}
