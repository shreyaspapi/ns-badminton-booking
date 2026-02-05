import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const origin = new URL(request.url).origin

  if (!code) {
    return NextResponse.redirect(`${origin}?error=no_code`)
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "",
        client_secret: process.env.DISCORD_CLIENT_SECRET || "",
        grant_type: "authorization_code",
        code,
        redirect_uri: `${origin}/api/auth/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", await tokenResponse.text())
      return NextResponse.redirect(`${origin}?error=token_exchange_failed`)
    }

    const tokens = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.redirect(`${origin}?error=user_fetch_failed`)
    }

    const discordUser = await userResponse.json()

    // Create user data to pass to client
    const userData = {
      discordId: discordUser.id,
      discordUsername: discordUser.username,
      discordAvatar: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null,
    }

    // Redirect with user data encoded
    const userDataEncoded = encodeURIComponent(JSON.stringify(userData))
    return NextResponse.redirect(`${origin}/auth/complete?data=${userDataEncoded}`)
  } catch (error) {
    console.error("OAuth error:", error)
    return NextResponse.redirect(`${origin}?error=oauth_failed`)
  }
}
