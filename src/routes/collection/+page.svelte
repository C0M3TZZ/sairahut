<script>
	import { gsap } from 'gsap';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { get } from '$lib/api';
	import { fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import allPoke from '../../stores/pokemon';

	const query = $page.url.searchParams.get('page'); // ดึงค่า url param

	let pages = query === null ? 1 : Number(query);
	let pokemon = [];
	let loading = true;

	// Page
	const allPokemon = 254; // จำนวนโปเม่อนทั้งหมดที่มี เพื่อ หาว่าต้องใช้กี่หน้า
	const limit = 12; //จำนวนโปเกม่อนต่อหนึ่งห้นา
	const allPages = Math.ceil(allPokemon / limit); // ปัดขึ้นจำนวนหน้า

	// Pagination (Not flexible work well with 5)
	const paginationPage = 5;
	const halfPagi = Math.ceil(paginationPage / 2);

	onMount(async () => {
		if (query == null || Number(query) < 1 || Number(query) > allPages) {
			window.location.href = '/collection?page=1';
		} // เช็คว่าเรียกหน้าในจำนวนที่กำหนด
		loading = true;
		let loadPokemon = await get(`/api/pokedex/page/${pages}`);
		pokemon = pokemon.concat(await fetchPokemons(loadPokemon));
		loading = false;
	});

	let getPokemon = async (p) => {
		loading = true;
		pages = p;
		if (!(p in $allPoke)) {
			let loadPokemon = await get(`/api/pokedex/page/${p}`);
			pokemon = await fetchPokemons(loadPokemon);
			console.log(loadPokemon.map(poke => poke.pokemon_name));
			allPoke.newPokemon(p, pokemon);
		} else {
			pokemon = $allPoke[p];
		}
		setTimeout(() => {
			loading = false;
		}, 100);
	};

	let fetchPokemons = async (pokemons) => {
		// ⚡️ Fetch pokemon มาจาก website official

		let result = [];
		for (let index = 0; index < pokemons.length; index++) {
			const pokemon = pokemons[index]; // เข้าถึงข้อมูลโปเกม่อนแต่ละตัวที่ Fetch
			let pokemonData = await get(`https://pokeapi.co/api/v2/pokemon/${pokemon.pokemon_id}`); // ทำการดึงข้อมูลจาก ID นั้นๆ ต่อ
			result.push({
				id: pokemon.pokemon_id,
				image: pokemonData.sprites.other.home.front_default
			});
		}
		return result;
	};

	const navigate = (pokeNth) => {
		const tl = gsap.timeline({});
		tl.fromTo(
			`.poke-navigator-${pokeNth}`,
			{
				left: '50%',
				top: '100%',
				transform: 'translate(-50%, 0)',
				cursor: 'auto',
				opacity: 0
			},
			{
				width: '222px',
				position: 'fixed',
				top: '370px',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				zIndex: 30,
				duration: 0.6,
				ease: 'power2.easeIn',
				opacity: 1
			}
		)
			.to(
				'#backdrop',
				{
					opacity: 1,
					pointerEvents: 'auto'
				},
				'<'
			)
			.to(`.poke-navigator-${pokeNth}`, {
				scale: 2,
				duration: 0.5,
				onComplete: () => goto(`/collection/${pokeNth}`, { replaceState: false })
			})
			.to(`.poke-navigator-${pokeNth}`, {
				opacity: 0.5
			});
	};
</script>

<svelte:head>
	<title>SAIRAHUT - Collection</title>
</svelte:head>

<div class="m-5">
	<div class="text-3xl font-bold py-1 flex mb-2">
		<span class="border-b-2 border-[#f20c32] mr-2">Pokedex collection</span>
	</div>
	<div class="text-md text-[#616573]">Everyone’s pokemons will display here</div>

	<div
		id="backdrop"
		class="pointer-events-none fixed top-0 left-0 w-full h-full bg-white z-20 opacity-0"
	/>

	{#if !loading}
		<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5 overflow-hidden">
			{#each pokemon as pokemonInfo, index}
				<div
					in:fly={{
						y: '100',
						delay: 100 * index,
						opacity: 0
					}}
					on:click={() => navigate(pokemonInfo.id)}
					class={`poke-navigators poke-navigator-${pokemonInfo.id} cursor-pointer select-none w-full aspect-square border-2 border-[#B0CAF4] bg-[#F3F7FA] rounded-2xl flex justify-center items-center relative`}
				>
					<div
						class="w-1/2 h-1/2 bg-[#E5EEF4] rounded-full relative flex justify-center items-center"
					>
						<img class="w-full" src={pokemonInfo.image} alt="pokemon" />
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="h-[70vh] flex justify-center items-center">
			<div class="animate-bounce">
				<img class="animate-spin mx-auto w-10 h-10 my-2" src="/icons/pokeball.png" alt="logo" />
				<h1 class="ml-2 text-2xl">Loading</h1>
			</div>
		</div>
	{/if}

	<!-- Pagination -->
	<div class="text-center mt-3 flex justify-center items-center gap-1">
		<button
			class="w-9 h-9 bg-[#e4781f] border-1 border-[#CB6714] rounded-md text-white flex justify-center items-center  transition-transform
			{pages <= 1
				? 'bg-[#e4781f8a] border-[#cb661486]'
				: 'bg-[#ea8d40] border-[#CB6714] hover:bg-[#e4781fde] hover:translate-y-[-2px]'}"
			on:click={() => {
				goto('/collection?page=' + (pages - 1));
				getPokemon(pages - 1);
			}}
			disabled={pages <= 1}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 320 512"
				width="15"
				height="15"
				fill="white"
			>
				<path
					d="M224 480c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25l192-192c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l169.4 169.4c12.5 12.5 12.5 32.75 0 45.25C240.4 476.9 232.2 480 224 480z"
				/>
			</svg>
		</button>
		{#each Array(paginationPage) as _, i}
			<button
				class="w-9 h-9 border-1 rounded-md text-white flex justify-center items-center transition-transform
				{(pages > 3 && pages < 20 ? i + pages - 2 : pages >= 20 ? i + 18 : i + 1) === pages
					? 'bg-[#a8a8a881] border-[#cb66147e]'
					: 'bg-[#ea8d40] border-[#CB6714] hover:translate-y-[-2px] hover:bg-[#ea8d40f3]'}"
				on:click={() => {
					goto(
						'/collection?page=' +
							(pages > 3 && pages < 20 ? i + pages - 2 : pages >= 20 ? i + 18 : i + 1)
					);
					getPokemon(pages > 3 && pages < 20 ? i + pages - 2 : pages >= 20 ? i + 18 : i + 1);
				}}
				disabled={(pages > 3 && pages < 20 ? i + pages - 2 : pages >= 20 ? i + 18 : i + 1) ===
					pages}
			>
				{pages > 3 && pages < 20 ? i + pages - 2 : pages >= 20 ? i + 18 : i + 1}
			</button>
		{/each}
		<button
			class="w-9 h-9 bg-[#e4781f] border-1 border-[#CB6714] rounded-md text-white flex justify-center items-center transition-transform
			{pages >= 22
				? 'bg-[#e4781f8a] border-[#cb661486]'
				: 'bg-[#ea8d40] border-[#CB6714] hover:translate-y-[-2px] hover:bg-[#e4781fde]'}"
			on:click={() => {
				goto('/collection?page=' + (pages + 1));
				getPokemon(pages + 1);
			}}
			disabled={pages >= allPages}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 320 512"
				width="15"
				height="15"
				fill="white"
			>
				<path
					d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"
				/>
			</svg>
		</button>
	</div>
</div>
