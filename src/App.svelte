<script lang="ts">
	import { navOptions } from  './components/Nav.svelte';
	let selected = navOptions[0];
	let intSelected: number = 0;

	const changeComponent = (id) => {
		selected = navOptions[id];
		intSelected = parseInt(id);
	};
</script>

<header>
	<div id="logo">
		<div>
			<span><img src="/assets/images/logo@2x.png" alt="Wahlbezirke" /></span>
			<span>Wahlbezirke</span>
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
</header>

<main>
	<svelte:component this={selected.component}/>
</main>

<style lang="scss" global>
	@import 'styles/vars';
	@import 'styles/global';
	@import 'styles/nav';
</style>