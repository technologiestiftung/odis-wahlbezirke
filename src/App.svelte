<script lang="ts">
	import { navOptions } from  './components/Nav.svelte';
	import Footer from './components/Footer.svelte';
	let selected = navOptions[0];
	let intSelected: number = 0;

	const changeComponent = (id) => {
		selected = navOptions[id];
		intSelected = parseInt(id);
	};

	let innerHeight;

	const navigateToTab = (tabId: number) => {
		selected = navOptions[tabId];
		intSelected = tabId;
	};

</script>

<svelte:window bind:innerHeight={innerHeight} />

<div class="odis">
	<div class="section bl">
		<a class="blog-link blog-link-back" href="https://odis-berlin.de/projekte/">Zurück zur ODIS-Webseite</a>
	</div>

	<div class="section">
		<p class="headline-05">Ein Tool der Open Data Informationsstelle (ODIS)
		</p>
		<h1 id="title">Wahlbezirke Editor</h1>
		<p class="headline-02b" id="intro-text">
			Mit offenen Daten in die nächste Wahlsaison.
		</p>
		<p class="headline-04">
			Vor jeder Wahl müssen die Wahlbezirke in den jeweiligen Berliner Bezirken auf ihre räumliche Festlegung geprüft und angepasst werden. Der Grund dafür sind ständig stattfindende Änderungen der Bevölkerungszahlen: In der Regel sollte ein Wahlbezirk nicht mehr als 2.500 deutsche Einwohner*innen beinhalten. Dieses Tool wurde entwickelt, um Teile des Prozesses der Neufestlegung von Wahlbezirken zu automatisieren und somit die Mitarbeitenden der bezirklichen Wahlämter zu unterstützen. Für den hier gezeigten ersten Prototypen, wurden exemplarisch Daten vom Bezirk Tempelhof-Schöneberg aus dem Europa-Wahljahr 2019 verwendet.
		</p>
		<p class="headline-04">
			Mehr Informationen dazu, wie dieser Prototyp entwickelt wurde, gibt es <a href="https://lab.technologiestiftung-berlin.de/projects/wahlbezirke/de/" target="blank"> in diesem ausführlichen Blogpost</a>. <br> 
			Der Quellcode des Prototyps ist <a href="https://github.com/technologiestiftung/odis-wahlbezirke" target="blank">auf GitHub verfügbar</a>.
		</p>
		<p class="headline-05">
			Hinweis: Diese Seite ist nicht für Mobilgeräte optimiert. Wir empfehlen die Nutzung dieser Seite auf einem Laptop oder Desktop-PC.
		</p>
	</div>
</div>


<nav>
	<ul class="nav nav-tabs">
		{#each navOptions as option, i}
		<li class="nav-item">
			<a class={intSelected==i ? "active" : ""} on:click={() => changeComponent(i.toString())} id={i.toString()} role="tab">
				<span><img src="/assets/images/icon-{option.icon}@2x.png" alt="{option.page}" /></span>
				<span>{option.page}</span>
			</a>
		</li>
		{/each}
	</ul>
</nav>

<main style="height: {innerHeight-100}px;">
	<svelte:component this={selected.component} navigateToTab={navigateToTab} />
</main>

<Footer />

<style lang="scss" global>
	@import 'styles/vars';
	@import 'styles/global';
	@import 'styles/nav';
	@import 'styles/odis';
	@import 'styles/map';
	@import 'styles/view';
</style>