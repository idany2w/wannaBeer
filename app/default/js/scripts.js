document.addEventListener('click', async e => {
	if(!e.target.closest('.wannaBeer__btn')) return

	let btn = e.target.closest('.wannaBeer__btn');

	btn.textContent = 'Загружаем';
	btn.style.pointerEvents = 'none';

	let response = await fetch('https://random-data-api.com/api/beer/random_beer');
	const beer = document.querySelector('.wannaBeer__beer');
	let html = '';

	if (response.ok) {
		let beerItem = await response.json();

		let beerItemHTML = `
			<div class="beerCard">
				<p class="beerCard__title">Пиво "${beerItem.name}"</p>
				<div class="beerCard__info">
					<ul class="beerCard__info_list">
						<li>alcohol: ${beerItem.alcohol}</li>
						<li>blg: ${beerItem.blg}</li>
						<li>brand: ${beerItem.brand}</li>
						<li>hop: ${beerItem.hop}</li>
						<li>ibu: ${beerItem.ibu}</li>
						<li>malts: ${beerItem.malts}</li>
						<li>style: ${beerItem.style}</li>
						<li>yeast: ${beerItem.yeast}</li>
					</ul>
				</div>
			</div>
		`;

		html += beerItemHTML;

		beer.innerHTML = html;
		btn.textContent = 'Хочу другое!';
		btn.style.pointerEvents = 'auto';

	} else {const beer = document.querySelector('.wannaBeer__beer');
		let beerItemHTML = `
			<div class="beerCard">
				<p class="beerCard__title">Не удалось получить информацию. Попробуйте позднее</p>
			</div>
		`;

		html += beerItemHTML;
		beer.innerHTML = html;
		btn.textContent = 'Хочу Пиво!';
		btn.style.pointerEvents = 'auto';
	}
		
})