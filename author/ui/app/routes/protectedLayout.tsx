import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import RootLayout from "./rootLayout";
import { getAuthToken } from "~/lib/auth";

export default function ProtectedLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    console.log(
      "[ProtectedLayout] token:",
      token,
      "location:",
      location.pathname,
    );

    if (!token) {
      navigate("/login", {
        replace: true,
        state: { from: location.pathname + location.search },
      });
    } else {
      setAuthed(true);
    }

    setChecked(true);
  }, [location.pathname, location.search, navigate]);

  return <RootLayout>{checked && authed ? <Outlet /> : null}</RootLayout>;
}
