<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Play') · NQ Gin Rummy</title>
    <link rel="stylesheet" href="{{ asset('css/ginrummy.css') }}">
</head>
<body>
<header class="topbar">
    <a href="{{ route('play') }}" class="brand">🂡 NQ Gin Rummy</a>
    <nav>
        <a href="{{ route('play') }}">Play</a>
        @auth
            <form method="POST" action="{{ route('logout') }}" class="inline">
                @csrf
                <button type="submit" class="linklike">Logout ({{ auth()->user()->name }})</button>
            </form>
        @else
            <a href="{{ route('login') }}">Login</a>
            <a href="{{ route('register') }}" class="btn small">Register</a>
        @endauth
    </nav>
</header>
<main class="container">
    @yield('content')
</main>
<footer class="footer">
    <p class="small">&copy; {{ date('Y') }} NQ Gin Rummy · Part of the <a href="https://nikniq.com">nikniq.com</a> games family.</p>
</footer>
@stack('scripts')
</body>
</html>
