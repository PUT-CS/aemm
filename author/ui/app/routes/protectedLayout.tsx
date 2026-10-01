import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useCurrentUser } from "~/lib/auth";

export default function ProtectedLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user, isPending } = useCurrentUser();

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/login", {
        replace: true,
        state: { from: location.pathname + location.search },
      });
    }
  }, [isPending, user, location.pathname, location.search, navigate]);

  return <>{user ? <Outlet /> : null}</>;
}
