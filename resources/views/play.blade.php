@extends('layout')
@section('title', 'Play')
@section('content')
<section class="card hero">
    <h1>Gin Rummy</h1>
    @auth
        <p>Welcome back, {{ auth()->user()->name }}. The table is being set up — game coming soon.</p>
    @else
        <p>Form melds, knock, and go gin. <a href="{{ route('login') }}">Log in</a> or <a href="{{ route('register') }}">register</a> to track your games.</p>
    @endauth
    <div id="table" class="felt"></div>
</section>
@endsection
