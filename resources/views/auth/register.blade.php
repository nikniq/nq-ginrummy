@extends('layout')
@section('title', 'Sign up')
@section('content')
<div class="auth">
    @include('auth._art', ['headline' => 'Join the table', 'sub' => 'Free account. Your name on the table and your record across devices.'])
    <form method="POST" action="{{ route('register') }}" class="panel form">
        @csrf
        <h1>Create an account</h1>
        <p class="small">Already registered? <a href="{{ route('login') }}">Log in</a></p>
        @include('auth._oauth')
        <label>Name <input name="name" value="{{ old('name') }}" required autofocus maxlength="50" autocomplete="nickname"></label>
        @error('name')<p class="error">{{ $message }}</p>@enderror
        <label>Email <input type="email" name="email" value="{{ old('email') }}" required autocomplete="email"></label>
        @error('email')<p class="error">{{ $message }}</p>@enderror
        <label>Password <input type="password" name="password" required minlength="8" autocomplete="new-password"></label>
        @error('password')<p class="error">{{ $message }}</p>@enderror
        <label>Confirm password <input type="password" name="password_confirmation" required autocomplete="new-password"></label>
        <button class="btn big">Create account</button>
    </form>
</div>
@endsection
