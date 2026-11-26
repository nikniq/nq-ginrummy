<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Play') · NQ Gin Rummy</title>
    <meta name="description" content="Play Gin Rummy free in your browser against the computer, with a built-in coach. Part of the nikniq.com games family.">
    <meta name="theme-color" content="#123f25">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='5' y='3' width='22' height='26' rx='3' fill='%23fffaf0' stroke='%231d2a22'/><text x='16' y='22' text-anchor='middle' font-size='14' fill='%23c22a2a'>♥</text></svg>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/ginrummy.css') }}?v={{ filemtime(public_path('css/ginrummy.css')) }}">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<div class="nq-strip">
    <a href="https://nikniq.com">@include('partials.nikniq-mark') <span>← Back to <b>nikniq.com</b> games</span></a>
</div>

<header class="topbar">
    <div class="topbar-inner">
        <a href="{{ route('play') }}" class="brand">@include('partials.logo')<span>Gin Rummy<small>by NQ</small></span></a>

        <details class="menu">
            <summary aria-label="Menu"><span></span><span></span><span></span></summary>
            <nav aria-label="Main">
                <a href="{{ route('play') }}" @class(['active' => request()->routeIs('play')])>Play</a>
                <a href="{{ route('rules') }}" @class(['active' => request()->routeIs('rules')])>How to play</a>
                <a href="https://nikniq.com" class="ext">More games ↗</a>
                <span class="sep" aria-hidden="true"></span>
                @auth
                    <span class="user">
                        @if (auth()->user()->avatar)
                            <img src="{{ auth()->user()->avatar }}" alt="" class="avatar" referrerpolicy="no-referrer">
                        @else
                            <span class="avatar initial">{{ mb_strtoupper(mb_substr(auth()->user()->name, 0, 1)) }}</span>
                        @endif
                        <span class="uname">{{ auth()->user()->name }}</span>
                    </span>
                    <form method="POST" action="{{ route('logout') }}" class="inline">
                        @csrf
                        <button type="submit" class="btn ghost small">Log out</button>
                    </form>
                @else
                    <a href="{{ route('login') }}" @class(['active' => request()->routeIs('login')])>Log in</a>
                    <a href="{{ route('register') }}" class="btn small">Sign up free</a>
                @endauth
            </nav>
        </details>
    </div>
</header>

<main id="main" class="container">
    @if (session('status'))<div class="flash">{{ session('status') }}</div>@endif
    @yield('content')
</main>

<footer class="footer">
    <div class="footer-inner">
        <div class="f-brand">
            <a href="{{ route('play') }}" class="brand">@include('partials.logo')<span>Gin Rummy<small>by NQ</small></span></a>
            <p>The classic two-player card game, free in your browser. Play the computer with a built-in coach.</p>
            <a href="https://nikniq.com" class="nq-back">@include('partials.nikniq-mark') Part of the <b>nikniq.com</b> games family →</a>
        </div>
        <nav aria-label="Game">
            <h4>Game</h4>
            <a href="{{ route('play') }}">Play now</a>
            <a href="{{ route('rules') }}">How to play</a>
            <a href="{{ route('rules') }}#scoring">Scoring</a>
        </nav>
        <nav aria-label="Account">
            <h4>Account</h4>
            @auth
                <span class="muted">Signed in as {{ auth()->user()->name }}</span>
            @else
                <a href="{{ route('login') }}">Log in</a>
                <a href="{{ route('register') }}">Create an account</a>
            @endauth
        </nav>
        <nav aria-label="nikniq.com">
            <h4>nikniq.com</h4>
            <a href="https://nikniq.com">All games</a>
            <a href="https://nikniq.com">Home</a>
        </nav>
    </div>
    <div class="footer-base">
        <span>&copy; {{ date('Y') }} NQ Gin Rummy · <a href="https://nikniq.com">nikniq.com</a></span>
        <span class="suits" aria-hidden="true">♠ <i>♥</i> <i>♦</i> ♣</span>
    </div>
</footer>
<script>
    // The menu is a <details>: always open on wide screens, a toggle on phones.
    (() => {
        const m = document.querySelector('.menu'), mq = matchMedia('(min-width: 761px)');
        const sync = () => { m.open = mq.matches; };
        sync(); mq.addEventListener('change', sync);
        m.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if (!mq.matches) m.open = false; }));
    })();
</script>
@stack('scripts')
</body>
</html>
