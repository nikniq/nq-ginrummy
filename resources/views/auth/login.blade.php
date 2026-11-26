@extends('layout')
@section('title', 'Log in')
@section('content')
<div class="auth">
    @include('auth._art', ['headline' => 'Welcome back', 'sub' => 'Pick up where you left off — the table is waiting.'])
    <form method="POST" action="{{ route('login') }}" class="panel form">
        @csrf
        <h1>Log in</h1>
        <p class="small">New here? <a href="{{ route('register') }}">Create a free account</a></p>
        @include('auth._oauth')
        <label>Email <input type="email" name="email" value="{{ old('email') }}" required autofocus autocomplete="email"></label>
        @error('email')<p class="error">{{ $message }}</p>@enderror
        <label>Password <input type="password" name="password" required autocomplete="current-password"></label>
        <label class="check"><input type="checkbox" name="remember"> Remember me</label>
        <button class="btn big">Log in</button>
    </form>
</div>
@endsection
