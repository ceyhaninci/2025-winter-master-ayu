import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import LogoutButton from "./logout-button";
import SearchForm from "./search-form";

export default async function SearchPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/auth/login");

  return (
    <>
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Search</h1>
            <div className="small">Giriş yapan: <b>{session.email}</b></div>
          </div>
          <LogoutButton />
        </div>
      </div>

      <div className="card">
        <h2>Arama</h2>
        <SearchForm />
      </div>
    </>
  );
}
