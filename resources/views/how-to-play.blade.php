@extends('layout')
@section('title', 'How to play')
@section('content')
<article class="card rules">
    <h1>How to play Gin Rummy</h1>
    <p class="lead">A two-player card game: build your hand into sets and runs, keep the leftover points low, and end the hand before your opponent does.</p>

    <h2>The goal</h2>
    <p>Arrange your 10 cards into <b>melds</b> so that as few points as possible are left over. The first player to reach <b>100 points</b> across several hands wins the game.</p>

    <h2>Melds</h2>
    <ul>
        <li><b>Set</b> — 3 or 4 cards of the same rank: <span class="c">7♠ 7♥ 7♦</span></li>
        <li><b>Run</b> — 3 or more cards in a row of the same suit: <span class="c r">4♥ 5♥ 6♥ 7♥</span></li>
        <li>Ace is low only: <span class="c">A♣ 2♣ 3♣</span> is a run, but <span class="c">Q♣ K♣ A♣</span> is not.</li>
        <li>A card can only be in one meld at a time. The game picks the best arrangement for you and underlines each meld in gold.</li>
    </ul>

    <h2>Deadwood</h2>
    <p>Cards that aren't in a meld are <b>deadwood</b>. They count against you: aces are 1, number cards are their face value, and J, Q and K are 10 each. Your deadwood total is shown under your hand.</p>

    <h2>Your turn</h2>
    <ol>
        <li><b>Draw</b> one card: click the face-down <b>stock</b>, or take the face-up card from the <b>discard pile</b>.</li>
        <li><b>Discard</b> one card: click a card to select it, then click it again or press <b>Discard</b>. You can't throw back the card you just took from the discard pile.</li>
    </ol>
    <p>You always end your turn with 10 cards.</p>

    <h2>Ending a hand</h2>
    <ul>
        <li><b>Knock</b> — once your deadwood would be <b>10 or less</b> after discarding, select your discard and press <b>Knock</b>. Both hands are shown.</li>
        <li><b>Gin</b> — if <b>all</b> your cards are in melds, the button says <b>Gin!</b>. Going gin is worth a bonus.</li>
        <li>If the stock runs down to 2 cards, nobody scores and a new hand is dealt.</li>
    </ul>

    <h2>Laying off</h2>
    <p>When someone knocks, the other player can add deadwood cards to the knocker's melds — e.g. a 8♥ onto a 5♥ 6♥ 7♥ run. Those cards no longer count. This happens for you automatically. You can't lay off against gin.</p>

    <h2>Scoring</h2>
    <table class="score">
        <tr><th>Knock</th><td>The knocker scores the difference between the two deadwood totals.</td></tr>
        <tr><th>Gin</th><td>25 bonus + the opponent's deadwood.</td></tr>
        <tr><th>Undercut</th><td>If the defender's deadwood is equal to or lower than the knocker's, the <b>defender</b> scores 25 + the difference.</td></tr>
        <tr><th>Game</th><td>First to 100. The winner gets a 100 game bonus, and each player gets 25 for every hand they won.</td></tr>
    </table>

    <h2>Tips</h2>
    <ul>
        <li>Throw away high cards (J, Q, K) early unless they're close to a meld.</li>
        <li>Watch what the computer picks up — don't feed it cards that fit its melds.</li>
        <li>Knocking early with low deadwood often beats waiting for gin, but beware of being undercut.</li>
        <li>Stuck? Press <b>Hint</b> for a suggested draw or discard.</li>
        <li>Leave the <b>🎓 Coach</b> switched on (under the table) for advice every turn: whether to take the face-up card, the best discard and why, when you can knock, which cards would help you, and warnings when a discard might feed the computer.</li>
        <li>New to the game? Set the opponent to <b>Easy</b>. On <b>Hard</b> the computer watches what you pick up and avoids feeding you.</li>
    </ul>

    <p><a href="{{ route('play') }}" class="btn">Play now</a></p>
</article>
@endsection
