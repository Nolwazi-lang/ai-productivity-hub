import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthorizationDetails = {
  client?: { name?: string; redirect_uri?: string } | null;
  scope?: string | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

type OAuthResult = { data: AuthorizationDetails | null; error: { message: string } | null };

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};

function oauth(): OAuthNamespace {
  return (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s['authorization_id'] === "string" ? (s['authorization_id'] as string) : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/auth",
        search: { next: location.pathname + location.searchStr },
      });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    const { data: session } = await supabase.auth.getSession();
    return { details: data, email: session.session?.user.email ?? null };
  },
  errorComponent: ({ error }) => (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authorization request failed</CardTitle>
          <CardDescription>
            {String((error as Error)?.message ?? error)}
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  ),
  component: Consent,
});

function Consent() {
  const { details, email } = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? "an app";
  const scopes = (details?.scope ?? "").split(/\s+/).filter(Boolean);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect {clientName} to AI Productivity Hub</CardTitle>
          <CardDescription>
            {clientName} will be able to call this app&apos;s enabled tools while you are signed in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="space-y-2 text-sm">
            {email && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Signed in as</dt>
                <dd className="font-medium">{email}</dd>
              </div>
            )}
            {details?.client?.redirect_uri && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Redirects to</dt>
                <dd className="truncate font-mono text-xs">{details.client.redirect_uri}</dd>
              </div>
            )}
          </dl>
          {scopes.length > 0 && (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {scopes.map((scope) => (
                <li key={scope}>
                  {scope === "email"
                    ? "Share your email address"
                    : scope === "profile" || scope === "openid"
                      ? "Share your basic profile"
                      : `Additional permission requested: ${scope}`}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">
            This does not bypass this app&apos;s permissions or backend policies.
          </p>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
              Approve
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={busy}
              onClick={() => decide(false)}
            >
              Cancel connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
