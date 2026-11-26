@extends('layout')
@section('title', 'Play')
@section('content')
<div class="play-head">
    <h1>Gin Rummy</h1>
    <p class="small">
        @auth Good luck, {{ auth()->user()->name }}. @else Playing as guest — <a href="{{ route('login') }}">log in</a> to keep your name on the table. @endauth
        Knock at 10 or less deadwood · Gin scores +25 · First to 100. <a href="{{ route('rules') }}">How to play</a>
    </p>
</div>
<div id="gin" class="gin" data-rules-url="{{ route('rules') }}"><noscript>Gin Rummy needs JavaScript.</noscript></div>
@endsection
@push('scripts')
<script src="{{ asset('js/ginrummy.js') }}?v={{ filemtime(public_path('js/ginrummy.js')) }}" defer></script>
@endpush
