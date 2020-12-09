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
			Dieses Tool dient dazu, Geodaten im GML-Format gegen eine festgelegte, dem Tool bekannte Datenstruktur zu prüfen. Abweichungen werden anhand von Fehlermeldungen beschrieben. GML ist ein offener Standard für räumliche Daten, basierend auf XML.
			Mehr zur Anwendung und Hintergrund des Validators finden sie unten.
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
	<svelte:component this={selected.component}/>
</main>

<Footer />

<style lang="scss" global>
	@import 'styles/vars';
	@import 'styles/global';
	@import 'styles/nav';
	@import 'styles/odis';
</style>